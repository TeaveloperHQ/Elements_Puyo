package com.elementspuyo.core

import kotlin.test.*

class FieldTest {

    @Test fun defaultSize() {
        val f = Field()
        assertEquals(8, f.width)
        assertEquals(12, f.height)
    }

    @Test fun dropStacksInColumn() {
        val f = Field()
        assertEquals(0, f.drop(3, Element.H))
        assertEquals(1, f.drop(3, Element.O))
        assertEquals(0, f.drop(4, Element.N))
        assertEquals(Element.H, f[3, 0])
        assertEquals(Element.O, f[3, 1])
    }

    @Test fun applyGravityCompacts() {
        val f = Field()
        f[3, 0] = Element.H
        f[3, 2] = Element.O
        f[3, 4] = Element.N
        f.applyGravity()
        assertEquals(Element.H, f[3, 0])
        assertEquals(Element.O, f[3, 1])
        assertEquals(Element.N, f[3, 2])
        assertNull(f[3, 3])
    }

    @Test fun cidEncodeDecodeRoundTrip() {
        val f = Field()
        for (x in 0 until f.width) for (y in 0 until f.height) {
            val c = f.cid(x, y)
            val p = f.decode(c)
            assertEquals(x, p.x); assertEquals(y, p.y)
        }
    }

    @Test fun clearCidsRemoves() {
        val f = Field()
        f[0, 0] = Element.H; f[1, 0] = Element.O
        f.clearCids(setOf(f.cid(0, 0)))
        assertNull(f[0, 0])
        assertEquals(Element.O, f[1, 0])
    }
}
