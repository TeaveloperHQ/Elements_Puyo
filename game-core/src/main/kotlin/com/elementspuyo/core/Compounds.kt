package com.elementspuyo.core

/**
 * 화이트리스트 화합물 및 이름/표기 매핑. 웹 matcher.js 와 동기화.
 * 키 규칙: 심볼 알파벳순 + GCD 축약 개수. 예: NaCl → "Cl1Na1", Mg(OH)₂ → "H2Mg1O2".
 */
object Compounds {
    val KNOWN: Set<String> = setOf(
        // 알칼리 금속
        "F1Li1","Cl1Li1","Li2O1","Li2S1","Li3N1","Li3P1","H1Li1",
        "F1Na1","Cl1Na1","Na2O1","Na2S1","Na3P1","H1Na1",
        // 알칼리 토금속
        "Be1F2","Be1Cl2","Be1O1","Be1S1","Be3N2","Be3P2","Be2C1",
        "F2Mg1","Cl2Mg1","Mg1O1","Mg1S1","Mg3N2","Mg3P2","H2Mg1",
        // 알루미늄
        "Al1F3","Al1Cl3","Al2O3","Al2S3","Al1N1","Al1P1","Al4C3",
        // 붕소
        "B1F3","B1Cl3","B2O3","B2S3","B1N1","B1P1",
        // 규소 (Si+4)
        "C1Si1","F4Si1","Cl4Si1","O2Si1","S2Si1","N4Si3",
        // 수소 화합물
        "F1H1","Cl1H1","H2O1","H2S1","H3N1","H3P1","C1H4",
        // 삼원 이상 (수산화물/아미드/하이드로설파이드)
        "H1Li1O1","H1Na1O1","Be1H2O2","H2Mg1O2","Al1H3O3",
        "H2Li1N1","H2N1Na1","H1Li1S1","H1Na1S1",
        // 탄소 양이온 (C+4)
        "C1O2","C1F4","C1Cl4","C1S2",
        // 규소 음이온 (Si-4) — 실리사이드
        "Li4Si1","Na4Si1","Be2Si1","Mg2Si1",
        // ── 4주기 ──
        "F1K1","Cl1K1","K2O1","K2S1","K3N1","K3P1","H1K1","Br1K1",
        "Ca1F2","Ca1Cl2","Ca1O1","Ca1S1","Ca3N2","Ca3P2","Ca1H2","Br2Ca1",
        "F3Sc1","Cl3Sc1","O3Sc2","S3Sc2","N1Sc1","P1Sc1","Br3Sc1",
        "O1Ti1","S1Ti1","F2Ti1","Cl2Ti1","O2Ti1","S2Ti1","F4Ti1","Cl4Ti1","C1Ti1",
        "O3V2","F3V1","Cl3V1","N1V1","O5V2",
        "Cr2O3","Cr1F3","Cl3Cr1","Cr2S3","Cr1N1","Cr1O3",
        "Mn1O1","Mn1S1","F2Mn1","Cl2Mn1","Mn1O2",
        "Fe1O1","Fe1S1","F2Fe1","Cl2Fe1","Br2Fe1",
        "Fe2O3","F3Fe1","Cl3Fe1","Fe2S3","Br3Fe1",
        "Co1O1","Co1S1","Co1F2","Cl2Co1","Co2O3","Co1F3","Cl3Co1",
        "Ni1O1","Ni1S1","F2Ni1","Cl2Ni1",
        "Cu2O1","Cu2S1","Cl1Cu1","Cu1F1","Cu3N1","Br1Cu1",
        "Cu1O1","Cu1S1","Cu1F2","Cl2Cu1","Br2Cu1",
        "O1Zn1","S1Zn1","F2Zn1","Cl2Zn1","N2Zn3","Br2Zn1",
        "Ga2O3","F3Ga1","Cl3Ga1","Ga2S3","Ga1N1","Ga1P1","Br3Ga1","As1Ga1",
        "Ge1O2","Ge1S2","F4Ge1","Cl4Ge1","Ge3N4",
        "Ge1Li4","Ge1Na4","Ge1Mg2","Be2Ge1","Ca2Ge1",
        "As1Na3","As1K3","As2Ca3","As2Mg3","As1Li3","Al1As1","As1H3","As2Be3",
        "As1F3","As1Cl3","As2O3","As2S3",
        "Na2Se1","K2Se1","Ca1Se1","Mg1Se1","Se1Zn1","H2Se1","Al2Se3","Li2Se1","Be1Se1",
        "O3Se1","F6Se1",
        "Br1H1","Br1Li1","Br1Na1","Br2Mg1","Al1Br3","Be1Br2",
    )

    val NAMES_KR: Map<String, String> = mapOf(
        // 1-3 주기 화합물
        "F1Li1" to "플루오린화 리튬", "Cl1Li1" to "염화 리튬",
        "Li2O1" to "산화 리튬", "Li2S1" to "황화 리튬",
        "Li3N1" to "질화 리튬", "Li3P1" to "인화 리튬", "H1Li1" to "수소화 리튬",
        "F1Na1" to "플루오린화 나트륨", "Cl1Na1" to "염화 나트륨(소금)",
        "Na2O1" to "산화 나트륨", "Na2S1" to "황화 나트륨",
        "Na3P1" to "인화 나트륨", "H1Na1" to "수소화 나트륨",
        "Be1F2" to "플루오린화 베릴륨", "Be1Cl2" to "염화 베릴륨",
        "Be1O1" to "산화 베릴륨", "Be1S1" to "황화 베릴륨",
        "Be3N2" to "질화 베릴륨", "Be3P2" to "인화 베릴륨", "Be2C1" to "탄화 베릴륨",
        "F2Mg1" to "플루오린화 마그네슘", "Cl2Mg1" to "염화 마그네슘",
        "Mg1O1" to "산화 마그네슘", "Mg1S1" to "황화 마그네슘",
        "Mg3N2" to "질화 마그네슘", "Mg3P2" to "인화 마그네슘", "H2Mg1" to "수소화 마그네슘",
        "Al1F3" to "플루오린화 알루미늄", "Al1Cl3" to "염화 알루미늄",
        "Al2O3" to "산화 알루미늄(알루미나)", "Al2S3" to "황화 알루미늄",
        "Al1N1" to "질화 알루미늄", "Al1P1" to "인화 알루미늄", "Al4C3" to "탄화 알루미늄",
        "B1F3" to "삼플루오린화 붕소", "B1Cl3" to "삼염화 붕소",
        "B2O3" to "산화 붕소", "B2S3" to "황화 붕소",
        "B1N1" to "질화 붕소", "B1P1" to "인화 붕소",
        "C1Si1" to "탄화 규소", "F4Si1" to "사플루오린화 규소", "Cl4Si1" to "사염화 규소",
        "O2Si1" to "이산화 규소(실리카)", "S2Si1" to "이황화 규소", "N4Si3" to "질화 규소",
        "F1H1" to "플루오린화 수소(불산)", "Cl1H1" to "염화 수소(염산)",
        "H2O1" to "물", "H2S1" to "황화 수소",
        "H3N1" to "암모니아", "H3P1" to "포스핀", "C1H4" to "메탄",
        "H1Li1O1" to "수산화 리튬", "H1Na1O1" to "수산화 나트륨(가성소다)",
        "Be1H2O2" to "수산화 베릴륨", "H2Mg1O2" to "수산화 마그네슘", "Al1H3O3" to "수산화 알루미늄",
        "H2Li1N1" to "리튬 아미드", "H2N1Na1" to "소듐 아미드",
        "H1Li1S1" to "리튬 하이드로설파이드", "H1Na1S1" to "소듐 하이드로설파이드",
        "C1O2" to "이산화 탄소", "C1F4" to "사플루오린화 탄소",
        "C1Cl4" to "사염화 탄소", "C1S2" to "이황화 탄소",
        "Li4Si1" to "규화 리튬", "Na4Si1" to "규화 나트륨",
        "Be2Si1" to "규화 베릴륨", "Mg2Si1" to "규화 마그네슘",
        // 4주기 K/Ca
        "F1K1" to "플루오린화 칼륨", "Cl1K1" to "염화 칼륨", "K2O1" to "산화 칼륨",
        "K2S1" to "황화 칼륨", "K3N1" to "질화 칼륨", "K3P1" to "인화 칼륨",
        "H1K1" to "수소화 칼륨", "Br1K1" to "브로민화 칼륨",
        "Ca1F2" to "플루오린화 칼슘", "Ca1Cl2" to "염화 칼슘", "Ca1O1" to "산화 칼슘",
        "Ca1S1" to "황화 칼슘", "Ca3N2" to "질화 칼슘", "Ca3P2" to "인화 칼슘",
        "Ca1H2" to "수소화 칼슘", "Br2Ca1" to "브로민화 칼슘",
        // 전이금속
        "F3Sc1" to "플루오린화 스칸듐", "Cl3Sc1" to "염화 스칸듐",
        "O3Sc2" to "산화 스칸듐", "S3Sc2" to "황화 스칸듐",
        "N1Sc1" to "질화 스칸듐", "P1Sc1" to "인화 스칸듐", "Br3Sc1" to "브로민화 스칸듐",
        "O1Ti1" to "산화 타이타늄(II)", "S1Ti1" to "황화 타이타늄(II)",
        "F2Ti1" to "플루오린화 타이타늄(II)", "Cl2Ti1" to "염화 타이타늄(II)",
        "O2Ti1" to "산화 타이타늄(IV)", "S2Ti1" to "황화 타이타늄(IV)",
        "F4Ti1" to "플루오린화 타이타늄(IV)", "Cl4Ti1" to "염화 타이타늄(IV)",
        "C1Ti1" to "탄화 타이타늄",
        "O3V2" to "산화 바나듐(III)", "F3V1" to "플루오린화 바나듐(III)",
        "Cl3V1" to "염화 바나듐(III)", "N1V1" to "질화 바나듐", "O5V2" to "오산화 이바나듐",
        "Cr2O3" to "산화 크로뮴(III)", "Cr1F3" to "플루오린화 크로뮴(III)",
        "Cl3Cr1" to "염화 크로뮴(III)", "Cr2S3" to "황화 크로뮴(III)",
        "Cr1N1" to "질화 크로뮴", "Cr1O3" to "산화 크로뮴(VI)",
        "Mn1O1" to "산화 망가니즈(II)", "Mn1S1" to "황화 망가니즈(II)",
        "F2Mn1" to "플루오린화 망가니즈(II)", "Cl2Mn1" to "염화 망가니즈(II)",
        "Mn1O2" to "이산화 망가니즈",
        "Fe1O1" to "산화 철(II)", "Fe1S1" to "황화 철(II)",
        "F2Fe1" to "플루오린화 철(II)", "Cl2Fe1" to "염화 철(II)", "Br2Fe1" to "브로민화 철(II)",
        "Fe2O3" to "산화 철(III)", "F3Fe1" to "플루오린화 철(III)",
        "Cl3Fe1" to "염화 철(III)", "Fe2S3" to "황화 철(III)", "Br3Fe1" to "브로민화 철(III)",
        "Co1O1" to "산화 코발트(II)", "Co1S1" to "황화 코발트(II)",
        "Co1F2" to "플루오린화 코발트(II)", "Cl2Co1" to "염화 코발트(II)",
        "Co2O3" to "산화 코발트(III)", "Co1F3" to "플루오린화 코발트(III)", "Cl3Co1" to "염화 코발트(III)",
        "Ni1O1" to "산화 니켈", "Ni1S1" to "황화 니켈",
        "F2Ni1" to "플루오린화 니켈", "Cl2Ni1" to "염화 니켈",
        "Cu2O1" to "산화 구리(I)", "Cu2S1" to "황화 구리(I)",
        "Cl1Cu1" to "염화 구리(I)", "Cu1F1" to "플루오린화 구리(I)",
        "Cu3N1" to "질화 구리(I)", "Br1Cu1" to "브로민화 구리(I)",
        "Cu1O1" to "산화 구리(II)", "Cu1S1" to "황화 구리(II)",
        "Cu1F2" to "플루오린화 구리(II)", "Cl2Cu1" to "염화 구리(II)", "Br2Cu1" to "브로민화 구리(II)",
        "O1Zn1" to "산화 아연", "S1Zn1" to "황화 아연",
        "F2Zn1" to "플루오린화 아연", "Cl2Zn1" to "염화 아연",
        "N2Zn3" to "질화 아연", "Br2Zn1" to "브로민화 아연",
        // Ga, Ge (±), As (±), Se (±), Br
        "Ga2O3" to "산화 갈륨", "F3Ga1" to "플루오린화 갈륨", "Cl3Ga1" to "염화 갈륨",
        "Ga2S3" to "황화 갈륨", "Ga1N1" to "질화 갈륨", "Ga1P1" to "인화 갈륨",
        "Br3Ga1" to "브로민화 갈륨", "As1Ga1" to "비소화 갈륨",
        "Ge1O2" to "이산화 저마늄", "Ge1S2" to "이황화 저마늄",
        "F4Ge1" to "사플루오린화 저마늄", "Cl4Ge1" to "사염화 저마늄", "Ge3N4" to "질화 저마늄",
        "Ge1Li4" to "저마늄화 리튬", "Ge1Na4" to "저마늄화 나트륨",
        "Ge1Mg2" to "저마늄화 마그네슘", "Be2Ge1" to "저마늄화 베릴륨", "Ca2Ge1" to "저마늄화 칼슘",
        "As1Na3" to "비소화 나트륨", "As1K3" to "비소화 칼륨",
        "As2Ca3" to "비소화 칼슘", "As2Mg3" to "비소화 마그네슘",
        "As1Li3" to "비소화 리튬", "Al1As1" to "비소화 알루미늄",
        "As1H3" to "아르신", "As2Be3" to "비소화 베릴륨",
        "As1F3" to "삼플루오린화 비소", "As1Cl3" to "삼염화 비소",
        "As2O3" to "삼산화 이비소", "As2S3" to "삼황화 이비소",
        "Na2Se1" to "셀레늄화 나트륨", "K2Se1" to "셀레늄화 칼륨",
        "Ca1Se1" to "셀레늄화 칼슘", "Mg1Se1" to "셀레늄화 마그네슘",
        "Se1Zn1" to "셀레늄화 아연", "H2Se1" to "셀레늄화 수소",
        "Al2Se3" to "셀레늄화 알루미늄", "Li2Se1" to "셀레늄화 리튬", "Be1Se1" to "셀레늄화 베릴륨",
        "O3Se1" to "삼산화 셀레늄", "F6Se1" to "육플루오린화 셀레늄",
        "Br1H1" to "브로민화 수소", "Br1Li1" to "브로민화 리튬", "Br1Na1" to "브로민화 나트륨",
        "Br2Mg1" to "브로민화 마그네슘", "Al1Br3" to "브로민화 알루미늄", "Be1Br2" to "브로민화 베릴륨",
    )

    val DIATOMIC_NAMES_KR: Map<String, String> = mapOf(
        "H" to "수소 기체", "N" to "질소 기체", "O" to "산소 기체",
        "F" to "플루오린 기체", "CL" to "염소 기체", "BR" to "브로민 기체",
    )

    /** 관례상 전하 정렬과 다른 표기 override. */
    val DISPLAY_FORMULAS: Map<String, String> = mapOf(
        "C1H4" to "CH₄", "H3N1" to "NH₃", "H3P1" to "PH₃",
        "H1Li1O1" to "LiOH", "H1Na1O1" to "NaOH",
        "Be1H2O2" to "Be(OH)₂", "H2Mg1O2" to "Mg(OH)₂", "Al1H3O3" to "Al(OH)₃",
        "H2Li1N1" to "LiNH₂", "H2N1Na1" to "NaNH₂",
        "H1Li1S1" to "LiSH", "H1Na1S1" to "NaSH",
        "C1Si1" to "SiC", "As1H3" to "AsH₃",
    )

    /** 셀 원소 리스트에서 empirical formula key 생성 (심볼 알파벳순, GCD 축약). */
    fun canonicalKey(cellEls: List<Element>): String {
        val counts = linkedMapOf<String, Int>()
        for (e in cellEls) counts[e.symbol] = (counts[e.symbol] ?: 0) + 1
        val g = counts.values.reduce(::gcd)
        return counts.entries.sortedBy { it.key }
            .joinToString("") { (s, n) -> "$s${n / g}" }
    }

    /** 표시 formula. DISPLAY_FORMULAS override 우선, 그다음 metal-cation → nonmetal-cation → anion 순. */
    fun displayFormula(cellEls: List<Element>): String {
        val key = canonicalKey(cellEls)
        DISPLAY_FORMULAS[key]?.let { return it }
        val counts = linkedMapOf<String, Int>()
        val bySym = mutableMapOf<String, Element>()
        for (e in cellEls) {
            counts[e.symbol] = (counts[e.symbol] ?: 0) + 1
            bySym[e.symbol] = e
        }
        val g = counts.values.reduce(::gcd)
        val symbols = counts.keys.sortedWith(
            compareBy({ elementRank(bySym[it]!!) }, { bySym[it]!!.atomicNumber })
        )
        return symbols.joinToString("") { s ->
            val n = counts[s]!! / g
            if (n == 1) s else "$s${subscript(n)}"
        }
    }

    private fun elementRank(e: Element): Int = when {
        e.category == ElementCategory.METAL -> 0
        e.charge > 0 -> 1
        else -> 2
    }

    private fun subscript(n: Int): String = n.toString()
        .map { "₀₁₂₃₄₅₆₇₈₉"[it.digitToInt()] }.joinToString("")

    private tailrec fun gcd(a: Int, b: Int): Int = if (b == 0) a else gcd(b, a % b)
}
