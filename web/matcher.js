// Matcher & compound data — 순수 함수. state 를 건드리지 않음. game.js 의 Game 인스턴스가 사용.
// 필드 인자 `f` 는 2D 배열: f[x][y] = element | null.

"use strict";

// ══════════════════════════════════════════════════════════════════════
// 실제 존재하는 화합물 화이트리스트 (수동 큐레이션)
// 우리 단순 이온 모델(고정 산화수)로 전하 균형이 맞고 실제 존재하는 화합물만.
// 키: 원소 심볼 알파벳순 + empirical 개수. 예: "Cl1Na1"=NaCl, "H2Mg1O2"=Mg(OH)₂.
// ══════════════════════════════════════════════════════════════════════
const KNOWN_COMPOUNDS = new Set([
  // 알칼리 금속 (Li, Na)
  "F1Li1","Cl1Li1","Li2O1","Li2S1","Li3N1","Li3P1","H1Li1",
  "F1Na1","Cl1Na1","Na2O1","Na2S1","Na3P1","H1Na1",
  // 알칼리 토금속 (Be, Mg)
  "Be1F2","Be1Cl2","Be1O1","Be1S1","Be3N2","Be3P2","Be2C1",
  "F2Mg1","Cl2Mg1","Mg1O1","Mg1S1","Mg3N2","Mg3P2","H2Mg1",
  // 알루미늄
  "Al1F3","Al1Cl3","Al2O3","Al2S3","Al1N1","Al1P1","Al4C3",
  // 붕소
  "B1F3","B1Cl3","B2O3","B2S3","B1N1","B1P1",
  // 규소 (Si+4)
  "C1Si1","F4Si1","Cl4Si1","O2Si1","S2Si1","N4Si3",
  // 탄소 양이온 (C+4)
  "C1O2","C1F4","C1Cl4","C1S2",
  // 규소 음이온 (Si-4) — 실리사이드
  "Li4Si1","Na4Si1","Be2Si1","Mg2Si1",
  // ── 4주기 ──
  // K, Ca
  "F1K1","Cl1K1","K2O1","K2S1","K3N1","K3P1","H1K1","Br1K1",
  "Ca1F2","Ca1Cl2","Ca1O1","Ca1S1","Ca3N2","Ca3P2","Ca1H2","Br2Ca1",
  // 전이금속 (Sc, Ti(II/IV), V(III/V), Cr(III/VI), Mn(II/IV), Fe(II/III), Co(II/III), Ni, Cu(I/II), Zn)
  "F3Sc1","Cl3Sc1","O3Sc2","S3Sc2","N1Sc1","P1Sc1","Br3Sc1",
  "O1Ti1","S1Ti1","F2Ti1","Cl2Ti1","O2Ti1","S2Ti1","F4Ti1","Cl4Ti1","C1Ti1",
  "O3V2","F3V1","Cl3V1","N1V1","O5V2",
  "Cr2O3","Cr1F3","Cl3Cr1","Cr2S3","Cr1N1","Cr1O3",
  "Mn1O1","Mn1S1","F2Mn1","Cl2Mn1","Mn1O2",
  "Fe1O1","Fe1S1","F2Fe1","Cl2Fe1","Br2Fe1","Fe2O3","F3Fe1","Cl3Fe1","Fe2S3","Br3Fe1",
  "Co1O1","Co1S1","Co1F2","Cl2Co1","Co2O3","Co1F3","Cl3Co1",
  "Ni1O1","Ni1S1","F2Ni1","Cl2Ni1",
  "Cu2O1","Cu2S1","Cl1Cu1","Cu1F1","Cu3N1","Br1Cu1",
  "Cu1O1","Cu1S1","Cu1F2","Cl2Cu1","Br2Cu1",
  "O1Zn1","S1Zn1","F2Zn1","Cl2Zn1","N2Zn3","Br2Zn1",
  // Ga, Ge (±), As (±), Se (±), Br
  "Ga2O3","F3Ga1","Cl3Ga1","Ga2S3","Ga1N1","Ga1P1","Br3Ga1","As1Ga1",
  "Ge1O2","Ge1S2","F4Ge1","Cl4Ge1","Ge3N4",
  "Ge1Li4","Ge1Na4","Ge1Mg2","Be2Ge1","Ca2Ge1",
  "As1Na3","As1K3","As2Ca3","As2Mg3","As1Li3","Al1As1","As1H3","As2Be3",
  "As1F3","As1Cl3","As2O3","As2S3",
  "Na2Se1","K2Se1","Ca1Se1","Mg1Se1","Se1Zn1","H2Se1","Al2Se3","Li2Se1","Be1Se1",
  "O3Se1","F6Se1",
  "Br1H1","Br1Li1","Br1Na1","Br2Mg1","Al1Br3","Be1Br2",
  // 수소 화합물
  "F1H1","Cl1H1","H2O1","H2S1","H3N1","H3P1","C1H4",
  // 삼원 이상
  "H1Li1O1","H1Na1O1","Be1H2O2","H2Mg1O2","Al1H3O3",
  "H2Li1N1","H2N1Na1","H1Li1S1","H1Na1S1",
]);

const COMPOUND_NAMES_KR = {
  "F1Li1":"플루오린화 리튬","Cl1Li1":"염화 리튬",
  "Li2O1":"산화 리튬","Li2S1":"황화 리튬",
  "Li3N1":"질화 리튬","Li3P1":"인화 리튬","H1Li1":"수소화 리튬",
  "F1Na1":"플루오린화 나트륨","Cl1Na1":"염화 나트륨(소금)",
  "Na2O1":"산화 나트륨","Na2S1":"황화 나트륨",
  "Na3P1":"인화 나트륨","H1Na1":"수소화 나트륨",
  "Be1F2":"플루오린화 베릴륨","Be1Cl2":"염화 베릴륨",
  "Be1O1":"산화 베릴륨","Be1S1":"황화 베릴륨",
  "Be3N2":"질화 베릴륨","Be3P2":"인화 베릴륨","Be2C1":"탄화 베릴륨",
  "F2Mg1":"플루오린화 마그네슘","Cl2Mg1":"염화 마그네슘",
  "Mg1O1":"산화 마그네슘","Mg1S1":"황화 마그네슘",
  "Mg3N2":"질화 마그네슘","Mg3P2":"인화 마그네슘","H2Mg1":"수소화 마그네슘",
  "Al1F3":"플루오린화 알루미늄","Al1Cl3":"염화 알루미늄",
  "Al2O3":"산화 알루미늄(알루미나)","Al2S3":"황화 알루미늄",
  "Al1N1":"질화 알루미늄","Al1P1":"인화 알루미늄","Al4C3":"탄화 알루미늄",
  "B1F3":"삼플루오린화 붕소","B1Cl3":"삼염화 붕소",
  "B2O3":"산화 붕소","B2S3":"황화 붕소",
  "B1N1":"질화 붕소","B1P1":"인화 붕소",
  "C1Si1":"탄화 규소","F4Si1":"사플루오린화 규소","Cl4Si1":"사염화 규소",
  "O2Si1":"이산화 규소(실리카)","S2Si1":"이황화 규소","N4Si3":"질화 규소",
  "C1O2":"이산화 탄소","C1F4":"사플루오린화 탄소","C1Cl4":"사염화 탄소","C1S2":"이황화 탄소",
  "Li4Si1":"규화 리튬","Na4Si1":"규화 나트륨","Be2Si1":"규화 베릴륨","Mg2Si1":"규화 마그네슘",
  // 4주기 K/Ca 화합물
  "F1K1":"플루오린화 칼륨","Cl1K1":"염화 칼륨","K2O1":"산화 칼륨","K2S1":"황화 칼륨",
  "K3N1":"질화 칼륨","K3P1":"인화 칼륨","H1K1":"수소화 칼륨","Br1K1":"브로민화 칼륨",
  "Ca1F2":"플루오린화 칼슘","Ca1Cl2":"염화 칼슘","Ca1O1":"산화 칼슘","Ca1S1":"황화 칼슘",
  "Ca3N2":"질화 칼슘","Ca3P2":"인화 칼슘","Ca1H2":"수소화 칼슘","Br2Ca1":"브로민화 칼슘",
  // 전이금속 산화·할라이드·황화 (Sc, Ti, V, Cr, Mn, Fe, Co, Ni, Cu, Zn)
  "F3Sc1":"플루오린화 스칸듐","Cl3Sc1":"염화 스칸듐","O3Sc2":"산화 스칸듐","S3Sc2":"황화 스칸듐",
  "N1Sc1":"질화 스칸듐","P1Sc1":"인화 스칸듐","Br3Sc1":"브로민화 스칸듐",
  "O1Ti1":"산화 타이타늄(II)","S1Ti1":"황화 타이타늄(II)","F2Ti1":"플루오린화 타이타늄(II)","Cl2Ti1":"염화 타이타늄(II)",
  "O2Ti1":"산화 타이타늄(IV)","S2Ti1":"황화 타이타늄(IV)","F4Ti1":"플루오린화 타이타늄(IV)","Cl4Ti1":"염화 타이타늄(IV)",
  "C1Ti1":"탄화 타이타늄",
  "O3V2":"산화 바나듐(III)","F3V1":"플루오린화 바나듐(III)","Cl3V1":"염화 바나듐(III)","N1V1":"질화 바나듐",
  "O5V2":"오산화 이바나듐",
  "Cr2O3":"산화 크로뮴(III)","Cr1F3":"플루오린화 크로뮴(III)","Cl3Cr1":"염화 크로뮴(III)",
  "Cr2S3":"황화 크로뮴(III)","Cr1N1":"질화 크로뮴","Cr1O3":"산화 크로뮴(VI)",
  "Mn1O1":"산화 망가니즈(II)","Mn1S1":"황화 망가니즈(II)","F2Mn1":"플루오린화 망가니즈(II)","Cl2Mn1":"염화 망가니즈(II)",
  "Mn1O2":"이산화 망가니즈",
  "Fe1O1":"산화 철(II)","Fe1S1":"황화 철(II)","F2Fe1":"플루오린화 철(II)","Cl2Fe1":"염화 철(II)","Br2Fe1":"브로민화 철(II)",
  "Fe2O3":"산화 철(III)","F3Fe1":"플루오린화 철(III)","Cl3Fe1":"염화 철(III)","Fe2S3":"황화 철(III)","Br3Fe1":"브로민화 철(III)",
  "Co1O1":"산화 코발트(II)","Co1S1":"황화 코발트(II)","Co1F2":"플루오린화 코발트(II)","Cl2Co1":"염화 코발트(II)",
  "Co2O3":"산화 코발트(III)","Co1F3":"플루오린화 코발트(III)","Cl3Co1":"염화 코발트(III)",
  "Ni1O1":"산화 니켈","Ni1S1":"황화 니켈","F2Ni1":"플루오린화 니켈","Cl2Ni1":"염화 니켈",
  "Cu2O1":"산화 구리(I)","Cu2S1":"황화 구리(I)","Cl1Cu1":"염화 구리(I)","Cu1F1":"플루오린화 구리(I)",
  "Cu3N1":"질화 구리(I)","Br1Cu1":"브로민화 구리(I)",
  "Cu1O1":"산화 구리(II)","Cu1S1":"황화 구리(II)","Cu1F2":"플루오린화 구리(II)","Cl2Cu1":"염화 구리(II)","Br2Cu1":"브로민화 구리(II)",
  "O1Zn1":"산화 아연","S1Zn1":"황화 아연","F2Zn1":"플루오린화 아연","Cl2Zn1":"염화 아연","N2Zn3":"질화 아연","Br2Zn1":"브로민화 아연",
  // Ga, Ge (±), As (±), Se (±), Br
  "Ga2O3":"산화 갈륨","F3Ga1":"플루오린화 갈륨","Cl3Ga1":"염화 갈륨","Ga2S3":"황화 갈륨",
  "Ga1N1":"질화 갈륨","Ga1P1":"인화 갈륨","Br3Ga1":"브로민화 갈륨","As1Ga1":"비소화 갈륨",
  "Ge1O2":"이산화 저마늄","Ge1S2":"이황화 저마늄","F4Ge1":"사플루오린화 저마늄","Cl4Ge1":"사염화 저마늄","Ge3N4":"질화 저마늄",
  "Ge1Li4":"저마늄화 리튬","Ge1Na4":"저마늄화 나트륨","Ge1Mg2":"저마늄화 마그네슘","Be2Ge1":"저마늄화 베릴륨","Ca2Ge1":"저마늄화 칼슘",
  "As1Na3":"비소화 나트륨","As1K3":"비소화 칼륨","As2Ca3":"비소화 칼슘","As2Mg3":"비소화 마그네슘",
  "As1Li3":"비소화 리튬","Al1As1":"비소화 알루미늄","As1H3":"아르신","As2Be3":"비소화 베릴륨",
  "As1F3":"삼플루오린화 비소","As1Cl3":"삼염화 비소","As2O3":"삼산화 이비소","As2S3":"삼황화 이비소",
  "Na2Se1":"셀레늄화 나트륨","K2Se1":"셀레늄화 칼륨","Ca1Se1":"셀레늄화 칼슘","Mg1Se1":"셀레늄화 마그네슘",
  "Se1Zn1":"셀레늄화 아연","H2Se1":"셀레늄화 수소","Al2Se3":"셀레늄화 알루미늄","Li2Se1":"셀레늄화 리튬","Be1Se1":"셀레늄화 베릴륨",
  "O3Se1":"삼산화 셀레늄","F6Se1":"육플루오린화 셀레늄",
  "Br1H1":"브로민화 수소","Br1Li1":"브로민화 리튬","Br1Na1":"브로민화 나트륨",
  "Br2Mg1":"브로민화 마그네슘","Al1Br3":"브로민화 알루미늄","Be1Br2":"브로민화 베릴륨",
  "F1H1":"플루오린화 수소(불산)","Cl1H1":"염화 수소(염산)",
  "H2O1":"물","H2S1":"황화 수소",
  "H3N1":"암모니아","H3P1":"포스핀","C1H4":"메탄",
  "H1Li1O1":"수산화 리튬","H1Na1O1":"수산화 나트륨(가성소다)",
  "Be1H2O2":"수산화 베릴륨","H2Mg1O2":"수산화 마그네슘","Al1H3O3":"수산화 알루미늄",
  "H2Li1N1":"리튬 아미드","H2N1Na1":"소듐 아미드",
  "H1Li1S1":"리튬 하이드로설파이드","H1Na1S1":"소듐 하이드로설파이드",
};

const DIATOMIC_KEYS = new Set(["H","N","O","F","CL","BR"]);
const DIATOMIC_NAMES_KR = { "H":"수소 기체","N":"질소 기체","O":"산소 기체","F":"플루오린 기체","CL":"염소 기체","BR":"브로민 기체" };

// 관례상 표기가 전하 순서와 다른 화합물 (14·15족 수소화물, 수산화물, 아미드, 하이드로설파이드).
// 전하 정렬은 양이온 우선 → H가 앞으로 가지만, NH₃/CH₄/PH₃ 등은 비H 원소가 먼저.
const DISPLAY_FORMULAS = {
  "C1H4": "CH<sub>4</sub>",
  "H3N1": "NH<sub>3</sub>",
  "H3P1": "PH<sub>3</sub>",
  "H1Li1O1": "LiOH",
  "H1Na1O1": "NaOH",
  "Be1H2O2": "Be(OH)<sub>2</sub>",
  "H2Mg1O2": "Mg(OH)<sub>2</sub>",
  "Al1H3O3": "Al(OH)<sub>3</sub>",
  "H2Li1N1": "LiNH<sub>2</sub>",
  "H2N1Na1": "NaNH<sub>2</sub>",
  "H1Li1S1": "LiSH",
  "H1Na1S1": "NaSH",
  "C1Si1": "SiC",
  "As1H3": "AsH<sub>3</sub>",
};

// ══════════════════════════════════════════════════════════════════════
// Empirical formula 계산 (알파벳순 심볼 + GCD 축약된 개수)
// ══════════════════════════════════════════════════════════════════════
function _gcd(a, b) { return b === 0 ? a : _gcd(b, a % b); }
function canonicalCompoundKey(cellEls) {
  const counts = new Map();
  for (const c of cellEls) counts.set(c.e.symbol, (counts.get(c.e.symbol) || 0) + 1);
  const values = [...counts.values()];
  const g = values.reduce((a, b) => _gcd(a, b));
  const keys = [...counts.keys()].sort();
  return keys.map(k => `${k}${counts.get(k) / g}`).join("");
}

// ══════════════════════════════════════════════════════════════════════
// 규칙 1: 상하좌우 인접 서브셋 중 화이트리스트 화합물이면 소거.
// 겹치는 서브셋은 value 큰 쪽 우선 선택 (그리디).
// ══════════════════════════════════════════════════════════════════════
const MOLECULE_MAX_SUBSET = 8;
function findMolecules(f, W, H, isNobleFn, isObstacleFn) {
  const allSubsets = [];
  const seenSubsets = new Set();
  const cid = (x, y) => x * H + y;
  function skip(e) { return !e || isNobleFn(e) || isObstacleFn(e); }

  function neighborsOf(x, y) {
    const out = [];
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
      const e = f[nx][ny];
      if (skip(e)) continue;
      out.push(cid(nx, ny));
    }
    return out;
  }

  function extend(subsetIds, cellEls, frontier, startCid) {
    if (subsetIds.length >= 2) {
      let sum = 0, cat = false, an = false;
      const distinct = new Set();
      for (const c of cellEls) {
        sum += c.e.charge; distinct.add(c.e.z);
        if (c.e.charge > 0) cat = true;
        if (c.e.charge < 0) an = true;
      }
      if (sum === 0 && distinct.size >= 2 && cat && an) {
        const key = canonicalCompoundKey(cellEls);
        if (KNOWN_COMPOUNDS.has(key)) {
          let mass = 0, posBonus = 0;
          for (const c of cellEls) { mass += (c.e.mass || 0); posBonus += c.e.period * 3 + c.e.group; }
          allSubsets.push({
            cellIds: new Set(subsetIds),
            formula: _computeFormula(cellEls),
            nameKr: COMPOUND_NAMES_KR[key] || "",
            key, size: cellEls.length,
            value: Math.round(mass * 100) + posBonus,
          });
        }
      }
    }
    if (subsetIds.length >= MOLECULE_MAX_SUBSET) return;
    for (let i = 0; i < frontier.length; i++) {
      const next = frontier[i];
      if (next < startCid) continue;
      const nx = Math.floor(next / H), ny = next % H;
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

  for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) {
    const e = f[x][y];
    if (skip(e)) continue;
    const startCid = cid(x, y);
    seenSubsets.add(String(startCid));
    const frontier = neighborsOf(x, y).filter(c => c > startCid);
    extend([startCid], [{ x, y, e }], frontier, startCid);
  }

  // 이원자 기체 (H/N/O/F/Cl/Br) 같은 원소 2개 이상 상하좌우 연결 → 분자와 동일 우선순위 트랙에서 경쟁.
  // 각 연결 컴포넌트를 하나의 서브셋으로 등록. 분자량 기반 value 로 greedy 대상.
  const diaVisited = Array.from({ length: W }, () => new Array(H).fill(false));
  for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) {
    if (diaVisited[x][y]) continue;
    const e = f[x][y];
    if (!e || !DIATOMIC_KEYS.has(e.key) || isObstacleFn(e)) { diaVisited[x][y] = true; continue; }
    const comp = [];
    const stack = [{ x, y }];
    while (stack.length) {
      const p = stack.pop();
      if (p.x < 0 || p.x >= W || p.y < 0 || p.y >= H) continue;
      if (diaVisited[p.x][p.y]) continue;
      const ce = f[p.x][p.y];
      if (!ce || ce.key !== e.key) continue;
      diaVisited[p.x][p.y] = true;
      comp.push({ x: p.x, y: p.y, e: ce });
      stack.push({ x: p.x + 1, y: p.y }); stack.push({ x: p.x - 1, y: p.y });
      stack.push({ x: p.x, y: p.y + 1 }); stack.push({ x: p.x, y: p.y - 1 });
    }
    if (comp.length >= 2) {
      const cellIds = new Set(comp.map(c => cid(c.x, c.y)));
      let mass = 0, posBonus = 0;
      for (const c of comp) { mass += (c.e.mass || 0); posBonus += c.e.period * 3 + c.e.group; }
      allSubsets.push({
        cellIds,
        formula: `${e.symbol}<sub>2</sub>`,
        nameKr: DIATOMIC_NAMES_KR[e.key] || "",
        key: `_dia_${e.key}`,
        size: comp.length,
        value: Math.round(mass * 100) + posBonus,
        isDiatomic: true,
      });
    }
  }

  allSubsets.sort((a, b) => b.value - a.value || a.key.localeCompare(b.key));
  const claimedCells = new Set();
  const compoundCells = new Set();
  const diatomicCells = new Set();
  const selected = [];
  const seenKeys = new Set();
  for (const s of allSubsets) {
    let overlap = false;
    for (const cellId of s.cellIds) if (claimedCells.has(cellId)) { overlap = true; break; }
    if (overlap) continue;
    for (const cellId of s.cellIds) {
      claimedCells.add(cellId);
      if (s.isDiatomic) diatomicCells.add(cellId);
      else compoundCells.add(cellId);
    }
    if (!seenKeys.has(s.key)) {
      seenKeys.add(s.key);
      selected.push(s);
    }
  }
  return { cells: claimedCells, subsets: selected, compoundCells, diatomicCells };
}

// 규칙 2: 같은 주기 가로 5개 이상 서로 다른 원소. 분자(규칙1)에 이미 쓰인 셀은 스킵.
function findPeriodRuns(f, W, H, isObstacleFn, excluded = null) {
  const result = new Set();
  const isExcluded = (x, y) => excluded && excluded.has(x * H + y);
  // 다양성은 z(원자번호)로 판정 — 같은 원소의 이온 변종(C/CP, SI/SIM, FE2/FE3 등)은 하나로.
  for (let y = 0; y < H; y++) {
    for (let start = 0; start < W; start++) {
      const seen = new Set(); let period = null, end = start;
      while (end < W) {
        const e = f[end][y];
        if (!e || isObstacleFn(e) || isExcluded(end, y)) break;
        if (period === null) period = e.period;
        else if (period !== e.period) break;
        if (seen.has(e.z)) break;
        seen.add(e.z); end++;
      }
      if (seen.size >= 5) for (let x = start; x < end; x++) result.add(x * H + y);
    }
  }
  return result;
}

// 규칙 3: 같은 족 세로 3개 이상 서로 다른 원소. 분자 셀 스킵.
function findGroupRuns(f, W, H, isObstacleFn, excluded = null) {
  const result = new Set();
  const isExcluded = (x, y) => excluded && excluded.has(x * H + y);
  for (let x = 0; x < W; x++) {
    for (let start = 0; start < H; start++) {
      const seen = new Set(); let group = null, end = start;
      while (end < H) {
        const e = f[x][end];
        if (!e || isObstacleFn(e) || isExcluded(x, end)) break;
        if (group === null) group = e.group;
        else if (group !== e.group) break;
        if (seen.has(e.z)) break;
        seen.add(e.z); end++;
      }
      if (seen.size >= 3) for (let y = start; y < end; y++) result.add(x * H + y);
    }
  }
  return result;
}

// 규칙 5: 이원자 기체 (H, N, O, F, Cl) 같은 원소 2개 이상 인접 → 소거.
// excluded: 규칙 1 분자에 이미 쓰인 셀들 (다시 세지 않음).
function findDiatomics(f, W, H, excluded = null) {
  const result = new Set();
  const visited = Array.from({ length: W }, () => new Array(H).fill(false));
  const isExcluded = (x, y) => excluded && excluded.has(x * H + y);
  for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) {
    if (visited[x][y]) continue;
    const e = f[x][y];
    if (!e || !DIATOMIC_KEYS.has(e.key) || isExcluded(x, y)) { visited[x][y] = true; continue; }
    const comp = [];
    const stack = [{ x, y }];
    while (stack.length) {
      const p = stack.pop();
      if (p.x < 0 || p.x >= W || p.y < 0 || p.y >= H) continue;
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
      for (const c of comp) result.add(c.x * H + c.y);
    }
  }
  return result;
}

// 규칙 4: 같은 금속 원소 상하좌우 5개 이상 → 소거. (원소 종류가 같아야 함, 이온 변종은 하나로 취급)
// 분자에 이미 쓰인 셀은 스킵 (분자가 최우선).
function findMetalClusters(f, W, H, METAL_CAT, excluded = null) {
  const result = new Set();
  const visited = Array.from({ length: W }, () => new Array(H).fill(false));
  const isExcluded = (x, y) => excluded && excluded.has(x * H + y);
  for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) {
    if (visited[x][y]) continue;
    const e = f[x][y];
    if (!e || e.category !== METAL_CAT || isExcluded(x, y)) { visited[x][y] = true; continue; }
    // 같은 원소는 원자번호 z 기준 (FE2/FE3 등 이온 변종 통합)
    const z = e.z;
    const comp = [];
    const stack = [{ x, y }];
    while (stack.length) {
      const p = stack.pop();
      if (p.x < 0 || p.x >= W || p.y < 0 || p.y >= H) continue;
      if (visited[p.x][p.y]) continue;
      if (isExcluded(p.x, p.y)) continue;
      const ce = f[p.x][p.y];
      if (!ce || ce.z !== z) continue;
      visited[p.x][p.y] = true;
      comp.push({ x: p.x, y: p.y });
      stack.push({ x: p.x + 1, y: p.y });
      stack.push({ x: p.x - 1, y: p.y });
      stack.push({ x: p.x, y: p.y + 1 });
      stack.push({ x: p.x, y: p.y - 1 });
    }
    if (comp.length >= 5) {
      for (const c of comp) result.add(c.x * H + c.y);
    }
  }
  return result;
}

function decodePositions(encoded, H) {
  const out = [];
  for (const enc of encoded) out.push({ x: Math.floor(enc / H), y: enc % H });
  return out;
}

// ══════════════════════════════════════════════════════════════════════
// 소거된 셀들 → 분자식 목록 산출 (규칙 1 결과 표시용)
// ══════════════════════════════════════════════════════════════════════
function molFormulasFromCleared(clearedSet, f, W, H) {
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
      const x = Math.floor(cur / H), y = cur % H;
      const e = f[x][y];
      if (!e) continue;
      comp.push({ x, y, e });
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
        stack.push(nx * H + ny);
      }
    }
    if (comp.length >= 2) {
      const key = canonicalCompoundKey(comp);
      items.push({ formula: _computeFormula(comp), nameKr: COMPOUND_NAMES_KR[key] || "" });
    }
  }
  return items;
}

function diatomicFormulas(clearedSet, f, W, H) {
  const items = [];
  const visited = new Set();
  for (const enc of clearedSet) {
    if (visited.has(enc)) continue;
    const x = Math.floor(enc / H), y = enc % H;
    const e = f[x][y];
    if (!e) continue;
    const stack = [enc];
    let count = 0;
    while (stack.length) {
      const cur = stack.pop();
      if (visited.has(cur)) continue;
      if (!clearedSet.has(cur)) continue;
      const cx = Math.floor(cur / H), cy = cur % H;
      const ce = f[cx][cy];
      if (!ce || ce.key !== e.key) continue;
      visited.add(cur);
      count++;
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
        stack.push(nx * H + ny);
      }
    }
    if (count >= 2) {
      items.push({ formula: `${e.symbol}<sub>2</sub>`, nameKr: DIATOMIC_NAMES_KR[e.key] || "" });
    }
  }
  return items;
}

// _computeFormula: elementRank + gcd 필요 → 여기서 자체 구현 (원소 카테고리 상수를 매개변수로 받음)
// game.js 는 elementRank 를 alias 하지 않고 여기서 계산되는 것을 그대로 사용.
// 순서: metal cation → nonmetal/metalloid cation → anion. 같은 rank 내 원자번호 오름차순.
function _computeFormula(cellEls) {
  const key = canonicalCompoundKey(cellEls);
  if (DISPLAY_FORMULAS[key]) return DISPLAY_FORMULAS[key];
  const counts = new Map();
  const bySym = new Map();
  for (const c of cellEls) {
    counts.set(c.e.symbol, (counts.get(c.e.symbol) || 0) + 1);
    bySym.set(c.e.symbol, c.e);
  }
  const values = [...counts.values()];
  const g = values.reduce((a, b) => _gcd(a, b));
  const symbols = [...counts.keys()];
  symbols.sort((a, b) => {
    const ea = bySym.get(a), eb = bySym.get(b);
    const rA = _elementRank(ea), rB = _elementRank(eb);
    if (rA !== rB) return rA - rB;
    return ea.z - eb.z;
  });
  return symbols.map(s => {
    const n = counts.get(s) / g;
    return n === 1 ? s : `${s}<sub>${n}</sub>`;
  }).join("");
}
function _elementRank(e) {
  if (e.category === "METAL") return 0;
  if (e.charge > 0) return 1;
  return 2;
}
