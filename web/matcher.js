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
  // 규소
  "C1Si1","F4Si1","Cl4Si1","O2Si1","S2Si1","N4Si3",
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
  "F1H1":"플루오린화 수소(불산)","Cl1H1":"염화 수소(염산)",
  "H2O1":"물","H2S1":"황화 수소",
  "H3N1":"암모니아","H3P1":"포스핀","C1H4":"메탄",
  "H1Li1O1":"수산화 리튬","H1Na1O1":"수산화 나트륨(가성소다)",
  "Be1H2O2":"수산화 베릴륨","H2Mg1O2":"수산화 마그네슘","Al1H3O3":"수산화 알루미늄",
  "H2Li1N1":"리튬 아미드","H2N1Na1":"소듐 아미드",
  "H1Li1S1":"리튬 하이드로설파이드","H1Na1S1":"소듐 하이드로설파이드",
};

const DIATOMIC_KEYS = new Set(["H","N","O","F","CL"]);
const DIATOMIC_NAMES_KR = { "H":"수소 기체","N":"질소 기체","O":"산소 기체","F":"플루오린 기체","CL":"염소 기체" };

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
        sum += c.e.charge; distinct.add(c.e.key);
        if (c.e.charge > 0) cat = true;
        if (c.e.charge < 0) an = true;
      }
      if (sum === 0 && distinct.size >= 2 && cat && an) {
        const key = canonicalCompoundKey(cellEls);
        if (KNOWN_COMPOUNDS.has(key)) {
          let posBonus = 0;
          for (const c of cellEls) posBonus += c.e.period * 3 + c.e.group;
          allSubsets.push({
            cellIds: new Set(subsetIds),
            formula: _computeFormula(cellEls),
            nameKr: COMPOUND_NAMES_KR[key] || "",
            key, size: cellEls.length,
            value: cellEls.length * 100 + posBonus,
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

  allSubsets.sort((a, b) => b.value - a.value || a.key.localeCompare(b.key));
  const claimedCells = new Set();
  const selected = [];
  const seenKeys = new Set();
  for (const s of allSubsets) {
    let overlap = false;
    for (const cellId of s.cellIds) if (claimedCells.has(cellId)) { overlap = true; break; }
    if (overlap) continue;
    for (const cellId of s.cellIds) claimedCells.add(cellId);
    if (!seenKeys.has(s.key)) {
      seenKeys.add(s.key);
      selected.push(s);
    }
  }
  return { cells: claimedCells, subsets: selected };
}

// 규칙 2: 같은 주기(1/2/3) 가로 5개 이상 서로 다른 원소 — 8열 필드 기준 콤보 유도용 상향
function findPeriodRuns(f, W, H, isObstacleFn) {
  const result = new Set();
  for (let y = 0; y < H; y++) {
    for (let start = 0; start < W; start++) {
      const seen = new Set(); let period = null, end = start;
      while (end < W) {
        const e = f[end][y];
        if (!e || isObstacleFn(e)) break;
        if (period === null) period = e.period;
        else if (period !== e.period) break;
        if (seen.has(e.key)) break;
        seen.add(e.key); end++;
      }
      if (seen.size >= 5) for (let x = start; x < end; x++) result.add(x * H + y);
    }
  }
  return result;
}

// 규칙 3: 같은 족 세로 3개 이상 서로 다른 원소
function findGroupRuns(f, W, H, isObstacleFn) {
  const result = new Set();
  for (let x = 0; x < W; x++) {
    for (let start = 0; start < H; start++) {
      const seen = new Set(); let group = null, end = start;
      while (end < H) {
        const e = f[x][end];
        if (!e || isObstacleFn(e)) break;
        if (group === null) group = e.group;
        else if (group !== e.group) break;
        if (seen.has(e.key)) break;
        seen.add(e.key); end++;
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

// 규칙 4: 금속 원소 상하좌우 5개 이상 → 소거. (8열 필드 기준 콤보 유도용 상향)
function findMetalClusters(f, W, H, METAL_CAT) {
  const result = new Set();
  const visited = Array.from({ length: W }, () => new Array(H).fill(false));
  for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) {
    if (visited[x][y]) continue;
    const e = f[x][y];
    if (!e || e.category !== METAL_CAT) { visited[x][y] = true; continue; }
    const comp = [];
    const stack = [{ x, y }];
    while (stack.length) {
      const p = stack.pop();
      if (p.x < 0 || p.x >= W || p.y < 0 || p.y >= H) continue;
      if (visited[p.x][p.y]) continue;
      const ce = f[p.x][p.y];
      if (!ce || ce.category !== METAL_CAT) continue;
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
