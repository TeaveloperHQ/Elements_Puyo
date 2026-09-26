// Web Audio 절차 생성 사운드 엔진
// - BGM: 랭크(레벨)별 스케일·템포·음색 변화
// - SFX: 착지 / 규칙별 소거 / 연쇄 / 승급 / 게임오버
// 외부 음원 파일 없음 — 라이선스 걱정 없이 무한 재생.
//
// 브라우저 자동재생 정책상 첫 유저 입력에서 AudioContext 를 깨워야 함.
// game.js 의 첫 keydown 에서 audio.unlock() 호출.

const AudioEngine = (() => {
  let ctx = null;
  let master = null;
  let bgmGain = null;
  let sfxGain = null;
  let bgmTimer = null;
  let bgmStep = 0;
  let bgmLevel = 1;
  let muted = false;
  let bgmMuted = false;

  // ── 스케일 (각 랭크 시대의 분위기) ─────────────────────
  // 반음 오프셋 (반음 = 1) 기준. 실제 주파수는 base * 2^(semitone/12)
  const SCALES = {
    // 고대·중세 연금술 (신비): D 도리안
    ancient:   { root: "D3",  intervals: [0, 2, 3, 5, 7, 9, 10, 12], tempo: 380, wave: "triangle", detune: 0 },
    // 근세 초기 (Boyle, Lavoisier): C 장조
    classical: { root: "C3",  intervals: [0, 2, 4, 5, 7, 9, 11, 12], tempo: 340, wave: "triangle", detune: 0 },
    // 원자설 (Dalton, Avogadro): F 장조
    atomic:    { root: "F3",  intervals: [0, 2, 4, 5, 7, 9, 11, 12], tempo: 310, wave: "sine",     detune: 0 },
    // 주기율 (Mendeleev): G 믹솔리디안
    periodic:  { root: "G3",  intervals: [0, 2, 4, 5, 7, 9, 10, 12], tempo: 300, wave: "square",   detune: 0 },
    // 방사능 (Curie, Rutherford): A 단조
    radio:     { root: "A2",  intervals: [0, 2, 3, 5, 7, 8, 10, 12], tempo: 280, wave: "sawtooth", detune: -3 },
    // 양자 (Bohr, Pauling): B 리디안
    quantum:   { root: "B2",  intervals: [0, 2, 4, 6, 7, 9, 11, 12], tempo: 260, wave: "sine",     detune: 4 },
  };

  const LEVEL_TO_SCALE = [
    "ancient",   // 1 Zosimos
    "ancient",   // 2 Jabir
    "classical", // 3 Paracelsus
    "classical", // 4 Boyle
    "atomic",    // 5 Lavoisier
    "atomic",    // 6 Dalton
    "atomic",    // 7 Avogadro
    "periodic",  // 8 Mendeleev
    "radio",     // 9 Curie
    "radio",     // 10 Rutherford
    "quantum",   // 11 Bohr
    "quantum",   // 12 Pauling
  ];

  // ── 노트 유틸 ─────────────────────────────────────
  const NOTE_MAP = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 };
  function noteToFreq(note) {
    // "A4", "C#5", "Bb3"
    const m = /^([A-G])(#|b)?(-?\d)$/.exec(note);
    if (!m) return 440;
    let n = NOTE_MAP[m[1]];
    if (m[2] === "#") n += 1; else if (m[2] === "b") n -= 1;
    const midi = n + (parseInt(m[3], 10) + 1) * 12;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }
  function shift(rootFreq, semitones) {
    return rootFreq * Math.pow(2, semitones / 12);
  }

  // ── 초기화 (첫 유저 입력에서 호출) ────────────────
  function unlock() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.warn("AudioContext unavailable", e);
        return;
      }
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.9;
      master.connect(ctx.destination);

      bgmGain = ctx.createGain();
      bgmGain.gain.value = bgmMuted ? 0 : 0.35;
      bgmGain.connect(master);

      sfxGain = ctx.createGain();
      sfxGain.gain.value = 0.6;
      sfxGain.connect(master);
    }
    // 브라우저 자동재생 정책: ctx 가 suspended 상태로 만들어짐 → resume 은 비동기.
    // BGM 시작은 반드시 resume 완료 후에 스케줄해야 첫 노트가 씹히지 않음.
    const startBgmIfNeeded = () => {
      if (!bgmTimer && !bgmMuted) startBgm(bgmLevel);
    };
    if (ctx.state === "suspended") {
      ctx.resume().then(startBgmIfNeeded).catch(() => startBgmIfNeeded());
    } else {
      startBgmIfNeeded();
    }
  }

  // ── SFX/BGM 톤 헬퍼 ───────────────────────────────
  // dest: sfxGain(기본) 또는 bgmGain
  function tone(freq, duration, opts = {}) {
    if (!ctx) return;
    const { wave = "sine", attack = 0.005, release = 0.08, gain = 0.5, pan = 0, detune = 0, dest = sfxGain } = opts;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = wave;
    osc.frequency.value = freq;
    if (detune) osc.detune.value = detune;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(gain, now + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration + release);
    const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (p) p.pan.value = pan;
    osc.connect(g);
    if (p) { g.connect(p); p.connect(dest); } else { g.connect(dest); }
    osc.start(now);
    osc.stop(now + duration + release + 0.05);
  }

  // 노이즈 버스트 (금속 결합 clang)
  function noiseBurst(duration, opts = {}) {
    if (!ctx) return;
    const { gain = 0.35, filter = 1400, filterQ = 6, release = 0.15 } = opts;
    const now = ctx.currentTime;
    const bufSize = Math.floor(ctx.sampleRate * duration);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = filter;
    bp.Q.value = filterQ;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration + release);
    src.connect(bp); bp.connect(g); g.connect(sfxGain);
    src.start(now);
    src.stop(now + duration);
  }

  // ── 이벤트별 사운드 ─────────────────────────────
  function playLand() {
    if (!ctx) return;
    tone(140, 0.06, { wave: "sine", gain: 0.35, release: 0.06 });
    tone(80,  0.08, { wave: "triangle", gain: 0.25 });
  }
  function playMove() {
    if (!ctx) return;
    tone(600, 0.03, { wave: "square", gain: 0.08, release: 0.02 });
  }
  // 규칙별 소거 사운드 (5종)
  function playClear(rule, chain = 1) {
    if (!ctx) return;
    // 연쇄에 따라 pitch shift up
    const chainSemi = Math.min(chain - 1, 6) * 2;
    const s = (n) => shift(n, chainSemi);
    switch (rule) {
      case "molecule": {   // 밝은 종소리 (major triad)
        const now = ctx.currentTime;
        tone(s(noteToFreq("C5")), 0.25, { wave: "triangle", gain: 0.35 });
        setTimeout(() => tone(s(noteToFreq("E5")), 0.25, { wave: "triangle", gain: 0.3 }), 40);
        setTimeout(() => tone(s(noteToFreq("G5")), 0.35, { wave: "triangle", gain: 0.28 }), 80);
        return;
      }
      case "diatomic": {   // 두 음 chirp
        tone(s(noteToFreq("D5")), 0.12, { wave: "sine", gain: 0.32 });
        setTimeout(() => tone(s(noteToFreq("A5")), 0.18, { wave: "sine", gain: 0.28 }), 80);
        return;
      }
      case "period": {     // 가로: 오름 4음 아르페지오
        [0, 2, 4, 7].forEach((iv, i) => {
          setTimeout(() => tone(s(noteToFreq("E5")) * Math.pow(2, iv / 12), 0.15, { wave: "triangle", gain: 0.28 }), i * 55);
        });
        return;
      }
      case "group": {      // 세로: 오름 5도 아르페지오
        [0, 7, 12, 16].forEach((iv, i) => {
          setTimeout(() => tone(s(noteToFreq("F5")) * Math.pow(2, iv / 12), 0.18, { wave: "square", gain: 0.22 }), i * 45);
        });
        return;
      }
      case "metal": {      // 금속 clang
        noiseBurst(0.18, { gain: 0.4, filter: 1800, filterQ: 8 });
        setTimeout(() => tone(s(noteToFreq("G3")), 0.25, { wave: "sawtooth", gain: 0.22 }), 20);
        setTimeout(() => tone(s(noteToFreq("D4")), 0.22, { wave: "sawtooth", gain: 0.18 }), 40);
        return;
      }
      default:
        tone(s(noteToFreq("C5")), 0.2, { wave: "triangle", gain: 0.3 });
    }
  }
  function playChain(chain) {
    if (!ctx || chain < 2) return;
    const freq = noteToFreq("C4") * Math.pow(2, Math.min(chain - 1, 6) / 12 * 2);
    tone(freq, 0.14, { wave: "triangle", gain: 0.3 });
    setTimeout(() => tone(freq * 1.5, 0.16, { wave: "triangle", gain: 0.25 }), 60);
  }
  function playLevelUp() {
    if (!ctx) return;
    // I - IV - V - I fanfare (in C)
    const notes = ["C5", "F5", "G5", "C6"];
    notes.forEach((n, i) => {
      setTimeout(() => {
        tone(noteToFreq(n),      0.28, { wave: "triangle", gain: 0.35 });
        tone(noteToFreq(n) * 0.5,0.32, { wave: "sine",     gain: 0.18 });
      }, i * 130);
    });
    // sparkle
    setTimeout(() => {
      [1, 1.25, 1.5, 2].forEach((r, i) => setTimeout(() => tone(1200 * r, 0.08, { wave: "sine", gain: 0.15 }), i * 40));
    }, 560);
  }
  function playGameOver() {
    if (!ctx) return;
    const notes = ["G4", "E4", "C4", "A3"];
    notes.forEach((n, i) => {
      setTimeout(() => tone(noteToFreq(n), 0.35, { wave: "sawtooth", gain: 0.28, detune: -8 }), i * 180);
    });
  }
  function playNewGame() {
    if (!ctx) return;
    tone(noteToFreq("C5"), 0.12, { wave: "triangle", gain: 0.3 });
    setTimeout(() => tone(noteToFreq("G5"), 0.16, { wave: "triangle", gain: 0.28 }), 80);
  }

  // ── BGM 루프 ─────────────────────────────────────
  // 각 스케일의 8음 패턴을 tempo(ms/step) 로 반복. 낮은 음 위주 + 하이라이트.
  function startBgm(level) {
    stopBgm();
    if (!ctx) return;
    bgmLevel = level;
    const key = LEVEL_TO_SCALE[Math.min(level - 1, LEVEL_TO_SCALE.length - 1)];
    const scale = SCALES[key];
    const rootF = noteToFreq(scale.root);
    // 8음 패턴 인덱스 시퀀스 (스케일 인덱스). 시대별 조금씩 다르게.
    const patternSet = {
      ancient:   [0, 3, 5, 3, 4, 2, 0, 3],
      classical: [0, 2, 4, 2, 3, 4, 5, 4],
      atomic:    [0, 4, 7, 4, 3, 5, 4, 2],
      periodic:  [0, 2, 4, 5, 7, 5, 4, 2],
      radio:     [0, 3, 5, 3, 2, 4, 7, 4],
      quantum:   [0, 4, 7, 5, 6, 3, 4, 2],
    };
    const pattern = patternSet[key];
    bgmStep = 0;
    const step = () => {
      if (!ctx || bgmMuted) return;
      const idx = pattern[bgmStep % pattern.length];
      const semi = scale.intervals[idx];
      const f = shift(rootF, semi + scale.detune);
      // 메인 톤 (BGM 게인으로 라우팅)
      tone(f, scale.tempo / 1000 * 0.9, {
        wave: scale.wave, gain: 0.28, attack: 0.02, release: 0.06, dest: bgmGain,
      });
      // 4스텝마다 옥타브 위 하이라이트
      if (bgmStep % 4 === 0) {
        tone(f * 2, scale.tempo / 1000 * 0.6, { wave: "sine", gain: 0.14, attack: 0.02, release: 0.08, dest: bgmGain });
      }
      // 8스텝마다 옥타브 아래 베이스
      if (bgmStep % 8 === 0) {
        tone(f * 0.5, scale.tempo / 1000 * 2.5, { wave: "sine", gain: 0.18, attack: 0.05, release: 0.1, dest: bgmGain });
      }
      bgmStep++;
    };
    step();
    bgmTimer = setInterval(step, SCALES[key].tempo);
  }
  function stopBgm() {
    if (bgmTimer) { clearInterval(bgmTimer); bgmTimer = null; }
  }
  function switchBgm(level) {
    if (level === bgmLevel && bgmTimer) return;
    startBgm(level);
  }

  // ── 뮤트 토글 ─────────────────────────────────────
  function toggleMuteAll() {
    muted = !muted;
    if (master) master.gain.value = muted ? 0 : 0.7;
    return muted;
  }
  function toggleMuteBgm() {
    bgmMuted = !bgmMuted;
    if (bgmGain) bgmGain.gain.value = bgmMuted ? 0 : 0.12;
    if (bgmMuted) stopBgm();
    else startBgm(bgmLevel);
    return bgmMuted;
  }
  function isMuted() { return muted; }
  function isBgmMuted() { return bgmMuted; }

  return {
    unlock,
    playLand, playMove, playClear, playChain,
    playLevelUp, playGameOver, playNewGame,
    startBgm, stopBgm, switchBgm,
    toggleMuteAll, toggleMuteBgm,
    isMuted, isBgmMuted,
  };
})();

// 전역 별칭
const audio = AudioEngine;
