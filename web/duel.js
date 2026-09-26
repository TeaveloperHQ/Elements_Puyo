// 대전 엔진 — 아바타 HP/실드, 순수 outcome 계산, 서버 프로토콜 훅
//
// 서버 없이 로컬 mock 상태로 동작.
// 나중에 WebSocket 붙일 때는 DuelChannel 만 교체하면 됨 (send/onReceive 인터페이스 유지).

"use strict";

// ────────────────────────────────────────────────────────────────
// 데미지·회복·실드 계산 (순수 함수)
// ────────────────────────────────────────────────────────────────
// steps = 연쇄 스텝 배열.
// 각 step:
//   { chainIdx (1-based), fired: string[],
//     subsets: [{ cellIds, formula, isDiatomic, size }],
//     cellCounts: { molecule, diatomic, period, group, metal } }
function computeDuelOutcome(steps, avatarType) {
  const mod = AVATAR_TYPES[avatarType].modifiers;
  let attack = 0, heal = 0, shield = 0;

  for (const step of steps) {
    const chainMul = chainMultiplier(step.chainIdx);
    const simulBonus = 1 + 0.2 * Math.max(0, (step.fired?.length || 1) - 1);

    // 분자 (화합물 + 이원자) → 공격
    for (const s of (step.subsets || [])) {
      const cells = (s.cellIds && s.cellIds.size) || s.size || 0;
      const mBonus = massBonus(s);
      const val = cells * (5 + mBonus) * chainMul * simulBonus;
      attack += val * mod.attack;
    }

    const c = step.cellCounts || {};
    // 주기·족 → 회복
    if (c.period)  heal   += c.period * 6 * chainMul * simulBonus * mod.heal;
    if (c.group)   heal   += c.group  * 6 * chainMul * simulBonus * mod.heal;
    // 금속 결합 → 실드
    if (c.metal)   shield += c.metal  * 8 * chainMul * simulBonus * mod.shield;
  }

  return {
    attack: Math.round(attack),
    heal: Math.round(heal),
    shield: Math.round(shield),
  };
}

function chainMultiplier(n) {
  if (n <= 1) return 1.0;
  if (n === 2) return 1.5;
  if (n === 3) return 2.0;
  return 2.0 + 0.7 * (n - 3);
}

// 대략적 mass 보너스. subset.mass 있으면 사용, 없으면 formula 길이로 추정.
function massBonus(s) {
  if (typeof s.mass === "number") return Math.max(1, Math.round(s.mass / 15));
  const f = s.formula || "";
  return Math.min(10, Math.max(1, Math.round(f.length / 2)));
}

// ────────────────────────────────────────────────────────────────
// Avatar — HP + 실드 상태
// ────────────────────────────────────────────────────────────────
class Avatar {
  constructor({ type, name, maxHp }) {
    this.type = type;
    this.name = name || "익명";
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.shield = 0;
  }
  get typeDef() { return AVATAR_TYPES[this.type]; }
  isDead() { return this.hp <= 0; }

  applyDamage(dmg) {
    let blocked = 0, taken = 0;
    if (this.shield > 0) {
      const absorb = Math.min(this.shield, dmg);
      this.shield -= absorb;
      blocked = absorb;
      dmg -= absorb;
    }
    if (dmg > 0) {
      taken = Math.min(this.hp, dmg);
      this.hp -= taken;
    }
    return { blocked, taken };
  }
  applyHeal(amt) {
    const before = this.hp;
    this.hp = Math.min(this.maxHp, this.hp + amt);
    return this.hp - before;
  }
  applyShield(amt) {
    this.shield += amt;
    return amt;
  }
}

// ────────────────────────────────────────────────────────────────
// DuelChannel — 서버 통신 추상. 현재는 로컬 mock.
// 인터페이스: send(event), onReceive(fn)
// 나중에 WebSocket 붙일 때 이 클래스만 교체.
// ────────────────────────────────────────────────────────────────
class DuelChannel {
  constructor() { this._listeners = []; }
  send(event) {
    // 서버 연동 전: 로컬 로그
    if (typeof console !== "undefined") console.debug("[duel.send]", event);
  }
  onReceive(fn) { this._listeners.push(fn); }
  // 테스트용 — 외부에서 상대 이벤트 시뮬레이션할 때 사용
  _emit(event) { for (const fn of this._listeners) fn(event); }
}

// ────────────────────────────────────────────────────────────────
// DuelState — 로컬 자신 + 상대 상태 + 이벤트 라우팅
// ────────────────────────────────────────────────────────────────
class DuelState {
  constructor(self, opponent, channel = new DuelChannel()) {
    this.self = self;
    this.opponent = opponent;
    this.channel = channel;
    this.onSelfChange = null;
    this.onOpponentChange = null;
    this.onIncomingAttack = null;
    this.onOutgoingAttack = null;
    this.onEnd = null;

    this.channel.onReceive((ev) => this._handleIncoming(ev));
  }

  // 로컬 플레이어 연쇄 종료 시 호출.
  // steps: computeDuelOutcome 형식.
  submitLocalChain(steps) {
    if (!steps || steps.length === 0) return null;
    const outcome = computeDuelOutcome(steps, this.self.type);
    // 자기 자신에게 회복·실드 즉시 적용
    if (outcome.heal > 0) this.self.applyHeal(outcome.heal);
    if (outcome.shield > 0) this.self.applyShield(outcome.shield);
    // 상대에게 데미지 이벤트 송신
    if (outcome.attack > 0) {
      this.channel.send({
        type: "chain_outcome",
        from: this.self.name,
        attack: outcome.attack,
        ts: Date.now(),
      });
      if (this.onOutgoingAttack) this.onOutgoingAttack(outcome.attack);
    }
    if (this.onSelfChange) this.onSelfChange(this.self, outcome);
    this._checkEnd();
    return outcome;
  }

  _handleIncoming(ev) {
    if (!ev || ev.from === this.self.name) return;   // 자기 에코 무시
    if (ev.type === "chain_outcome" && ev.attack > 0) {
      const result = this.self.applyDamage(ev.attack);
      if (this.onIncomingAttack) this.onIncomingAttack(ev, result);
      if (this.onSelfChange) this.onSelfChange(this.self, null);
      this._checkEnd();
    } else if (ev.type === "opponent_state" && this.opponent) {
      // 상대 HP/실드 스냅샷 반영 (선택)
      if (typeof ev.hp === "number") this.opponent.hp = ev.hp;
      if (typeof ev.shield === "number") this.opponent.shield = ev.shield;
      if (this.onOpponentChange) this.onOpponentChange(this.opponent);
      this._checkEnd();
    }
  }

  _checkEnd() {
    if (this.self.isDead() || (this.opponent && this.opponent.isDead())) {
      if (this.onEnd) this.onEnd({
        selfDead: this.self.isDead(),
        oppDead: this.opponent && this.opponent.isDead(),
      });
    }
  }
}

// ────────────────────────────────────────────────────────────────
// 서버 프로토콜 (문서용, 실제 구현은 나중에)
// ────────────────────────────────────────────────────────────────
// 클라 → 서버 이벤트:
//   { type: "join_match", matchId, avatar: { type, name }, hpConfig }
//   { type: "chain_outcome", from, attack, ts }
//   { type: "state_snapshot", hp, shield, ts }   // 옵션: 주기적 상태 sync
//   { type: "leave" }
// 서버 → 클라 이벤트:
//   { type: "match_start", players: [{name, type, maxHp}], selfIdx }
//   { type: "chain_outcome", from, attack, ts }   // 상대 이벤트 릴레이
//   { type: "opponent_state", hp, shield }         // 옵션 sync
//   { type: "match_end", winner: name }
//
// 인터페이스는 그대로, 나중에 WebSocketDuelChannel 로 교체:
//   class WsDuelChannel extends DuelChannel {
//     constructor(url) { super(); this.ws = new WebSocket(url); ... }
//     send(ev) { this.ws.send(JSON.stringify(ev)); }
//   }
