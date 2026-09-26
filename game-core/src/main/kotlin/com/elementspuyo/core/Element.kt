package com.elementspuyo.core

enum class ElementCategory { METAL, NONMETAL, METALLOID, NOBLE, OBSTACLE }

/**
 * 원소 정의. 웹 game.js 의 ELEMENTS 와 동기화.
 * - 주기 1~4 전부, 이온 변종 별도 항목 (C/CP, Si/SIM, Fe2/Fe3 등)
 * - 원자량(mass) 및 낙하 큐 가중치(weight) 자동 계산
 */
enum class Element(
    val atomicNumber: Int,
    val symbol: String,
    val nameKr: String,
    val period: Int,
    val group: Int,
    val charge: Int,
    val category: ElementCategory,
) {
    // ── 주기 1
    H (1,  "H",  "수소",   1, 1,  +1, ElementCategory.NONMETAL),
    HE(2,  "He", "헬륨",   1, 18,  0, ElementCategory.NOBLE),
    // ── 주기 2
    LI(3,  "Li", "리튬",     2, 1,  +1, ElementCategory.METAL),
    BE(4,  "Be", "베릴륨",   2, 2,  +2, ElementCategory.METAL),
    B (5,  "B",  "붕소",     2, 13, +3, ElementCategory.METALLOID),
    C (6,  "C",  "탄소",     2, 14, -4, ElementCategory.NONMETAL),
    CP(6,  "C",  "탄소(양)", 2, 14, +4, ElementCategory.NONMETAL),
    N (7,  "N",  "질소",     2, 15, -3, ElementCategory.NONMETAL),
    O (8,  "O",  "산소",     2, 16, -2, ElementCategory.NONMETAL),
    F (9,  "F",  "플루오린", 2, 17, -1, ElementCategory.NONMETAL),
    NE(10, "Ne", "네온",     2, 18,  0, ElementCategory.NOBLE),
    // ── 주기 3
    NA(11, "Na", "나트륨",   3, 1,  +1, ElementCategory.METAL),
    MG(12, "Mg", "마그네슘", 3, 2,  +2, ElementCategory.METAL),
    AL(13, "Al", "알루미늄", 3, 13, +3, ElementCategory.METAL),
    SI(14, "Si", "규소",     3, 14, +4, ElementCategory.METALLOID),
    SIM(14,"Si", "규소(음)", 3, 14, -4, ElementCategory.METALLOID),
    P (15, "P",  "인",       3, 15, -3, ElementCategory.NONMETAL),
    S (16, "S",  "황",       3, 16, -2, ElementCategory.NONMETAL),
    CL(17, "Cl", "염소",     3, 17, -1, ElementCategory.NONMETAL),
    AR(18, "Ar", "아르곤",   3, 18,  0, ElementCategory.NOBLE),
    // ── 주기 4 (전이금속은 흔한 산화수마다 별도 변종)
    K  (19, "K",  "칼륨",             4, 1,  +1, ElementCategory.METAL),
    CA (20, "Ca", "칼슘",             4, 2,  +2, ElementCategory.METAL),
    SC (21, "Sc", "스칸듐",           4, 3,  +3, ElementCategory.METAL),
    TI2(22, "Ti", "타이타늄(II)",     4, 4,  +2, ElementCategory.METAL),
    TI4(22, "Ti", "타이타늄(IV)",     4, 4,  +4, ElementCategory.METAL),
    V3 (23, "V",  "바나듐(III)",      4, 5,  +3, ElementCategory.METAL),
    V5 (23, "V",  "바나듐(V)",        4, 5,  +5, ElementCategory.METAL),
    CR3(24, "Cr", "크로뮴(III)",      4, 6,  +3, ElementCategory.METAL),
    CR6(24, "Cr", "크로뮴(VI)",       4, 6,  +6, ElementCategory.METAL),
    MN2(25, "Mn", "망가니즈(II)",     4, 7,  +2, ElementCategory.METAL),
    MN4(25, "Mn", "망가니즈(IV)",     4, 7,  +4, ElementCategory.METAL),
    FE2(26, "Fe", "철(II)",           4, 8,  +2, ElementCategory.METAL),
    FE3(26, "Fe", "철(III)",          4, 8,  +3, ElementCategory.METAL),
    CO2(27, "Co", "코발트(II)",       4, 9,  +2, ElementCategory.METAL),
    CO3(27, "Co", "코발트(III)",      4, 9,  +3, ElementCategory.METAL),
    NI (28, "Ni", "니켈",             4, 10, +2, ElementCategory.METAL),
    CU1(29, "Cu", "구리(I)",          4, 11, +1, ElementCategory.METAL),
    CU2(29, "Cu", "구리(II)",         4, 11, +2, ElementCategory.METAL),
    ZN (30, "Zn", "아연",             4, 12, +2, ElementCategory.METAL),
    GA (31, "Ga", "갈륨",             4, 13, +3, ElementCategory.METAL),
    GE (32, "Ge", "저마늄",           4, 14, +4, ElementCategory.METALLOID),
    GEM(32, "Ge", "저마늄(음)",       4, 14, -4, ElementCategory.METALLOID),
    AS (33, "As", "비소",             4, 15, -3, ElementCategory.METALLOID),
    ASP(33, "As", "비소(III)",        4, 15, +3, ElementCategory.METALLOID),
    SE (34, "Se", "셀레늄",           4, 16, -2, ElementCategory.NONMETAL),
    SEP(34, "Se", "셀레늄(VI)",       4, 16, +6, ElementCategory.NONMETAL),
    BR (35, "Br", "브로민",           4, 17, -1, ElementCategory.NONMETAL),
    KR (36, "Kr", "크립톤",           4, 18,  0, ElementCategory.NOBLE),
    // ── 장애물 (연쇄 공격으로 상대에게 보내는 금속. 규칙 참여 안 함)
    AU(79, "Au", "금", 0, 0, 0, ElementCategory.OBSTACLE),
    AG(47, "Ag", "은", 0, 0, 0, ElementCategory.OBSTACLE),
    ;

    val isNoble: Boolean get() = category == ElementCategory.NOBLE
    val isObstacle: Boolean get() = category == ElementCategory.OBSTACLE
    val isCation: Boolean get() = charge > 0
    val isAnion: Boolean get() = charge < 0
    val isDiatomic: Boolean get() = name in DIATOMIC_KEYS

    val mass: Double get() = ATOMIC_MASS[atomicNumber] ?: 0.0
    val weight: Double get() = WEIGHTS[this] ?: 0.0

    /** 심볼 + 전하 위첨자. 예: Na⁺, Mg²⁺, C⁴⁻, Fe³⁺. */
    val label: String get() = when (charge) {
         0 -> symbol
        +1 -> "$symbol⁺";   +2 -> "$symbol²⁺"
        +3 -> "$symbol³⁺";  +4 -> "$symbol⁴⁺"
        +5 -> "$symbol⁵⁺";  +6 -> "$symbol⁶⁺"
        -1 -> "$symbol⁻";   -2 -> "$symbol²⁻"
        -3 -> "$symbol³⁻";  -4 -> "$symbol⁴⁻"
        else -> "$symbol$charge"
    }

    /** 주기별 ARGB. Compose/Android 에서 그대로 사용 가능. */
    val periodColor: Int get() = when (period) {
        1 -> 0xFFFFCF3D.toInt()
        2 -> 0xFF7ED88A.toInt()
        3 -> 0xFF6FBCF5.toInt()
        4 -> 0xFFDCB0FF.toInt()
        else -> 0xFF9E9E9E.toInt()
    }

    companion object {
        val ATOMIC_MASS: Map<Int, Double> = mapOf(
            1 to 1.008, 2 to 4.0, 3 to 6.94, 4 to 9.01, 5 to 10.81,
            6 to 12.01, 7 to 14.01, 8 to 16.0, 9 to 19.0, 10 to 20.18,
            11 to 22.99, 12 to 24.31, 13 to 26.98, 14 to 28.09, 15 to 30.97,
            16 to 32.07, 17 to 35.45, 18 to 39.95,
            19 to 39.10, 20 to 40.08, 21 to 44.96, 22 to 47.87, 23 to 50.94,
            24 to 52.00, 25 to 54.94, 26 to 55.85, 27 to 58.93, 28 to 58.69,
            29 to 63.55, 30 to 65.38, 31 to 69.72, 32 to 72.63, 33 to 74.92,
            34 to 78.96, 35 to 79.90, 36 to 83.80,
            47 to 107.87, 79 to 196.97,
        )

        /** 이원자 기체 원소 키(name). */
        val DIATOMIC_KEYS: Set<String> = setOf("H", "N", "O", "F", "CL", "BR")

        /** 낙하 큐에 자연 등장하는 원소 (장애물 제외). */
        val playable: List<Element> by lazy { entries.filter { !it.isObstacle } }

        /**
         * 낙하 큐 가중치. P1:P2:P3:P4 총합 비율 10:35:35:20.
         * 주기 1 은 H:He = 3:1 (우주 원소 비율).
         * 주기 2/3/4 는 z 기준 등확률, 이온 변종(C/CP, FE2/FE3 등)은 같은 z 슬롯 분할.
         */
        private val WEIGHTS: Map<Element, Double> by lazy {
            val periodTotals = mapOf(1 to 10.0, 2 to 35.0, 3 to 35.0, 4 to 20.0)
            val zVariantCount = entries.groupingBy { it.atomicNumber }.eachCount()
            val zPerPeriod = entries.groupBy { it.period }
                .mapValues { (_, list) -> list.map { it.atomicNumber }.toSet().size }
            entries.associateWith { e ->
                when {
                    e.isObstacle -> 0.0
                    e.period == 1 -> periodTotals[1]!! * if (e.atomicNumber == 1) 0.75 else 0.25
                    else -> {
                        val total = periodTotals[e.period] ?: 0.0
                        val zCount = zPerPeriod[e.period] ?: 1
                        (total / zCount) / (zVariantCount[e.atomicNumber] ?: 1)
                    }
                }
            }
        }
    }
}
