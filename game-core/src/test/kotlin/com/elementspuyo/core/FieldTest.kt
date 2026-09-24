package com.elementspuyo.core

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue

class FieldTest {

    @Test fun `default dimensions are 8 by 12`() {
        val f = Field()
        assertEquals(8, f.width)
        assertEquals(12, f.height)
    }

    @Test fun `empty field returns null for all cells`() {
        val f = Field()
        for (x in 0 until f.width) for (y in 0 until f.height) {
            assertNull(f[x, y])
        }
    }

    @Test fun `column height starts at 0`() {
        val f = Field()
        for (x in 0 until f.width) assertEquals(0, f.columnHeight(x))
    }

    @Test fun `drop places element at correct height`() {
        val f = Field()
        val y0 = f.drop(3, Element.NA)
        val y1 = f.drop(3, Element.CL)
        assertEquals(0, y0)
        assertEquals(1, y1)
        assertEquals(Element.NA, f[3, 0])
        assertEquals(Element.CL, f[3, 1])
        assertEquals(2, f.columnHeight(3))
    }

    @Test fun `drop returns minus 1 when column full`() {
        val f = Field()
        repeat(f.height) { assertTrue(f.drop(0, Element.H) >= 0) }
        assertEquals(-1, f.drop(0, Element.H))
        assertTrue(f.isColumnFull(0))
    }

    @Test fun `applyGravity packs floating cells to bottom`() {
        val f = Field()
        f[0, 3] = Element.NA
        f[0, 5] = Element.CL
        assertTrue(f.applyGravity())
        assertEquals(Element.NA, f[0, 0])
        assertEquals(Element.CL, f[0, 1])
        assertNull(f[0, 3])
        assertNull(f[0, 5])
    }

    @Test fun `applyGravity returns false when nothing moves`() {
        val f = Field()
        f.drop(0, Element.NA)
        f.drop(0, Element.CL)
        assertFalse(f.applyGravity())
    }

    @Test fun `clearAll removes specified positions`() {
        val f = Field()
        f.drop(0, Element.NA)
        f.drop(0, Element.CL)
        f.clearAll(setOf(Pos(0, 0)))
        assertNull(f[0, 0])
        assertEquals(Element.CL, f[0, 1])
    }
}
