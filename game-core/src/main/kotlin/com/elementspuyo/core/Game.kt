package com.elementspuyo.core

/**
 * 한 턴의 결과 요약.
 * @param landed 이번 턴에 착지한 3원소의 위치 (열 지정 실패시 -1 y).
 * @param chains 연쇄 단계별 소거된 위치 집합 (0단계=첫 소거, 1단계=낙하 후 재소거, ...).
 * @param totalCleared 이번 턴 총 소거 개수.
 * @param chainCount 연쇄 횟수(0 = 소거 없음).
 * @param score 이번 턴에 얻은 점수.
 * @param gameOver 이번 턴 후 게임 종료 여부(다음 조각 배치 실패 위험 등 상위 로직에서 판정).
 * @param placementFailed 조각 배치 자체가 실패했으면 true (열 full).
 */
data class TurnResult(
    val landed: List<Pos> = emptyList(),
    val chains: List<Set<Pos>> = emptyList(),
    val totalCleared: Int = 0,
    val chainCount: Int = 0,
    val score: Int = 0,
    val gameOver: Boolean = false,
    val placementFailed: Boolean = false,
)

/**
 * 솔로 플레이 게임 엔진.
 *
 * 한 턴 흐름 (playTurn):
 *   1. current piece 의 3원소를 지정된 3개 열에 순서대로 낙하.
 *   2. 매칭 검사 → 소거 → 중력 적용 을 반복 (연쇄).
 *   3. current ← next, next ← generator.next().
 *   4. 다음 조각의 예상 스폰 열(가운데 3열) 이 이미 꼭대기에 닿아 있으면 게임 오버로 표기.
 */
class Game(
    val field: Field = Field(),
    private val generator: PieceGenerator = PieceGenerator(),
) {
    var current: Piece = generator.next()
        private set
    var next: Piece = generator.next()
        private set
    var totalScore: Int = 0
        private set
    var isGameOver: Boolean = false
        private set

    /**
     * 이번 턴의 3원소를 지정된 3개 열에 낙하시킨다.
     * columns.size == 3, 각 값 in [0, width). 같은 열 중복 허용 (세로 클러스터).
     */
    fun playTurn(columns: IntArray): TurnResult {
        require(columns.size == 3) { "columns must have length 3" }
        require(columns.all { it in 0 until field.width }) { "column out of range: ${columns.toList()}" }
        if (isGameOver) return TurnResult(gameOver = true, placementFailed = true)

        // 1. 배치
        val landed = mutableListOf<Pos>()
        for (i in 0..2) {
            val y = field.drop(columns[i], current.elements[i])
            if (y < 0) {
                isGameOver = true
                return TurnResult(landed = landed, gameOver = true, placementFailed = true)
            }
            landed.add(Pos(columns[i], y))
        }

        // 2. 연쇄 루프
        val chains = mutableListOf<Set<Pos>>()
        while (true) {
            val matches = Matcher(field).findMatches()
            if (matches.isEmpty()) break
            chains.add(matches)
            field.clearAll(matches)
            field.applyGravity()
        }
        val totalCleared = chains.sumOf { it.size }
        val turnScore = scoreFor(chains)
        totalScore += turnScore

        // 3. 다음 조각
        current = next
        next = generator.next()

        // 4. 게임 오버 판정: 스폰 열(가운데 3열 = 3,4,5) 이 이미 최상단이면 다음 배치 불가.
        val spawnCols = intArrayOf(field.width / 2 - 1, field.width / 2, field.width / 2 + 1)
        val cannotSpawn = spawnCols.any { it in 0 until field.width && field.isColumnFull(it) }
        if (cannotSpawn) isGameOver = true

        return TurnResult(
            landed = landed,
            chains = chains,
            totalCleared = totalCleared,
            chainCount = chains.size,
            score = turnScore,
            gameOver = isGameOver,
        )
    }

    /**
     * 임시 점수식: 소거 개수 × (연쇄 단계 인덱스 + 1) × 10.
     * 연쇄가 길수록 각 단계 가중치가 올라감. 튜닝 대상.
     */
    private fun scoreFor(chains: List<Set<Pos>>): Int {
        var s = 0
        for ((i, step) in chains.withIndex()) {
            s += step.size * (i + 1) * 10
        }
        return s
    }
}
