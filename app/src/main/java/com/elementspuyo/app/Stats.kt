package com.elementspuyo.app

import android.content.Context
import android.content.SharedPreferences

/** 최고점·최고 연쇄·플레이 횟수. SharedPreferences 저장. */
class Stats private constructor(private val prefs: SharedPreferences) {
    val highScore: Int get() = prefs.getInt(KEY_HIGH_SCORE, 0)
    val highChain: Int get() = prefs.getInt(KEY_HIGH_CHAIN, 0)
    val gamesPlayed: Int get() = prefs.getInt(KEY_GAMES, 0)
    val topRank: Int get() = prefs.getInt(KEY_TOP_RANK, 1)

    fun recordChain(chain: Int) {
        if (chain > highChain) prefs.edit().putInt(KEY_HIGH_CHAIN, chain).apply()
    }
    fun recordScore(score: Int, level: Int) {
        val e = prefs.edit()
        if (score > highScore) e.putInt(KEY_HIGH_SCORE, score)
        if (level > topRank) e.putInt(KEY_TOP_RANK, level)
        e.apply()
    }
    fun recordGameEnd() {
        prefs.edit().putInt(KEY_GAMES, gamesPlayed + 1).apply()
    }

    companion object {
        private const val PREF = "puyo_stats"
        private const val KEY_HIGH_SCORE = "high_score"
        private const val KEY_HIGH_CHAIN = "high_chain"
        private const val KEY_GAMES = "games"
        private const val KEY_TOP_RANK = "top_rank"

        fun from(ctx: Context): Stats =
            Stats(ctx.getSharedPreferences(PREF, Context.MODE_PRIVATE))
    }
}
