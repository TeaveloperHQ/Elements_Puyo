package com.elementspuyo.core

/**
 * 필드에서 소거 대상 셀을 찾는다.
 *
 * 규칙 1 (분자 완성 / 옥텟):
 *   - 비활성 기체 제외한 이온들이 상하좌우로 연결된 컴포넌트.
 *   - 컴포넌트의 전하 합 == 0 AND 서로 다른 원소 최소 2종 AND 양이온·음이온 모두 존재.
 *   - 개수 하한 없음 (Na⁺+Cl⁻ 2개도 성립).
 *
 * 규칙 2 (같은 주기 가로 3개 이상):
 *   - 같은 행에서 연속 셀들이 모두 같은 period AND 서로 다른 원소일 때 3개 이상이면 소거.
 *
 * 규칙 3 (같은 족 세로 3층 이상):
 *   - 같은 열에서 연속 셀들이 모두 같은 group AND 서로 다른 원소일 때 3개 이상이면 소거.
 *
 * 세 규칙은 OR 관계로 합집합.
 */
class Matcher(private val field: Field) {

    fun findMatches(): Set<Pos> {
        val result = mutableSetOf<Pos>()
        result += findMolecules()
        result += findPeriodRuns()
        result += findGroupRuns()
        return result
    }

    /** 규칙 1: 이온 연결 컴포넌트 중 전하 합 0 인 것. */
    fun findMolecules(): Set<Pos> {
        val result = mutableSetOf<Pos>()
        val visited = Array(field.width) { BooleanArray(field.height) }
        for (x in 0 until field.width) for (y in 0 until field.height) {
            if (visited[x][y]) continue
            val start = field[x, y] ?: continue
            if (start.isNoble) { visited[x][y] = true; continue }

            val comp = mutableListOf<Pos>()
            val stack = ArrayDeque<Pos>()
            stack.add(Pos(x, y))
            while (stack.isNotEmpty()) {
                val p = stack.removeLast()
                if (p.x !in 0 until field.width || p.y !in 0 until field.height) continue
                if (visited[p.x][p.y]) continue
                val e = field[p.x, p.y] ?: continue
                if (e.isNoble) continue
                visited[p.x][p.y] = true
                comp.add(p)
                stack.add(Pos(p.x + 1, p.y))
                stack.add(Pos(p.x - 1, p.y))
                stack.add(Pos(p.x, p.y + 1))
                stack.add(Pos(p.x, p.y - 1))
            }
            if (comp.isEmpty()) continue

            val elems = comp.map { field[it.x, it.y]!! }
            val chargeSum = elems.sumOf { it.charge }
            val distinct = elems.toSet().size
            val hasCation = elems.any { it.isCation }
            val hasAnion = elems.any { it.isAnion }
            if (chargeSum == 0 && distinct >= 2 && hasCation && hasAnion) {
                result.addAll(comp)
            }
        }
        return result
    }

    /** 규칙 2: 행별로 같은 period + 서로 다른 원소 연속 3개 이상. */
    fun findPeriodRuns(): Set<Pos> = scanRuns(byPeriod = true)

    /** 규칙 3: 열별로 같은 group + 서로 다른 원소 연속 3개 이상. */
    fun findGroupRuns(): Set<Pos> = scanRuns(byPeriod = false)

    private fun scanRuns(byPeriod: Boolean): Set<Pos> {
        val result = mutableSetOf<Pos>()
        // byPeriod=true: 행 스캔(가로). byPeriod=false: 열 스캔(세로).
        val outer = if (byPeriod) field.height else field.width
        val inner = if (byPeriod) field.width else field.height
        for (o in 0 until outer) {
            for (start in 0 until inner) {
                val seen = mutableSetOf<Element>()
                var key: Int? = null
                var end = start
                while (end < inner) {
                    val e = cellAt(byPeriod, o, end) ?: break
                    val k = if (byPeriod) e.period else e.group
                    if (key == null) key = k
                    else if (key != k) break
                    if (e in seen) break
                    seen.add(e)
                    end++
                }
                if (seen.size >= 3) {
                    for (i in start until end) result.add(posOf(byPeriod, o, i))
                }
            }
        }
        return result
    }

    private fun cellAt(byPeriod: Boolean, outer: Int, inner: Int): Element? =
        if (byPeriod) field[inner, outer] else field[outer, inner]

    private fun posOf(byPeriod: Boolean, outer: Int, inner: Int): Pos =
        if (byPeriod) Pos(inner, outer) else Pos(outer, inner)
}
