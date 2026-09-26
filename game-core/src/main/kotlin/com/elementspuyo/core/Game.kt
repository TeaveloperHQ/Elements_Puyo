package com.elementspuyo.core

/** 한 연쇄 단계의 요약. */
data class ChainStep(
    val cleared: Set<Int>,
    val fired: List<String>,
    val subsets: List<Subset>,
)

/** 한 턴 결과. */
data class TurnResult(
    val landed: Pos,
    val chains: List<ChainStep> = emptyList(),
    val totalCleared: Int = 0,
    val chainCount: Int = 0,
    val score: Int = 0,
    val gameOver: Boolean = false,
    val placementFailed: Boolean = false,
) {
    val didAttack: Boolean get() =
        chainCount >= 2 ||
        chains.any { s -> "molecule" in s.fired || "diatomic" in s.fired || "metal" in s.fired }
}

/**
 * 솔로 플레이 게임 엔진 (1 원소 낙하 방식, 웹 game.js 미러).
 * 한 턴 흐름:
 *   1. current piece 를 지정 열에 낙하
 *   2. Matcher.findAll → 소거 → 중력 반복 (연쇄)
 *   3. current ← next, next ← generator.next()
 *   4. 가운데 열 상단 스폰 실패면 game over
 */
class Game(
    val field: Field = Field(),
    private val generator: PieceGenerator = PieceGenerator(),
) {
    var current: Piece = generator.next(); private set
    var next: Piece = generator.next(); private set
    var totalScore: Int = 0; private set
    var isGameOver: Boolean = false; private set

    fun playTurn(column: Int): TurnResult {
        require(column in 0 until field.width) { "column out of range: $column" }
        if (isGameOver) return TurnResult(landed = Pos(-1, -1), gameOver = true, placementFailed = true)

        val y = field.drop(column, current.element)
        if (y < 0) {
            isGameOver = true
            return TurnResult(landed = Pos(column, -1), gameOver = true, placementFailed = true)
        }
        val landed = Pos(column, y)

        val chains = mutableListOf<ChainStep>()
        while (true) {
            val res = Matcher(field).findAll()
            if (res.isEmpty) break
            chains.add(ChainStep(res.allCleared, res.fired, res.subsets))
            field.clearCids(res.allCleared)
            field.applyGravity()
        }
        val turnScore = scoreFor(chains)
        totalScore += turnScore

        current = next
        next = generator.next()

        val spawnCol = field.width / 2
        if (spawnCol in 0 until field.width && field.isColumnFull(spawnCol)) isGameOver = true

        return TurnResult(
            landed = landed,
            chains = chains,
            totalCleared = chains.sumOf { it.cleared.size },
            chainCount = chains.size,
            score = turnScore,
            gameOver = isGameOver,
        )
    }

    /**
     * 점수식: 소거 셀 × 연쇄단계(1-based) × (동시 발동 규칙 수) × 10.
     * (웹 game.js baseScore 공식 이식)
     */
    private fun scoreFor(chains: List<ChainStep>): Int {
        var s = 0
        for ((i, step) in chains.withIndex()) {
            val simul = step.fired.size.coerceAtLeast(1)
            s += step.cleared.size * (i + 1) * simul * 10
        }
        return s
    }
}
