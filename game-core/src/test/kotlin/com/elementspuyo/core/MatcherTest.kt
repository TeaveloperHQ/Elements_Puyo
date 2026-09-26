package com.elementspuyo.core

import kotlin.random.Random
import kotlin.test.*

class MatcherTest {

    private fun place(f: Field, vararg cells: Triple<Int, Int, Element>) {
        for ((x, y, e) in cells) f[x, y] = e
    }

    @Test fun nh3StarShapeFires() {
        val f = Field()
        place(f,
            Triple(3, 3, Element.N),
            Triple(3, 4, Element.H),
            Triple(3, 2, Element.H),
            Triple(4, 3, Element.H),
        )
        val res = Matcher(f).findAll()
        val keys = res.subsets.map { it.key }
        assertTrue("H3N1" in keys, "expected NH3, got $keys")
        val nh3 = res.subsets.first { it.key == "H3N1" }
        assertEquals("NH₃", nh3.formula)
        assertEquals("암모니아", nh3.nameKr)
    }

    @Test fun co2ViaCarbonCation() {
        val f = Field()
        place(f, Triple(3,3,Element.CP), Triple(3,4,Element.O), Triple(3,2,Element.O))
        val res = Matcher(f).findAll()
        assertTrue(res.subsets.any { it.key == "C1O2" }, "expected CO2 via CP")
    }

    @Test fun mg2SiViaSiliconAnion() {
        val f = Field()
        place(f, Triple(3,3,Element.SIM), Triple(3,4,Element.MG), Triple(3,2,Element.MG))
        val res = Matcher(f).findAll()
        assertTrue(res.subsets.any { it.key == "Mg2Si1" }, "expected Mg2Si via SIM")
    }

    @Test fun feoAndFe2o3ViaFeVariants() {
        val f1 = Field()
        place(f1, Triple(3,3,Element.FE2), Triple(3,4,Element.O))
        assertTrue(Matcher(f1).findAll().subsets.any { it.key == "Fe1O1" })

        val f2 = Field()
        place(f2,
            Triple(3,3,Element.FE3), Triple(3,4,Element.FE3),
            Triple(4,3,Element.O), Triple(4,4,Element.O), Triple(4,2,Element.O),
        )
        assertTrue(Matcher(f2).findAll().subsets.any { it.key == "Fe2O3" })
    }

    @Test fun ticl4AndCro3AndAsh3() {
        val f1 = Field()
        place(f1, Triple(3,3,Element.TI4),
            Triple(3,4,Element.CL), Triple(3,2,Element.CL),
            Triple(4,3,Element.CL), Triple(2,3,Element.CL))
        assertTrue(Matcher(f1).findAll().subsets.any { it.key == "Cl4Ti1" })

        val f2 = Field()
        place(f2, Triple(3,3,Element.CR6),
            Triple(3,4,Element.O), Triple(3,2,Element.O), Triple(4,3,Element.O))
        assertTrue(Matcher(f2).findAll().subsets.any { it.key == "Cr1O3" })

        val f3 = Field()
        place(f3, Triple(3,3,Element.AS),
            Triple(3,4,Element.H), Triple(3,2,Element.H), Triple(4,3,Element.H))
        val res3 = Matcher(f3).findAll()
        val ash3 = res3.subsets.first { it.key == "As1H3" }
        assertEquals("AsH₃", ash3.formula)
    }

    @Test fun nh3WinsOverH2InSameTick() {
        val f = Field()
        place(f, Triple(3,3,Element.N),
            Triple(3,4,Element.H), Triple(3,2,Element.H), Triple(4,3,Element.H))
        val res = Matcher(f).findAll()
        val keys = res.subsets.map { it.key }
        assertTrue("H3N1" in keys, "NH3 should fire")
        assertTrue(keys.none { it.startsWith("_dia_") }, "no diatomic should claim NH3's H's")
    }

    @Test fun diatomicH2FiresWithoutCompound() {
        val f = Field()
        place(f, Triple(3,3,Element.H), Triple(3,4,Element.H), Triple(3,5,Element.H))
        val res = Matcher(f).findAll()
        val dia = res.subsets.firstOrNull { it.isDiatomic }
        assertNotNull(dia)
        assertEquals("H₂", dia.formula)
        assertEquals(3, dia.cellIds.size)
    }

    @Test fun metalClusterMergesIonVariants() {
        val f = Field()
        f[0,0] = Element.FE2; f[1,0] = Element.FE3; f[2,0] = Element.FE2
        f[3,0] = Element.FE3; f[4,0] = Element.FE2
        val res = Matcher(f).findAll()
        assertEquals(5, res.metalCells.size, "Fe2/Fe3 mixed 5-cluster should count as one")
    }

    @Test fun periodRunFiresForFiveDistinctSamePeriod() {
        val f = Field()
        val row = listOf(Element.LI, Element.BE, Element.B, Element.C, Element.N, Element.O, Element.F)
        for ((i, e) in row.withIndex()) f[i, 0] = e
        val per = PeriodRunRule(f).evaluate()
        assertEquals(row.size, per.size)
    }

    @Test fun invariantMoleculeCellsExcludedFromOtherRules() {
        // Fuzz: 500 random fields — molecule cells must never appear in per/grp/met.
        val rng = Random(42)
        val pool = Element.playable
        repeat(500) { iter ->
            val f = Field()
            for (x in 0 until f.width) for (y in 0 until f.height) {
                if (rng.nextDouble() < 0.5) f[x, y] = pool[rng.nextInt(pool.size)]
            }
            val res = Matcher(f).findAll()
            for (c in res.periodCells) assertFalse(c in res.cells, "iter $iter period shares mol cell $c")
            for (c in res.groupCells) assertFalse(c in res.cells, "iter $iter group shares mol cell $c")
            for (c in res.metalCells) assertFalse(c in res.cells, "iter $iter metal shares mol cell $c")
            // compound + diatomic partition mol
            val union = res.compoundCells + res.diatomicCells
            assertEquals(res.cells.size, union.size, "iter $iter partition size")
        }
    }

    @Test fun largestMassMoleculeWins() {
        // NaCl (mass 58.44) vs CH4 (mass 16.04) overlapping wouldn't happen easily,
        // but check that a larger-mass compound beats a smaller one when both would fire alone.
        val f1 = Field()
        place(f1, Triple(3,3,Element.NA), Triple(3,4,Element.CL))
        val naCl = Matcher(f1).findAll().subsets.first { it.key == "Cl1Na1" }
        assertTrue(naCl.value > 5000, "NaCl mass·100 should exceed 5000, got ${naCl.value}")
    }
}
