// Story data — 각 화학자 스테이지의 도발·승리·패배 대사.
// solo 모드 스토리: 학생이 과학실의 시공간 균열에 빨려들어가 12명의 역사적 화학자와 순차 대결.
// 네트워크 대전 모드에선 이 파일 사용하지 않음.

const STORY_INTRO = {
  title: "시공간의 균열",
  subtitle: "The Rift in the Lab",
  lines: [
    "야간자율학습이 끝난 텅 빈 과학실.",
    "네가 실수로 건드린 낡은 증류기에서",
    "형언할 수 없는 빛이 새어나온다.",
    "정신을 차렸을 땐 이미 익숙한 세상이 아니었다.",
    "12명의 화학자들이 시간의 문 너머에서 기다리고 있다.",
    "원소의 힘으로 그들을 넘어서 원래 시대로 돌아가라.",
  ],
};

// 각 화학자의 도발(intro), 패배 시 상대의 반응(defeat_taunt=플레이어 승리 시 상대 대사),
// 플레이어 패배 시 상대의 대사(victory_taunt=플레이어 패배 시 상대 대사).
// keys: ALCHEMIST_RANKS 순서와 일치 (0..11).
const STORY_STAGES = [
  { // 0 Zosimos
    intro: "젊은이여, 원소의 정제(精製)를 논하려면 먼저 나의 증류기를 넘어라.",
    onPlayerWin: "…흠. 시간이 흘러도 지혜는 사라지지 않는군.",
    onPlayerLose: "성급하구나. 물질의 변환은 인내에서 온다.",
  },
  { // 1 Jabir
    intro: "실험 없는 지식은 헛것. 왕수(王水)의 힘을 보여주지.",
    onPlayerWin: "훌륭하다. 재현 가능한 결과 — 그것이 과학의 정수다.",
    onPlayerLose: "다시 처음부터. 손을 움직이지 않고는 배울 수 없다.",
  },
  { // 2 Paracelsus
    intro: "용량이 독을 만든다. 너의 균형 감각을 시험해보지.",
    onPlayerWin: "몸이 곧 화학이다 — 너도 이제 조금 알겠구나.",
    onPlayerLose: "너무 많이도, 너무 적게도 아닌 것 — 그것이 부족했군.",
  },
  { // 3 Boyle
    intro: "회의(懷疑) 없이는 아무것도 원소가 아니다. 증명해보라.",
    onPlayerWin: "잘했다. 압력을 견디는 것이 곧 실력이다.",
    onPlayerLose: "관찰 부족이다. 다시 압력계를 확인하라.",
  },
  { // 4 Lavoisier
    intro: "질량은 창조되지도 소멸되지도 않는다. 나의 저울 앞에서라면 더더욱.",
    onPlayerWin: "완벽한 균형이다. 근대 화학은 너의 손에 있다.",
    onPlayerLose: "무언가가 사라졌다고 착각한 게냐? 아니, 그저 못 본 것이지.",
  },
  { // 5 Dalton
    intro: "만물은 원자로 이루어진다 — 그 정수비를 맞춰보아라.",
    onPlayerWin: "너의 원자는 정확한 비율로 결합했다. 완벽한 화합이다.",
    onPlayerLose: "비율이 맞지 않아. 원자는 거짓말하지 않는다.",
  },
  { // 6 Avogadro
    intro: "같은 부피, 같은 개수. 나의 필드에서 그 법칙을 어길 수 있겠나?",
    onPlayerWin: "일관성이 있다. 진정 이 시대의 학자다.",
    onPlayerLose: "개수를 셌어야지. 부피만 봐서는 안 된다.",
  },
  { // 7 Mendeleev
    intro: "주기율의 법칙 앞에서 뒷걸음질치는 원소는 없다.",
    onPlayerWin: "너는 아직 발견되지 않은 원소의 자리까지 예측할 수 있겠구나.",
    onPlayerLose: "표를 다시 봐라. 빈칸에도 의미가 있다.",
  },
  { // 8 Curie
    intro: "빛나지 않는 원소는 없다. 나의 라듐이 그것을 증명한다.",
    onPlayerWin: "위험을 무릅쓴 자만이 진실에 다가간다. 훌륭하다.",
    onPlayerLose: "빛의 대가는 컸다. 다시 도전하라, 두려워 말고.",
  },
  { // 9 Rutherford
    intro: "얇은 금박에 알파선을 쏘아 무엇을 발견했는지 아느냐? 너에게 그것을 보여주지.",
    onPlayerWin: "핵을 꿰뚫는 시선이다. 너는 원자의 심장을 보았다.",
    onPlayerLose: "표면만 보고 지나쳤군. 원자 안엔 텅 빈 공간과 조밀한 핵이 있다.",
  },
  { // 10 Bohr
    intro: "전자는 아무 궤도나 오르지 않는다. 오직 허락된 길로만.",
    onPlayerWin: "너의 도약은 정확한 양자 에너지였다. 감탄스럽다.",
    onPlayerLose: "허락되지 않은 궤도로 올라가려 했군. 자연은 그것을 용납하지 않는다.",
  },
  { // 11 Pauling
    intro: "전기음성도. 결합의 극성. 그리고 나선의 비밀. 너는 준비되었는가?",
    onPlayerWin: "너는 이제 화학과 물리, 그리고 평화 사이에 다리를 놓을 수 있다. 원래 시대로 돌아가라.",
    onPlayerLose: "결합의 방향을 놓쳤다. 원자는 서로를 얼마나 원하는지 알아야 한다.",
  },
];

// 스테이지 상태
// (localStorage 에 저장 — "어디까지 클리어했는지" 만 기록)
const STAGE_KEY = "elements_puyo_stage_progress_v1";
function loadProgress() {
  try {
    const raw = localStorage.getItem(STAGE_KEY);
    if (!raw) return { cleared: 0, seenIntro: false };
    return JSON.parse(raw);
  } catch { return { cleared: 0, seenIntro: false }; }
}
function saveProgress(p) { localStorage.setItem(STAGE_KEY, JSON.stringify(p)); }

// ── UI: 인트로 컷씬 ─────────────────────────────────────
// 게임 로드 후, seenIntro=false 면 한 번 재생. 이후 새 게임 눌러도 스킵.
function showStoryIntro(onDone) {
  const overlay = document.createElement("div");
  overlay.className = "story-overlay";
  overlay.innerHTML = `
    <div class="story-inner">
      <div class="story-rift"></div>
      <div class="story-title">${STORY_INTRO.title}</div>
      <div class="story-subtitle">${STORY_INTRO.subtitle}</div>
      <div class="story-lines">
        ${STORY_INTRO.lines.map((l, i) => `<div class="story-line" style="animation-delay:${0.5 + i * 0.8}s">${l}</div>`).join("")}
      </div>
      <button class="story-cta" style="animation-delay:${0.5 + STORY_INTRO.lines.length * 0.8 + 0.3}s">균열로 들어가기</button>
    </div>`;
  document.body.appendChild(overlay);
  const cta = overlay.querySelector(".story-cta");
  const close = () => {
    overlay.classList.add("fading");
    setTimeout(() => { overlay.remove(); onDone && onDone(); }, 400);
  };
  cta.addEventListener("click", close);
  // 방향키·엔터·스페이스로도 진행
  const kh = (e) => {
    if (["Enter", " ", "ArrowDown", "n", "N"].includes(e.key)) {
      e.preventDefault(); close(); document.removeEventListener("keydown", kh, true);
    }
  };
  document.addEventListener("keydown", kh, true);
}

// ── UI: 스테이지 시작 컷씬 (화학자 도발) ────────────────
function showStageIntro(stageIndex, onDone) {
  const rank = ALCHEMIST_RANKS[Math.min(stageIndex, ALCHEMIST_RANKS.length - 1)];
  const stage = STORY_STAGES[Math.min(stageIndex, STORY_STAGES.length - 1)];
  const el = document.createElement("div");
  el.className = "stage-intro";
  el.innerHTML = `
    <div class="stage-inner">
      <div class="stage-portrait">${chemistPortraitHtml(stageIndex, 120)}</div>
      <div class="stage-text">
        <div class="stage-badge">STAGE ${stageIndex + 1} / ${ALCHEMIST_RANKS.length}</div>
        <div class="stage-name">${rank.name}</div>
        <div class="stage-name-kr">${rank.nameKr} · ${rank.era}</div>
        <div class="stage-quote">"${stage.intro}"</div>
        <button class="stage-cta">대결 시작</button>
      </div>
    </div>`;
  document.body.appendChild(el);
  const cta = el.querySelector(".stage-cta");
  const close = () => {
    el.classList.add("fading");
    setTimeout(() => { el.remove(); onDone && onDone(); }, 350);
  };
  cta.addEventListener("click", close);
  const kh = (e) => {
    if (["Enter", " ", "ArrowDown"].includes(e.key)) {
      e.preventDefault(); close(); document.removeEventListener("keydown", kh, true);
    }
  };
  document.addEventListener("keydown", kh, true);
}

// ── UI: 결과 컷씬 ────────────────────────────────────
function showStageResult(stageIndex, playerWon, onDone) {
  const rank = ALCHEMIST_RANKS[Math.min(stageIndex, ALCHEMIST_RANKS.length - 1)];
  const stage = STORY_STAGES[Math.min(stageIndex, STORY_STAGES.length - 1)];
  const quote = playerWon ? stage.onPlayerWin : stage.onPlayerLose;
  const el = document.createElement("div");
  el.className = `stage-result ${playerWon ? "win" : "lose"}`;
  el.innerHTML = `
    <div class="stage-inner">
      <div class="stage-portrait">${chemistPortraitHtml(stageIndex, 120)}</div>
      <div class="stage-text">
        <div class="stage-badge">${playerWon ? "VICTORY" : "DEFEAT"}</div>
        <div class="stage-name">${rank.name}</div>
        <div class="stage-quote">"${quote}"</div>
        <button class="stage-cta">${playerWon ? "다음 스테이지" : "다시 도전"}</button>
      </div>
    </div>`;
  document.body.appendChild(el);
  const cta = el.querySelector(".stage-cta");
  const close = () => {
    el.classList.add("fading");
    setTimeout(() => { el.remove(); onDone && onDone(); }, 350);
  };
  cta.addEventListener("click", close);
  const kh = (e) => {
    if (["Enter", " ", "ArrowDown"].includes(e.key)) {
      e.preventDefault(); close(); document.removeEventListener("keydown", kh, true);
    }
  };
  document.addEventListener("keydown", kh, true);
}
