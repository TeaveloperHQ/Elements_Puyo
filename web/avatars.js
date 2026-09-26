// 대전용 학생 연금술사 아바타 (남/여 × 공격형/수비형 = 총 4개)
// 판타지 학원의 학생들. 랩코트/교복 위에 붉은/파란 아크셀트, 손에 플라스크·마법책.

"use strict";

const AVATAR_MOD = {
  attacker: { attack: 1.30, heal: 0.80, shield: 0.80 },
  defender: { attack: 0.80, heal: 1.20, shield: 1.30 },
};

// ── 공통 파트 ────────────────────────────────────────────────
// SVG 조합용 helper. 배경·랩코트·팔소품은 family(공격/수비)로 다름,
// 얼굴·머리·리본은 남/여로 다름.

function bgRadial(id, c1, c2) {
  return `<defs><radialGradient id="${id}" cx="35%" cy="28%">
    <stop offset="0%" stop-color="${c1}"/>
    <stop offset="100%" stop-color="${c2}"/>
  </radialGradient></defs>`;
}

// 얼굴 (성별 무관)
const FACE = `
  <rect x="46" y="45" width="8" height="7" fill="#f4c8a0"/>
  <ellipse cx="50" cy="36" rx="11" ry="13" fill="#f4c8a0"/>
`;

// 남 짧은 머리 (검정, 스파이키)
const HAIR_M = `
  <path d="M39 34 Q39 20 50 18 Q61 20 61 34 L60 28 L56 32 L52 24 L48 32 L44 24 L40 30 Z"
        fill="#2a1a0e"/>
  <path d="M42 28 L46 24 L48 28 L52 22 L54 28 L58 24 L58 30 L42 30 Z" fill="#3a2010"/>
`;
// 남 눈+눈썹+입 (굵은 눈썹, 다부진 입)
const FACE_M = `
  <ellipse cx="45" cy="37" rx="1.5" ry="1.6" fill="#1a1a1a"/>
  <ellipse cx="55" cy="37" rx="1.5" ry="1.6" fill="#1a1a1a"/>
  <circle cx="45.5" cy="36.5" r="0.4" fill="#fff"/>
  <circle cx="55.5" cy="36.5" r="0.4" fill="#fff"/>
  <path d="M42 33 L48 32.5" stroke="#1a1a1a" stroke-width="1.3" stroke-linecap="round"/>
  <path d="M58 32.5 L52 33" stroke="#1a1a1a" stroke-width="1.3" stroke-linecap="round"/>
  <path d="M46 43 L54 43" stroke="#7a3a20" stroke-width="0.9" stroke-linecap="round"/>
`;

// 여 긴 머리 (양갈래로 뻗음)
const HAIR_F = `
  <!-- 뒷머리 (어깨까지) -->
  <path d="M36 34 Q36 24 50 20 Q64 24 64 34 L68 56 L60 54 L60 34 L40 34 L40 54 L32 56 Z"
        fill="#3a2010"/>
  <!-- 앞머리 (부드러운 컷) -->
  <path d="M40 30 Q44 24 50 22 Q56 24 60 30 L60 34 Q56 30 50 30 Q44 30 40 34 Z"
        fill="#4a2818"/>
  <!-- 옆머리 -->
  <path d="M39 34 L37 44 L41 42 Z" fill="#3a2010"/>
  <path d="M61 34 L63 44 L59 42 Z" fill="#3a2010"/>
`;
// 여 눈+눈썹+입 (큰 눈, 얇은 눈썹, 미소)
const FACE_F = `
  <ellipse cx="45" cy="38" rx="1.8" ry="2.1" fill="#1a1a1a"/>
  <ellipse cx="55" cy="38" rx="1.8" ry="2.1" fill="#1a1a1a"/>
  <circle cx="45.5" cy="37" r="0.5" fill="#fff"/>
  <circle cx="55.5" cy="37" r="0.5" fill="#fff"/>
  <path d="M42.5 33.5 Q45 32.5 47.5 33" stroke="#1a1a1a" stroke-width="0.9" fill="none" stroke-linecap="round"/>
  <path d="M57.5 33 Q55 32.5 52.5 33.5" stroke="#1a1a1a" stroke-width="0.9" fill="none" stroke-linecap="round"/>
  <path d="M47 43.5 Q50 45 53 43.5" stroke="#a05030" stroke-width="0.9" fill="none" stroke-linecap="round"/>
  <!-- 볼터치 -->
  <circle cx="42" cy="41" r="1.5" fill="#f4a090" opacity="0.5"/>
  <circle cx="58" cy="41" r="1.5" fill="#f4a090" opacity="0.5"/>
`;

// 공격 랩코트 (붉은)
function coatAttacker(withRibbon = false) {
  return `
    <path d="M22 88 L28 62 Q30 52 42 50 L58 50 Q70 52 72 62 L78 88 Z"
          fill="#c0392b" stroke="#ffcf3d" stroke-width="1" stroke-linejoin="round"/>
    <path d="M42 50 L50 62 L58 50" fill="#8a1e12" stroke="#ffcf3d" stroke-width="0.9"/>
    <line x1="50" y1="62" x2="50" y2="86" stroke="#8a1e12" stroke-width="1"/>
    <circle cx="50" cy="68" r="1" fill="#ffcf3d"/>
    <circle cx="50" cy="76" r="1" fill="#ffcf3d"/>
    ${withRibbon ? `<path d="M44 52 L50 56 L56 52 L54 58 L50 56 L46 58 Z" fill="#ffcf3d"/>` : ""}
  `;
}
// 오른손 붉은 플라스크
const PROP_ATTACKER = `
  <rect x="66" y="62" width="6" height="3" fill="#8a3a1c" stroke="#ffcf3d" stroke-width="0.5"/>
  <path d="M66 65 L64 74 L74 74 L72 65 Z" fill="#ff5a30" stroke="#ffcf3d" stroke-width="0.8"/>
  <ellipse cx="69" cy="72" rx="3" ry="1.2" fill="#ffff80" opacity="0.7"/>
  <path d="M68 62 Q67 57 69 53 Q71 57 70 62" fill="#ff5030" opacity="0.9"/>
`;

// 수비 랩코트 (파란)
function coatDefender(withRibbon = false) {
  return `
    <path d="M22 88 L28 62 Q30 52 42 50 L58 50 Q70 52 72 62 L78 88 Z"
          fill="#2c6faf" stroke="#7fc0fb" stroke-width="1" stroke-linejoin="round"/>
    <path d="M42 50 L50 62 L58 50" fill="#1a3f65" stroke="#7fc0fb" stroke-width="0.9"/>
    <line x1="50" y1="62" x2="50" y2="86" stroke="#1a3f65" stroke-width="1"/>
    <circle cx="50" cy="68" r="1" fill="#7fc0fb"/>
    <circle cx="50" cy="76" r="1" fill="#7fc0fb"/>
    ${withRibbon ? `<path d="M44 52 L50 56 L56 52 L54 58 L50 56 L46 58 Z" fill="#7fc0fb"/>` : ""}
  `;
}
// 양손 마법책
const PROP_DEFENDER = `
  <path d="M28 66 L28 82 L50 76 L50 62 L32 60 Z"
        fill="#3498db" stroke="#e8f4fd" stroke-width="0.7"/>
  <path d="M72 66 L72 82 L50 76 L50 62 L68 60 Z"
        fill="#3498db" stroke="#e8f4fd" stroke-width="0.7"/>
  <line x1="34" y1="70" x2="46" y2="69" stroke="#e8f4fd" stroke-width="0.4" opacity="0.7"/>
  <line x1="34" y1="74" x2="46" y2="73" stroke="#e8f4fd" stroke-width="0.4" opacity="0.7"/>
  <line x1="54" y1="69" x2="66" y2="70" stroke="#e8f4fd" stroke-width="0.4" opacity="0.7"/>
  <line x1="54" y1="73" x2="66" y2="74" stroke="#e8f4fd" stroke-width="0.4" opacity="0.7"/>
  <circle cx="50" cy="65" r="2" fill="#fff" opacity="0.9"/>
  <circle cx="50" cy="65" r="4" fill="none" stroke="#a3d5f7" stroke-width="0.6" opacity="0.6"/>
`;

function buildEmblem(family, gender) {
  const isAtk = family === "attacker";
  const isFem = gender === "f";
  const bgId = `${family}_${gender}_bg`;
  const bg = isAtk
    ? bgRadial(bgId, "#5a1808", "#150606")
    : bgRadial(bgId, "#0e3a63", "#020610");
  const coat = isAtk ? coatAttacker(isFem) : coatDefender(isFem);
  const prop = isAtk ? PROP_ATTACKER : PROP_DEFENDER;
  const hair = isFem ? HAIR_F : HAIR_M;
  const face = isFem ? FACE_F : FACE_M;
  return `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      ${bg}
      <circle cx="50" cy="50" r="48" fill="url(#${bgId})"/>
      ${coat}
      ${FACE}
      ${hair}
      ${face}
      ${prop}
    </svg>
  `;
}

const AVATAR_TYPES = {
  attacker_m: {
    key: "attacker_m", family: "attacker", gender: "m",
    nameKr: "공격형 남학생",
    color: "#e74c3c", accent: "#ff8a80", dark: "#7a1e12",
    modifiers: AVATAR_MOD.attacker,
    tagline: "분자 파괴로 상대를 압박",
    emblem: buildEmblem("attacker", "m"),
  },
  attacker_f: {
    key: "attacker_f", family: "attacker", gender: "f",
    nameKr: "공격형 여학생",
    color: "#e74c3c", accent: "#ff8a80", dark: "#7a1e12",
    modifiers: AVATAR_MOD.attacker,
    tagline: "분자 파괴로 상대를 압박",
    emblem: buildEmblem("attacker", "f"),
  },
  defender_m: {
    key: "defender_m", family: "defender", gender: "m",
    nameKr: "수비형 남학생",
    color: "#3498db", accent: "#7fc0fb", dark: "#0e3a63",
    modifiers: AVATAR_MOD.defender,
    tagline: "회복과 실드로 오래 버틴다",
    emblem: buildEmblem("defender", "m"),
  },
  defender_f: {
    key: "defender_f", family: "defender", gender: "f",
    nameKr: "수비형 여학생",
    color: "#3498db", accent: "#7fc0fb", dark: "#0e3a63",
    modifiers: AVATAR_MOD.defender,
    tagline: "회복과 실드로 오래 버틴다",
    emblem: buildEmblem("defender", "f"),
  },
};

const AVATAR_KEYS = Object.keys(AVATAR_TYPES);

function avatarType(key) {
  return AVATAR_TYPES[key] || AVATAR_TYPES.defender_f;
}

function avatarCardHtml(typeKey, userName, size = 72) {
  const a = avatarType(typeKey);
  const safeName = (userName || "익명").replace(/[<>]/g, "");
  return `
    <div class="avatar-card family-${a.family}" data-type="${typeKey}">
      <div class="avatar-emblem" style="width:${size}px;height:${size}px;">
        ${a.emblem}
      </div>
      <div class="avatar-meta">
        <div class="avatar-name" style="color:${a.accent}">${safeName}</div>
        <div class="avatar-role">${a.nameKr}</div>
      </div>
    </div>
  `;
}
