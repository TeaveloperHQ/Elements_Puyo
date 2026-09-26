package com.elementspuyo.app

/** 12 연금술사 랭크. 웹 game.js ALCHEMIST_RANKS 와 동기화. */
data class AlchemistRank(val name: String, val nameKr: String, val era: String)

object Ranks {
    const val SCORE_PER_LEVEL = 1200

    val ALL: List<AlchemistRank> = listOf(
        AlchemistRank("Zosimos", "조시모스", "3–4c Egypt"),
        AlchemistRank("Jabir ibn Hayyan", "자비르 이븐 하이얀", "8c Persia"),
        AlchemistRank("Paracelsus", "파라켈수스", "16c Switzerland"),
        AlchemistRank("Robert Boyle", "로버트 보일", "17c Ireland"),
        AlchemistRank("Antoine Lavoisier", "앙투안 라부아지에", "18c France"),
        AlchemistRank("John Dalton", "존 돌턴", "Early 19c Britain"),
        AlchemistRank("Amedeo Avogadro", "아메데오 아보가드로", "Early 19c Italy"),
        AlchemistRank("Dmitri Mendeleev", "드미트리 멘델레예프", "Late 19c Russia"),
        AlchemistRank("Marie Curie", "마리 퀴리", "19–20c Poland·France"),
        AlchemistRank("Ernest Rutherford", "어니스트 러더퍼드", "Early 20c NZ·UK"),
        AlchemistRank("Niels Bohr", "닐스 보어", "Early 20c Denmark"),
        AlchemistRank("Linus Pauling", "라이너스 폴링", "20c USA"),
    )

    fun levelForScore(score: Int): Int =
        (1 + score / SCORE_PER_LEVEL).coerceIn(1, ALL.size)

    fun rankFor(level: Int): AlchemistRank =
        ALL[(level - 1).coerceIn(0, ALL.size - 1)]

    /** 다음 랭크까지 진행률 0..1 (마지막 랭크에서는 1). */
    fun progressToNext(score: Int): Float {
        val lv = levelForScore(score)
        if (lv >= ALL.size) return 1f
        val start = (lv - 1) * SCORE_PER_LEVEL
        return ((score - start).toFloat() / SCORE_PER_LEVEL).coerceIn(0f, 1f)
    }
}
