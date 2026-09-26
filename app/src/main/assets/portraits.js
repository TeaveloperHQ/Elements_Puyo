// Chemist emblems — 각 화학자의 대표 업적을 상징으로 표현한 SVG.
// 실사 얼굴 대신 인식 가능한 도구/도식을 사용 (교육적 힌트 역할).
// 팔레트: 세피아·황금 톤 — style.css 의 chemist-portrait 프레임과 조화.

const EMBLEM_BG = "radial-gradient(circle at 35% 30%, #5a3f1e, #1e1408 80%)";

// 공통 SVG 시작/끝 헬퍼
function svg(inner, vb = "0 0 100 100") {
  return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;
}

// 각 엠블럼 — key 는 랭크 index (0..11)
const CHEMIST_EMBLEMS = {
  // 0. Zosimos — 증류기(alembic)
  zosimos: svg(`
    <defs><linearGradient id="g0" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffd88a"/><stop offset="1" stop-color="#c48533"/>
    </linearGradient></defs>
    <path d="M35 78 h30 v-8 h-30 z" fill="#8a5a25" stroke="#ffd88a" stroke-width="1.2"/>
    <ellipse cx="50" cy="60" rx="18" ry="12" fill="url(#g0)" stroke="#ffd88a" stroke-width="1.5"/>
    <path d="M50 48 Q50 30 62 22 Q70 18 74 22" fill="none" stroke="#ffd88a" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="76" cy="24" r="3" fill="#ffd88a"/>
    <path d="M42 72 q2 -6 8 -6 q6 0 8 6" fill="none" stroke="#ffb45a" stroke-width="1.2" opacity="0.7"/>
  `),

  // 1. Jabir — 아쿠아 레지아 플라스크 + 아랍 별
  jabir: svg(`
    <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffd88a"/><stop offset="1" stop-color="#a86a2a"/>
    </linearGradient></defs>
    <path d="M40 30 v18 l-14 26 q-2 8 6 8 h36 q8 0 6 -8 l-14 -26 v-18 z"
          fill="url(#g1)" stroke="#ffd88a" stroke-width="1.5"/>
    <rect x="40" y="24" width="20" height="8" rx="2" fill="#8a5a25" stroke="#ffd88a" stroke-width="1.2"/>
    <path d="M32 62 h36" stroke="#ffb45a" stroke-width="0.8" opacity="0.6"/>
    <path d="M50 40 l3 6 6 1 -4.5 4.5 1 6 -5.5 -3 -5.5 3 1 -6 -4.5 -4.5 6 -1 z" fill="#ffd88a" opacity="0.85"/>
  `),

  // 2. Paracelsus — 뱀과 지팡이(의화학) + 수은 기호
  paracelsus: svg(`
    <line x1="50" y1="16" x2="50" y2="82" stroke="#ffd88a" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M50 30 q-14 4 -14 14 q0 10 14 10 q14 0 14 10 q0 10 -14 12"
          fill="none" stroke="#c48533" stroke-width="3.2" stroke-linecap="round"/>
    <circle cx="36" cy="30" r="3.5" fill="#ffd88a"/>
    <path d="M32 28 q4 -4 8 0" stroke="#3a2a15" stroke-width="1" fill="none"/>
    <circle cx="34" cy="30" r="0.8" fill="#3a2a15"/>
    <text x="50" y="90" text-anchor="middle" font-family="serif" font-size="11" font-weight="900" fill="#ffd88a">☿</text>
  `),

  // 3. Boyle — 기체 부피 실험 (실린더 + 화살표)
  boyle: svg(`
    <rect x="34" y="20" width="32" height="60" rx="3" fill="#3a2a15" stroke="#ffd88a" stroke-width="1.5"/>
    <rect x="36" y="46" width="28" height="32" fill="#ffd88a" opacity="0.25"/>
    <line x1="36" y1="46" x2="64" y2="46" stroke="#ffd88a" stroke-width="1.2" stroke-dasharray="2 2"/>
    <circle cx="42" cy="60" r="2" fill="#ffd88a"/><circle cx="52" cy="68" r="2" fill="#ffd88a"/>
    <circle cx="58" cy="56" r="2" fill="#ffd88a"/><circle cx="46" cy="72" r="1.6" fill="#ffd88a"/>
    <path d="M78 30 v20 M74 46 l4 4 4 -4" stroke="#ffb45a" stroke-width="2" fill="none" stroke-linecap="round"/>
    <text x="80" y="24" font-family="serif" font-size="8" fill="#ffb45a" text-anchor="middle">P</text>
  `),

  // 4. Lavoisier — 저울 (질량 보존)
  lavoisier: svg(`
    <line x1="50" y1="20" x2="50" y2="70" stroke="#ffd88a" stroke-width="2.5"/>
    <line x1="20" y1="35" x2="80" y2="35" stroke="#ffd88a" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M14 35 l6 18 h-12 z" fill="url(#gL1)" stroke="#ffd88a" stroke-width="1.2"/>
    <path d="M86 35 l6 18 h-12 z" fill="url(#gL1)" stroke="#ffd88a" stroke-width="1.2"/>
    <defs><linearGradient id="gL1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffd88a"/><stop offset="1" stop-color="#a86a2a"/>
    </linearGradient></defs>
    <rect x="38" y="70" width="24" height="10" rx="1" fill="#8a5a25" stroke="#ffd88a" stroke-width="1.2"/>
    <circle cx="50" cy="20" r="3" fill="#ffd88a"/>
  `),

  // 5. Dalton — 원자 (동그란 공 3개 = 물)
  dalton: svg(`
    <circle cx="50" cy="42" r="18" fill="#a86a2a" stroke="#ffd88a" stroke-width="1.8"/>
    <circle cx="46" cy="36" r="4" fill="#ffd88a" opacity="0.5"/>
    <text x="50" y="48" text-anchor="middle" font-family="serif" font-size="18" font-weight="900" fill="#ffd88a">O</text>
    <circle cx="28" cy="68" r="10" fill="#8a5a25" stroke="#ffd88a" stroke-width="1.5"/>
    <text x="28" y="72" text-anchor="middle" font-family="serif" font-size="10" font-weight="900" fill="#ffd88a">H</text>
    <circle cx="72" cy="68" r="10" fill="#8a5a25" stroke="#ffd88a" stroke-width="1.5"/>
    <text x="72" y="72" text-anchor="middle" font-family="serif" font-size="10" font-weight="900" fill="#ffd88a">H</text>
    <line x1="40" y1="52" x2="34" y2="60" stroke="#ffd88a" stroke-width="1.5"/>
    <line x1="60" y1="52" x2="66" y2="60" stroke="#ffd88a" stroke-width="1.5"/>
  `),

  // 6. Avogadro — 같은 부피 상자 안의 입자들 (N=N_A)
  avogadro: svg(`
    <rect x="18" y="28" width="64" height="52" rx="3" fill="none" stroke="#ffd88a" stroke-width="1.8"/>
    <circle cx="30" cy="42" r="4" fill="#ffd88a"/>
    <circle cx="46" cy="56" r="4" fill="#c48533"/>
    <circle cx="66" cy="44" r="4" fill="#ffd88a"/>
    <circle cx="38" cy="70" r="4" fill="#c48533"/>
    <circle cx="60" cy="66" r="4" fill="#ffd88a"/>
    <circle cx="72" cy="72" r="4" fill="#c48533"/>
    <text x="50" y="22" text-anchor="middle" font-family="serif" font-size="9" font-weight="700" fill="#ffb45a">V, T, P</text>
  `),

  // 7. Mendeleev — 미니 주기율표 (Group 1·2·17·18 강조)
  mendeleev: svg(`
    <g stroke="#ffd88a" stroke-width="1" fill="#3a2a15">
      <rect x="14" y="24" width="10" height="10"/>
      <rect x="14" y="36" width="10" height="10"/><rect x="26" y="36" width="10" height="10"/>
      <rect x="14" y="48" width="10" height="10"/><rect x="26" y="48" width="10" height="10"/>
      <rect x="52" y="48" width="10" height="10"/><rect x="64" y="48" width="10" height="10"/><rect x="76" y="48" width="10" height="10"/>
      <rect x="14" y="60" width="10" height="10"/><rect x="26" y="60" width="10" height="10"/>
      <rect x="52" y="60" width="10" height="10"/><rect x="64" y="60" width="10" height="10"/><rect x="76" y="60" width="10" height="10"/>
    </g>
    <rect x="14" y="24" width="10" height="10" fill="#ffd88a" opacity="0.6"/>
    <rect x="76" y="48" width="10" height="10" fill="#ffd88a" opacity="0.4"/>
    <rect x="76" y="60" width="10" height="10" fill="#ffd88a" opacity="0.4"/>
  `),

  // 8. Curie — 방사능 기호(트레포일)
  curie: svg(`
    <circle cx="50" cy="50" r="6" fill="#ffd88a"/>
    <g fill="#c48533" stroke="#ffd88a" stroke-width="1">
      <path d="M50 50 L74 18 A38 38 0 0 1 88 40 Z"/>
      <path d="M50 50 L88 60 A38 38 0 0 1 62 88 Z"/>
      <path d="M50 50 L38 88 A38 38 0 0 1 12 60 Z"/>
    </g>
    <circle cx="50" cy="50" r="30" fill="none" stroke="#ffd88a" stroke-width="0.8" opacity="0.4"/>
  `),

  // 9. Rutherford — 알파 산란 (핵 + 궤도 굴절)
  rutherford: svg(`
    <line x1="10" y1="30" x2="46" y2="46" stroke="#ffd88a" stroke-width="1.4" stroke-dasharray="2 2"/>
    <path d="M46 46 Q55 42 90 20" fill="none" stroke="#ffb45a" stroke-width="1.8"/>
    <line x1="10" y1="60" x2="90" y2="60" stroke="#ffd88a" stroke-width="1" stroke-dasharray="2 2" opacity="0.5"/>
    <line x1="10" y1="80" x2="42" y2="60" stroke="#ffd88a" stroke-width="1.2" stroke-dasharray="2 2"/>
    <path d="M42 60 Q54 66 90 82" fill="none" stroke="#ffb45a" stroke-width="1.8"/>
    <circle cx="50" cy="52" r="7" fill="#ffd88a" stroke="#ffb45a" stroke-width="1.5"/>
    <circle cx="50" cy="52" r="14" fill="none" stroke="#ffd88a" stroke-width="0.6" opacity="0.5"/>
  `),

  // 10. Bohr — 원자 궤도 모형
  bohr: svg(`
    <circle cx="50" cy="50" r="6" fill="#ffd88a"/>
    <ellipse cx="50" cy="50" rx="34" ry="14" fill="none" stroke="#ffd88a" stroke-width="1.4"/>
    <ellipse cx="50" cy="50" rx="34" ry="14" fill="none" stroke="#ffb45a" stroke-width="1.2" transform="rotate(60 50 50)"/>
    <ellipse cx="50" cy="50" rx="34" ry="14" fill="none" stroke="#c48533" stroke-width="1.2" transform="rotate(-60 50 50)"/>
    <circle cx="84" cy="50" r="3" fill="#ffd88a"/>
    <circle cx="34" cy="20" r="3" fill="#ffb45a"/>
    <circle cx="34" cy="80" r="3" fill="#c48533"/>
  `),

  // 11. Pauling — 나선(α-helix / DNA 이미지)
  pauling: svg(`
    <g fill="none" stroke="#ffd88a" stroke-width="2" stroke-linecap="round">
      <path d="M32 18 Q68 30 32 42 Q68 54 32 66 Q68 78 32 90"/>
      <path d="M68 18 Q32 30 68 42 Q32 54 68 66 Q32 78 68 90"/>
    </g>
    <g stroke="#ffb45a" stroke-width="1.4">
      <line x1="34" y1="24" x2="66" y2="24"/>
      <line x1="34" y1="48" x2="66" y2="48"/>
      <line x1="34" y1="72" x2="66" y2="72"/>
    </g>
    <circle cx="34" cy="24" r="2.5" fill="#ffd88a"/><circle cx="66" cy="24" r="2.5" fill="#ffd88a"/>
    <circle cx="34" cy="48" r="2.5" fill="#ffd88a"/><circle cx="66" cy="48" r="2.5" fill="#ffd88a"/>
    <circle cx="34" cy="72" r="2.5" fill="#ffd88a"/><circle cx="66" cy="72" r="2.5" fill="#ffd88a"/>
  `),
};

// 랭크 index -> emblem key 매핑 (game.js 의 ALCHEMIST_RANKS 배열 순서와 1:1)
const EMBLEM_ORDER = [
  "zosimos", "jabir", "paracelsus", "boyle", "lavoisier",
  "dalton", "avogadro", "mendeleev", "curie", "rutherford",
  "bohr", "pauling",
];

function emblemSvg(rankIndex) {
  const key = EMBLEM_ORDER[Math.min(rankIndex, EMBLEM_ORDER.length - 1)];
  return CHEMIST_EMBLEMS[key];
}
