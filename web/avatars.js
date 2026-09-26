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
          <radialGradient id="atkBg" cx="35%" cy="28%">
            <stop offset="0%" stop-color="#5a1808"/>
            <stop offset="70%" stop-color="#2a0806"/>
            <stop offset="100%" stop-color="#100303"/>
          </radialGradient>
          <radialGradient id="atkAura" cx="50%" cy="55%">
            <stop offset="0%" stop-color="#ff5030" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="#7a0808" stop-opacity="0"/>
          </radialGradient>
          <linearGradient id="atkFlask" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stop-color="#ffde66"/>
            <stop offset="55%" stop-color="#ff7845"/>
            <stop offset="100%" stop-color="#b81c08"/>
          </linearGradient>
        </defs>
        <!-- 배경 -->
        <circle cx="50" cy="50" r="48" fill="url(#atkBg)"/>
        <circle cx="50" cy="55" r="42" fill="url(#atkAura)"/>
        <!-- 후드 뒷그림자 -->
        <path d="M22 44 Q22 24 50 20 Q78 24 78 44 L82 82 L18 82 Z"
              fill="#0a0202" opacity="0.65"/>
        <!-- 후드 (본체) -->
        <path d="M26 46 Q26 26 50 22 Q74 26 74 46 L78 80 L22 80 Z"
              fill="#3a0f0a" stroke="#ff5a30" stroke-width="1.3" stroke-linejoin="round"/>
        <!-- 후드 안쪽 공동 -->
        <ellipse cx="50" cy="42" rx="14" ry="16" fill="#050202"/>
        <!-- 붉은 눈 -->
        <circle cx="45" cy="40" r="1.9" fill="#ff3018"/>
        <circle cx="55" cy="40" r="1.9" fill="#ff3018"/>
        <circle cx="45" cy="40" r="0.6" fill="#ffff80"/>
        <circle cx="55" cy="40" r="0.6" fill="#ffff80"/>
        <!-- 오른손 플라스크 -->
        <rect x="60" y="54" width="8" height="4" rx="1" fill="#8a3a1c" stroke="#ffcf3d" stroke-width="0.7"/>
        <path d="M60 58 L58 66 L58 78 L70 78 L70 66 L68 58 Z"
              fill="url(#atkFlask)" stroke="#ffcf3d" stroke-width="1"/>
        <ellipse cx="64" cy="72" rx="4" ry="2" fill="#ffff80" opacity="0.7"/>
        <!-- 증발 화염 -->
        <path d="M62 53 Q60 45 64 39 Q68 45 66 53 Q65 50 62 53 Z"
              fill="#ff5030" opacity="0.9"/>
        <path d="M63 50 Q62 45 65 41" fill="none" stroke="#ffff80" stroke-width="1" opacity="0.7"/>
        <!-- 가슴 화염 룬 (△) -->
        <path d="M50 55 L42 68 L58 68 Z" fill="none" stroke="#ffcf3d" stroke-width="1.6"/>
        <line x1="46" y1="65" x2="54" y2="65" stroke="#ffcf3d" stroke-width="1"/>
        <!-- 어깨 리벳 -->
        <circle cx="30" cy="52" r="1.5" fill="#ffcf3d" opacity="0.75"/>
        <circle cx="70" cy="52" r="1.5" fill="#ffcf3d" opacity="0.75"/>
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
          <radialGradient id="defBg" cx="35%" cy="28%">
            <stop offset="0%" stop-color="#0e3a63"/>
            <stop offset="70%" stop-color="#061a30"/>
            <stop offset="100%" stop-color="#020610"/>
          </radialGradient>
          <radialGradient id="defAura" cx="50%" cy="55%">
            <stop offset="0%" stop-color="#5dade2" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#0a1f3a" stop-opacity="0"/>
          </radialGradient>
          <linearGradient id="defTome" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stop-color="#a3d5f7"/>
            <stop offset="70%" stop-color="#3498db"/>
            <stop offset="100%" stop-color="#0e3a63"/>
          </linearGradient>
        </defs>
        <!-- 배경 -->
        <circle cx="50" cy="50" r="48" fill="url(#defBg)"/>
        <circle cx="50" cy="55" r="42" fill="url(#defAura)"/>
        <!-- 후드 뒷그림자 -->
        <path d="M22 44 Q22 24 50 20 Q78 24 78 44 L82 82 L18 82 Z"
              fill="#020610" opacity="0.65"/>
        <!-- 후드 -->
        <path d="M26 46 Q26 26 50 22 Q74 26 74 46 L78 80 L22 80 Z"
              fill="#0e2a4a" stroke="#5dade2" stroke-width="1.3" stroke-linejoin="round"/>
        <!-- 후드 안쪽 공동 -->
        <ellipse cx="50" cy="42" rx="14" ry="16" fill="#030913"/>
        <!-- 푸른 눈 -->
        <circle cx="45" cy="40" r="1.9" fill="#5dade2"/>
        <circle cx="55" cy="40" r="1.9" fill="#5dade2"/>
        <circle cx="45" cy="40" r="0.6" fill="#e8f4fd"/>
        <circle cx="55" cy="40" r="0.6" fill="#e8f4fd"/>
        <!-- 열린 마법책 (양손) -->
        <path d="M32 60 L32 78 L50 74 L50 62 L36 58 Z"
              fill="url(#defTome)" stroke="#e8f4fd" stroke-width="0.9"/>
        <path d="M68 60 L68 78 L50 74 L50 62 L64 58 Z"
              fill="url(#defTome)" stroke="#e8f4fd" stroke-width="0.9"/>
        <!-- 책 페이지 라인 -->
        <line x1="36" y1="66" x2="46" y2="65" stroke="#e8f4fd" stroke-width="0.5" opacity="0.7"/>
        <line x1="36" y1="70" x2="46" y2="69" stroke="#e8f4fd" stroke-width="0.5" opacity="0.7"/>
        <line x1="54" y1="65" x2="64" y2="66" stroke="#e8f4fd" stroke-width="0.5" opacity="0.7"/>
        <line x1="54" y1="69" x2="64" y2="70" stroke="#e8f4fd" stroke-width="0.5" opacity="0.7"/>
        <!-- 책 위 마법 빛 -->
        <circle cx="50" cy="60" r="2.5" fill="#ffffff" opacity="0.9"/>
        <circle cx="50" cy="60" r="5" fill="none" stroke="#a3d5f7" stroke-width="0.7" opacity="0.6"/>
        <!-- 가슴 물 룬 (▽) -->
        <path d="M44 50 L56 50 L50 60 Z" fill="none" stroke="#a3d5f7" stroke-width="1.4"/>
        <line x1="46" y1="53" x2="54" y2="53" stroke="#a3d5f7" stroke-width="0.9"/>
        <!-- 어깨 브로치 -->
        <circle cx="30" cy="52" r="1.5" fill="#a3d5f7" opacity="0.8"/>
        <circle cx="70" cy="52" r="1.5" fill="#a3d5f7" opacity="0.8"/>
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
