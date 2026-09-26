package com.elementspuyo.core

import kotlin.random.Random

/** 한 턴에 낙하하는 조각. 원소 1개. */
data class Piece(val element: Element)

/**
 * 피스 생성기. 가중치 기반 랜덤 (Element.weight).
 * P1:P2:P3:P4 = 10:35:35:20, P1 안에서 H:He = 3:1.
 * 이온 변종(Fe2/Fe3 등)은 그 z 슬롯을 균등 분할.
 */
open class PieceGenerator(private val random: Random = Random.Default) {
    open fun next(): Piece = Piece(pickWeighted(random))

    companion object {
        fun pickWeighted(rng: Random): Element {
            val pool = Element.playable
            val total = pool.sumOf { it.weight }
            var r = rng.nextDouble() * total
            for (e in pool) {
                if (r < e.weight) return e
                r -= e.weight
            }
            return pool.last()
        }
    }
}
