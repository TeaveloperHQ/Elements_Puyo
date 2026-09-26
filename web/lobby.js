// 대전 로비 UI — 아바타 선택 + 이름 입력 + 매치 찾기
// 서버 없는 지금은 매칭 시도 시 "서버 준비 중" 안내만 출력.
// 사용자 선택은 localStorage 에 유지.

"use strict";
(function () {
  const LOBBY_KEY = "duel_prefs";

  function loadPrefs() {
    try { return JSON.parse(localStorage.getItem(LOBBY_KEY) || "{}"); }
    catch { return {}; }
  }
  function savePrefs(prefs) {
    try { localStorage.setItem(LOBBY_KEY, JSON.stringify(prefs)); } catch {}
  }

  function ensureOverlay() {
    let div = document.getElementById("lobby-overlay");
    if (div) return div;
    div = document.createElement("div");
    div.id = "lobby-overlay";
    div.className = "lobby-overlay hidden";
    div.innerHTML = `
      <div class="lobby-inner">
        <div class="lobby-title">⚔ 대전 로비</div>
        <div class="lobby-sub">아바타를 고르고 이름을 입력해주세요</div>
        <label class="lobby-field">
          <span>이름</span>
          <input type="text" id="lobby-name" maxlength="16"
                 placeholder="유저 이름" autocomplete="off" spellcheck="false">
        </label>
        <div class="picker-cards" id="picker-cards"></div>
        <div class="lobby-selection" id="lobby-selection">아바타를 선택하세요</div>
        <div class="lobby-actions">
          <button class="lobby-btn back" id="lobby-back">뒤로</button>
          <button class="lobby-btn primary" id="lobby-start" disabled>매치 찾기</button>
        </div>
        <div class="lobby-msg" id="lobby-msg"></div>
      </div>
    `;
    document.body.appendChild(div);

    // 아바타 카드 렌더 (4종: 공격형 남/여 + 수비형 남/여)
    const cardsEl = div.querySelector("#picker-cards");
    for (const key of AVATAR_KEYS) {
      const a = AVATAR_TYPES[key];
      const b = document.createElement("button");
      b.className = `picker-card family-${a.family}`;
      b.dataset.type = key;
      b.innerHTML = `
        <div class="picker-emblem">${a.emblem}</div>
        <div class="picker-name">${a.nameKr}</div>
        <div class="picker-mods">
          공격 ×${a.modifiers.attack.toFixed(2)}
          · 회복 ×${a.modifiers.heal.toFixed(2)}
          · 실드 ×${a.modifiers.shield.toFixed(2)}
        </div>
      `;
      cardsEl.appendChild(b);
    }

    // 배경 클릭 시 닫기
    div.addEventListener("click", (e) => {
      if (e.target === div) closeLobby();
    });

    return div;
  }

  function refresh(div, state) {
    // 카드 선택 표시
    div.querySelectorAll(".picker-card").forEach((b) => {
      b.classList.toggle("selected", b.dataset.type === state.type);
    });
    // 선택 미리보기
    const selEl = div.querySelector("#lobby-selection");
    if (state.type) {
      const nm = state.name.trim() || "익명";
      selEl.classList.add("picked");
      selEl.innerHTML = avatarCardHtml(state.type, nm, 60);
    } else {
      selEl.classList.remove("picked");
      selEl.innerHTML = "아바타를 선택하세요";
    }
    // 시작 버튼
    const startBtn = div.querySelector("#lobby-start");
    startBtn.disabled = !(state.name.trim().length > 0 && !!state.type);
  }

  function openLobby() {
    const div = ensureOverlay();
    div.classList.remove("hidden");

    const prefs = loadPrefs();
    const state = { name: prefs.name || "", type: prefs.type || null };

    const nameInput = div.querySelector("#lobby-name");
    const startBtn = div.querySelector("#lobby-start");
    const msgEl = div.querySelector("#lobby-msg");

    nameInput.value = state.name;
    msgEl.textContent = "";
    msgEl.className = "lobby-msg";
    refresh(div, state);

    nameInput.oninput = () => {
      state.name = nameInput.value;
      refresh(div, state);
    };
    div.querySelectorAll(".picker-card").forEach((b) => {
      b.onclick = () => {
        state.type = b.dataset.type;
        refresh(div, state);
      };
    });
    div.querySelector("#lobby-back").onclick = () => closeLobby();
    startBtn.onclick = () => {
      const name = state.name.trim();
      if (!name || !state.type) return;
      savePrefs({ name, type: state.type });
      startBtn.disabled = true;
      msgEl.textContent = "매칭 대기 중…";
      msgEl.className = "lobby-msg pending";
      // 서버 없는 지금: 곧 오픈 안내
      setTimeout(() => {
        msgEl.innerHTML = "서버 준비 중 — 곧 오픈됩니다.<br>지금은 솔로 모드로 즐겨주세요.";
        msgEl.className = "lobby-msg info";
        startBtn.disabled = false;
      }, 1200);
    };
  }

  function closeLobby() {
    const div = document.getElementById("lobby-overlay");
    if (div) div.classList.add("hidden");
  }

  // 헤더에 "⚔ 대전" 버튼 자동 추가
  document.addEventListener("DOMContentLoaded", () => {
    const headerActions = document.querySelector(".header-actions");
    if (headerActions && !document.getElementById("duel-btn")) {
      const b = document.createElement("button");
      b.id = "duel-btn";
      b.className = "hdr-btn";
      b.title = "온라인 대전";
      b.textContent = "⚔ 대전";
      b.onclick = openLobby;
      const stageBtn = document.getElementById("stage-btn");
      if (stageBtn) headerActions.insertBefore(b, stageBtn);
      else headerActions.appendChild(b);
    }
  });

  // 노출 — 나중에 다른 곳에서 열 수 있게
  window.DuelLobby = { open: openLobby, close: closeLobby, load: loadPrefs };
})();
