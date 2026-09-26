package com.elementspuyo.core

/** 검출된 분자 서브셋 (화합물 또는 이원자). cellIds 는 Field.cid. */
data class Subset(
    val cellIds: Set<Int>,
    val formula: String,
    val nameKr: String,
    val key: String,
    val size: Int,
    val value: Long,
    val isDiatomic: Boolean = false,
)

/** MoleculeRule 결과. */
data class MoleculeResult(
    val cells: Set<Int>,
    val subsets: List<Subset>,
    val compoundCells: Set<Int>,
    val diatomicCells: Set<Int>,
)

/** Matcher.findAll 결과 — 분자 + 주기/족/금속. */
data class MatchResult(
    val cells: Set<Int>,                // 분자 셀 (compound + diatomic)
    val subsets: List<Subset>,          // 분자 서브셋 목록
    val compoundCells: Set<Int>,
    val diatomicCells: Set<Int>,
    val periodCells: Set<Int>,
    val groupCells: Set<Int>,
    val metalCells: Set<Int>,
) {
    /** 모든 소거 대상 cid 합집합. */
    val allCleared: Set<Int> get() = cells + periodCells + groupCells + metalCells
    val isEmpty: Boolean get() = allCleared.isEmpty()
    /** 규칙별 발동 여부. */
    val fired: List<String> get() = buildList {
        if (compoundCells.isNotEmpty()) add("molecule")
        if (diatomicCells.isNotEmpty()) add("diatomic")
        if (periodCells.isNotEmpty()) add("period")
        if (groupCells.isNotEmpty()) add("group")
        if (metalCells.isNotEmpty()) add("metal")
    }
}

/**
 * 매치 파이프라인. 분자(compound + diatomic) 가 최우선 → 나머지 규칙은 분자 셀 제외.
 * 주기/족/금속은 서로 셀 공유 가능.
 */
class Matcher(val field: Field) {
    fun findAll(): MatchResult {
        val molRes = MoleculeRule(field).evaluate()
        val mol = molRes.cells
        val per = PeriodRunRule(field, excluded = mol).evaluate()
        val grp = GroupRunRule(field, excluded = mol).evaluate()
        val met = MetalClusterRule(field, excluded = mol).evaluate()
        return MatchResult(
            cells = mol,
            subsets = molRes.subsets,
            compoundCells = molRes.compoundCells,
            diatomicCells = molRes.diatomicCells,
            periodCells = per,
            groupCells = grp,
            metalCells = met,
        )
    }
}

// ── 규칙 1 (+ 이원자): 분자 whitelist + 이원자, 분자량 기반 greedy ───────────
class MoleculeRule(private val field: Field, private val excluded: Set<Int>? = null) {
    companion object { const val MAX_SUBSET = 8 }

    private data class CellRef(val x: Int, val y: Int, val e: Element)

    private val allSubsets = mutableListOf<Subset>()
    private val seenSubsets = mutableSetOf<String>()

    fun evaluate(): MoleculeResult {
        allSubsets.clear(); seenSubsets.clear()
        enumerateCompounds()
        enumerateDiatomics()
        return selectGreedy()
    }

    private fun skip(e: Element?): Boolean = e == null || e.isNoble || e.isObstacle

    private fun neighborsOf(x: Int, y: Int): List<Int> =
        field.neighborCids(x, y) { e, _, _ -> skip(e) }

    private fun enumerateCompounds() {
        for (x in 0 until field.width) for (y in 0 until field.height) {
            val e = field[x, y] ?: continue
            if (skip(e)) continue
            val startCid = field.cid(x, y)
            seenSubsets.add(startCid.toString())
            val frontier = neighborsOf(x, y).filter { it > startCid }.toMutableList()
            extend(mutableListOf(startCid), mutableListOf(CellRef(x, y, e)), frontier, startCid)
        }
    }

    private fun extend(
        subsetIds: MutableList<Int>,
        cells: MutableList<CellRef>,
        frontier: MutableList<Int>,
        startCid: Int,
    ) {
        if (subsetIds.size >= 2) {
            var sum = 0
            var hasCat = false; var hasAn = false
            val distinct = mutableSetOf<Int>()
            for (c in cells) {
                sum += c.e.charge
                distinct.add(c.e.atomicNumber)
                if (c.e.isCation) hasCat = true
                if (c.e.isAnion) hasAn = true
            }
            if (sum == 0 && distinct.size >= 2 && hasCat && hasAn) {
                val elems = cells.map { it.e }
                val key = Compounds.canonicalKey(elems)
                if (key in Compounds.KNOWN) {
                    var mass = 0.0
                    var posBonus = 0
                    for (c in cells) {
                        mass += c.e.mass
                        posBonus += c.e.period * 3 + c.e.group
                    }
                    allSubsets.add(Subset(
                        cellIds = subsetIds.toSet(),
                        formula = Compounds.displayFormula(elems),
                        nameKr = Compounds.NAMES_KR[key] ?: "",
                        key = key,
                        size = cells.size,
                        value = Math.round(mass * 100) + posBonus,
                    ))
                }
            }
        }
        if (subsetIds.size >= MAX_SUBSET) return
        for (i in frontier.indices) {
            val next = frontier[i]
            if (next < startCid) continue
            val p = field.decode(next)
            val ne = field[p.x, p.y] ?: continue
            val newIds = (subsetIds + next).sorted()
            val memoKey = newIds.joinToString(",")
            if (memoKey in seenSubsets) continue
            seenSubsets.add(memoKey)
            val nextFrontier = frontier.subList(i + 1, frontier.size)
                .filter { it !in newIds }.toMutableList()
            for (nb in neighborsOf(p.x, p.y)) {
                if (nb in newIds) continue
                if (nb !in nextFrontier) nextFrontier.add(nb)
            }
            extend(newIds.toMutableList(),
                (cells + CellRef(p.x, p.y, ne)).toMutableList(),
                nextFrontier, startCid)
        }
    }

    private fun enumerateDiatomics() {
        val visited = Array(field.width) { BooleanArray(field.height) }
        for (x in 0 until field.width) for (y in 0 until field.height) {
            if (visited[x][y]) continue
            val e = field[x, y]
            if (e == null || !e.isDiatomic || e.isObstacle) { visited[x][y] = true; continue }
            val comp = mutableListOf<CellRef>()
            val stack = ArrayDeque<Pos>().apply { add(Pos(x, y)) }
            while (stack.isNotEmpty()) {
                val p = stack.removeLast()
                if (!field.inBounds(p.x, p.y) || visited[p.x][p.y]) continue
                val ce = field[p.x, p.y] ?: continue
                if (ce.name != e.name) continue
                visited[p.x][p.y] = true
                comp.add(CellRef(p.x, p.y, ce))
                stack.add(Pos(p.x + 1, p.y)); stack.add(Pos(p.x - 1, p.y))
                stack.add(Pos(p.x, p.y + 1)); stack.add(Pos(p.x, p.y - 1))
            }
            if (comp.size >= 2) {
                var mass = 0.0
                var posBonus = 0
                for (c in comp) {
                    mass += c.e.mass
                    posBonus += c.e.period * 3 + c.e.group
                }
                allSubsets.add(Subset(
                    cellIds = comp.map { field.cid(it.x, it.y) }.toSet(),
                    formula = "${e.symbol}${subscript(2)}",
                    nameKr = Compounds.DIATOMIC_NAMES_KR[e.name] ?: "",
                    key = "_dia_${e.name}",
                    size = comp.size,
                    value = Math.round(mass * 100) + posBonus,
                    isDiatomic = true,
                ))
            }
        }
    }

    private fun selectGreedy(): MoleculeResult {
        val sorted = allSubsets.sortedWith(
            compareByDescending<Subset> { it.value }.thenBy { it.key }
        )
        val claimed = mutableSetOf<Int>()
        val compoundCells = mutableSetOf<Int>()
        val diatomicCells = mutableSetOf<Int>()
        val selected = mutableListOf<Subset>()
        val seenKeys = mutableSetOf<String>()
        for (s in sorted) {
            if (s.cellIds.any { it in claimed }) continue
            claimed.addAll(s.cellIds)
            if (s.isDiatomic) diatomicCells.addAll(s.cellIds) else compoundCells.addAll(s.cellIds)
            if (s.key !in seenKeys) { seenKeys.add(s.key); selected.add(s) }
        }
        return MoleculeResult(claimed, selected, compoundCells, diatomicCells)
    }

    private fun subscript(n: Int): String = n.toString()
        .map { "₀₁₂₃₄₅₆₇₈₉"[it.digitToInt()] }.joinToString("")
}

// ── 규칙 2/3 공통 축 스캔 ────────────────────────────────────────────────
sealed class LinearRunRule(
    protected val field: Field,
    protected val excluded: Set<Int>?,
    protected val minDistinct: Int,
) {
    protected abstract fun cellAt(i: Int, j: Int): Element?
    protected abstract fun cidAt(i: Int, j: Int): Int
    protected abstract fun axisValue(e: Element): Int
    protected abstract val axisLen: Int
    protected abstract val crossLen: Int

    fun evaluate(): Set<Int> {
        val result = mutableSetOf<Int>()
        for (j in 0 until crossLen) {
            for (start in 0 until axisLen) {
                val seen = mutableSetOf<Int>()
                var axis: Int? = null
                var end = start
                while (end < axisLen) {
                    val e = cellAt(end, j)
                    val cid = cidAt(end, j)
                    if (e == null || e.isObstacle) break
                    if (excluded?.contains(cid) == true) break
                    if (axis == null) axis = axisValue(e)
                    else if (axis != axisValue(e)) break
                    if (e.atomicNumber in seen) break
                    seen.add(e.atomicNumber); end++
                }
                if (seen.size >= minDistinct) {
                    for (i in start until end) result.add(cidAt(i, j))
                }
            }
        }
        return result
    }
}

/** 규칙 2: 같은 주기 가로 5+ 서로 다른 z. */
class PeriodRunRule(field: Field, excluded: Set<Int>? = null)
    : LinearRunRule(field, excluded, MIN_DISTINCT) {
    companion object { const val MIN_DISTINCT = 5 }
    override val axisLen get() = field.width
    override val crossLen get() = field.height
    override fun cellAt(i: Int, j: Int): Element? = field[i, j]
    override fun cidAt(i: Int, j: Int): Int = field.cid(i, j)
    override fun axisValue(e: Element): Int = e.period
}

/** 규칙 3: 같은 족 세로 3+ 서로 다른 z. */
class GroupRunRule(field: Field, excluded: Set<Int>? = null)
    : LinearRunRule(field, excluded, MIN_DISTINCT) {
    companion object { const val MIN_DISTINCT = 3 }
    override val axisLen get() = field.height
    override val crossLen get() = field.width
    override fun cellAt(i: Int, j: Int): Element? = field[j, i]
    override fun cidAt(i: Int, j: Int): Int = field.cid(j, i)
    override fun axisValue(e: Element): Int = e.group
}

// ── 규칙 4: 같은 z 금속 5+ 연결. 이온 변종은 하나로 통합. ───────────────
class MetalClusterRule(private val field: Field, private val excluded: Set<Int>? = null) {
    companion object { const val MIN_CLUSTER = 5 }
    fun evaluate(): Set<Int> {
        val result = mutableSetOf<Int>()
        val visited = Array(field.width) { BooleanArray(field.height) }
        for (x in 0 until field.width) for (y in 0 until field.height) {
            if (visited[x][y]) continue
            val e = field[x, y]
            if (e == null || e.category != ElementCategory.METAL || isExcluded(x, y)) {
                visited[x][y] = true; continue
            }
            val z = e.atomicNumber
            val comp = mutableListOf<Pos>()
            val stack = ArrayDeque<Pos>().apply { add(Pos(x, y)) }
            while (stack.isNotEmpty()) {
                val p = stack.removeLast()
                if (!field.inBounds(p.x, p.y) || visited[p.x][p.y]) continue
                if (isExcluded(p.x, p.y)) continue
                val ce = field[p.x, p.y] ?: continue
                if (ce.atomicNumber != z) continue
                visited[p.x][p.y] = true
                comp.add(p)
                stack.add(Pos(p.x + 1, p.y)); stack.add(Pos(p.x - 1, p.y))
                stack.add(Pos(p.x, p.y + 1)); stack.add(Pos(p.x, p.y - 1))
            }
            if (comp.size >= MIN_CLUSTER) {
                for (p in comp) result.add(field.cid(p.x, p.y))
            }
        }
        return result
    }

    private fun isExcluded(x: Int, y: Int): Boolean =
        excluded?.contains(field.cid(x, y)) == true
}
