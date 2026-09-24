package com.elementspuyo.core

import kotlin.random.Random

/**
 * 한 턴에 낙하하는 조각. 항상 원소 3개.
 * - 일반 조각: 세 원소가 서로 다를 수 있음.
 * - 클러스터 조각: 세 원소가 모두 같음 (금속·C·Si).
 */
data class Piece(val elements: List<Element>) {
    init {
        require(elements.size == 3) { "Piece must have exactly 3 elements" }
    }

    val isCluster: Boolean get() = elements[0].isCluster && elements.all { it == elements[0] }
}

/**
 * 피스 생성기. 테스트에서는 오버라이드해서 결정론적 시퀀스 주입 가능.
 * 롤 규칙 (기본 구현):
 * 1. 원소 하나를 균등 확률로 롤.
 * 2. 클러스터 대상이면 (금속·C·Si) → 그 원소를 3번 반복한 클러스터 조각.
 * 3. 아니면 클러스터가 아닌 원소 pool(11종) 에서 3번 롤한 일반 조각.
 */
open class PieceGenerator(private val random: Random = Random.Default) {
    companion object {
        val NON_CLUSTER_POOL: List<Element> = Element.entries.filter { !it.isCluster }
    }

    open fun next(): Piece {
        val first = Element.entries.random(random)
        return if (first.isCluster) {
            Piece(List(3) { first })
        } else {
            Piece(List(3) { NON_CLUSTER_POOL.random(random) })
        }
    }
}
