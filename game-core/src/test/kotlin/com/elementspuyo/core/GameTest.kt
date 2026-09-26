package com.elementspuyo.core

import kotlin.test.*

/** 결정론적 시퀀스를 주입하는 테스트용 generator. */
class ScriptedGenerator(sequence: List<Element>) : PieceGenerator() {
    private val seq = sequence.toMutableList()
    override fun next(): Piece {
        val e = if (seq.isNotEmpty()) seq.removeAt(0) else Element.H
        return Piece(e)
    }
}

class GameTest {

    @Test fun singleDropStacks() {
        val g = Game(generator = ScriptedGenerator(listOf(Element.H, Element.O, Element.N)))
        val r = g.playTurn(3)
        assertEquals(Pos(3, 0), r.landed)
        assertFalse(r.gameOver)
    }

    @Test fun naclFormsFromTwoDrops() {
        // Sequence: Na, Cl, filler. Drop both in same column so they stack adjacent.
        val g = Game(generator = ScriptedGenerator(listOf(Element.NA, Element.CL, Element.H, Element.H)))
        // First drop: Na at (3, 0). current becomes Cl.
        val r1 = g.playTurn(3)
        assertEquals(0, r1.chainCount, "single Na — no match yet")
        // Second drop: Cl at (3, 1). Now Na + Cl adjacent → NaCl fires.
        val r2 = g.playTurn(3)
        assertEquals(1, r2.chainCount, "NaCl should fire")
        assertEquals(2, r2.totalCleared)
        assertTrue(r2.chains.first().subsets.any { it.key == "Cl1Na1" })
    }

    @Test fun columnFullEndsGame() {
        val g = Game(generator = ScriptedGenerator(List(20) { Element.HE })) // He can't match
        val col = 3
        var lastResult: TurnResult? = null
        for (i in 0 until 15) {
            lastResult = g.playTurn(col)
            if (lastResult.gameOver) break
        }
        assertNotNull(lastResult)
        assertTrue(lastResult.gameOver, "column should fill and end game")
    }

    @Test fun scoreAccumulates() {
        val g = Game(generator = ScriptedGenerator(listOf(Element.NA, Element.CL, Element.HE, Element.HE)))
        g.playTurn(3)          // Na landing
        val r = g.playTurn(3)  // Cl landing → NaCl fires
        assertTrue(r.score > 0, "score should be positive after NaCl clear")
        assertEquals(r.score, g.totalScore)
    }
}
