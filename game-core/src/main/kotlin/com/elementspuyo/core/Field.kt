package com.elementspuyo.core

/**
 * 게임 필드. 기본 8열 × 12층.
 * (x, y) 에서 y=0 이 바닥.
 *
 * cid 인코딩: x * height + y (웹 matcher.js 와 동일). MatchResult 는 cid 로 셀 지목.
 */
class Field(val width: Int = WIDTH, val height: Int = HEIGHT) {
    companion object {
        const val WIDTH = 8
        const val HEIGHT = 12
        val NEIGHBORS = listOf(1 to 0, -1 to 0, 0 to 1, 0 to -1)
    }

    private val cells: Array<Array<Element?>> = Array(width) { arrayOfNulls(height) }

    operator fun get(x: Int, y: Int): Element? {
        if (!inBounds(x, y)) return null
        return cells[x][y]
    }

    operator fun set(x: Int, y: Int, e: Element?) {
        require(inBounds(x, y)) { "out of bounds ($x,$y)" }
        cells[x][y] = e
    }

    fun inBounds(x: Int, y: Int): Boolean =
        x in 0 until width && y in 0 until height

    fun cid(x: Int, y: Int): Int = x * height + y
    fun decode(cid: Int): Pos = Pos(cid / height, cid % height)

    /** 4-이웃 cid 목록 (필터 통과 셀만). filter(e, nx, ny) 가 true 면 스킵. */
    fun neighborCids(x: Int, y: Int, filter: (Element?, Int, Int) -> Boolean): List<Int> {
        val out = ArrayList<Int>(4)
        for ((dx, dy) in NEIGHBORS) {
            val nx = x + dx; val ny = y + dy
            if (!inBounds(nx, ny)) continue
            if (filter(cells[nx][ny], nx, ny)) continue
            out.add(cid(nx, ny))
        }
        return out
    }

    /** 열 x 의 채워진 높이 (다음 낙하 시 착지 y). */
    fun columnHeight(x: Int): Int {
        require(x in 0 until width)
        for (y in height - 1 downTo 0) if (cells[x][y] != null) return y + 1
        return 0
    }

    fun isColumnFull(x: Int): Boolean = columnHeight(x) >= height

    /** 원소 e 를 열 x 에 떨어뜨림. 착지 y 반환, 열이 꽉 찼으면 -1. */
    fun drop(x: Int, e: Element): Int {
        val h = columnHeight(x)
        if (h >= height) return -1
        cells[x][h] = e
        return h
    }

    /** 지정된 cid 위치들을 비움. */
    fun clearCids(positions: Set<Int>) {
        for (c in positions) {
            val p = decode(c)
            if (inBounds(p.x, p.y)) cells[p.x][p.y] = null
        }
    }

    /** 각 열에서 빈 칸 위의 원소들을 아래로 내림. 하나라도 움직였으면 true. */
    fun applyGravity(): Boolean {
        var moved = false
        for (x in 0 until width) {
            var writeY = 0
            for (y in 0 until height) {
                val e = cells[x][y] ?: continue
                if (writeY != y) {
                    cells[x][writeY] = e
                    cells[x][y] = null
                    moved = true
                }
                writeY++
            }
        }
        return moved
    }

    /** 디버그·테스트용 스냅샷. */
    fun snapshot(): List<List<Element?>> =
        List(height) { y -> List(width) { x -> cells[x][y] } }

    /** 테스트용 짧은 문자열 표현 (위 → 아래로 각 행). */
    fun render(): String = buildString {
        for (y in height - 1 downTo 0) {
            for (x in 0 until width) {
                val e = cells[x][y]
                append(if (e == null) " .   " else "%-5s".format(e.label))
            }
            append('\n')
        }
    }
}
