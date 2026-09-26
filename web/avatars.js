// 대전용 연금술사 아바타 (공격형 · 수비형)
// 서버 대전에서 유저 이름과 함께 상대를 식별. 색·계수는 서버 튜닝 가능.

"use strict";

const AVATAR_TYPES = {
  attacker: {
    key: "attacker",
    nameKr: "공격형 연금술사",
    color: "#e74c3c",     // crimson
    accent: "#ff8a80",
    dark: "#7a1e12",
    modifiers: { attack: 1.30, heal: 0.80, shield: 0.80 },
    tagline: "분자 파괴로 상대를 압박",
    emblem: `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="atkBg" cx="35%" cy="30%">
            <stop offset="0%" stop-color="#7a1e12"/>
            <stop offset="100%" stop-color="#2a0805"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#atkBg)"/>
        <!-- 검 -->
        <path d="M50 12 L58 22 L54 26 L54 66 L60 72 L60 78 L40 78 L40 72 L46 66 L46 26 L42 22 Z"
              fill="#ff9d6b" stroke="#ffcf3d" stroke-width="1.5" stroke-linejoin="round"/>
        <!-- 가드 -->
        <rect x="26" y="66" width="48" height="5" rx="1"
              fill="#8a3a1c" stroke="#ffcf3d" stroke-width="1"/>
        <!-- 파멜(손잡이 끝) -->
        <circle cx="50" cy="84" r="4" fill="#ffcf3d"/>
        <!-- 화염 상징 (검 뒤) -->
        <path d="M50 16 Q46 26 44 34 Q50 30 56 34 Q54 26 50 16 Z"
              fill="#ff5a3a" opacity="0.7"/>
      </svg>
    `,
  },
  defender: {
    key: "defender",
    nameKr: "수비형 연금술사",
    color: "#3498db",     // azure
    accent: "#7fc0fb",
    dark: "#0e3a63",
    modifiers: { attack: 0.80, heal: 1.20, shield: 1.30 },
    tagline: "회복과 실드로 오래 버틴다",
    emblem: `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="defBg" cx="35%" cy="30%">
            <stop offset="0%" stop-color="#0e3a63"/>
            <stop offset="100%" stop-color="#040f1c"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#defBg)"/>
        <!-- 방패 외곽 -->
        <path d="M50 14 L82 22 L82 50 Q82 78 50 88 Q18 78 18 50 L18 22 Z"
              fill="#3498db" stroke="#7fc0fb" stroke-width="1.8" stroke-linejoin="round"/>
        <!-- 방패 안 문양 -->
        <path d="M50 30 L62 38 L58 62 L50 68 L42 62 L38 38 Z"
              fill="#a3d5f7" opacity="0.55"/>
        <!-- 중심 보석 -->
        <circle cx="50" cy="50" r="5" fill="#ffffff" opacity="0.9"/>
        <circle cx="50" cy="50" r="8" fill="none" stroke="#e8f4fd" stroke-width="0.8" opacity="0.6"/>
      </svg>
    `,
  },
};

const AVATAR_KEYS = Object.keys(AVATAR_TYPES);

function avatarType(key) {
  return AVATAR_TYPES[key] || AVATAR_TYPES.defender;
}

// 화면에 표시하는 아바타 카드. size = px.
function avatarCardHtml(typeKey, userName, size = 72) {
  const a = avatarType(typeKey);
  const safeName = (userName || "익명").replace(/[<>]/g, "");
  return `
    <div class="avatar-card ${typeKey}" data-type="${typeKey}">
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
