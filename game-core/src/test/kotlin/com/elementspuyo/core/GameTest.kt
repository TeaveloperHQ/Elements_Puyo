package com.elementspuyo.core

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue

/** 테스트용 고정 시퀀스 생성기 — 목록을 소진할 때까지 순회, 이후 마지막 조각 반복. */
private class FixedPieceGenerator(pieces: List<Piece>) : PieceGenerator() {
    private val queue = ArrayDeque(pieces)
    private var last: Piece = pieces.last()
    override fun next(): Piece {
        if (queue.isEmpty()) return last
        val p = queue.removeFirst()
        last = p
        return p
    }
}

/** 매치를 트리거하지 않는 "무해한" 피스 — He, Ne, Ar 세 노블 가스. */
private val INERT_PIECE = Piece(listOf(Element.HE, Element.NE, Element.AR))

class GameTest {

    @Test fun `piece generator produces valid pieces`() {
        val gen = PieceGenerator(kotlin.random.Random(42))
        repeat(100) {
            val p = gen.next()
            assertEquals(3, p.elements.size)
            if (p.isCluster) {
                assertEquals(p.elements[0], p.elements[1])
                assertEquals(p.elements[0], p.elements[2])
                assertTrue(p.elements[0].isCluster,
                    "Cluster piece must be a cluster-eligible element")
            } else {
                for (e in p.elements) assertFalse(e.isCluster,
                    "Non-cluster piece must contain only non-cluster elements")
            }
        }
    }

    @Test fun `playTurn places piece into requested columns and advances`() {
        val piece1 = INERT_PIECE
        val piece2 = INERT_PIECE
        val game = Game(Field(), FixedPieceGenerator(listOf(piece1, piece2)))
        val cols = intArrayOf(0, 1, 7)
        val result = game.playTurn(cols)

        assertEquals(3, result.landed.size)
        assertEquals(0, result.landed[0].x)
        assertEquals(1, result.landed[1].x)
        assertEquals(7, result.landed[2].x)
        for (p in result.landed) assertEquals(0, p.y, "First drops land at y=0")

        // Inert piece: no matches
        assertEquals(0, result.chainCount)
        assertEquals(Element.HE, game.field[0, 0])
        assertEquals(Element.NE, game.field[1, 0])
        assertEquals(Element.AR, game.field[7, 0])
    }

    @Test fun `playTurn detects immediate clear via Rule 1 with pre-populated NaCl`() {
        val field = Field()
        field[0, 0] = Element.NA
        field[1, 0] = Element.CL
        val game = Game(field, FixedPieceGenerator(listOf(INERT_PIECE)))

        val result = game.playTurn(intArrayOf(4, 5, 6))

        assertEquals(1, result.chainCount)
        assertEquals(2, result.totalCleared)
        assertNull(game.field[0, 0])
        assertNull(game.field[1, 0])
    }

    @Test fun `playTurn chain of two via Rule 2 period cascade`() {
        // Round 1: 바닥의 [Na, Mg, Al] (period 3, 서로 다름) → Rule 2 소거.
        //   상단에 떠 있던 Li(0,1), Be(1,2), B(2,1) 은 각자 격리(주변 빈칸)라 이번 라운드엔 소거 안 됨.
        // Gravity: 세 원소가 각 열에서 바닥으로 낙하 → 새 바닥 y=0 = [Li, Be, B] (period 2, 서로 다름).
        // Round 2: Rule 2 로 [Li, Be, B] 소거 → chain=2.
        val field = Field()
        field[0, 0] = Element.NA
        field[1, 0] = Element.MG
        field[2, 0] = Element.AL
        field[0, 1] = Element.LI
        field[1, 2] = Element.BE   // 떠 있는 상태 (col 1 y=1 은 비어있음)
        field[2, 1] = Element.B
        val game = Game(field, FixedPieceGenerator(listOf(INERT_PIECE)))

        val result = game.playTurn(intArrayOf(4, 5, 6))

        assertEquals(2, result.chainCount, "Two chain steps: period 3 row → gravity → period 2 row")
        assertEquals(6, result.totalCleared, "Round1 clears 3 (Na Mg Al), Round2 clears 3 (Li Be B)")
        assertNull(game.field[0, 0])
        assertNull(game.field[1, 0])
        assertNull(game.field[2, 0])
    }

    @Test fun `playTurn on full spawn column signals gameOver via placement failure`() {
        val field = Field()
        for (y in 0 until field.height) field[3, y] = Element.AR
        val game = Game(field, FixedPieceGenerator(listOf(INERT_PIECE)))
        val result = game.playTurn(intArrayOf(3, 4, 5))
        assertTrue(result.placementFailed)
        assertTrue(result.gameOver)
        assertTrue(game.isGameOver)
    }
}
