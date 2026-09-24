package com.elementspuyo.core

enum class ElementCategory { METAL, NONMETAL, METALLOID, NOBLE }

enum class Element(
    val atomicNumber: Int,
    val symbol: String,
    val nameKr: String,
    val period: Int,
    val group: Int,
    val charge: Int,
    val category: ElementCategory,
) {
    H (1,  "H",  "수소",     1, 1,  +1, ElementCategory.NONMETAL),
    HE(2,  "He", "헬륨",     1, 18,  0, ElementCategory.NOBLE),
    LI(3,  "Li", "리튬",     2, 1,  +1, ElementCategory.METAL),
    BE(4,  "Be", "베릴륨",   2, 2,  +2, ElementCategory.METAL),
    B (5,  "B",  "붕소",     2, 13, +3, ElementCategory.METALLOID),
    C (6,  "C",  "탄소",     2, 14, -4, ElementCategory.NONMETAL),
    N (7,  "N",  "질소",     2, 15, -3, ElementCategory.NONMETAL),
    O (8,  "O",  "산소",     2, 16, -2, ElementCategory.NONMETAL),
    F (9,  "F",  "플루오린", 2, 17, -1, ElementCategory.NONMETAL),
    NE(10, "Ne", "네온",     2, 18,  0, ElementCategory.NOBLE),
    NA(11, "Na", "나트륨",   3, 1,  +1, ElementCategory.METAL),
    MG(12, "Mg", "마그네슘", 3, 2,  +2, ElementCategory.METAL),
    AL(13, "Al", "알루미늄", 3, 13, +3, ElementCategory.METAL),
    SI(14, "Si", "규소",     3, 14, +4, ElementCategory.METALLOID),
    P (15, "P",  "인",       3, 15, -3, ElementCategory.NONMETAL),
    S (16, "S",  "황",       3, 16, -2, ElementCategory.NONMETAL),
    CL(17, "Cl", "염소",     3, 17, -1, ElementCategory.NONMETAL),
    AR(18, "Ar", "아르곤",   3, 18,  0, ElementCategory.NOBLE),
    ;

    val isNoble: Boolean get() = category == ElementCategory.NOBLE
    val isCation: Boolean get() = charge > 0
    val isAnion: Boolean get() = charge < 0

    /**
     * 클러스터 원소: 분자를 만들지 않고 뭉쳐서 존재하는 원소.
     * 금속(금속 결합) + C, Si(network solid).
     */
    val isCluster: Boolean get() = category == ElementCategory.METAL || this == C || this == SI

    /**
     * UI 표시용 이온 기호. 예: "Na⁺", "Mg²⁺", "O²⁻", "Al³⁺", "C⁴⁻". 비활성 기체는 기호만.
     * 원소 자체는 charge 프로퍼티로 몇 가 이온인지 프로그램적으로 알 수 있음.
     */
    val label: String get() = when (charge) {
         0 -> symbol
        +1 -> "$symbol⁺"
        +2 -> "$symbol²⁺"
        +3 -> "$symbol³⁺"
        +4 -> "$symbol⁴⁺"
        -1 -> "$symbol⁻"
        -2 -> "$symbol²⁻"
        -3 -> "$symbol³⁻"
        -4 -> "$symbol⁴⁻"
        else -> "$symbol$charge"
    }

    /**
     * UI 힌트: 같은 주기 = 같은 색. 규칙 2(주기 가로 3+) 를 시각적으로 알아채기 쉽게.
     * 족(그룹) 는 별도 색 없음 — 이온 라벨의 전하로 이미 시각화됨.
     * ARGB 8-bit 정수 (Android Compose Color, java.awt.Color 등에서 그대로 사용 가능).
     */
    val periodColor: Int get() = when (period) {
        1 -> 0xFFFFC107.toInt() // amber (H, He)
        2 -> 0xFF4CAF50.toInt() // green (Li~Ne)
        3 -> 0xFF2196F3.toInt() // blue  (Na~Ar)
        else -> 0xFF9E9E9E.toInt()
    }
}
