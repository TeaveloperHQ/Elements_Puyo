package com.elementspuyo.core

/**
 * 게임 필드. 기본 8칸(옥텟) × 12층.
 * (x, y) 에서 y=0 이 바닥.
 */
class Field(val width: Int = WIDTH, val height: Int = HEIGHT) {
    companion object {
        const val WIDTH = 8   // 옥텟 규칙의 8
        const val HEIGHT = 12 // 뿌요 표준 세로
    }

    private val cells: Array<Array<Element?>> = Array(width) { arrayOfNulls(height) }

    operator fun get(x: Int, y: Int): Element? {
        if (x !in 0 until width || y !in 0 until height) return null
        return cells[x][y]
    }

    operator fun set(x: Int, y: Int, e: Element?) {
        require(x in 0 until width && y in 0 until height) { "out of bounds ($x,$y)" }
        cells[x][y] = e
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

    /** 지정된 위치들을 비움. */
    fun clearAll(positions: Set<Pos>) {
        for (p in positions) if (p.x in 0 until width && p.y in 0 until height) cells[p.x][p.y] = null
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

    /** 디버그·테스트용 필드 상태 스냅샷. */
    fun snapshot(): List<List<Element?>> = List(height) { y -> List(width) { x -> cells[x][y] } }

    /** 테스트용 짧은 문자열 표현. 위에서 아래로 각 행 출력, 이온 라벨 사용. */
    fun render(): String = buildString {
        for (y in height - 1 downTo 0) {
            for (x in 0 until width) {
                val e = cells[x][y]
                append(if (e == null) " .  " else "%-4s".format(e.label))
            }
            append('\n')
        }
    }
}
