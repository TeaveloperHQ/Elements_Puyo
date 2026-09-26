// Elements Puyo — 원소 뿌요 (Duel prototype)
// Game 클래스가 필드/볼/상태/DOM 을 캡슐화. 플레이어·상대 두 인스턴스 병존.
// 컨트롤러 교체로 solo AI ↔ 네트워크 대응.

"use strict";

// ══════════════════════════════════════════════════════════════════════
// 원소 데이터
// ══════════════════════════════════════════════════════════════════════
const CATEGORY = {
  METAL: "METAL", NONMETAL: "NONMETAL", METALLOID: "METALLOID",
  NOBLE: "NOBLE", OBSTACLE: "OBSTACLE",
};

const ELEMENTS = {
  H:  { z: 1,  symbol: "H",  nameKr: "수소",     period: 1, group: 1,  charge: +1, category: CATEGORY.NONMETAL },
  HE: { z: 2,  symbol: "He", nameKr: "헬륨",     period: 1, group: 18, charge:  0, category: CATEGORY.NOBLE    },
  LI: { z: 3,  symbol: "Li", nameKr: "리튬",     period: 2, group: 1,  charge: +1, category: CATEGORY.METAL    },
  BE: { z: 4,  symbol: "Be", nameKr: "베릴륨",   period: 2, group: 2,  charge: +2, category: CATEGORY.METAL    },
  B:  { z: 5,  symbol: "B",  nameKr: "붕소",     period: 2, group: 13, charge: +3, category: CATEGORY.METALLOID},
  C:  { z: 6,  symbol: "C",  nameKr: "탄소",     period: 2, group: 14, charge: -4, category: CATEGORY.NONMETAL },
  CP: { z: 6,  symbol: "C",  nameKr: "탄소(양)", period: 2, group: 14, charge: +4, category: CATEGORY.NONMETAL },
  N:  { z: 7,  symbol: "N",  nameKr: "질소",     period: 2, group: 15, charge: -3, category: CATEGORY.NONMETAL },
  O:  { z: 8,  symbol: "O",  nameKr: "산소",     period: 2, group: 16, charge: -2, category: CATEGORY.NONMETAL },
  F:  { z: 9,  symbol: "F",  nameKr: "플루오린", period: 2, group: 17, charge: -1, category: CATEGORY.NONMETAL },
  NE: { z: 10, symbol: "Ne", nameKr: "네온",     period: 2, group: 18, charge:  0, category: CATEGORY.NOBLE    },
  NA: { z: 11, symbol: "Na", nameKr: "나트륨",   period: 3, group: 1,  charge: +1, category: CATEGORY.METAL    },
  MG: { z: 12, symbol: "Mg", nameKr: "마그네슘", period: 3, group: 2,  charge: +2, category: CATEGORY.METAL    },
  AL: { z: 13, symbol: "Al", nameKr: "알루미늄", period: 3, group: 13, charge: +3, category: CATEGORY.METAL    },
  SI: { z: 14, symbol: "Si", nameKr: "규소",     period: 3, group: 14, charge: +4, category: CATEGORY.METALLOID},
  SIM:{ z: 14, symbol: "Si", nameKr: "규소(음)", period: 3, group: 14, charge: -4, category: CATEGORY.METALLOID},
  P:  { z: 15, symbol: "P",  nameKr: "인",       period: 3, group: 15, charge: -3, category: CATEGORY.NONMETAL },
  S:  { z: 16, symbol: "S",  nameKr: "황",       period: 3, group: 16, charge: -2, category: CATEGORY.NONMETAL },
  CL: { z: 17, symbol: "Cl", nameKr: "염소",     period: 3, group: 17, charge: -1, category: CATEGORY.NONMETAL },
  AR: { z: 18, symbol: "Ar", nameKr: "아르곤",   period: 3, group: 18, charge:  0, category: CATEGORY.NOBLE    },
  // 4주기 — 전이금속은 흔한 산화수마다 별도 변종 (C/Si 방식). 전하 합만 맞으면 어떤 조합이든 화합물 형성.
  K:  { z: 19, symbol: "K",  nameKr: "칼륨",             period: 4, group: 1,  charge: +1, category: CATEGORY.METAL     },
  CA: { z: 20, symbol: "Ca", nameKr: "칼슘",             period: 4, group: 2,  charge: +2, category: CATEGORY.METAL     },
  SC: { z: 21, symbol: "Sc", nameKr: "스칸듐",           period: 4, group: 3,  charge: +3, category: CATEGORY.METAL     },
  TI2:{ z: 22, symbol: "Ti", nameKr: "타이타늄(II)",     period: 4, group: 4,  charge: +2, category: CATEGORY.METAL     },
  TI4:{ z: 22, symbol: "Ti", nameKr: "타이타늄(IV)",     period: 4, group: 4,  charge: +4, category: CATEGORY.METAL     },
  V3: { z: 23, symbol: "V",  nameKr: "바나듐(III)",      period: 4, group: 5,  charge: +3, category: CATEGORY.METAL     },
  V5: { z: 23, symbol: "V",  nameKr: "바나듐(V)",        period: 4, group: 5,  charge: +5, category: CATEGORY.METAL     },
  CR3:{ z: 24, symbol: "Cr", nameKr: "크로뮴(III)",      period: 4, group: 6,  charge: +3, category: CATEGORY.METAL     },
  CR6:{ z: 24, symbol: "Cr", nameKr: "크로뮴(VI)",       period: 4, group: 6,  charge: +6, category: CATEGORY.METAL     },
  MN2:{ z: 25, symbol: "Mn", nameKr: "망가니즈(II)",     period: 4, group: 7,  charge: +2, category: CATEGORY.METAL     },
  MN4:{ z: 25, symbol: "Mn", nameKr: "망가니즈(IV)",     period: 4, group: 7,  charge: +4, category: CATEGORY.METAL     },
  FE2:{ z: 26, symbol: "Fe", nameKr: "철(II)",           period: 4, group: 8,  charge: +2, category: CATEGORY.METAL     },
  FE3:{ z: 26, symbol: "Fe", nameKr: "철(III)",          period: 4, group: 8,  charge: +3, category: CATEGORY.METAL     },
  CO2:{ z: 27, symbol: "Co", nameKr: "코발트(II)",       period: 4, group: 9,  charge: +2, category: CATEGORY.METAL     },
  CO3:{ z: 27, symbol: "Co", nameKr: "코발트(III)",      period: 4, group: 9,  charge: +3, category: CATEGORY.METAL     },
  NI: { z: 28, symbol: "Ni", nameKr: "니켈",             period: 4, group: 10, charge: +2, category: CATEGORY.METAL     },
  CU1:{ z: 29, symbol: "Cu", nameKr: "구리(I)",          period: 4, group: 11, charge: +1, category: CATEGORY.METAL     },
  CU2:{ z: 29, symbol: "Cu", nameKr: "구리(II)",         period: 4, group: 11, charge: +2, category: CATEGORY.METAL     },
  ZN: { z: 30, symbol: "Zn", nameKr: "아연",             period: 4, group: 12, charge: +2, category: CATEGORY.METAL     },
  GA: { z: 31, symbol: "Ga", nameKr: "갈륨",             period: 4, group: 13, charge: +3, category: CATEGORY.METAL     },
  GE: { z: 32, symbol: "Ge", nameKr: "저마늄",           period: 4, group: 14, charge: +4, category: CATEGORY.METALLOID },
  GEM:{ z: 32, symbol: "Ge", nameKr: "저마늄(음)",       period: 4, group: 14, charge: -4, category: CATEGORY.METALLOID },
  AS: { z: 33, symbol: "As", nameKr: "비소",             period: 4, group: 15, charge: -3, category: CATEGORY.METALLOID },
  ASP:{ z: 33, symbol: "As", nameKr: "비소(III)",        period: 4, group: 15, charge: +3, category: CATEGORY.METALLOID },
  SE: { z: 34, symbol: "Se", nameKr: "셀레늄",           period: 4, group: 16, charge: -2, category: CATEGORY.NONMETAL  },
  SEP:{ z: 34, symbol: "Se", nameKr: "셀레늄(VI)",       period: 4, group: 16, charge: +6, category: CATEGORY.NONMETAL  },
  BR: { z: 35, symbol: "Br", nameKr: "브로민",           period: 4, group: 17, charge: -1, category: CATEGORY.NONMETAL  },
  KR: { z: 36, symbol: "Kr", nameKr: "크립톤",           period: 4, group: 18, charge:  0, category: CATEGORY.NOBLE     },
  // 방해석 — 게임 규칙에 참여하지 않는 순수 장애물 (연쇄 공격으로 상대에게 보냄)
  AU: { z: 79, symbol: "Au", nameKr: "금",       period: 0, group: 0,  charge:  0, category: CATEGORY.OBSTACLE },
  AG: { z: 47, symbol: "Ag", nameKr: "은",       period: 0, group: 0,  charge:  0, category: CATEGORY.OBSTACLE },
};
for (const k in ELEMENTS) ELEMENTS[k].key = k;

// 원자량 (u) — 분자량 기반 우선순위 계산용. z 로 조회.
const ATOMIC_MASS = {
  1:1.008, 2:4.0, 3:6.94, 4:9.01, 5:10.81, 6:12.01, 7:14.01, 8:16.0, 9:19.0, 10:20.18,
  11:22.99, 12:24.31, 13:26.98, 14:28.09, 15:30.97, 16:32.07, 17:35.45, 18:39.95,
  19:39.10, 20:40.08, 21:44.96, 22:47.87, 23:50.94, 24:52.00, 25:54.94, 26:55.85,
  27:58.93, 28:58.69, 29:63.55, 30:65.38, 31:69.72, 32:72.63, 33:74.92, 34:78.96,
  35:79.90, 36:83.80,
  47:107.87, 79:196.97,
};
for (const k in ELEMENTS) ELEMENTS[k].mass = ATOMIC_MASS[ELEMENTS[k].z] || 0;

// 게임에 자연 낙하하는 원소 (장애물 제외)
const ALL_ELEMENTS = Object.values(ELEMENTS).filter(e => e.category !== CATEGORY.OBSTACLE);
const OBSTACLE_ELEMENTS = [ELEMENTS.AU, ELEMENTS.AG];

function isNoble(e)    { return e && e.category === CATEGORY.NOBLE; }
function isObstacle(e) { return e && e.category === CATEGORY.OBSTACLE; }

// HTML 라벨: sup 태그 사용 (CSS 에서 우상단으로 이동).
function labelHTML(e) {
  if (e.charge === 0) return e.symbol;
  const abs = Math.abs(e.charge);
  const sign = e.charge > 0 ? "+" : "−";
  const supText = abs === 1 ? sign : `${abs}${sign}`;
  return `${e.symbol}<sup>${supText}</sup>`;
}

// ══════════════════════════════════════════════════════════════════════
// 렌더 상수. CSS `--cell / --gap / --pad` 이 뷰포트에 따라 동적으로 계산
// 되므로 여기서도 실측값을 사용. measureFieldDims() 로 갱신.
// ══════════════════════════════════════════════════════════════════════
let CELL = 56, GAP = 8, PAD = 10;
let CELL_STEP = CELL + GAP;
const WIDTH = 8, HEIGHT = 12;
function ballPx(gridX, y) {
  return {
    x: PAD + gridX * CELL_STEP,
    y: PAD + (HEIGHT - 1 - y) * CELL_STEP,
  };
}
// CSS 변수 (--cell 등) 는 min()/calc() 표현식이라 getComputedStyle 만으론
// 실제 px 값을 얻기 어렵다. 임시 프로브 요소를 넣고 렌더된 크기를 읽어옴.
function measureFieldDims() {
  const probe = document.createElement("div");
  probe.style.cssText = "position:absolute; visibility:hidden; pointer-events:none; top:0; left:0;";
  probe.innerHTML =
    '<div style="width: var(--cell); height: var(--cell)"></div>' +
    '<div style="width: var(--gap);  height: var(--gap)"></div>'  +
    '<div style="width: var(--pad);  height: var(--pad)"></div>';
  document.body.appendChild(probe);
  const cells = probe.children;
  CELL = cells[0].getBoundingClientRect().width || CELL;
  GAP  = cells[1].getBoundingClientRect().width || GAP;
  PAD  = cells[2].getBoundingClientRect().width || PAD;
  probe.remove();
  CELL_STEP = CELL + GAP;
}

// ══════════════════════════════════════════════════════════════════════
// 랭크 · 낙하 속도
// ══════════════════════════════════════════════════════════════════════
const SPAWN_COL = 3;
const FALL_SPEED_BASE = 0.8;
const FALL_SPEED_PER_LEVEL = 0.28;
const FALL_SPEED_MAX = 6.0;
const FALL_SPEED_SOFT = 30;
const SCORE_PER_LEVEL = 1200;   // 랭크 상승 필요 점수 — 12랭크 다 오르려면 ~14400점

const ALCHEMIST_RANKS = [
  { name: "Zosimos",           nameKr: "조시모스",           era: "3–4c Egypt" },
  { name: "Jabir ibn Hayyan",  nameKr: "자비르 이븐 하이얀", era: "8c Persia" },
  { name: "Paracelsus",        nameKr: "파라켈수스",         era: "16c Switzerland" },
  { name: "Robert Boyle",      nameKr: "로버트 보일",        era: "17c Ireland" },
  { name: "Antoine Lavoisier", nameKr: "앙투안 라부아지에",  era: "18c France" },
  { name: "John Dalton",       nameKr: "존 돌턴",            era: "Early 19c Britain" },
  { name: "Amedeo Avogadro",   nameKr: "아메데오 아보가드로",era: "Early 19c Italy" },
  { name: "Dmitri Mendeleev",  nameKr: "드미트리 멘델레예프",era: "Late 19c Russia" },
  { name: "Marie Curie",       nameKr: "마리 퀴리",          era: "19–20c Poland·France" },
  { name: "Ernest Rutherford", nameKr: "어니스트 러더퍼드",  era: "Early 20c NZ·UK" },
  { name: "Niels Bohr",        nameKr: "닐스 보어",          era: "Early 20c Denmark" },
  { name: "Linus Pauling",     nameKr: "라이너스 폴링",      era: "20c USA" },
];
// game.js 는 desc 를 표시하지 않지만 showLevelUp 에서 참조하므로 story.js 나 별도에서 사용 가능

function chemistPortraitHtml(rankIndex, size = 40) {
  const svgMarkup = emblemSvg(rankIndex);
  return `<div class="chemist-portrait" style="width:${size}px;height:${size}px">${svgMarkup}</div>`;
}
function rankInfo(level)  { return ALCHEMIST_RANKS[Math.min(level - 1, ALCHEMIST_RANKS.length - 1)]; }
function pickRandom(arr)  { return arr[Math.floor(Math.random() * arr.length)]; }
function fallSpeedForLevel(lv) { return Math.min(FALL_SPEED_MAX, FALL_SPEED_BASE + (lv - 1) * FALL_SPEED_PER_LEVEL); }
function periodColor(period) { return period === 1 ? "#ffcf3d" : period === 2 ? "#7ed88a" : "#6fbcf5"; }

// 원소 하나 뽑기 (장애물 제외)
function generatePiece() { return { element: pickRandom(ALL_ELEMENTS) }; }

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ══════════════════════════════════════════════════════════════════════
// Ball — DOM 부착·이동. Game 인스턴스가 소유.
// ══════════════════════════════════════════════════════════════════════
class Ball {
  constructor(element, gridX, y, game) {
    this.game = game;
    this.id = ++game.nextBallId;
    this.element = element;
    this.gridX = gridX;
    this.y = y;
    this.locked = false;
    this.dom = null;
    this._createDom();
    this.dom.classList.add("falling");
    this.updateDom();
  }
  _createDom() {
    const el = document.createElement("div");
    const e = this.element;
    if (isObstacle(e)) {
      el.className = "ball obstacle " + (e.key === "AG" ? "silver" : "gold");
      el.innerHTML = `<span class="sym">${e.symbol}</span>`;
    } else {
      el.className = `ball p${e.period}`;
      if (e.category === CATEGORY.METAL) el.classList.add("metal");
      if (isNoble(e)) {
        el.classList.add("noble");
        el.innerHTML = `
          <div class="gas-layer"></div>
          <div class="gas-particles">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
          <span class="label">${e.symbol}</span>`;
      } else {
        el.innerHTML = labelHTML(e);
      }
    }
    this.game.fieldEl.appendChild(el);
    this.dom = el;
  }
  updateDom() {
    const p = ballPx(this.gridX, this.y);
    this.dom.style.setProperty("--px", p.x + "px");
    this.dom.style.setProperty("--py", p.y + "px");
    this.dom.style.transform = `translate(${p.x}px, ${p.y}px)`;
  }
  setFallMode(mode) {
    this.dom.classList.remove("falling", "gravity");
    if (mode) this.dom.classList.add(mode);
  }
  markClearing() { this.dom.classList.add("clearing"); }
  destroy() {
    if (this.dom && this.dom.parentNode) this.dom.parentNode.removeChild(this.dom);
    this.dom = null;
  }
}

// ══════════════════════════════════════════════════════════════════════
// Game — 필드/볼/상태/DOM 캡슐. 컨트롤러가 tryMove/softDrop 을 호출.
// ══════════════════════════════════════════════════════════════════════
class Game {
  constructor(rootEl, opts = {}) {
    this.rootEl = rootEl;
    this.opts = opts;   // { isPlayer, onChain, onGameOver, onLevelUp, showLevelToast }
    // 이 side 의 DOM 요소들
    this.fieldEl      = rootEl.querySelector(".field-wrap");
    this.playfieldEl  = rootEl.querySelector(".playfield");
    this.ruleBannerEl = rootEl.querySelector(".rule-banner");
    this.scoreEl      = rootEl.querySelector('[data-role="score"]');
    this.chainEl      = rootEl.querySelector('[data-role="chain"]');
    this.nextEl       = rootEl.querySelector(".next");
    this.hpBarEl      = rootEl.querySelector(".side-hp > span");

    this.nextBallId = 0;
    this.field = null;
    this.balls = new Map();
    this.state = this._defaultState();
    this.speedBoostUntil = 0;   // performance.now() ms 이후까지 가속 유지
    this._paused = false;
  }

  pause()  { this._paused = true; }
  resume() { this._paused = false; }

  _defaultState() {
    return {
      currentPiece: null,
      nextPiece: null,
      fallingBall: null,
      isResolving: false,
      gameOver: false,
      score: 0,
      level: 1,
      lastChain: 0,
      softDrop: false,
      pendingNuisance: 0,  // 상대에게서 받은 Au/Ag 개수 (다음 조각 스폰 전 낙하)
    };
  }

  reset() {
    for (const b of this.balls.values()) b.destroy();
    this.balls.clear();
    this.field = this._createField();
    Object.assign(this.state, this._defaultState());
    this.state.currentPiece = generatePiece();
    this.state.nextPiece = generatePiece();
    this._spawnPiece();
    this.updateUI();
  }

  _createField() {
    const f = new Array(WIDTH);
    for (let x = 0; x < WIDTH; x++) f[x] = new Array(HEIGHT).fill(null);
    return f;
  }
  _columnHeight(x) {
    for (let y = HEIGHT - 1; y >= 0; y--) if (this.field[x][y] !== null) return y + 1;
    return 0;
  }
  _fieldOfElements() {
    const ef = this._createField();
    for (let x = 0; x < WIDTH; x++) for (let y = 0; y < HEIGHT; y++) {
      const bid = this.field[x][y];
      if (bid !== null) {
        const b = this.balls.get(bid);
        ef[x][y] = b ? b.element : null;
      }
    }
    return ef;
  }
  _applyGravity() {
    const moves = [];
    for (let x = 0; x < WIDTH; x++) {
      let writeY = 0;
      for (let y = 0; y < HEIGHT; y++) {
        const bid = this.field[x][y];
        if (bid === null) continue;
        if (writeY !== y) {
          this.field[x][writeY] = bid;
          this.field[x][y] = null;
          moves.push({ ballId: bid, x, fromY: y, toY: writeY });
        }
        writeY++;
      }
    }
    return moves;
  }

  _spawnPiece() {
    const el = this.state.currentPiece.element;
    const b = new Ball(el, SPAWN_COL, HEIGHT - 1, this);
    this.balls.set(b.id, b);
    this.state.fallingBall = b;
  }

  _isSpawnBlocked() {
    return this.field[SPAWN_COL][HEIGHT - 1] !== null;
  }

  currentFallSpeed() {
    const base = fallSpeedForLevel(this.state.level);
    const boost = performance.now() < this.speedBoostUntil ? 1.5 : 1.0;
    return Math.min(FALL_SPEED_MAX * 1.5, base * boost);
  }

  // 컨트롤러가 호출
  tryMove(delta) {
    if (this.state.gameOver || this.state.isResolving) return false;
    const ball = this.state.fallingBall;
    if (!ball || ball.locked) return false;
    const newX = ball.gridX + delta;
    if (newX < 0 || newX >= WIDTH) return false;
    if (this._columnHeight(newX) > Math.floor(ball.y)) return false;
    ball.gridX = newX;
    ball.updateDom();
    if (this.opts.isPlayer && typeof audio !== "undefined") audio.playMove();
    return true;
  }
  softDrop(on) { this.state.softDrop = on; }

  // 매 프레임 호출
  tick(dt) {
    if (this._paused || this.state.gameOver || this.state.isResolving) return;
    this._updateFalling(dt);
  }

  _updateFalling(dt) {
    const ball = this.state.fallingBall;
    if (!ball) return;
    const speed = this.state.softDrop ? FALL_SPEED_SOFT : this.currentFallSpeed();
    const dy = speed * dt;
    const floor = this._columnHeight(ball.gridX);
    const newY = ball.y - dy;
    if (newY <= floor) {
      ball.y = floor;
      ball.locked = true;
      if (floor < HEIGHT) this.field[ball.gridX][floor] = ball.id;
      ball.updateDom();
      this.state.fallingBall = null;
      this._onPieceLanded();
    } else {
      ball.y = newY;
      ball.updateDom();
    }
  }

  async _onPieceLanded() {
    this.state.isResolving = true;
    if (this.opts.isPlayer && typeof audio !== "undefined") audio.playLand();
    await sleep(80);
    await this._resolveMatches();
    await this._advanceToNextPiece();
  }

  async _resolveMatches() {
    let chain = 0;
    while (true) {
      const f = this._fieldOfElements();
      const molResult = findMolecules(f, WIDTH, HEIGHT, isNoble, isObstacle);
      const mol = molResult.cells;           // 분자(화합물 + 이원자) 통합
      const compoundCells = molResult.compoundCells;
      const diatomicCells = molResult.diatomicCells;
      // 분자가 최우선 — 분자 셀은 주기/족/금속 규칙에서 제외 (서로는 공유 OK)
      const per = findPeriodRuns(f, WIDTH, HEIGHT, isObstacle, mol);
      const grp = findGroupRuns(f, WIDTH, HEIGHT, isObstacle, mol);
      const met = findMetalClusters(f, WIDTH, HEIGHT, CATEGORY.METAL, mol);
      const all = new Set([...mol, ...per, ...grp, ...met]);
      if (all.size === 0) break;
      chain++;
      const positions = decodePositions(all, HEIGHT);

      const compoundSubs = molResult.subsets.filter(s => !s.isDiatomic);
      const diatomicSubs = molResult.subsets.filter(s => s.isDiatomic);
      const fired = [];
      if (compoundSubs.length > 0) fired.push({ cls: "molecule", label: "분자", formulas: compoundSubs });
      if (diatomicSubs.length > 0) fired.push({ cls: "diatomic", label: "이원자", formulas: diatomicSubs });
      if (per.size > 0) fired.push({ cls: "period", label: "주기 가로" });
      if (grp.size > 0) fired.push({ cls: "group",  label: "족 세로"  });
      if (met.size > 0) fired.push({ cls: "metal",  label: "금속 결합" });
      const simul = fired.length;

      this._showRuleBanner(chain, fired, simul);

      if (this.opts.isPlayer && typeof audio !== "undefined") {
        const primary = met.size > 0 ? "metal"
                      : diatomicCells.size > 0 ? "diatomic"
                      : grp.size > 0 ? "group"
                      : per.size > 0 ? "period"
                      : "molecule";
        audio.playClear(primary, chain);
        if (chain >= 2) audio.playChain(chain);
      }
      if (this.opts.isPlayer) { stats.recordChain(chain, simul); stats.save(); stats.render(); }

      // 규칙별 하이라이트 — 분자(화합물/이원자) 는 mol 에 이미 배타적이므로 셀 겹침 없음
      for (const p of positions) {
        const bid = this.field[p.x][p.y];
        if (bid === null) continue;
        const b = this.balls.get(bid);
        if (!b) continue;
        const enc = p.x * HEIGHT + p.y;
        if (compoundCells.has(enc))      b.dom.classList.add("match-molecule");
        else if (diatomicCells.has(enc)) b.dom.classList.add("match-diatomic");
        else if (met.has(enc))           b.dom.classList.add("match-metal");
        else if (grp.has(enc))           b.dom.classList.add("match-group");
        else if (per.has(enc))           b.dom.classList.add("match-period");
      }
      this._spawnMatchLabels(f, compoundSubs, diatomicSubs, per, grp, met);
      await sleep(280);

      for (const p of positions) {
        const bid = this.field[p.x][p.y];
        if (bid !== null) this.balls.get(bid)?.markClearing();
      }
      await sleep(320);

      for (const p of positions) {
        const bid = this.field[p.x][p.y];
        if (bid !== null) {
          const b = this.balls.get(bid);
          if (b) {
            const px = ballPx(p.x, p.y);
            this._spawnParticles(px.x + CELL / 2, px.y + CELL / 2, periodColor(b.element.period));
          }
          b?.destroy();
          this.balls.delete(bid);
          this.field[p.x][p.y] = null;
        }
      }

      const moves = this._applyGravity();
      for (const m of moves) {
        const b = this.balls.get(m.ballId);
        if (b) { b.setFallMode("gravity"); b.y = m.toY; b.updateDom(); }
      }
      if (moves.length > 0) await sleep(300);

      // 점수
      let positionalBonus = 0;
      for (const p of positions) {
        const e = f[p.x][p.y];
        if (e) positionalBonus += e.period * 3 + e.group;
      }
      const baseScore = all.size * chain * simul * 10;
      const gained = baseScore + positionalBonus;
      this.state.score += gained;
      if (this.opts.isPlayer) stats.recordEvent(chain, simul, fired, gained);
      this._showScorePopup(gained, positions, chain >= 2 || simul >= 2);

      // 점수 기반 자동 랭크 상승 (solo 전용)
      if (this.opts.autoLevelUp) {
        const newLv = 1 + Math.floor(this.state.score / SCORE_PER_LEVEL);
        if (newLv > this.state.level) {
          this.state.level = newLv;
          if (this.opts.onLevelUp) this.opts.onLevelUp(newLv, this);
        }
      }

      // 공격 라우팅 (duel 전용): 순수 period/group 만 (규칙 2·3) 은 공격 없음.
      // molecule/metal/diatomic 발동 또는 chain ≥ 2 일 때만 상대에게 Au/Ag 발사.
      const attackable = mol.size > 0 || met.size > 0 || chain >= 2;
      if (attackable && this.opts.onAttack) {
        const attackAmt = Math.floor(gained / 30);
        if (attackAmt > 0) this.opts.onAttack(attackAmt, this);
      }

      this.updateUI();
    }
    this.state.lastChain = chain;
    if (this.opts.isPlayer) { stats.save(); stats.render(); }
    this.updateUI();
    setTimeout(() => this._hideRuleBanner(), 1200);
  }

  async _advanceToNextPiece() {
    // 대기 중인 방해석 먼저 하늘에서 낙하 (뿌요뿌요 오자마 스타일)
    if (this.state.pendingNuisance > 0) {
      await this._doNuisanceDrop();
    }
    this.state.currentPiece = this.state.nextPiece;
    this.state.nextPiece = generatePiece();
    if (this._isSpawnBlocked()) {
      this.state.gameOver = true;
      this.state.isResolving = false;
      if (this.opts.onGameOver) this.opts.onGameOver(this);
      return;
    }
    this._spawnPiece();
    this.state.isResolving = false;
    this.updateUI();
  }

  // ── 방해석 대기열 추가 (상대의 공격이 도착) ─────────────────
  receiveNuisance(count) {
    this.state.pendingNuisance += count;
  }

  // ── 대기 방해석을 하늘에서 동시 낙하로 필드에 얹기 ─────────────
  //    다음 조각 스폰 전에 호출. 각 방해석은 랜덤 열의 필드 위쪽(y > HEIGHT)에서 시작
  //    → 자연 낙하 → 착지. 여러 개가 같은 열이면 위쪽부터 스택.
  async _doNuisanceDrop() {
    const count = this.state.pendingNuisance;
    this.state.pendingNuisance = 0;
    if (count <= 0) return;

    const perCol = new Map();
    const nBalls = [];
    for (let i = 0; i < count; i++) {
      const cols = [];
      for (let x = 0; x < WIDTH; x++) if (this._columnHeight(x) < HEIGHT) cols.push(x);
      if (cols.length === 0) break;
      const x = pickRandom(cols);
      const stacked = perCol.get(x) || 0;
      perCol.set(x, stacked + 1);
      const el = (i % 3 === 0) ? ELEMENTS.AG : ELEMENTS.AU;  // 셋 중 하나는 은
      const startY = HEIGHT + 1.5 + stacked * 1.4;
      const b = new Ball(el, x, startY, this);
      b.dom.classList.add("nuisance-falling");
      nBalls.push(b);
      this.balls.set(b.id, b);
    }
    if (nBalls.length === 0) return;

    // 모든 방해석이 착지할 때까지 프레임마다 갱신
    const fallSpeed = 20;  // 빠른 낙하
    await new Promise(resolve => {
      let last = performance.now();
      const step = (now) => {
        const dt = Math.min(50, now - last) / 1000;
        last = now;
        let moving = false;
        for (const b of nBalls) {
          if (b.locked) continue;
          const floor = this._columnHeight(b.gridX);
          const newY = b.y - fallSpeed * dt;
          if (newY <= floor) {
            b.y = floor;
            b.locked = true;
            if (floor < HEIGHT) this.field[b.gridX][floor] = b.id;
            b.dom.classList.remove("nuisance-falling");
            b.updateDom();
            // 착지 스파클
            const px = ballPx(b.gridX, b.y);
            this._spawnParticles(px.x + CELL / 2, px.y + CELL / 2, "#ffd66b", 4);
          } else {
            b.y = newY;
            b.updateDom();
            moving = true;
          }
        }
        if (moving) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
    this.updateUI();
  }

  // ── UI 갱신 (side-footer + rank/HP) ──────────────────────
  updateUI() {
    if (this.scoreEl) this.scoreEl.textContent = this.state.score;
    if (this.chainEl) this.chainEl.textContent = this.state.lastChain;
    if (this.nextEl) {
      this.nextEl.innerHTML = "";
      if (this.state.nextPiece) {
        const e = this.state.nextPiece.element;
        const el = document.createElement("div");
        el.className = `mini-ball p${e.period}`;
        if (e.category === CATEGORY.METAL) el.classList.add("metal");
        if (isNoble(e)) {
          el.classList.add("noble");
          el.innerHTML = `<span class="label">${e.symbol}</span>`;
        } else if (isObstacle(e)) {
          el.classList.add("obstacle", e.key === "AG" ? "silver" : "gold");
          el.innerHTML = `<span class="sym">${e.symbol}</span>`;
        } else {
          el.innerHTML = labelHTML(e);
        }
        this.nextEl.appendChild(el);
      }
    }
    // HP bar: 최상단 셀들 사용률 = 1 - (top row 채워짐 비율)
    if (this.hpBarEl) {
      let topFilled = 0;
      for (let x = 0; x < WIDTH; x++) {
        if (this._columnHeight(x) >= HEIGHT - 1) topFilled++;
      }
      const hp = Math.max(0, 1 - topFilled / WIDTH);
      this.hpBarEl.style.width = (hp * 100) + "%";
    }
    // 플레이어의 랭크 표시는 boot 쪽에서 처리 (전역 rank-title)
    if (this.opts.onUIUpdate) this.opts.onUIUpdate(this);
  }

  // ── 규칙 배너 + 점수 팝업 + 파티클 ─────────────────────────
  _showRuleBanner(chain, firedList, simul) {
    if (!this.ruleBannerEl) return;
    const badges = [];
    if (chain > 1) badges.push(`<span class="chain-tag combo-tag">연쇄 ${chain}단</span>`);
    else badges.push(`<span class="chain-tag">소거</span>`);
    if (simul >= 2) badges.push(`<span class="chain-tag simul-tag">동시 ${simul}종</span>`);
    let html = badges.join("");
    for (const f of firedList) {
      if (f.formulas && f.formulas.length > 0) {
        const parts = f.formulas.map(it =>
          `<span class="formula">${it.formula}</span>` +
          (it.nameKr ? ` <span class="name-kr">${it.nameKr}</span>` : "")
        ).join(" · ");
        html += `<span class="rule-tag ${f.cls}">${f.label}: ${parts}</span>`;
      } else {
        html += `<span class="rule-tag ${f.cls}">${f.label}</span>`;
      }
    }
    this.ruleBannerEl.innerHTML = html;
    this.ruleBannerEl.classList.add("show");
  }
  _hideRuleBanner() { if (this.ruleBannerEl) this.ruleBannerEl.classList.remove("show"); }

  _spawnParticles(cx, cy, color, count = 10) {
    if (!this.playfieldEl || !this.fieldEl) return;
    const wrapRect = this.fieldEl.getBoundingClientRect();
    const playRect = this.playfieldEl.getBoundingClientRect();
    const offsetTop = wrapRect.top - playRect.top;
    const offsetLeft = wrapRect.left - playRect.left;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const dist = 45 + Math.random() * 35;
      p.style.left = (offsetLeft + cx) + "px";
      p.style.top = (offsetTop + cy) + "px";
      p.style.setProperty("--dx", Math.cos(angle) * dist + "px");
      p.style.setProperty("--dy", Math.sin(angle) * dist + "px");
      p.style.background = color;
      p.style.color = color;
      this.playfieldEl.appendChild(p);
      setTimeout(() => p.remove(), 720);
    }
  }

  // 소거 순간, 각 규칙 클러스터 중심에 이름 팝업 (분자식·N주기·N족·이원자·금속 결합)
  _spawnMatchLabels(f, molSubsets, diatomicSubs, per, grp, met) {
    if (!this.playfieldEl || !this.fieldEl) return;
    const centroidPx = (cells) => {
      let sx = 0, sy = 0;
      for (const c of cells) { const p = ballPx(c.x, c.y); sx += p.x + CELL/2; sy += p.y + CELL/2; }
      return { x: sx / cells.length, y: sy / cells.length };
    };
    // 분자: subset 별 — 6망성 마법진 + 화학식 (오래 잔상)
    for (const sub of molSubsets) {
      const cells = [];
      for (const cid of sub.cellIds) cells.push({ x: Math.floor(cid / HEIGHT), y: cid % HEIGHT });
      const c = centroidPx(cells);
      // 6망성 (두 개의 삼각형 겹침, 정육각형에 내접)
      const hex = `
        <svg class="mp-hexagram" viewBox="0 0 100 100" width="150" height="150" aria-hidden="true">
          <defs>
            <filter id="mp-glow"><feGaussianBlur stdDeviation="1.4"/></filter>
          </defs>
          <g class="mp-hex-ring" stroke="rgba(255,205,110,0.9)" stroke-width="1.1" fill="none" filter="url(#mp-glow)">
            <circle cx="50" cy="50" r="46"/>
            <circle cx="50" cy="50" r="34" stroke-dasharray="2 3" opacity="0.75"/>
          </g>
          <g class="mp-hex-up"   stroke="rgba(255,220,140,0.95)" stroke-width="1.4" fill="rgba(255,190,80,0.06)" filter="url(#mp-glow)">
            <polygon points="50,10 87,72 13,72"/>
          </g>
          <g class="mp-hex-down" stroke="rgba(255,235,180,0.95)" stroke-width="1.4" fill="rgba(255,220,120,0.06)" filter="url(#mp-glow)">
            <polygon points="50,90 13,28 87,28"/>
          </g>
          <g fill="rgba(255,235,170,0.95)">
            <circle cx="50" cy="10" r="1.6"/><circle cx="87" cy="72" r="1.6"/><circle cx="13" cy="72" r="1.6"/>
            <circle cx="50" cy="90" r="1.6"/><circle cx="13" cy="28" r="1.6"/><circle cx="87" cy="28" r="1.6"/>
          </g>
        </svg>`;
      const html = hex +
                   `<span class="mp-formula">${sub.formula}</span>` +
                   (sub.nameKr ? `<span class="mp-name">${sub.nameKr}</span>` : "");
      this._spawnLabelPopup(c.x, c.y, html, "molecule");
    }
    // 이원자: findMolecules 가 이미 서브셋 단위로 반환 — subset 중심에 팝업
    for (const sub of diatomicSubs) {
      const cells = [];
      for (const cid of sub.cellIds) cells.push({ x: Math.floor(cid / HEIGHT), y: cid % HEIGHT });
      const c = centroidPx(cells);
      const html = `<span class="mp-formula">${sub.formula}</span>` +
                   (sub.nameKr ? `<span class="mp-name">${sub.nameKr}</span>` : "");
      this._spawnLabelPopup(c.x, c.y, html, "diatomic");
    }
    // 주기: 행별로 묶기 (같은 주기가 연속되는 구간)
    if (per && per.size > 0) {
      const byRow = new Map();  // y -> [{x,e}]
      for (const enc of per) {
        const x = Math.floor(enc / HEIGHT), y = enc % HEIGHT;
        const e = f[x][y]; if (!e) continue;
        if (!byRow.has(y)) byRow.set(y, []);
        byRow.get(y).push({ x, y, e });
      }
      for (const cells of byRow.values()) {
        const c = centroidPx(cells);
        const period = cells[0].e.period;
        this._spawnLabelPopup(c.x, c.y, `<span class="mp-formula">${period}주기</span>`, "period");
      }
    }
    // 족: 열별로 묶기
    if (grp && grp.size > 0) {
      const byCol = new Map();  // x -> [{y,e}]
      for (const enc of grp) {
        const x = Math.floor(enc / HEIGHT), y = enc % HEIGHT;
        const e = f[x][y]; if (!e) continue;
        if (!byCol.has(x)) byCol.set(x, []);
        byCol.get(x).push({ x, y, e });
      }
      for (const cells of byCol.values()) {
        const c = centroidPx(cells);
        const group = cells[0].e.group;
        this._spawnLabelPopup(c.x, c.y, `<span class="mp-formula">${group}족</span>`, "group");
      }
    }
    // 금속: 같은 원소(key)로 이어진 성분별로 묶기 (BFS)
    if (met && met.size > 0) {
      const remaining = new Set(met);
      while (remaining.size > 0) {
        const first = remaining.values().next().value;
        const fx = Math.floor(first / HEIGHT), fy = first % HEIGHT;
        const startE = f[fx][fy];
        if (!startE) { remaining.delete(first); continue; }
        const key = startE.key;
        const stack = [first];
        const cluster = [];
        while (stack.length) {
          const cur = stack.pop();
          if (!remaining.has(cur)) continue;
          const cx = Math.floor(cur / HEIGHT), cy = cur % HEIGHT;
          const ce = f[cx][cy];
          if (!ce || ce.key !== key) continue;
          remaining.delete(cur);
          cluster.push({ x: cx, y: cy });
          for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
            const nEnc = (cx + dx) * HEIGHT + (cy + dy);
            if (remaining.has(nEnc)) stack.push(nEnc);
          }
        }
        if (cluster.length === 0) continue;
        const c = centroidPx(cluster);
        const html = `<span class="mp-formula">${startE.symbol}<sub>${cluster.length}</sub> 금속</span>` +
                     `<span class="mp-name">${startE.nameKr} 결합</span>`;
        this._spawnLabelPopup(c.x, c.y, html, "metal");
      }
    }
  }

  _spawnLabelPopup(cx, cy, html, cls) {
    const wrapRect = this.fieldEl.getBoundingClientRect();
    const playRect = this.playfieldEl.getBoundingClientRect();
    const offsetTop = wrapRect.top - playRect.top;
    const offsetLeft = wrapRect.left - playRect.left;
    const el = document.createElement("div");
    el.className = "match-popup match-popup-" + cls;
    el.innerHTML = html;
    el.style.left = (offsetLeft + cx) + "px";
    el.style.top  = (offsetTop  + cy) + "px";
    this.playfieldEl.appendChild(el);
    // 분자는 인식 시간을 주기 위해 오래 잔상, 나머지는 짧게
    const lifetime = cls === "molecule" ? 2600 : 1300;
    setTimeout(() => el.remove(), lifetime);
  }

  _showScorePopup(amount, positions, isBig) {
    if (!positions.length || !this.playfieldEl || !this.fieldEl) return;
    let sx = 0, sy = 0;
    for (const p of positions) {
      const px = ballPx(p.x, p.y);
      sx += px.x + CELL / 2;
      sy += px.y + CELL / 2;
    }
    sx /= positions.length; sy /= positions.length;
    const wrapRect = this.fieldEl.getBoundingClientRect();
    const playRect = this.playfieldEl.getBoundingClientRect();
    const offsetTop = wrapRect.top - playRect.top;
    const offsetLeft = wrapRect.left - playRect.left;
    const el = document.createElement("div");
    el.className = "score-popup" + (isBig ? " big" : "");
    el.textContent = `+${amount}`;
    el.style.left = (offsetLeft + sx) + "px";
    el.style.top  = (offsetTop + sy) + "px";
    this.playfieldEl.appendChild(el);
    setTimeout(() => el.remove(), 950);
  }
}

// ══════════════════════════════════════════════════════════════════════
// KeyboardController — 키 이벤트를 game 인스턴스로 라우팅
// ══════════════════════════════════════════════════════════════════════
class KeyboardController {
  constructor(game) {
    this.game = game;
    this._downHandler = (e) => this._onKeyDown(e);
    this._upHandler = (e) => this._onKeyUp(e);
    document.addEventListener("keydown", this._downHandler);
    document.addEventListener("keyup", this._upHandler);
  }
  _onKeyDown(e) {
    if (typeof audio !== "undefined") audio.unlock();
    if (e.key === "ArrowLeft")  { this.game.tryMove(-1); e.preventDefault(); return; }
    if (e.key === "ArrowRight") { this.game.tryMove(+1); e.preventDefault(); return; }
    if (e.key === "ArrowDown")  { this.game.softDrop(true); e.preventDefault(); return; }
    if (e.key === "n" || e.key === "N") { onNewGameRequested(); e.preventDefault(); return; }
    if ((e.key === "m" || e.key === "M") && typeof audio !== "undefined") {
      audio.toggleMuteAll(); updateMuteUI(); e.preventDefault(); return;
    }
    if ((e.key === "b" || e.key === "B") && typeof audio !== "undefined") {
      audio.toggleMuteBgm(); updateMuteUI(); e.preventDefault(); return;
    }
  }
  _onKeyUp(e) {
    if (e.key === "ArrowDown") this.game.softDrop(false);
  }
  destroy() {
    document.removeEventListener("keydown", this._downHandler);
    document.removeEventListener("keyup", this._upHandler);
  }
}

// ══════════════════════════════════════════════════════════════════════
// AIController — solo 대전용. 상대 game 을 자동 조작.
// 초기 구현: 랜덤 열 선택 후 이동·soft drop. 스테이지가 오를수록 반응 빠름.
// ══════════════════════════════════════════════════════════════════════
class AIController {
  constructor(game) {
    this.game = game;
    this.targetCol = null;
    this.moveCooldown = 0;   // 초 단위
    this.decisionCooldown = 0;
  }
  setLevel(lv) {
    // lv=1 → 반응 느림, lv=12 → 반응 빠름
    this.moveInterval = Math.max(0.05, 0.28 - lv * 0.015);   // 이동 간격 (초)
    this.baseDrop = lv >= 5;  // 스테이지 5 이상부터 소프트드롭 사용
  }
  tick(dt) {
    if (!this.moveInterval) this.setLevel(this.game.state.level);
    if (this.game.state.gameOver || this.game.state.isResolving) return;
    const ball = this.game.state.fallingBall;
    if (!ball || ball.locked) { this.targetCol = null; return; }
    if (this.targetCol === null) this.targetCol = this._pickColumn();
    this.moveCooldown -= dt;
    if (this.moveCooldown > 0) return;
    this.moveCooldown = this.moveInterval;
    if (ball.gridX < this.targetCol) this.game.tryMove(+1);
    else if (ball.gridX > this.targetCol) this.game.tryMove(-1);
    else if (this.baseDrop) this.game.softDrop(true);
  }
  _pickColumn() {
    // 지금은 랜덤. 나중에 매칭 가능성 있는 열 우선하도록 개선.
    const cols = [];
    for (let x = 0; x < WIDTH; x++) if (this.game._columnHeight(x) < HEIGHT - 1) cols.push(x);
    if (cols.length === 0) return SPAWN_COL;
    return pickRandom(cols);
  }
}

// ══════════════════════════════════════════════════════════════════════
// Stats — 플레이어 학습 기록 (localStorage). 전역 하나.
// ══════════════════════════════════════════════════════════════════════
const stats = (() => {
  const KEY = "elements_puyo_stats_v3";
  const EVENT_KEEP = 30, EVENT_SHOW = 10;
  const s = {
    events: [], gamesPlayed: 0, bestScore: 0,
    maxChain: 0, maxSimul: 0, totalChains2Plus: 0, totalSimul2Plus: 0,
  };
  const contentEl = () => document.getElementById("stats-content");
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const j = JSON.parse(raw);
      Object.assign(s, {
        events: j.events || [],
        gamesPlayed: j.gamesPlayed || 0,
        bestScore: j.bestScore || 0,
        maxChain: j.maxChain || 0,
        maxSimul: j.maxSimul || 0,
        totalChains2Plus: j.totalChains2Plus || 0,
        totalSimul2Plus: j.totalSimul2Plus || 0,
      });
    } catch {}
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }
  function recordEvent(chain, simul, fired, gained) {
    s.events.unshift({
      chain, simul, gained,
      rules: fired.map(f => ({ cls: f.cls, label: f.label, formulas: f.formulas || null })),
      at: Date.now(),
    });
    if (s.events.length > EVENT_KEEP) s.events.length = EVENT_KEEP;
  }
  function recordChain(chain, simul) {
    if (simul > s.maxSimul) s.maxSimul = simul;
    if (simul >= 2) s.totalSimul2Plus++;
    if (chain > s.maxChain) s.maxChain = chain;
    if (chain >= 2) s.totalChains2Plus++;
  }
  function recordGameEnd(finalScore) {
    s.gamesPlayed++;
    if (finalScore > s.bestScore) s.bestScore = finalScore;
    save();
  }
  function resetEvents() { s.events = []; }
  function render() {
    const el = contentEl();
    if (!el) return;
    const parts = [];
    parts.push(`<div class="stat-cat"><span class="cat-label log">최근 소거 (${EVENT_SHOW}개)</span></div>`);
    if (s.events.length === 0) {
      parts.push('<div class="stat-empty">아직 없음</div>');
    } else {
      for (const ev of s.events.slice(0, EVENT_SHOW)) {
        const badges = [];
        if (ev.chain >= 2) badges.push(`<span class="ev-badge combo">${ev.chain}단</span>`);
        if (ev.simul >= 2) badges.push(`<span class="ev-badge simul">${ev.simul}종</span>`);
        badges.push(`<span class="ev-score">+${ev.gained}</span>`);
        const body = ev.rules.map(r => {
          if (r.formulas && r.formulas.length > 0) {
            const fms = r.formulas.map(it =>
              `<span class="ev-formula">${it.formula}</span>` +
              (it.nameKr ? `<span class="ev-name">${it.nameKr}</span>` : "")
            ).join(", ");
            return `<span class="ev-tag ${r.cls}">${r.label}</span> ${fms}`;
          }
          return `<span class="ev-tag ${r.cls}">${r.label}</span>`;
        }).join(" · ");
        parts.push(`<div class="event-row"><div class="event-meta">${badges.join("")}</div><div class="event-body">${body}</div></div>`);
      }
    }
    parts.push('<div class="stat-cat"><span class="cat-label attack">공격력</span></div>');
    parts.push(`<div class="stat-row"><span>최고 연쇄</span><span class="count">${s.maxChain}단</span></div>`);
    parts.push(`<div class="stat-row"><span>최고 동시</span><span class="count">${s.maxSimul}종</span></div>`);
    parts.push(`<div class="stat-row"><span>연쇄 2+ 누적</span><span class="count">${s.totalChains2Plus}</span></div>`);
    parts.push(`<div class="stat-row"><span>동시 2+ 누적</span><span class="count">${s.totalSimul2Plus}</span></div>`);
    parts.push(`<div class="stat-summary">플레이 ${s.gamesPlayed}회 · 최고 ${s.bestScore}점</div>`);
    el.innerHTML = parts.join("");
  }
  return { load, save, recordEvent, recordChain, recordGameEnd, resetEvents, render, get s() { return s; } };
})();

// ══════════════════════════════════════════════════════════════════════
// 레벨업 토스트 (플레이어 전용)
// ══════════════════════════════════════════════════════════════════════
const RANK_DESCS = [
  "그리스-이집트 연금술사. 증류기(alembic) 등 실험기구 사용을 체계화. 물질의 변환·정제 개념의 시조.",
  "\"화학의 아버지\". 왕수(질산+염산) 발견. 실험 방법·기록·재현 개념 정립.",
  "의화학 창시자. \"용량이 독을 만든다\" — 최초의 독성학 개념.",
  "《회의적 화학자》. 원소·화합물·혼합물을 근대적 의미로 정의. **보일의 법칙**.",
  "\"근대 화학의 아버지\". **질량 보존 법칙**. 산소·수소 명명.",
  "근대 **원자설** 창시. 원자는 고유 질량. 화합물은 정수비.",
  "**아보가드로의 법칙**. 원자·분자 구분 정립.",
  "**주기율표** 최초 정립. 미발견 원소 성질 예측.",
  "폴로늄·라듐 발견. 방사성 개념 최초 사용. 여성 최초 노벨상.",
  "**금박 산란 실험**. 원자핵 발견. \"핵물리학의 아버지\".",
  "**보어 원자모형**. 전자는 허용된 궤도에만.",
  "**전기음성도** 도입. α-헬릭스 규명. 노벨화학상·평화상 모두 수상.",
];
function showLevelUp(newLevel) {
  const rIdx = Math.min(newLevel - 1, ALCHEMIST_RANKS.length - 1);
  const rank = ALCHEMIST_RANKS[rIdx];
  const el = document.createElement("div");
  el.className = "level-up-toast";
  el.innerHTML = `
    <div class="lvl-sigil">⚗</div>
    ${chemistPortraitHtml(rIdx, 110)}
    <div class="lvl-badge">RANK ${newLevel} · ${rank.era}</div>
    <div class="lvl-name">${rank.name}</div>
    <div class="lvl-name-kr">${rank.nameKr}</div>
    <div class="lvl-desc">${RANK_DESCS[rIdx] || ""}</div>
  `;
  document.body.appendChild(el);
  if (typeof audio !== "undefined") audio.playLevelUp();
  setTimeout(() => el.remove(), 2600);
}

// ══════════════════════════════════════════════════════════════════════
// 전역 UI (플레이어 랭크·오버레이·뮤트 토글)
// ══════════════════════════════════════════════════════════════════════
const rankTitleEl = document.getElementById("rank-title");
const levelEl = document.getElementById("level");
const levelBarEl = document.getElementById("level-bar");
const stageNumEl = document.getElementById("stage-num");
const overlayEl = document.getElementById("overlay");
const overlayTitleEl = document.getElementById("overlay-title");
const oppNameEl = document.getElementById("opp-name");
const oppNameBigEl = document.getElementById("opp-name-big");
const oppNameKrEl = document.getElementById("opp-name-kr");
const oppPortraitEl = document.getElementById("opp-portrait");

function updateGlobalRankUI(level) {
  if (!rankTitleEl) return;
  const rIdx = Math.min(level - 1, ALCHEMIST_RANKS.length - 1);
  const r = ALCHEMIST_RANKS[rIdx];
  rankTitleEl.innerHTML = `
    ${chemistPortraitHtml(rIdx, 42)}
    <div class="rank-text">
      <div class="rank-name">${r.name}</div>
      <div class="rank-name-kr">${r.nameKr}</div>
      <div class="rank-era">${r.era}</div>
    </div>`;
  if (levelEl) levelEl.textContent = "RANK " + level;
  if (stageNumEl) stageNumEl.textContent = level;
  if (levelBarEl) {
    const p = (player.state.score % SCORE_PER_LEVEL) / SCORE_PER_LEVEL;
    levelBarEl.style.width = (p * 100) + "%";
  }
  // 상대 카드
  if (oppNameEl) oppNameEl.textContent = r.name;
  if (oppNameBigEl) oppNameBigEl.textContent = r.name;
  if (oppNameKrEl) oppNameKrEl.textContent = r.nameKr;
  if (oppPortraitEl) oppPortraitEl.innerHTML = chemistPortraitHtml(rIdx, 110);
}

function showOverlay(title) {
  overlayTitleEl.textContent = title;
  overlayEl.classList.remove("hidden");
}
function hideOverlay() { overlayEl.classList.add("hidden"); }

function updateMuteUI() {
  const el = document.getElementById("mute-toggle");
  if (!el || typeof audio === "undefined") return;
  const allMuted = audio.isMuted();
  const bgmMuted = audio.isBgmMuted();
  el.dataset.state = allMuted ? "all" : bgmMuted ? "bgm" : "on";
  el.title = allMuted ? "소리 꺼짐 (M 해제)"
           : bgmMuted ? "BGM 꺼짐 · 효과음만 (B 해제)"
           : "소리 켜짐 · M=전체 뮤트, B=BGM 뮤트";
}

// ══════════════════════════════════════════════════════════════════════
// 대전 결과 처리 & 스테이지 진행
// ══════════════════════════════════════════════════════════════════════
// currentStage: 1..12 — 현재 도전 중인 스테이지 (= 화학자 인덱스+1).
// 승리 → 다음 스테이지. 패배 → 같은 스테이지 재도전.
// player/opponent 의 state.level 는 duel 동안 고정 (score 로 자동 올라가지 않음).
let currentStage = 1;
let matchEnded = false;

function onNewGameRequested() { newGame(); }
function newGame() {
  matchEnded = false;
  player.reset();
  if (opponent) opponent.reset();
  if (MODE === "duel") {
    // duel: 현재 스테이지에 고정
    player.state.level = currentStage;
    if (opponent) opponent.state.level = currentStage;
    if (ai) ai.setLevel(currentStage);
    updateGlobalRankUI(currentStage);
  } else {
    // solo: 랭크 1 부터, 점수 오르며 자동 승급
    player.state.level = 1;
    updateGlobalRankUI(1);
  }
  stats.resetEvents();
  stats.save();
  stats.render();
  hideOverlay();
  if (typeof audio !== "undefined") {
    audio.playNewGame();
    audio.switchBgm(player.state.level);
  }
}

function onDuelEnded(playerWon) {
  if (matchEnded) return;
  matchEnded = true;
  stats.recordGameEnd(player.state.score);
  stats.render();
  if (typeof audio !== "undefined") { audio.stopBgm(); }
  const stageIdx = Math.min(currentStage - 1, ALCHEMIST_RANKS.length - 1);
  if (playerWon) {
    // 다음 스테이지로 진행 (12 까지)
    if (currentStage < ALCHEMIST_RANKS.length) currentStage++;
    if (typeof audio !== "undefined") audio.playLevelUp();
    // 진행 상황 저장
    if (typeof saveProgress === "function") {
      const p = (typeof loadProgress === "function") ? loadProgress() : { cleared: 0, seenIntro: true };
      p.cleared = Math.max(p.cleared || 0, stageIdx + 1);
      p.current = currentStage;
      saveProgress(p);
    }
    if (typeof showStageResult === "function") {
      showStageResult(stageIdx, true, () => { newGame(); });
    } else showOverlay("승리!");
  } else {
    if (typeof audio !== "undefined") audio.playGameOver();
    if (typeof showStageResult === "function") {
      showStageResult(stageIdx, false, () => { newGame(); });
    } else showOverlay("게임 오버");
  }
}

// ══════════════════════════════════════════════════════════════════════
// 부팅
// ══════════════════════════════════════════════════════════════════════
// ── 모드 플래그 ─────────────────────────────────────────────
// "solo"  : 1인 모드. 오른쪽 상대 필드 숨김. 점수 기반 랭크 상승. (기본)
// "duel"  : AI 대전 모드. 지금은 AI 가 허접해서 비활성. 나중에 강화 후 재개.
const MODE = "solo";

let player, opponent;
let ai;
let kb;

const playerRoot = document.getElementById("side-player");
const opponentRoot = document.getElementById("side-opponent");

player = new Game(playerRoot, {
  isPlayer: true,
  autoLevelUp: MODE === "solo",   // solo 만 점수로 랭크 상승
  onLevelUp: (lv) => {
    updateGlobalRankUI(lv);
    if (typeof audio !== "undefined") audio.switchBgm(lv);
    if (MODE === "solo") {
      // 새 화학자 등장 컷씬 — 게임 일시정지
      player.pause();
      const rIdx = Math.min(lv - 1, ALCHEMIST_RANKS.length - 1);
      if (typeof showStageIntro === "function") {
        showStageIntro(rIdx, () => { player.resume(); });
      } else {
        showLevelUp(lv);
        player.resume();
      }
    } else {
      showLevelUp(lv);
    }
  },
  onGameOver: () => onGameOverForMode(),
  onAttack: (n) => { if (opponent) opponent.receiveNuisance(n); },
  onUIUpdate: () => {
    if (levelBarEl) {
      const p = Math.min(1, (player.state.score % SCORE_PER_LEVEL) / SCORE_PER_LEVEL);
      levelBarEl.style.width = (p * 100) + "%";
    }
  },
});

if (MODE === "duel") {
  opponent = new Game(opponentRoot, {
    isPlayer: false,
    onGameOver: () => onDuelEnded(true),
    onAttack: (n) => { if (player) player.receiveNuisance(n); },
  });
  ai = new AIController(opponent);
  ai.setLevel(1);
  // 상대 자리표시 제거
  const oppPlaceholder = document.getElementById("opp-placeholder");
  if (oppPlaceholder) oppPlaceholder.style.display = "none";
} else {
  // solo: 오른쪽 사이드 자체를 숨김 + 중앙 VS 도 숨김
  document.body.classList.add("solo-mode");
}

kb = new KeyboardController(player);

function onGameOverForMode() {
  if (MODE === "duel") {
    onDuelEnded(false);
  } else {
    // solo: 기존처럼 오버레이 + N 으로 새 게임
    stats.recordGameEnd(player.state.score);
    stats.render();
    showOverlay("게임 오버");
    if (typeof audio !== "undefined") { audio.playGameOver(); audio.stopBgm(); }
  }
}

// 애니메이션 프레임 루프
let lastTime = performance.now();
function tick(t) {
  const dt = Math.min(50, t - lastTime) / 1000;
  lastTime = t;
  player.tick(dt);
  if (opponent) opponent.tick(dt);
  if (ai) ai.tick(dt);
  requestAnimationFrame(tick);
}

// DOMContentLoaded 이후 뮤트 버튼 · 스테이지 버튼 바인딩
document.addEventListener("DOMContentLoaded", () => {
  const muteBtn = document.getElementById("mute-toggle");
  if (muteBtn) muteBtn.addEventListener("click", (ev) => {
    if (typeof audio !== "undefined") {
      audio.unlock();
      if (ev.shiftKey) audio.toggleMuteBgm();
      else audio.toggleMuteAll();
    }
    updateMuteUI();
  });
  updateMuteUI();
  const stageBtn = document.getElementById("stage-btn");
  if (stageBtn) stageBtn.addEventListener("click", () => {
    if (typeof audio !== "undefined") audio.unlock();
    const rIdx = Math.min(player.state.level - 1, ALCHEMIST_RANKS.length - 1);
    if (typeof showStageIntro === "function") showStageIntro(rIdx, null);
  });

  // 터치 조작 패드 바인딩. 이동은 tap, ▼는 hold-to-softdrop.
  const bindMove = (id, delta) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    const fire = (ev) => {
      ev.preventDefault();
      if (typeof audio !== "undefined") audio.unlock();
      player.tryMove(delta);
    };
    btn.addEventListener("pointerdown", fire);
  };
  bindMove("tp-left", -1);
  bindMove("tp-right", +1);
  const downBtn = document.getElementById("tp-down");
  if (downBtn) {
    const start = (ev) => {
      ev.preventDefault();
      if (typeof audio !== "undefined") audio.unlock();
      player.softDrop(true);
    };
    const end = (ev) => {
      ev.preventDefault();
      player.softDrop(false);
    };
    downBtn.addEventListener("pointerdown", start);
    downBtn.addEventListener("pointerup", end);
    downBtn.addEventListener("pointercancel", end);
    downBtn.addEventListener("pointerleave", end);
  }

  // 손잡이 (오른손/왼손) 전환 — ▼ 버튼 위치를 좌우로 이동. 기본 오른손.
  const HAND_KEY = "elements_puyo_hand";
  const setHand = (h) => {
    document.body.setAttribute("data-hand", h);
    try { localStorage.setItem(HAND_KEY, h); } catch {}
  };
  let hand = "right";
  try { const v = localStorage.getItem(HAND_KEY); if (v === "left") hand = "left"; } catch {}
  setHand(hand);
  const handBtn = document.getElementById("hand-toggle");
  if (handBtn) handBtn.addEventListener("click", () => {
    setHand(document.body.getAttribute("data-hand") === "left" ? "right" : "left");
  });
  // 헤더의 "새 게임" 아이콘 버튼. 실수 방지를 위해 진행 중 게임에서는 확인 후 리셋.
  const newBtn = document.getElementById("new-game-btn");
  if (newBtn) newBtn.addEventListener("click", () => {
    if (typeof audio !== "undefined") audio.unlock();
    const alive = !player.state.gameOver && player.state.score > 0;
    if (alive && !confirm("현재 게임을 종료하고 새로 시작할까요?")) return;
    onNewGameRequested();
  });
});

// 스토리 인트로 → 게임 시작
stats.load();
stats.render();

const progress = (typeof loadProgress === "function") ? loadProgress() : { seenIntro: true, current: 1 };
currentStage = Math.min(Math.max(1, progress.current || 1), ALCHEMIST_RANKS.length);

function bootGame() {
  measureFieldDims();
  newGame();
  lastTime = performance.now();
  requestAnimationFrame(tick);
}

// 뷰포트 크기 변경 → 셀 크기 재측정 후 모든 볼 재배치. 낙하 중 조각도 같이.
let _resizeRaf = 0;
function _reflowAllBalls() {
  measureFieldDims();
  for (const g of [player, opponent]) {
    if (!g) continue;
    for (const b of g.balls.values()) b.updateDom();
    if (g.state.fallingBall) g.state.fallingBall.updateDom();
  }
}
window.addEventListener("resize", () => {
  cancelAnimationFrame(_resizeRaf);
  _resizeRaf = requestAnimationFrame(_reflowAllBalls);
});
window.addEventListener("orientationchange", () => {
  setTimeout(_reflowAllBalls, 200);
});
// 스토리 인트로 (첫 플레이 시 시공간의 균열 컷씬 → 스테이지 1 컷씬)
if (!progress.seenIntro && typeof showStoryIntro === "function") {
  showStoryIntro(() => {
    progress.seenIntro = true;
    if (typeof saveProgress === "function") saveProgress(progress);
    if (typeof showStageIntro === "function") {
      showStageIntro(0, bootGame);
    } else {
      bootGame();
    }
  });
} else {
  bootGame();
}
