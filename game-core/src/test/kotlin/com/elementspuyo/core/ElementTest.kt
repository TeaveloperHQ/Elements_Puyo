package com.elementspuyo.core

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class ElementTest {

    @Test fun `all 18 elements are defined in order`() {
        val expected = (1..18).toList()
        val actual = Element.entries.map { it.atomicNumber }
        assertEquals(expected, actual)
    }

    @Test fun `noble gases have charge 0 and are marked noble`() {
        for (e in listOf(Element.HE, Element.NE, Element.AR)) {
            assertEquals(0, e.charge, "${e.symbol} should have charge 0")
            assertTrue(e.isNoble, "${e.symbol} should be noble")
        }
    }

    @Test fun `group 1 cations have plus 1 charge`() {
        assertEquals(+1, Element.H.charge)
        assertEquals(+1, Element.LI.charge)
        assertEquals(+1, Element.NA.charge)
    }

    @Test fun `group 2 cations have plus 2 charge`() {
        assertEquals(+2, Element.BE.charge)
        assertEquals(+2, Element.MG.charge)
    }

    @Test fun `group 13 cations have plus 3 charge`() {
        assertEquals(+3, Element.B.charge)
        assertEquals(+3, Element.AL.charge)
    }

    @Test fun `group 16 anions have minus 2 charge`() {
        assertEquals(-2, Element.O.charge)
        assertEquals(-2, Element.S.charge)
    }

    @Test fun `group 17 anions have minus 1 charge`() {
        assertEquals(-1, Element.F.charge)
        assertEquals(-1, Element.CL.charge)
    }

    @Test fun `carbon is C4 minus and silicon is Si4 plus`() {
        assertEquals(-4, Element.C.charge)
        assertEquals(+4, Element.SI.charge)
    }

    @Test fun `cluster elements are metals plus C and Si`() {
        val expected = setOf(
            Element.LI, Element.BE, Element.NA, Element.MG, Element.AL,
            Element.C, Element.SI,
        )
        val actual = Element.entries.filter { it.isCluster }.toSet()
        assertEquals(expected, actual)
    }

    @Test fun `noble gases are never cluster`() {
        assertFalse(Element.HE.isCluster)
        assertFalse(Element.NE.isCluster)
        assertFalse(Element.AR.isCluster)
    }

    @Test fun `label formats ion charges correctly`() {
        assertEquals("Na⁺", Element.NA.label)
        assertEquals("Mg²⁺", Element.MG.label)
        assertEquals("Al³⁺", Element.AL.label)
        assertEquals("Si⁴⁺", Element.SI.label)
        assertEquals("Cl⁻", Element.CL.label)
        assertEquals("O²⁻", Element.O.label)
        assertEquals("N³⁻", Element.N.label)
        assertEquals("C⁴⁻", Element.C.label)
        assertEquals("He", Element.HE.label)
        assertEquals("Ne", Element.NE.label)
        assertEquals("Ar", Element.AR.label)
    }

    @Test fun `same period elements share color`() {
        val p1 = Element.entries.filter { it.period == 1 }.map { it.periodColor }.toSet()
        val p2 = Element.entries.filter { it.period == 2 }.map { it.periodColor }.toSet()
        val p3 = Element.entries.filter { it.period == 3 }.map { it.periodColor }.toSet()
        assertEquals(1, p1.size)
        assertEquals(1, p2.size)
        assertEquals(1, p3.size)
        // Different periods have different colors
        assertEquals(3, (p1 + p2 + p3).size)
    }
}
