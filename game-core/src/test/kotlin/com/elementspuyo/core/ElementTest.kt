package com.elementspuyo.core

import kotlin.math.abs
import kotlin.test.*

class ElementTest {

    @Test fun periodWeightsSumToTarget() {
        val expected = mapOf(1 to 10.0, 2 to 35.0, 3 to 35.0, 4 to 20.0)
        val sums = Element.entries.filter { !it.isObstacle }
            .groupBy { it.period }
            .mapValues { (_, list) -> list.sumOf { it.weight } }
        for ((p, want) in expected) {
            val got = sums[p] ?: 0.0
            assertTrue(abs(got - want) < 0.001, "P$p sum $got != $want")
        }
    }

    @Test fun hydrogenToHeliumRatioIsThreeToOne() {
        val ratio = Element.H.weight / Element.HE.weight
        assertTrue(abs(ratio - 3.0) < 0.001, "H:He ratio $ratio != 3")
    }

    @Test fun ionVariantsShareTheirZSlot() {
        val zSum = Element.C.weight + Element.CP.weight
        val neSingle = Element.NE.weight
        assertTrue(abs(zSum - neSingle) < 0.001, "C+CP=$zSum should equal single Ne=$neSingle")

        val feSum = Element.FE2.weight + Element.FE3.weight
        val niSingle = Element.NI.weight
        assertTrue(abs(feSum - niSingle) < 0.001, "Fe2+Fe3=$feSum should equal Ni=$niSingle")
    }

    @Test fun massLookupWorks() {
        assertEquals(1.008, Element.H.mass, 0.001)
        assertEquals(16.0, Element.O.mass, 0.001)
        assertEquals(55.85, Element.FE2.mass, 0.001)
        assertEquals(55.85, Element.FE3.mass, 0.001)
    }

    @Test fun labelIncludesChargeSuperscript() {
        assertEquals("Na⁺", Element.NA.label)
        assertEquals("Mg²⁺", Element.MG.label)
        assertEquals("O²⁻", Element.O.label)
        assertEquals("C⁴⁻", Element.C.label)
        assertEquals("C⁴⁺", Element.CP.label)
        assertEquals("Fe²⁺", Element.FE2.label)
        assertEquals("Fe³⁺", Element.FE3.label)
        assertEquals("Cr⁶⁺", Element.CR6.label)
        assertEquals("Ne", Element.NE.label)
    }

    @Test fun diatomicFlagCoversHNOFClBr() {
        assertTrue(Element.H.isDiatomic)
        assertTrue(Element.N.isDiatomic)
        assertTrue(Element.O.isDiatomic)
        assertTrue(Element.F.isDiatomic)
        assertTrue(Element.CL.isDiatomic)
        assertTrue(Element.BR.isDiatomic)
        assertFalse(Element.NA.isDiatomic)
        assertFalse(Element.C.isDiatomic)
    }

    @Test fun playablePoolExcludesObstacles() {
        val pool = Element.playable
        assertFalse(Element.AU in pool)
        assertFalse(Element.AG in pool)
        assertTrue(Element.KR in pool)
    }
}
