// Elements Puyo — 원소 뿌요
// 자연낙하(Tetris/Puyo 스타일) + 절대위치 볼 렌더링.

"use strict";

// ══════════════════════════════════════════════════════════════════════
// 원소 데이터
// ══════════════════════════════════════════════════════════════════════
const CATEGORY = { METAL: "METAL", NONMETAL: "NONMETAL", METALLOID: "METALLOID", NOBLE: "NOBLE" };

const ELEMENTS = {
  H:  { z: 1,  symbol: "H",  nameKr: "수소",     period: 1, group: 1,  charge: +1, category: CATEGORY.NONMETAL },
  HE: { z: 2,  symbol: "He", nameKr: "헬륨",     period: 1, group: 18, charge:  0, category: CATEGORY.NOBLE    },
  LI: { z: 3,  symbol: "Li", nameKr: "리튬",     period: 2, group: 1,  charge: +1, category: CATEGORY.METAL    },
  BE: { z: 4,  symbol: "Be", nameKr: "베릴륨",   period: 2, group: 2,  charge: +2, category: CATEGORY.METAL    },
  B:  { z: 5,  symbol: "B",  nameKr: "붕소",     period: 2, group: 13, charge: +3, category: CATEGORY.METALLOID},
  C:  { z: 6,  symbol: "C",  nameKr: "탄소",     period: 2, group: 14, charge: -4, category: CATEGORY.NONMETAL },
  N:  { z: 7,  symbol: "N",  nameKr: "질소",     period: 2, group: 15, charge: -3, category: CATEGORY.NONMETAL },
  O:  { z: 8,  symbol: "O",  nameKr: "산소",     period: 2, group: 16, charge: -2, category: CATEGORY.NONMETAL },
  F:  { z: 9,  symbol: "F",  nameKr: "플루오린", period: 2, group: 17, charge: -1, category: CATEGORY.NONMETAL },
  NE: { z: 10, symbol: "Ne", nameKr: "네온",     period: 2, group: 18, charge:  0, category: CATEGORY.NOBLE    },
  NA: { z: 11, symbol: "Na", nameKr: "나트륨",   period: 3, group: 1,  charge: +1, category: CATEGORY.METAL    },
  MG: { z: 12, symbol: "Mg", nameKr: "마그네슘", period: 3, group: 2,  charge: +2, category: CATEGORY.METAL    },
  AL: { z: 13, symbol: "Al", nameKr: "알루미늄", period: 3, group: 13, charge: +3, category: CATEGORY.METAL    },
  SI: { z: 14, symbol: "Si", nameKr: "규소",     period: 3, group: 14, charge: +4, category: CATEGORY.METALLOID},
  P:  { z: 15, symbol: "P",  nameKr: "인",       period: 3, group: 15, charge: -3, category: CATEGORY.NONMETAL },
  S:  { z: 16, symbol: "S",  nameKr: "황",       period: 3, group: 16, charge: -2, category: CATEGORY.NONMETAL },
  CL: { z: 17, symbol: "Cl", nameKr: "염소",     period: 3, group: 17, charge: -1, category: CATEGORY.NONMETAL },
  AR: { z: 18, symbol: "Ar", nameKr: "아르곤",   period: 3, group: 18, charge:  0, category: CATEGORY.NOBLE    },
};
for (const k in ELEMENTS) ELEMENTS[k].key = k;

const ALL_ELEMENTS = Object.values(ELEMENTS);
const BY_SYMBOL = new Map();
for (const e of ALL_ELEMENTS) BY_SYMBOL.set(e.symbol, e);

function isNoble(e) { return e.category === CATEGORY.NOBLE; }

// 화학식 계산 (empirical formula): 원소별 개수 → GCD 로 축약 → 관례적 순서.
//   순서 우선순위: 금속 양이온 → 비금속·메탈로이드 양이온(H, B, Si) → 음이온. 같은 rank 내 원자번호 오름차순.
//   예: NaCl (Na→Cl), MgCl₂ (Mg→Cl), H₂O (H→O), NaHO (Na→H→O), HCl (H→Cl), Al₂O₃ (Al→O).
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
function elementRank(e) {
  if (e.category === CATEGORY.METAL) return 0;
  if (e.charge > 0) return 1;   // H, B(+3), Si(+4) 등 비금속/메탈로이드 양이온
  return 2;                     // 음이온
}
function computeFormula(cellEls) {
  const counts = new Map();
  for (const c of cellEls) counts.set(c.e.symbol, (counts.get(c.e.symbol) || 0) + 1);
  const values = [...counts.values()];
  const g = values.reduce((a, b) => gcd(a, b));
  const symbols = [...counts.keys()];
  symbols.sort((a, b) => {
    const ea = BY_SYMBOL.get(a), eb = BY_SYMBOL.get(b);
    const rA = elementRank(ea), rB = elementRank(eb);
    if (rA !== rB) return rA - rB;
    return ea.z - eb.z;
  });
  return symbols.map(s => {
    const n = counts.get(s) / g;
    return n === 1 ? s : `${s}<sub>${n}</sub>`;
  }).join("");
}

// HTML 라벨: sup 태그 사용 (심볼 우상단에 확실히 뜨도록 CSS 에서 위쪽으로 이동).
function labelHTML(e) {
  if (e.charge === 0) return e.symbol;
  const abs = Math.abs(e.charge);
  const sign = e.charge > 0 ? "+" : "−";
  const supText = abs === 1 ? sign : `${abs}${sign}`;
  return `${e.symbol}<sup>${supText}</sup>`;
}

// ══════════════════════════════════════════════════════════════════════
// 렌더 상수 (CSS 와 동기화 필요)
// ══════════════════════════════════════════════════════════════════════
const CELL = 56, GAP = 8, PAD = 10;
const CELL_STEP = CELL + GAP;
const WIDTH = 8, HEIGHT = 12;

function ballPx(gridX, y) {
  return {
    x: PAD + gridX * CELL_STEP,
    y: PAD + (HEIGHT - 1 - y) * CELL_STEP,
  };
}

// ══════════════════════════════════════════════════════════════════════
// Ball
// ══════════════════════════════════════════════════════════════════════
let nextBallId = 0;
class Ball {
  constructor(element, gridX, y) {
    this.id = ++nextBallId;
    this.element = element;
    this.gridX = gridX;
    this.y = y;           // float, 0 = 바닥, HEIGHT-1 = 최상단 field row, HEIGHT+ = above field(클리핑)
    this.locked = false;
    this.dom = null;
    this._createDom();
    this.dom.classList.add("falling");   // 자연낙하 중엔 CSS transition 없음 (매 프레임 JS 갱신)
    this.updateDom();
  }
  _createDom() {
    const el = document.createElement("div");
    el.className = `ball p${this.element.period}`;
    if (this.element.category === CATEGORY.METAL) el.classList.add("metal");
    if (isNoble(this.element)) {
      el.classList.add("noble");
      // 기체 파티클 레이어 + 라벨
      el.innerHTML = `
        <div class="gas-layer"></div>
        <div class="gas-particles">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
        <span class="label">${this.element.symbol}</span>`;
    } else {
      el.innerHTML = labelHTML(this.element);
    }
    fieldEl.appendChild(el);
    this.dom = el;
  }
  updateDom() {
    const p = ballPx(this.gridX, this.y);
    // CSS 변수로 저장 → 소거 애니메이션 시 위치 유지 가능
    this.dom.style.setProperty("--px", p.x + "px");
    this.dom.style.setProperty("--py", p.y + "px");
    this.dom.style.transform = `translate(${p.x}px, ${p.y}px)`;
  }
  setFallMode(mode) {
    this.dom.classList.remove("falling", "gravity");
    if (mode) this.dom.classList.add(mode);
  }
  markClearing() { this.dom.classList.add("clearing"); }
  destroy() { if (this.dom && this.dom.parentNode) this.dom.parentNode.removeChild(this.dom); this.dom = null; }
}

// ══════════════════════════════════════════════════════════════════════
// Field (ball id 저장)
// ══════════════════════════════════════════════════════════════════════
let field;
const balls = new Map();   // id -> Ball

function createField() {
  const f = new Array(WIDTH);
  for (let x = 0; x < WIDTH; x++) f[x] = new Array(HEIGHT).fill(null);
  return f;
}
function columnHeight(f, x) {
  for (let y = HEIGHT - 1; y >= 0; y--) if (f[x][y] !== null) return y + 1;
  return 0;
}
function isColumnFull(f, x) { return columnHeight(f, x) >= HEIGHT; }

function fieldOfElements() {
  const ef = createField();
  for (let x = 0; x < WIDTH; x++) for (let y = 0; y < HEIGHT; y++) {
    const bid = field[x][y];
    if (bid !== null) {
      const b = balls.get(bid);
      ef[x][y] = b ? b.element : null;
    }
  }
  return ef;
}

function applyGravityToField(f) {
  const moves = [];
  for (let x = 0; x < WIDTH; x++) {
    let writeY = 0;
    for (let y = 0; y < HEIGHT; y++) {
      const bid = f[x][y];
      if (bid === null) continue;
      if (writeY !== y) {
        f[x][writeY] = bid;
        f[x][y] = null;
        moves.push({ ballId: bid, x, fromY: y, toY: writeY });
      }
      writeY++;
    }
  }
  return moves;
}

// ══════════════════════════════════════════════════════════════════════
// Matcher — 3규칙 (Kotlin 로직 그대로)
// ══════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════
// 실제 존재하는 화합물 화이트리스트 (수동 큐레이션)
// ══════════════════════════════════════════════════════════════════════
// 우리 단순 이온 모델(고정 산화수) 로 전하 균형이 맞고 **실제 존재**하는 화합물만.
// 키: 원소 심볼 알파벳순 + empirical 개수. 예: "Cl1Na1" = NaCl, "H2Mg1O2" = Mg(OH)₂.
const KNOWN_COMPOUNDS = new Set([
  // ── 알칼리 금속 (Li, Na) ─────────────────────────────
  "F1Li1",   // LiF
  "Cl1Li1",  // LiCl
  "Li2O1",   // Li₂O
  "Li2S1",   // Li₂S
  "Li3N1",   // Li₃N
  "Li3P1",   // Li₃P
  "H1Li1",   // LiH
  "F1Na1",   // NaF
  "Cl1Na1",  // NaCl
  "Na2O1",   // Na₂O
  "Na2S1",   // Na₂S
  "Na3P1",   // Na₃P
  "H1Na1",   // NaH
  // ── 알칼리 토금속 (Be, Mg) ──────────────────────────
  "Be1F2",   // BeF₂
  "Be1Cl2",  // BeCl₂
  "Be1O1",   // BeO
  "Be1S1",   // BeS
  "Be3N2",   // Be₃N₂
  "Be3P2",   // Be₃P₂
  "Be2C1",   // Be₂C
  "F2Mg1",   // MgF₂
  "Cl2Mg1",  // MgCl₂
  "Mg1O1",   // MgO
  "Mg1S1",   // MgS
  "Mg3N2",   // Mg₃N₂
  "Mg3P2",   // Mg₃P₂
  "H2Mg1",   // MgH₂
  // ── 알루미늄 ────────────────────────────────────────
  "Al1F3",   // AlF₃
  "Al1Cl3",  // AlCl₃
  "Al2O3",   // Al₂O₃
  "Al2S3",   // Al₂S₃
  "Al1N1",   // AlN
  "Al1P1",   // AlP
  "Al4C3",   // Al₄C₃ (aluminum carbide)
  // ── 붕소 ────────────────────────────────────────────
  "B1F3",    // BF₃
  "B1Cl3",   // BCl₃
  "B2O3",    // B₂O₃
  "B2S3",    // B₂S₃
  "B1N1",    // BN
  "B1P1",    // BP
  // ── 규소 ────────────────────────────────────────────
  "C1Si1",   // SiC (탄화규소)
  "F4Si1",   // SiF₄
  "Cl4Si1",  // SiCl₄
  "O2Si1",   // SiO₂ (석영)
  "S2Si1",   // SiS₂
  "N4Si3",   // Si₃N₄
  // ── 수소 화합물 ─────────────────────────────────────
  "F1H1",    // HF
  "Cl1H1",   // HCl
  "H2O1",    // H₂O
  "H2S1",    // H₂S
  "H3N1",    // NH₃ (암모니아)
  "H3P1",    // PH₃ (포스핀)
  "C1H4",    // CH₄ (메탄)
  // ── 삼원 이상 (수산화물·아미드·하이드로설파이드) ──
  "H1Li1O1", // LiOH
  "H1Na1O1", // NaOH
  "Be1H2O2", // Be(OH)₂
  "H2Mg1O2", // Mg(OH)₂
  "Al1H3O3", // Al(OH)₃
  "H2Li1N1", // LiNH₂
  "H2N1Na1", // NaNH₂
  "H1Li1S1", // LiHS
  "H1Na1S1", // NaHS
]);

// canonical key → 한글명 매핑 (학습용)
const COMPOUND_NAMES_KR = {
  // 알칼리 금속
  "F1Li1": "플루오린화 리튬", "Cl1Li1": "염화 리튬",
  "Li2O1": "산화 리튬", "Li2S1": "황화 리튬",
  "Li3N1": "질화 리튬", "Li3P1": "인화 리튬", "H1Li1": "수소화 리튬",
  "F1Na1": "플루오린화 나트륨", "Cl1Na1": "염화 나트륨(소금)",
  "Na2O1": "산화 나트륨", "Na2S1": "황화 나트륨",
  "Na3P1": "인화 나트륨", "H1Na1": "수소화 나트륨",
  // 알칼리 토금속
  "Be1F2": "플루오린화 베릴륨", "Be1Cl2": "염화 베릴륨",
  "Be1O1": "산화 베릴륨", "Be1S1": "황화 베릴륨",
  "Be3N2": "질화 베릴륨", "Be3P2": "인화 베릴륨", "Be2C1": "탄화 베릴륨",
  "F2Mg1": "플루오린화 마그네슘", "Cl2Mg1": "염화 마그네슘",
  "Mg1O1": "산화 마그네슘", "Mg1S1": "황화 마그네슘",
  "Mg3N2": "질화 마그네슘", "Mg3P2": "인화 마그네슘", "H2Mg1": "수소화 마그네슘",
  // 알루미늄
  "Al1F3": "플루오린화 알루미늄", "Al1Cl3": "염화 알루미늄",
  "Al2O3": "산화 알루미늄(알루미나)", "Al2S3": "황화 알루미늄",
  "Al1N1": "질화 알루미늄", "Al1P1": "인화 알루미늄", "Al4C3": "탄화 알루미늄",
  // 붕소
  "B1F3": "삼플루오린화 붕소", "B1Cl3": "삼염화 붕소",
  "B2O3": "산화 붕소", "B2S3": "황화 붕소",
  "B1N1": "질화 붕소", "B1P1": "인화 붕소",
  // 규소
  "C1Si1": "탄화 규소", "F4Si1": "사플루오린화 규소", "Cl4Si1": "사염화 규소",
  "O2Si1": "이산화 규소(실리카)", "S2Si1": "이황화 규소", "N4Si3": "질화 규소",
  // 수소 화합물
  "F1H1": "플루오린화 수소(불산)", "Cl1H1": "염화 수소(염산)",
  "H2O1": "물", "H2S1": "황화 수소",
  "H3N1": "암모니아", "H3P1": "포스핀", "C1H4": "메탄",
  // 삼원 이상
  "H1Li1O1": "수산화 리튬", "H1Na1O1": "수산화 나트륨(가성소다)",
  "Be1H2O2": "수산화 베릴륨", "H2Mg1O2": "수산화 마그네슘", "Al1H3O3": "수산화 알루미늄",
  "H2Li1N1": "리튬 아미드", "H2N1Na1": "소듐 아미드",
  "H1Li1S1": "리튬 하이드로설파이드", "H1Na1S1": "소듐 하이드로설파이드",
};

// 이원자 기체 한글명
const DIATOMIC_NAMES_KR = {
  "H": "수소 기체", "N": "질소 기체", "O": "산소 기체",
  "F": "플루오린 기체", "CL": "염소 기체",
};

// 셀 리스트로부터 canonical key 계산 (알파벳순 심볼 + empirical 개수)
function canonicalCompoundKey(cellEls) {
  const counts = new Map();
  for (const c of cellEls) counts.set(c.e.symbol, (counts.get(c.e.symbol) || 0) + 1);
  const values = [...counts.values()];
  const g = values.reduce((a, b) => gcd(a, b));
  const keys = [...counts.keys()].sort();
  return keys.map(k => `${k}${counts.get(k) / g}`).join("");
}

// 규칙 1: 상하좌우로 연결된 부분집합 중 **화이트리스트에 있는 실제 화합물** 이면 소거.
//   원자가 겹치는 서브셋이 여러 개면 **가장 큰(=점수 높은) 조합만 선택** — 나머지 무시.
//   예: Cl-H-F 인접 시 HCl 과 HF 둘 다 유효하지만 하나만 (더 큰 쪽·크기 같으면 위치 가산점 높은 쪽) 골라 소거.
//   반환값: { cells: Set<cid>, subsets: [{cellIds, formula, nameKr, key, size, value}] }
const MOLECULE_MAX_SUBSET = 8;
function findMolecules(f) {
  const allSubsets = [];   // 모든 유효 서브셋 후보
  const seenSubsets = new Set();
  const cid = (x, y) => x * HEIGHT + y;

  function neighborsOf(x, y) {
    const out = [];
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || nx >= WIDTH || ny < 0 || ny >= HEIGHT) continue;
      const e = f[nx][ny];
      if (!e || isNoble(e)) continue;
      out.push(cid(nx, ny));
    }
    return out;
  }

  function extend(subsetIds, cellEls, frontier, startCid) {
    if (subsetIds.length >= 2) {
      let sum = 0, cat = false, an = false;
      const distinct = new Set();
      for (const c of cellEls) {
        sum += c.e.charge; distinct.add(c.e.key);
        if (c.e.charge > 0) cat = true;
        if (c.e.charge < 0) an = true;
      }
      if (sum === 0 && distinct.size >= 2 && cat && an) {
        const key = canonicalCompoundKey(cellEls);
        if (KNOWN_COMPOUNDS.has(key)) {
          // value: 크기 우선(=cell 수 × 100), 위치 가산점 보조
          let posBonus = 0;
          for (const c of cellEls) posBonus += c.e.period * 3 + c.e.group;
          allSubsets.push({
            cellIds: new Set(subsetIds),
            formula: computeFormula(cellEls),
            nameKr: COMPOUND_NAMES_KR[key] || "",
            key,
            size: cellEls.length,
            value: cellEls.length * 100 + posBonus,
          });
        }
      }
    }
    if (subsetIds.length >= MOLECULE_MAX_SUBSET) return;
    for (let i = 0; i < frontier.length; i++) {
      const next = frontier[i];
      if (next < startCid) continue;
      const nx = Math.floor(next / HEIGHT), ny = next % HEIGHT;
      const ne = f[nx][ny];
      const newIds = [...subsetIds, next].sort((a, b) => a - b);
      const key = newIds.join(",");
      if (seenSubsets.has(key)) continue;
      seenSubsets.add(key);
      const nextFrontier = frontier.slice(i + 1).filter(c => !newIds.includes(c));
      for (const nb of neighborsOf(nx, ny)) {
        if (newIds.includes(nb)) continue;
        if (!nextFrontier.includes(nb)) nextFrontier.push(nb);
      }
      extend(newIds, [...cellEls, { x: nx, y: ny, e: ne }], nextFrontier, startCid);
    }
  }

  for (let x = 0; x < WIDTH; x++) for (let y = 0; y < HEIGHT; y++) {
    const e = f[x][y];
    if (!e || isNoble(e)) continue;
    const startCid = cid(x, y);
    seenSubsets.add(String(startCid));
    const frontier = neighborsOf(x, y).filter(c => c > startCid);
    extend([startCid], [{ x, y, e }], frontier, startCid);
  }

  // 그리디 선택: value 높은 순 → 겹치지 않는 서브셋만 채택
  allSubsets.sort((a, b) => b.value - a.value || a.key.localeCompare(b.key));
  const claimedCells = new Set();
  const selected = [];
  const seenKeys = new Set();   // 같은 화합물 여러 번 나오면 표시는 한 번만
  for (const s of allSubsets) {
    let overlap = false;
    for (const cid of s.cellIds) if (claimedCells.has(cid)) { overlap = true; break; }
    if (overlap) continue;
    for (const cid of s.cellIds) claimedCells.add(cid);
    if (!seenKeys.has(s.key)) {
      seenKeys.add(s.key);
      selected.push(s);
    }
  }
  return { cells: claimedCells, subsets: selected };
}
function findPeriodRuns(f) {
  const result = new Set();
  for (let y = 0; y < HEIGHT; y++) {
    for (let start = 0; start < WIDTH; start++) {
      const seen = new Set(); let period = null, end = start;
      while (end < WIDTH) {
        const e = f[end][y];
        if (!e) break;
        if (period === null) period = e.period;
        else if (period !== e.period) break;
        if (seen.has(e.key)) break;
        seen.add(e.key); end++;
      }
      if (seen.size >= 3) for (let x = start; x < end; x++) result.add(x * HEIGHT + y);
    }
  }
  return result;
}
function findGroupRuns(f) {
  const result = new Set();
  for (let x = 0; x < WIDTH; x++) {
    for (let start = 0; start < HEIGHT; start++) {
      const seen = new Set(); let group = null, end = start;
      while (end < HEIGHT) {
        const e = f[x][end];
        if (!e) break;
        if (group === null) group = e.group;
        else if (group !== e.group) break;
        if (seen.has(e.key)) break;
        seen.add(e.key); end++;
      }
      if (seen.size >= 3) for (let y = start; y < end; y++) result.add(x * HEIGHT + y);
    }
  }
  return result;
}
// 규칙 5 (이원자 기체): 같은 원소(H, N, O, F, Cl) 2개 이상 상하좌우 연결 → 소거.
//   `excluded` 에 든 셀은 존재하지 않는 것처럼 취급 (규칙 1 분자에 이미 쓰인 셀 제외용).
//   이렇게 하면 CH₄ 처럼 큰 분자가 있으면 그 안의 H 들은 H₂ 로 소진되지 않음.
const DIATOMIC_KEYS = new Set(["H", "N", "O", "F", "CL"]);
function findDiatomics(f, excluded = null) {
  const result = new Set();
  const visited = Array.from({ length: WIDTH }, () => new Array(HEIGHT).fill(false));
  const isExcluded = (x, y) => excluded && excluded.has(x * HEIGHT + y);
  for (let x = 0; x < WIDTH; x++) for (let y = 0; y < HEIGHT; y++) {
    if (visited[x][y]) continue;
    const e = f[x][y];
    if (!e || !DIATOMIC_KEYS.has(e.key) || isExcluded(x, y)) { visited[x][y] = true; continue; }
    const comp = [];
    const stack = [{ x, y }];
    while (stack.length) {
      const p = stack.pop();
      if (p.x < 0 || p.x >= WIDTH || p.y < 0 || p.y >= HEIGHT) continue;
      if (visited[p.x][p.y]) continue;
      if (isExcluded(p.x, p.y)) continue;
      const ce = f[p.x][p.y];
      if (!ce || ce.key !== e.key) continue;
      visited[p.x][p.y] = true;
      comp.push({ x: p.x, y: p.y, key: e.key });
      stack.push({ x: p.x + 1, y: p.y }); stack.push({ x: p.x - 1, y: p.y });
      stack.push({ x: p.x, y: p.y + 1 }); stack.push({ x: p.x, y: p.y - 1 });
    }
    if (comp.length >= 2) {
      for (const c of comp) result.add(c.x * HEIGHT + c.y);
    }
  }
  return result;
}

// 규칙 4 (금속 결합): 상하좌우로 연결된 금속 원소(Li, Be, Na, Mg, Al) 4개 이상이면 소거.
//   같은 금속이든 다른 금속이든 상관 없음 — 실제 금속 결합은 자유전자 바다에서 임의 조합 가능.
function findMetalClusters(f) {
  const result = new Set();
  const visited = Array.from({ length: WIDTH }, () => new Array(HEIGHT).fill(false));
  for (let x = 0; x < WIDTH; x++) for (let y = 0; y < HEIGHT; y++) {
    if (visited[x][y]) continue;
    const e = f[x][y];
    if (!e || e.category !== CATEGORY.METAL) { visited[x][y] = true; continue; }
    const comp = [];
    const stack = [{ x, y }];
    while (stack.length) {
      const p = stack.pop();
      if (p.x < 0 || p.x >= WIDTH || p.y < 0 || p.y >= HEIGHT) continue;
      if (visited[p.x][p.y]) continue;
      const ce = f[p.x][p.y];
      if (!ce || ce.category !== CATEGORY.METAL) continue;
      visited[p.x][p.y] = true;
      comp.push({ x: p.x, y: p.y });
      stack.push({ x: p.x + 1, y: p.y });
      stack.push({ x: p.x - 1, y: p.y });
      stack.push({ x: p.x, y: p.y + 1 });
      stack.push({ x: p.x, y: p.y - 1 });
    }
    if (comp.length >= 4) {
      for (const c of comp) result.add(c.x * HEIGHT + c.y);
    }
  }
  return result;
}

function findAllMatches(f) {
  const s = new Set();
  for (const p of findMolecules(f)) s.add(p);
  for (const p of findPeriodRuns(f)) s.add(p);
  for (const p of findGroupRuns(f)) s.add(p);
  for (const p of findMetalClusters(f)) s.add(p);
  for (const p of findDiatomics(f)) s.add(p);
  return s;
}
function decodePositions(encoded) {
  const out = [];
  for (const enc of encoded) out.push({ x: Math.floor(enc / HEIGHT), y: enc % HEIGHT });
  return out;
}

// ══════════════════════════════════════════════════════════════════════
// 조각 생성 + 스폰 위치 (단일 이온)
// ══════════════════════════════════════════════════════════════════════
const SPAWN_COL = 3;             // 4열 (0-indexed 3) — 가운데
const FALL_SPEED_BASE = 0.8;     // Lv 1 낙하 속도
const FALL_SPEED_PER_LEVEL = 0.28; // 레벨당 증가
const FALL_SPEED_MAX = 6.0;      // 상한
const FALL_SPEED_SOFT = 30;      // soft drop 고정
const SCORE_PER_LEVEL = 400;     // 이 점수마다 레벨업

// 연금술사 랭크 — 영어 이름(주) + 한글(부제) + 대표 업적 상징 엠블럼(portraits.js)
const ALCHEMIST_RANKS = [
  { name: "Zosimos",           nameKr: "조시모스",           era: "3–4c Egypt",
    desc: "그리스-이집트 연금술사. 현존하는 가장 오래된 연금술 저서를 남김. 증류기(alembic) 등 실험기구 사용을 체계화. 물질의 변환·정제 개념의 시조." },
  { name: "Jabir ibn Hayyan",  nameKr: "자비르 이븐 하이얀", era: "8c Persia",
    desc: "\"화학의 아버지\". 왕수(질산+염산) 발견. 실험 방법·기록·재현 개념을 세워 연금술을 과학으로 진화시킴." },
  { name: "Paracelsus",        nameKr: "파라켈수스",         era: "16c Switzerland",
    desc: "의화학(iatrochemistry) 창시자. 광물성 약제를 의학에 도입. \"용량이 독을 만든다\" — 최초의 독성학 개념." },
  { name: "Robert Boyle",      nameKr: "로버트 보일",        era: "17c Ireland",
    desc: "《회의적 화학자》. 원소·화합물·혼합물을 근대적 의미로 정의. **보일의 법칙**(P∝1/V) 발견." },
  { name: "Antoine Lavoisier", nameKr: "앙투안 라부아지에",  era: "18c France",
    desc: "\"근대 화학의 아버지\". **질량 보존 법칙** 확립. 산소·수소 명명, 연소=산소 결합 증명(플로지스톤설 폐기)." },
  { name: "John Dalton",       nameKr: "존 돌턴",            era: "Early 19c Britain",
    desc: "근대 **원자설** 창시. 각 원소는 고유 질량의 원자로 이루어지며, 화합물은 정수비의 원자 결합." },
  { name: "Amedeo Avogadro",   nameKr: "아메데오 아보가드로",era: "Early 19c Italy",
    desc: "**아보가드로의 법칙**: 같은 온도·압력의 모든 기체는 같은 부피 안에 같은 수의 입자. 원자·분자 구분 정립." },
  { name: "Dmitri Mendeleev",  nameKr: "드미트리 멘델레예프",era: "Late 19c Russia",
    desc: "**주기율표**(1869) 최초 정립. 갈륨·게르마늄 등 미발견 원소의 성질을 미리 예측해 정확히 맞춤." },
  { name: "Marie Curie",       nameKr: "마리 퀴리",          era: "19–20c Poland·France",
    desc: "폴로늄·라듐 발견. 방사성(radioactivity) 개념 최초 사용. 여성 최초 노벨상(물리 1903·화학 1911)." },
  { name: "Ernest Rutherford", nameKr: "어니스트 러더퍼드",  era: "Early 20c NZ·UK",
    desc: "**금박 산란 실험**으로 원자핵 발견. \"핵물리학의 아버지\". 알파·베타선 명명. 노벨화학상(1908)." },
  { name: "Niels Bohr",        nameKr: "닐스 보어",          era: "Early 20c Denmark",
    desc: "**보어 원자모형**: 전자가 특정 에너지 궤도에만 존재. 궤도 이동 시 광자 방출·흡수. 노벨물리학상(1922)." },
  { name: "Linus Pauling",     nameKr: "라이너스 폴링",      era: "20c USA",
    desc: "**전기음성도** 도입, 화학결합의 양자역학적 이해. α-헬릭스 규명. 노벨화학상(1954)·평화상(1962)." },
];

// 화학자 삽화 HTML (로컬 SVG 엠블럼 — 항상 렌더링됨)
function chemistPortraitHtml(rankIndex, size = 40) {
  const svgMarkup = emblemSvg(rankIndex);
  return `<div class="chemist-portrait" style="width:${size}px;height:${size}px">${svgMarkup}</div>`;
}

function currentLevel() { return 1 + Math.floor(state.score / SCORE_PER_LEVEL); }
function rankInfo(level) { return ALCHEMIST_RANKS[Math.min(level - 1, ALCHEMIST_RANKS.length - 1)]; }
function currentFallSpeed() {
  const lv = currentLevel();
  return Math.min(FALL_SPEED_MAX, FALL_SPEED_BASE + (lv - 1) * FALL_SPEED_PER_LEVEL);
}

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// 한 번에 원소(이온) 하나만 나옴.
function generatePiece() {
  return { element: pickRandom(ALL_ELEMENTS) };
}

function isSpawnBlocked() {
  // 스폰 열 최상단이 이미 차 있으면 게임 오버
  return field[SPAWN_COL][HEIGHT - 1] !== null;
}

// ══════════════════════════════════════════════════════════════════════
// 게임 상태 & 낙하 루프
// ══════════════════════════════════════════════════════════════════════
const state = {
  currentPiece: null,      // { element }
  nextPiece: null,
  fallingBall: null,       // Ball | null
  isResolving: false,
  gameOver: false,
  score: 0,
  level: 1,                // 현재 레벨 (score 기반)
  lastChain: 0,
  softDrop: false,
};

function spawnPiece() {
  const el = state.currentPiece.element;
  const b = new Ball(el, SPAWN_COL, HEIGHT - 1);
  balls.set(b.id, b);
  state.fallingBall = b;
}

let lastTime = performance.now();
function tick(t) {
  const dt = Math.min(50, t - lastTime) / 1000;
  lastTime = t;
  if (!state.gameOver && !state.isResolving) updateFalling(dt);
  requestAnimationFrame(tick);
}

function updateFalling(dt) {
  const ball = state.fallingBall;
  if (!ball) return;
  const speed = state.softDrop ? FALL_SPEED_SOFT : currentFallSpeed();
  const dy = speed * dt;
  const floor = columnHeight(field, ball.gridX);
  const newY = ball.y - dy;
  if (newY <= floor) {
    ball.y = floor;
    ball.locked = true;
    if (floor < HEIGHT) field[ball.gridX][floor] = ball.id;
    ball.updateDom();
    state.fallingBall = null;
    onPieceLanded();
  } else {
    ball.y = newY;
    ball.updateDom();
  }
}

async function onPieceLanded() {
  state.isResolving = true;
  audio.playLand();
  await sleep(80);
  await resolveMatches();
  advanceToNextPiece();
}

async function resolveMatches() {
  let chain = 0;
  while (true) {
    const f = fieldOfElements();
    // 규칙별로 따로 검사 → 어느 규칙이 발동했는지 알기 위함
    const molResult = findMolecules(f);   // { cells, subsets }
    const mol   = molResult.cells;
    const per   = findPeriodRuns(f);
    const grp   = findGroupRuns(f);
    const met   = findMetalClusters(f);
    // 규칙 1(분자) 우선 — 그 셀들을 뺀 뒤 규칙 5(이원자) 검사.
    const dia   = findDiatomics(f, mol);
    const all   = new Set([...mol, ...per, ...grp, ...met, ...dia]);
    if (all.size === 0) break;
    chain++;
    const positions = decodePositions(all);

    // 발동 규칙 + 분자식 수집
    const fired = [];
    if (mol.size > 0) fired.push({ cls: "molecule", label: "분자", formulas: molResult.subsets });
    if (dia.size > 0) fired.push({ cls: "diatomic", label: "이원자", formulas: diatomicFormulas(dia, f) });
    if (per.size > 0) fired.push({ cls: "period", label: "주기 가로" });
    if (grp.size > 0) fired.push({ cls: "group",  label: "족 세로"  });
    if (met.size > 0) fired.push({ cls: "metal",  label: "금속 결합" });
    // 이번 스텝에서 몇 개 규칙이 동시 발동했는지
    const simul = fired.length;
    if (simul > stats.maxSimul) stats.maxSimul = simul;
    if (simul >= 2) stats.totalSimul2Plus++;
    if (chain > stats.maxChain) stats.maxChain = chain;

    showRuleBanner(chain, fired, simul);
    // 규칙별 SFX (가장 특이한 규칙 하나만 재생 — 매치 화면과 동일 우선순위)
    const primary = met.size > 0 ? "metal"
                  : dia.size > 0 ? "diatomic"
                  : grp.size > 0 ? "group"
                  : per.size > 0 ? "period"
                  : "molecule";
    audio.playClear(primary, chain);
    if (chain >= 2) audio.playChain(chain);
    saveStats();
    renderStats();

    // 볼별로 어떤 규칙에 걸렸는지 하이라이트 클래스 부여 (우선순위: 특이한 규칙 우선)
    for (const p of positions) {
      const bid = field[p.x][p.y];
      if (bid === null) continue;
      const b = balls.get(bid);
      if (!b) continue;
      const enc = p.x * HEIGHT + p.y;
      if (met.has(enc))      b.dom.classList.add("match-metal");
      else if (dia.has(enc)) b.dom.classList.add("match-diatomic");
      else if (grp.has(enc)) b.dom.classList.add("match-group");
      else if (per.has(enc)) b.dom.classList.add("match-period");
      else if (mol.has(enc)) b.dom.classList.add("match-molecule");
    }
    await sleep(280);   // 하이라이트 잠깐 보여주기

    // 이어서 clearing 애니메이션
    for (const p of positions) {
      const bid = field[p.x][p.y];
      if (bid !== null) balls.get(bid)?.markClearing();
    }
    await sleep(320);

    for (const p of positions) {
      const bid = field[p.x][p.y];
      if (bid !== null) {
        const b = balls.get(bid);
        // 파티클 스파클 (볼의 period 색상 기반)
        if (b) {
          const px = ballPx(p.x, p.y);
          const cx = px.x + CELL / 2, cy = px.y + CELL / 2;
          spawnParticles(cx, cy, periodColor(b.element.period));
        }
        b?.destroy();
        balls.delete(bid);
        field[p.x][p.y] = null;
      }
    }

    const moves = applyGravityToField(field);
    for (const m of moves) {
      const b = balls.get(m.ballId);
      if (b) { b.setFallMode("gravity"); b.y = m.toY; b.updateDom(); }
    }
    if (moves.length > 0) await sleep(300);

    // 점수: (소거수 × 연쇄단수 × 동시규칙수 × 10) + 위치 가산점(주기·족 순서)
    let positionalBonus = 0;
    for (const p of positions) {
      const e = f[p.x][p.y];
      if (e) positionalBonus += e.period * 3 + e.group;
    }
    const baseScore = all.size * chain * simul * 10;
    const gained = baseScore + positionalBonus;
    state.score += gained;
    // 시간순 이벤트 로그에 추가
    pushEvent(chain, simul, fired, gained);
    // 점수 팝업 (소거 셀 무게중심에 표시)
    showScorePopup(gained, positions, chain >= 2 || simul >= 2);
    // 레벨업 확인
    const newLv = currentLevel();
    if (newLv > state.level) {
      state.level = newLv;
      showLevelUp(newLv);
      audio.switchBgm(newLv);
    }
    updateSideUI();
  }
  state.lastChain = chain;
  if (chain >= 2) stats.totalChains2Plus++;
  saveStats();
  updateSideUI();
  renderStats();
  setTimeout(hideRuleBanner, 1200);
}

// ══════════════════════════════════════════════════════════════════════
// 규칙 배너 UI + 분자식 계산 도우미
// ══════════════════════════════════════════════════════════════════════
const bannerEl = document.getElementById("rule-banner");
function showRuleBanner(chain, firedList, simul) {
  bannerEl.innerHTML = "";
  const badges = [];
  if (chain > 1) badges.push(`<span class="chain-tag combo-tag">연쇄 ${chain}단</span>`);
  else badges.push(`<span class="chain-tag">소거</span>`);
  if (simul >= 2) badges.push(`<span class="chain-tag simul-tag">동시 ${simul}종</span>`);
  bannerEl.innerHTML = badges.join("");
  for (const f of firedList) {
    const tag = document.createElement("span");
    tag.className = `rule-tag ${f.cls}`;
    if (f.formulas && f.formulas.length > 0) {
      const html = f.formulas.map(it =>
        `<span class="formula">${it.formula}</span>` +
        (it.nameKr ? ` <span class="name-kr">${it.nameKr}</span>` : "")
      ).join(" · ");
      tag.innerHTML = `${f.label}: ${html}`;
    } else {
      tag.textContent = f.label;
    }
    bannerEl.appendChild(tag);
  }
  bannerEl.classList.add("show");
}
function hideRuleBanner() { bannerEl.classList.remove("show"); }

// 규칙 1 로 소거된 셀들을 연결 컴포넌트로 묶어 각 { formula, nameKr } 산출
function molFormulasFromCleared(clearedSet, f) {
  const items = [];
  const visited = new Set();
  for (const enc of clearedSet) {
    if (visited.has(enc)) continue;
    const comp = [];
    const stack = [enc];
    while (stack.length) {
      const cur = stack.pop();
      if (visited.has(cur)) continue;
      if (!clearedSet.has(cur)) continue;
      visited.add(cur);
      const x = Math.floor(cur / HEIGHT), y = cur % HEIGHT;
      const e = f[x][y];
      if (!e) continue;
      comp.push({ x, y, e });
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || nx >= WIDTH || ny < 0 || ny >= HEIGHT) continue;
        stack.push(nx * HEIGHT + ny);
      }
    }
    if (comp.length >= 2) {
      const key = canonicalCompoundKey(comp);
      items.push({ formula: computeFormula(comp), nameKr: COMPOUND_NAMES_KR[key] || "" });
    }
  }
  return items;
}

// 규칙 5 로 소거된 이원자 원소별로 { formula, nameKr } 산출
function diatomicFormulas(clearedSet, f) {
  const items = [];
  const visited = new Set();
  for (const enc of clearedSet) {
    if (visited.has(enc)) continue;
    const x = Math.floor(enc / HEIGHT), y = enc % HEIGHT;
    const e = f[x][y];
    if (!e) continue;
    const stack = [enc];
    let count = 0;
    while (stack.length) {
      const cur = stack.pop();
      if (visited.has(cur)) continue;
      if (!clearedSet.has(cur)) continue;
      const cx = Math.floor(cur / HEIGHT), cy = cur % HEIGHT;
      const ce = f[cx][cy];
      if (!ce || ce.key !== e.key) continue;
      visited.add(cur);
      count++;
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || nx >= WIDTH || ny < 0 || ny >= HEIGHT) continue;
        stack.push(nx * HEIGHT + ny);
      }
    }
    if (count >= 2) {
      items.push({ formula: `${e.symbol}<sub>2</sub>`, nameKr: DIATOMIC_NAMES_KR[e.key] || "" });
    }
  }
  return items;
}

function advanceToNextPiece() {
  state.currentPiece = state.nextPiece;
  state.nextPiece = generatePiece();
  if (isSpawnBlocked()) {
    state.gameOver = true;
    state.isResolving = false;
    // 게임 종료 → 통계 갱신
    stats.gamesPlayed++;
    if (state.score > stats.bestScore) stats.bestScore = state.score;
    saveStats();
    renderStats();
    showOverlay("게임 오버");
    audio.playGameOver();
    audio.stopBgm();
    return;
  }
  spawnPiece();
  state.isResolving = false;
  updateSideUI();
}

// ══════════════════════════════════════════════════════════════════════
// 입력
// ══════════════════════════════════════════════════════════════════════
document.addEventListener("keydown", (e) => {
  // 첫 유저 입력에서 AudioContext 깨우기 (브라우저 자동재생 정책)
  audio.unlock();
  if (e.key === "ArrowLeft")  { tryMove(-1); e.preventDefault(); return; }
  if (e.key === "ArrowRight") { tryMove(+1); e.preventDefault(); return; }
  if (e.key === "ArrowDown")  { state.softDrop = true; e.preventDefault(); return; }
  if (e.key === "n" || e.key === "N") { newGame(); e.preventDefault(); return; }
  if (e.key === "m" || e.key === "M") { const on = !audio.toggleMuteAll(); updateMuteUI(); e.preventDefault(); return; }
  if (e.key === "b" || e.key === "B") { audio.toggleMuteBgm(); updateMuteUI(); e.preventDefault(); return; }
});
document.addEventListener("click", () => audio.unlock(), { once: false });
document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowDown") state.softDrop = false;
});

// 낙하 중 좌우 이동. 목표 열이 비어 있으면 이동, 아니면 무시.
function tryMove(delta) {
  if (state.gameOver || state.isResolving) return;
  const ball = state.fallingBall;
  if (!ball || ball.locked) return;
  const newX = ball.gridX + delta;
  if (newX < 0 || newX >= WIDTH) return;
  // 목표 열의 현재 볼 높이가 이 볼의 y(정수)보다 낮아야 이동 가능
  if (columnHeight(field, newX) > Math.floor(ball.y)) return;
  ball.gridX = newX;
  ball.updateDom();
  audio.playMove();
}

// ══════════════════════════════════════════════════════════════════════
// 사이드바 UI
// ══════════════════════════════════════════════════════════════════════
const fieldEl = document.getElementById("field");
const nextEl = document.getElementById("next");
const scoreEl = document.getElementById("score");
const chainEl = document.getElementById("chain");
const levelEl = document.getElementById("level");
const levelBarEl = document.getElementById("level-bar");
const rankTitleEl = document.getElementById("rank-title");
const overlayEl = document.getElementById("overlay");
const overlayTitleEl = document.getElementById("overlay-title");

// 대전 UI 요소 (상대 카드 · 스테이지 뱃지)
const oppNameEl = document.getElementById("opp-name");
const oppNameBigEl = document.getElementById("opp-name-big");
const oppNameKrEl = document.getElementById("opp-name-kr");
const oppPortraitEl = document.getElementById("opp-portrait");
const stageNumEl = document.getElementById("stage-num");

function updateOpponentCard(rIdx, rank) {
  if (oppNameEl) oppNameEl.textContent = rank.name;
  if (oppNameBigEl) oppNameBigEl.textContent = rank.name;
  if (oppNameKrEl) oppNameKrEl.textContent = rank.nameKr;
  if (oppPortraitEl) oppPortraitEl.innerHTML = chemistPortraitHtml(rIdx, 110);
  if (stageNumEl) stageNumEl.textContent = (rIdx + 1);
}

function updateSideUI() {
  scoreEl.textContent = state.score;
  chainEl.textContent = state.lastChain;
  levelEl.textContent = "RANK " + state.level;
  const rIdx = Math.min(state.level - 1, ALCHEMIST_RANKS.length - 1);
  const r = ALCHEMIST_RANKS[rIdx];
  rankTitleEl.innerHTML = `
    ${chemistPortraitHtml(rIdx, 42)}
    <div class="rank-text">
      <div class="rank-name">${r.name}</div>
      <div class="rank-name-kr">${r.nameKr}</div>
      <div class="rank-era">${r.era}</div>
    </div>`;
  updateOpponentCard(rIdx, r);
  const progress = (state.score % SCORE_PER_LEVEL) / SCORE_PER_LEVEL;
  levelBarEl.style.width = (progress * 100) + "%";
  nextEl.innerHTML = "";
  if (state.nextPiece) {
    const e = state.nextPiece.element;
    const el = document.createElement("div");
    el.className = `mini-ball p${e.period}`;
    if (e.category === CATEGORY.METAL) el.classList.add("metal");
    if (isNoble(e)) {
      el.classList.add("noble");
      el.innerHTML = `<span class="label">${e.symbol}</span>`;
    } else {
      el.innerHTML = labelHTML(e);
    }
    nextEl.appendChild(el);
  }
}

function showOverlay(title) { overlayTitleEl.textContent = title; overlayEl.classList.remove("hidden"); }
function hideOverlay() { overlayEl.classList.add("hidden"); }

// 파티클 스파클 — 소거 시 볼 색상으로 사방으로 튐
function periodColor(period) {
  return period === 1 ? "#ffcf3d" : period === 2 ? "#7ed88a" : "#6fbcf5";
}
function spawnParticles(cx, cy, color, count = 10) {
  const wrapRect = fieldEl.getBoundingClientRect();
  const playRect = playfieldEl.getBoundingClientRect();
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
    p.style.color = color;   // for currentColor in box-shadow
    playfieldEl.appendChild(p);
    setTimeout(() => p.remove(), 720);
  }
}

// 점수 팝업: 소거 위치의 무게중심 근처에 "+N" 표시.
// .playfield 컨테이너에 붙여 field-wrap 의 overflow:hidden 을 피함.
const playfieldEl = document.querySelector(".playfield");
function showScorePopup(amount, positions, isBig) {
  if (!positions.length) return;
  let sx = 0, sy = 0;
  for (const p of positions) {
    const px = ballPx(p.x, p.y);
    sx += px.x + CELL / 2;
    sy += px.y + CELL / 2;
  }
  sx /= positions.length; sy /= positions.length;
  // field-wrap 은 playfield 안에서 상단 배너 밑에 있음.
  // 배너 높이 + playfield gap 만큼 아래로 오프셋 필요.
  const bannerRect = bannerEl.getBoundingClientRect();
  const wrapRect = fieldEl.getBoundingClientRect();
  const playRect = playfieldEl.getBoundingClientRect();
  const offsetTop = wrapRect.top - playRect.top;
  const offsetLeft = wrapRect.left - playRect.left;
  const el = document.createElement("div");
  el.className = "score-popup" + (isBig ? " big" : "");
  el.textContent = `+${amount}`;
  el.style.left = (offsetLeft + sx) + "px";
  el.style.top  = (offsetTop + sy) + "px";
  playfieldEl.appendChild(el);
  setTimeout(() => el.remove(), 950);
}

// 레벨업 알림 — 승급 시 화학자 삽화 + 영어명·한글명·업적
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
    <div class="lvl-desc">${rank.desc}</div>
  `;
  document.body.appendChild(el);
  audio.playLevelUp();
  setTimeout(() => el.remove(), 2600);
}

// ══════════════════════════════════════════════════════════════════════
// 학습 기록 (localStorage 영속화)
// ══════════════════════════════════════════════════════════════════════
const STATS_KEY = "elements_puyo_stats_v3";
const EVENT_KEEP = 30;   // 저장 최대 개수
const EVENT_SHOW = 10;   // 화면 표시 최대 개수

const stats = {
  // 시간순 이벤트 로그 (최신이 [0])
  //   {chain, simul, gained, rules: [{cls, label, formulas:[{formula,nameKr}]}], at}
  events: [],
  // 영속 지표 (게임 넘어 유지)
  gamesPlayed: 0,
  bestScore: 0,
  maxChain: 0,
  maxSimul: 0,
  totalChains2Plus: 0,
  totalSimul2Plus: 0,
};

function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return;
    const s = JSON.parse(raw);
    stats.events = s.events || [];
    stats.gamesPlayed = s.gamesPlayed || 0;
    stats.bestScore = s.bestScore || 0;
    stats.maxChain = s.maxChain || 0;
    stats.maxSimul = s.maxSimul || 0;
    stats.totalChains2Plus = s.totalChains2Plus || 0;
    stats.totalSimul2Plus = s.totalSimul2Plus || 0;
  } catch (e) { /* ignore corruption */ }
}
function saveStats() {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) { /* quota exceeded etc. */ }
}
function pushEvent(chain, simul, fired, gained) {
  stats.events.unshift({
    chain, simul, gained,
    rules: fired.map(f => ({
      cls: f.cls,
      label: f.label,
      formulas: f.formulas || null,
    })),
    at: Date.now(),
  });
  if (stats.events.length > EVENT_KEEP) stats.events.length = EVENT_KEEP;
}

const statsContentEl = document.getElementById("stats-content");
function renderEventRow(ev) {
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
  return `<div class="event-row">
    <div class="event-meta">${badges.join("")}</div>
    <div class="event-body">${body}</div>
  </div>`;
}
function renderStats() {
  const parts = [];
  parts.push(`<div class="stat-cat"><span class="cat-label log">최근 소거 (${EVENT_SHOW}개)</span></div>`);
  if (stats.events.length === 0) {
    parts.push('<div class="stat-empty">아직 없음</div>');
  } else {
    for (const ev of stats.events.slice(0, EVENT_SHOW)) parts.push(renderEventRow(ev));
  }
  // 공격력 지표 (게임 넘어 유지)
  parts.push('<div class="stat-cat"><span class="cat-label attack">공격력 (예정)</span></div>');
  parts.push(`<div class="stat-row"><span>최고 연쇄</span><span class="count">${stats.maxChain}단</span></div>`);
  parts.push(`<div class="stat-row"><span>최고 동시</span><span class="count">${stats.maxSimul}종</span></div>`);
  parts.push(`<div class="stat-row"><span>연쇄 2+ 누적</span><span class="count">${stats.totalChains2Plus}</span></div>`);
  parts.push(`<div class="stat-row"><span>동시 2+ 누적</span><span class="count">${stats.totalSimul2Plus}</span></div>`);
  parts.push(`<div class="stat-summary">플레이 ${stats.gamesPlayed}회 · 최고 ${stats.bestScore}점</div>`);
  statsContentEl.innerHTML = parts.join("");
}

// ══════════════════════════════════════════════════════════════════════
// 초기화
// ══════════════════════════════════════════════════════════════════════
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function newGame() {
  for (const b of balls.values()) b.destroy();
  balls.clear();
  field = createField();
  state.currentPiece = generatePiece();
  state.nextPiece = generatePiece();
  state.fallingBall = null;
  state.isResolving = false;
  state.gameOver = false;
  state.softDrop = false;
  state.score = 0;
  state.level = 1;
  state.lastChain = 0;
  // 새 게임: 이벤트 로그 리셋 (영속 지표는 유지)
  stats.events = [];
  saveStats();
  renderStats();
  hideOverlay();
  spawnPiece();
  updateSideUI();
  lastTime = performance.now();
  audio.playNewGame();
  audio.switchBgm(1);
}

function updateMuteUI() {
  const el = document.getElementById("mute-toggle");
  if (!el) return;
  const allMuted = audio.isMuted();
  const bgmMuted = audio.isBgmMuted();
  el.dataset.state = allMuted ? "all" : bgmMuted ? "bgm" : "on";
  el.title = allMuted ? "소리 꺼짐 (M 해제)"
           : bgmMuted ? "BGM 꺼짐 · 효과음만 (B 해제)"
           : "소리 켜짐 · M=전체 뮤트, B=BGM 뮤트";
}
document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("mute-toggle");
  if (el) el.addEventListener("click", (ev) => {
    audio.unlock();
    // 왼클릭: 전체 토글, Shift: BGM 만 토글
    if (ev.shiftKey) audio.toggleMuteBgm();
    else audio.toggleMuteAll();
    updateMuteUI();
  });
  updateMuteUI();

  // 스테이지 버튼: 현재 랭크의 컷씬 다시 재생
  const stageBtn = document.getElementById("stage-btn");
  if (stageBtn) stageBtn.addEventListener("click", () => {
    audio.unlock();
    const rIdx = Math.min(state.level - 1, ALCHEMIST_RANKS.length - 1);
    showStageIntro(rIdx, null);
  });
});

loadStats();
renderStats();

// 스토리 인트로 → 게임 시작
const progress = loadProgress();
function bootGame() {
  newGame();
  requestAnimationFrame(tick);
}
if (!progress.seenIntro) {
  // 인트로 첫 재생 → seenIntro 저장 후 스테이지 1 컷씬 → 게임
  showStoryIntro(() => {
    progress.seenIntro = true;
    saveProgress(progress);
    showStageIntro(0, bootGame);
  });
} else {
  bootGame();
}
