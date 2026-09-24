package com.elementspuyo.core

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class MatcherTest {

    private fun field(block: Field.() -> Unit): Field = Field().apply(block)

    // ─────────────────────────── 규칙 1: 분자 (옥텟) ───────────────────────────

    @Test fun `rule1 NaCl pair clears both`() {
        val f = field {
            this[0, 0] = Element.NA
            this[1, 0] = Element.CL
        }
        val m = Matcher(f).findMolecules()
        assertEquals(setOf(Pos(0, 0), Pos(1, 0)), m)
    }

    @Test fun `rule1 MgCl2 as Cl-Mg-Cl horizontal clears all three`() {
        val f = field {
            this[0, 0] = Element.CL
            this[1, 0] = Element.MG
            this[2, 0] = Element.CL
        }
        val m = Matcher(f).findMolecules()
        assertEquals(setOf(Pos(0, 0), Pos(1, 0), Pos(2, 0)), m)
    }

    @Test fun `rule1 H2O as H-O-H horizontal clears all three`() {
        val f = field {
            this[0, 0] = Element.H
            this[1, 0] = Element.O
            this[2, 0] = Element.H
        }
        val m = Matcher(f).findMolecules()
        assertEquals(setOf(Pos(0, 0), Pos(1, 0), Pos(2, 0)), m)
    }

    @Test fun `rule1 single ion does not clear`() {
        val f = field { this[3, 0] = Element.NA }
        assertTrue(Matcher(f).findMolecules().isEmpty())
    }

    @Test fun `rule1 same element repetition does not clear`() {
        val f = field {
            this[0, 0] = Element.NA
            this[1, 0] = Element.NA
            this[2, 0] = Element.NA
        }
        assertTrue(Matcher(f).findMolecules().isEmpty())
    }

    @Test fun `rule1 cations only does not clear`() {
        val f = field {
            this[0, 0] = Element.NA
            this[1, 0] = Element.MG
        }
        assertTrue(Matcher(f).findMolecules().isEmpty())
    }

    @Test fun `rule1 anions only does not clear`() {
        val f = field {
            this[0, 0] = Element.CL
            this[1, 0] = Element.O
        }
        assertTrue(Matcher(f).findMolecules().isEmpty())
    }

    @Test fun `rule1 noble gas breaks connectivity`() {
        val f = field {
            this[0, 0] = Element.NA
            this[1, 0] = Element.NE
            this[2, 0] = Element.CL
        }
        assertTrue(Matcher(f).findMolecules().isEmpty(),
            "Na and Cl should be in separate components split by Ne")
    }

    @Test fun `rule1 unbalanced component does not clear`() {
        val f = field {
            this[0, 0] = Element.NA
            this[1, 0] = Element.CL
            this[2, 0] = Element.MG  // sum: +1-1+2 = +2
        }
        assertTrue(Matcher(f).findMolecules().isEmpty())
    }

    // ─────────────────────────── 규칙 2: 같은 주기 가로 ───────────────────────────

    @Test fun `rule2 period 2 three distinct clears`() {
        val f = field {
            this[0, 0] = Element.LI
            this[1, 0] = Element.BE
            this[2, 0] = Element.B
        }
        val m = Matcher(f).findPeriodRuns()
        assertEquals(setOf(Pos(0, 0), Pos(1, 0), Pos(2, 0)), m)
    }

    @Test fun `rule2 period 3 four distinct clears all four`() {
        val f = field {
            this[0, 0] = Element.NA
            this[1, 0] = Element.MG
            this[2, 0] = Element.AL
            this[3, 0] = Element.SI
        }
        val m = Matcher(f).findPeriodRuns()
        assertEquals(setOf(Pos(0, 0), Pos(1, 0), Pos(2, 0), Pos(3, 0)), m)
    }

    @Test fun `rule2 repeated element in row does not clear`() {
        val f = field {
            this[0, 0] = Element.NA
            this[1, 0] = Element.MG
            this[2, 0] = Element.NA
        }
        assertTrue(Matcher(f).findPeriodRuns().isEmpty())
    }

    @Test fun `rule2 mixed periods do not clear`() {
        val f = field {
            this[0, 0] = Element.LI  // period 2
            this[1, 0] = Element.NA  // period 3
            this[2, 0] = Element.BE  // period 2
        }
        assertTrue(Matcher(f).findPeriodRuns().isEmpty())
    }

    @Test fun `rule2 only two distinct do not clear`() {
        val f = field {
            this[0, 0] = Element.LI
            this[1, 0] = Element.BE
        }
        assertTrue(Matcher(f).findPeriodRuns().isEmpty())
    }

    // ─────────────────────────── 규칙 3: 같은 족 세로 ───────────────────────────

    @Test fun `rule3 group 1 stack of three clears`() {
        val f = field {
            this[0, 0] = Element.H
            this[0, 1] = Element.LI
            this[0, 2] = Element.NA
        }
        val m = Matcher(f).findGroupRuns()
        assertEquals(setOf(Pos(0, 0), Pos(0, 1), Pos(0, 2)), m)
    }

    @Test fun `rule3 group 18 noble stack clears`() {
        val f = field {
            this[0, 0] = Element.HE
            this[0, 1] = Element.NE
            this[0, 2] = Element.AR
        }
        val m = Matcher(f).findGroupRuns()
        assertEquals(setOf(Pos(0, 0), Pos(0, 1), Pos(0, 2)), m)
    }

    @Test fun `rule3 same element stack does not clear`() {
        val f = field {
            this[0, 0] = Element.NA
            this[0, 1] = Element.NA
            this[0, 2] = Element.NA
        }
        assertTrue(Matcher(f).findGroupRuns().isEmpty())
    }

    @Test fun `rule3 same noble repeated does not clear`() {
        val f = field {
            this[0, 0] = Element.HE
            this[0, 1] = Element.HE
            this[0, 2] = Element.HE
        }
        assertTrue(Matcher(f).findGroupRuns().isEmpty())
    }

    @Test fun `rule3 mixed groups do not clear`() {
        val f = field {
            this[0, 0] = Element.NA  // group 1
            this[0, 1] = Element.MG  // group 2
            this[0, 2] = Element.LI  // group 1
        }
        assertTrue(Matcher(f).findGroupRuns().isEmpty())
    }

    // ─────────────────────────── 통합 ───────────────────────────

    @Test fun `findMatches unions all three rules`() {
        val f = field {
            // Rule 1: NaCl pair at (5,0),(6,0)
            this[5, 0] = Element.NA
            this[6, 0] = Element.CL
            // Rule 3: He-Ne-Ar vertical at col 0
            this[0, 0] = Element.HE
            this[0, 1] = Element.NE
            this[0, 2] = Element.AR
        }
        val m = Matcher(f).findMatches()
        assertTrue(Pos(5, 0) in m && Pos(6, 0) in m)
        assertTrue(Pos(0, 0) in m && Pos(0, 1) in m && Pos(0, 2) in m)
    }

    @Test fun `noble gas is not cleared by rule 1 even when adjacent to ions`() {
        val f = field {
            this[0, 0] = Element.NA
            this[1, 0] = Element.CL   // NaCl pair – Rule 1 will clear these two
            this[2, 0] = Element.NE   // noble adjacent to Cl but doesn't participate
        }
        val m = Matcher(f).findMolecules()
        assertFalse(Pos(2, 0) in m, "Noble gas must not be included in Rule 1 clear")
        assertTrue(Pos(0, 0) in m && Pos(1, 0) in m)
    }
}
