/**
 * ══════════════════════════════════════════════════════════
 *  CHARACTER ANIMATION ENGINE — Portfolio Mascot
 *
 *  Karakter animasi yang:
 *  1. Berjalan dengan tangan dilipat (hero section)
 *  2. Mengibaskan tangan saat scroll ke About
 *  3. Mengetik saat di Skills
 *  4. Menunjuk saat di Portfolio
 *  5. Selebrasi saat di Contact
 *
 *  Menggunakan: CSS animasi murni (selalu bekerja)
 *  Enhancement: Lottie jika tersedia & CDN reachable
 * ══════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  /* ── Section → animation state ── */
  const SECTIONS = [
    { id: 'home',      state: 'walk',  speech: '👋 Hi, I\'m Daffa!' },
    { id: 'about',     state: 'wave',  speech: '😊 Nice to meet you!' },
    { id: 'skills',    state: 'code',  speech: '💻 I love to code!' },
    { id: 'portfolio', state: 'point', speech: '🚀 Check my work!' },
    { id: 'contact',   state: 'cheer', speech: '🎉 Let\'s collaborate!' },
  ];

  let currentState   = null;
  let lottieLib      = null;
  let lottieInst     = null;
  let lottieMode     = false;
  let speechTimer    = null;
  let widget         = null;

  /* ══════════════════════════════════════════
     SVG CHARACTER — Pure CSS animated SVG
     Setiap state mengubah animasi
  ══════════════════════════════════════════ */
  function buildSVGChar () {
    // Returns SVG string for the character
    // Colors follow the site's neon theme
    return `<svg viewBox="0 0 100 180" xmlns="http://www.w3.org/2000/svg"
      style="width:100%;height:100%;overflow:visible;">
      <defs>
        <radialGradient id="hg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#00F5A0"/>
          <stop offset="100%" stop-color="#00C2FF"/>
        </radialGradient>
        <radialGradient id="bg" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#00C2FF"/>
          <stop offset="100%" stop-color="#7C3AED"/>
        </radialGradient>
        <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#7C3AED"/>
          <stop offset="100%" stop-color="#00F5A0"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glow2">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <!-- Shadow glow under feet -->
      <ellipse cx="50" cy="178" rx="28" ry="5"
        fill="rgba(0,245,160,0.35)" filter="url(#glow2)">
        <animate attributeName="rx" values="28;22;28" dur="0.6s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.5;0.8;0.5" dur="0.6s" repeatCount="indefinite"/>
      </ellipse>

      <!-- ══ LEFT LEG ══ -->
      <g id="leg-l" transform-origin="50 130">
        <rect x="38" y="128" width="14" height="38" rx="7"
          fill="url(#lg)" filter="url(#glow)"/>
        <!-- Foot -->
        <ellipse cx="43" cy="167" rx="10" ry="5" fill="#00F5A0" filter="url(#glow)"/>
      </g>

      <!-- ══ RIGHT LEG ══ -->
      <g id="leg-r" transform-origin="50 130">
        <rect x="48" y="128" width="14" height="38" rx="7"
          fill="url(#lg)" filter="url(#glow)"/>
        <ellipse cx="57" cy="167" rx="10" ry="5" fill="#00F5A0" filter="url(#glow)"/>
      </g>

      <!-- ══ BODY ══ -->
      <g id="body" transform-origin="50 100">
        <rect x="27" y="80" width="46" height="55" rx="14"
          fill="url(#bg)" filter="url(#glow)"/>
        <!-- Chest detail / code lines -->
        <rect x="35" y="92" width="20" height="3" rx="2" fill="rgba(0,245,160,0.6)"/>
        <rect x="35" y="99" width="14" height="3" rx="2" fill="rgba(0,194,255,0.5)"/>
        <rect x="35" y="106" width="18" height="3" rx="2" fill="rgba(124,58,237,0.6)"/>
      </g>

      <!-- ══ LEFT ARM ══ -->
      <g id="arm-l" transform-origin="30 85">
        <rect x="12" y="83" width="17" height="38" rx="8"
          fill="url(#bg)" filter="url(#glow)"/>
        <!-- Hand -->
        <circle cx="20" cy="122" r="8" fill="url(#hg)" filter="url(#glow)"/>
      </g>

      <!-- ══ RIGHT ARM ══ -->
      <g id="arm-r" transform-origin="70 85">
        <rect x="71" y="83" width="17" height="38" rx="8"
          fill="url(#bg)" filter="url(#glow)"/>
        <!-- Hand -->
        <circle cx="80" cy="122" r="8" fill="url(#hg)" filter="url(#glow)"/>
      </g>

      <!-- ══ HEAD ══ -->
      <g id="head" transform-origin="50 45">
        <!-- Neck -->
        <rect x="44" y="70" width="12" height="14" rx="6"
          fill="url(#hg)" opacity="0.8"/>
        <!-- Head shape -->
        <ellipse cx="50" cy="45" rx="30" ry="32" fill="url(#hg)" filter="url(#glow)"/>
        <!-- Face highlight -->
        <ellipse cx="44" cy="35" rx="10" ry="8" fill="rgba(255,255,255,0.15)"/>
        <!-- Eyes -->
        <circle cx="38" cy="42" r="5" fill="#0B1020"/>
        <circle cx="62" cy="42" r="5" fill="#0B1020"/>
        <circle cx="40" cy="40" r="2" fill="rgba(0,245,160,0.9)"/>
        <circle cx="64" cy="40" r="2" fill="rgba(0,245,160,0.9)"/>
        <!-- Smile -->
        <path d="M 38 56 Q 50 66 62 56" stroke="#0B1020" stroke-width="3"
          fill="none" stroke-linecap="round"/>
        <!-- Ear detail -->
        <ellipse cx="20" cy="48" rx="5" ry="8" fill="url(#hg)" opacity="0.7"/>
        <ellipse cx="80" cy="48" rx="5" ry="8" fill="url(#hg)" opacity="0.7"/>
      </g>

      <!-- ══ HAIR / TOP ══ -->
      <ellipse cx="50" cy="17" rx="26" ry="10"
        fill="#00C2FF" opacity="0.7"/>
      <path d="M 30 18 Q 50 5 70 18" fill="#7C3AED" opacity="0.6"/>
    </svg>`;
  }

  /* ══════════════════════════════════════════
     CSS ANIMATIONS — injected per state
  ══════════════════════════════════════════ */
  const STATE_CSS = {
    walk: `
      /* Walking: legs alternate, arms swing opposite, body slight bob */
      #leg-l  { animation: legFwd 0.55s ease-in-out infinite; }
      #leg-r  { animation: legFwd 0.55s ease-in-out infinite 0.275s reverse; }
      #arm-l  { animation: armSwing 0.55s ease-in-out infinite 0.275s; }
      #arm-r  { animation: armSwing 0.55s ease-in-out infinite; }
      #body   { animation: bodyBob 0.55s ease-in-out infinite; }
      #head   { animation: headBob 0.55s ease-in-out infinite; }

      @keyframes legFwd {
        0%,100% { transform: rotate(-22deg); }
        50%     { transform: rotate(22deg); }
      }
      @keyframes armSwing {
        0%,100% { transform: rotate(-28deg); }
        50%     { transform: rotate(28deg); }
      }
      @keyframes bodyBob {
        0%,100% { transform: translateY(0); }
        50%     { transform: translateY(-3px); }
      }
      @keyframes headBob {
        0%,100% { transform: rotate(-3deg) translateY(0); }
        50%     { transform: rotate(3deg) translateY(-2px); }
      }
    `,

    wave: `
      /* Waving: right arm rapidly waves up, left arm tucked, legs slight sway */
      #leg-l  { animation: legSway 1.8s ease-in-out infinite; }
      #leg-r  { animation: legSway 1.8s ease-in-out infinite 0.9s; }
      #arm-l  { animation: armFold 2s ease-in-out infinite; }
      #arm-r  { animation: armWave 0.42s ease-in-out infinite; }
      #body   { animation: bodyBreath 2s ease-in-out infinite; }
      #head   { animation: headNod 1.5s ease-in-out infinite; }

      @keyframes legSway {
        0%,100% { transform: rotate(-5deg); }
        50%     { transform: rotate(5deg); }
      }
      @keyframes armFold {
        0%,100% { transform: rotate(20deg); }
        50%     { transform: rotate(25deg); }
      }
      @keyframes armWave {
        0%,100% { transform: rotate(-55deg) translateY(-8px); }
        50%     { transform: rotate(-10deg) translateY(-2px); }
      }
      @keyframes bodyBreath {
        0%,100% { transform: scaleY(1); }
        50%     { transform: scaleY(1.02); }
      }
      @keyframes headNod {
        0%,100% { transform: rotate(-5deg); }
        50%     { transform: rotate(5deg); }
      }
    `,

    code: `
      /* Coding: arms forward/down typing, head looks down, legs still */
      #leg-l  { animation: legStand 3s ease-in-out infinite; }
      #leg-r  { animation: legStand 3s ease-in-out infinite 1.5s; }
      #arm-l  { animation: armType 0.35s ease-in-out infinite; }
      #arm-r  { animation: armType 0.35s ease-in-out infinite 0.175s; }
      #body   { animation: bodyLean 2s ease-in-out infinite; }
      #head   { animation: headRead 1.5s ease-in-out infinite; }

      @keyframes legStand {
        0%,100% { transform: rotate(-2deg); }
        50%     { transform: rotate(2deg); }
      }
      @keyframes armType {
        0%,100% { transform: rotate(50deg); }
        50%     { transform: rotate(48deg) translateY(4px); }
      }
      @keyframes bodyLean {
        0%,100% { transform: rotate(-2deg); }
        50%     { transform: rotate(2deg); }
      }
      @keyframes headRead {
        0%,100% { transform: rotate(8deg) translateY(4px); }
        50%     { transform: rotate(10deg) translateY(6px); }
      }
    `,

    point: `
      /* Pointing: right arm extended forward/up, confident pose */
      #leg-l  { animation: legConfident 2s ease-in-out infinite; }
      #leg-r  { transform: rotate(8deg); }
      #arm-l  { animation: armHip 2s ease-in-out infinite; }
      #arm-r  { animation: armPoint 0.6s ease-in-out infinite; }
      #body   { animation: bodyPride 2s ease-in-out infinite; }
      #head   { animation: headUp 1.5s ease-in-out infinite; }

      @keyframes legConfident {
        0%,100% { transform: rotate(-5deg); }
        50%     { transform: rotate(3deg); }
      }
      @keyframes armHip {
        0%,100% { transform: rotate(35deg); }
        50%     { transform: rotate(40deg); }
      }
      @keyframes armPoint {
        0%,100% { transform: rotate(-65deg) translateY(-10px); }
        50%     { transform: rotate(-70deg) translateY(-12px); }
      }
      @keyframes bodyPride {
        0%,100% { transform: rotate(-1deg) translateY(0); }
        50%     { transform: rotate(1deg) translateY(-2px); }
      }
      @keyframes headUp {
        0%,100% { transform: rotate(-5deg) translateY(-2px); }
        50%     { transform: rotate(-3deg) translateY(-4px); }
      }
    `,

    cheer: `
      /* Cheering / celebrating: both arms up, jumping */
      #leg-l  { animation: legJump 0.5s ease-in-out infinite; }
      #leg-r  { animation: legJump 0.5s ease-in-out infinite 0.25s; }
      #arm-l  { animation: armCheerL 0.5s ease-in-out infinite; }
      #arm-r  { animation: armCheerR 0.5s ease-in-out infinite 0.15s; }
      #body   { animation: bodyJump 0.5s ease-in-out infinite; }
      #head   { animation: headCheer 0.5s ease-in-out infinite; }

      @keyframes legJump {
        0%,100% { transform: rotate(-5deg) translateY(0); }
        50%     { transform: rotate(-15deg) translateY(-8px); }
      }
      @keyframes armCheerL {
        0%,100% { transform: rotate(-50deg) translateY(-5px); }
        50%     { transform: rotate(-65deg) translateY(-12px); }
      }
      @keyframes armCheerR {
        0%,100% { transform: rotate(50deg) translateY(-5px); }
        50%     { transform: rotate(65deg) translateY(-12px); }
      }
      @keyframes bodyJump {
        0%,100% { transform: translateY(0) scaleY(1); }
        50%     { transform: translateY(-10px) scaleY(1.05); }
      }
      @keyframes headCheer {
        0%,100% { transform: rotate(-8deg) translateY(0); }
        50%     { transform: rotate(8deg) translateY(-6px); }
      }
    `,
  };

  let animStyleEl = null;
  function applyStateCSS (state) {
    if (!animStyleEl) {
      animStyleEl = document.createElement('style');
      animStyleEl.id = 'char-anim-state-css';
      document.head.appendChild(animStyleEl);
    }
    animStyleEl.textContent = STATE_CSS[state] || STATE_CSS.walk;
  }

  /* ══════════════════════════════════════════
     WIDGET STYLES
  ══════════════════════════════════════════ */
  function injectWidgetStyles () {
    const el = document.createElement('style');
    el.textContent = `
      /* ── Root widget ── */
      #char-widget {
        position: fixed;
        bottom: 22px;
        right: 22px;
        z-index: 9500;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;
        user-select: none;
      }
      #char-widget.side-left {
        right: auto;
        left: 22px;
        align-items: flex-start;
      }
      #char-widget.side-left .char-speech {
        border-radius: 16px 16px 16px 4px;
      }
      #char-widget.side-left .char-speech::after {
        right: auto;
        left: 20px;
      }
      #char-widget.is-hidden .char-stage,
      #char-widget.is-hidden .char-speech,
      #char-widget.is-hidden .char-shadow {
        display: none;
      }

      /* ── SVG Stage ── */
      .char-stage {
        width: 120px;
        height: 160px;
        cursor: pointer;
        position: relative;
        transition: transform 0.3s cubic-bezier(0.22,1,0.36,1);
        filter: drop-shadow(0 15px 30px rgba(0,245,160,0.25));
      }
      .char-stage:hover {
        transform: scale(1.07) translateY(-5px);
        filter: drop-shadow(0 20px 40px rgba(0,245,160,0.45));
      }

      /* Stage transition */
      .char-stage.exit {
        animation: stageExit 0.28s cubic-bezier(0.22,1,0.36,1) forwards;
      }
      .char-stage.enter {
        animation: stageEnter 0.45s cubic-bezier(0.22,1,0.36,1) forwards;
      }
      @keyframes stageExit {
        from { opacity:1; transform: translateX(0) scale(1); }
        to   { opacity:0; transform: translateX(45px) scale(0.8); }
      }
      @keyframes stageEnter {
        from { opacity:0; transform: translateX(-40px) scale(0.82); }
        to   { opacity:1; transform: translateX(0) scale(1); }
      }

      /* ── Ground glow ── */
      .char-shadow {
        width: 70px;
        height: 10px;
        background: radial-gradient(ellipse, rgba(0,245,160,0.5) 0%, transparent 70%);
        border-radius: 50%;
        margin: 0 auto;
        filter: blur(4px);
        align-self: center;
        animation: charShadow 0.55s ease-in-out infinite;
      }
      @keyframes charShadow {
        0%,100% { transform: scaleX(1);    opacity:0.6; }
        50%      { transform: scaleX(0.82); opacity:0.9; }
      }

      /* ── Speech bubble ── */
      .char-speech {
        position: relative;
        background: linear-gradient(135deg,
          rgba(11,16,32,0.95) 0%,
          rgba(5,12,28,0.95) 100%);
        border: 1px solid rgba(0,245,160,0.55);
        border-radius: 16px 16px 4px 16px;
        padding: 9px 15px;
        font-size: 0.8rem;
        font-weight: 600;
        color: #EAF7FF;
        white-space: nowrap;
        backdrop-filter: blur(16px);
        box-shadow:
          0 8px 30px rgba(0,0,0,0.4),
          0 0 25px rgba(0,245,160,0.12),
          inset 0 1px 0 rgba(255,255,255,0.07);
        opacity: 0;
        transform: translateY(10px) scale(0.9);
        pointer-events: none;
        transition:
          opacity 0.38s cubic-bezier(0.22,1,0.36,1),
          transform 0.38s cubic-bezier(0.22,1,0.36,1);
      }
      .char-speech.visible {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      .char-speech::after {
        content:'';
        position:absolute;
        bottom:-7px; right:18px;
        width:12px; height:12px;
        background:rgba(11,16,32,0.95);
        border-right:1px solid rgba(0,245,160,0.55);
        border-bottom:1px solid rgba(0,245,160,0.55);
        transform:rotate(45deg);
      }

      /* ── Toggle button ── */
      .char-btn {
        width:36px; height:36px;
        border-radius:50%;
        border:1px solid rgba(0,245,160,0.35);
        background:rgba(11,16,32,0.88);
        color:#00F5A0;
        font-size:0.9rem;
        cursor:pointer;
        backdrop-filter:blur(14px);
        transition:transform 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
        box-shadow:0 4px 15px rgba(0,0,0,0.35), 0 0 12px rgba(0,245,160,0.08);
        display:flex; align-items:center; justify-content:center;
        align-self:flex-end;
      }
      .char-btn:hover {
        transform:scale(1.12) rotate(20deg);
        background:rgba(0,245,160,0.18);
        box-shadow:0 8px 25px rgba(0,245,160,0.28);
      }

      /* ── Mobile ── */
      @media(max-width:600px){
        #char-widget{right:10px;bottom:10px;}
        .char-stage{width:90px;height:120px;}
        .char-speech{font-size:0.72rem;padding:7px 11px;}
      }
    `;
    document.head.appendChild(el);
  }

  /* ══════════════════════════════════════════
     BUILD DOM
  ══════════════════════════════════════════ */
  function buildWidget () {
    widget = document.createElement('div');
    widget.id = 'char-widget';
    widget.innerHTML = `
      <div class="char-speech" id="char-speech">
        <span id="char-speech-text"></span>
      </div>
      <div class="char-stage" id="char-stage">
        ${buildSVGChar()}
      </div>
      <div class="char-shadow"></div>
      <button class="char-btn" id="char-btn" title="Toggle mascot" aria-label="Toggle character">
        <i class="fas fa-robot"></i>
      </button>
    `;
    document.body.appendChild(widget);

    // Toggle
    document.getElementById('char-btn').addEventListener('click', () => {
      widget.classList.toggle('is-hidden');
    });

    // Click stage → show speech
    document.getElementById('char-stage').addEventListener('click', () => {
      const sec = SECTIONS.find(s => s.state === currentState) || SECTIONS[0];
      showSpeech(sec.speech);
    });
  }

  /* ══════════════════════════════════════════
     SPEECH BUBBLE
  ══════════════════════════════════════════ */
  function showSpeech (text) {
    const bubble = document.getElementById('char-speech');
    const span   = document.getElementById('char-speech-text');
    if (!bubble || !span) return;

    bubble.classList.remove('visible');
    clearTimeout(speechTimer);

    setTimeout(() => {
      span.textContent = text;
      bubble.classList.add('visible');
      speechTimer = setTimeout(() => bubble.classList.remove('visible'), 3500);
    }, 60);
  }

  /* ══════════════════════════════════════════
     SWITCH STATE  (with slide transition)
  ══════════════════════════════════════════ */
  function switchState (newState) {
    if (newState === currentState) return;

    const stage = document.getElementById('char-stage');
    if (!stage) return;

    // Exit animation
    stage.classList.remove('enter');
    stage.classList.add('exit');

    setTimeout(() => {
      // Apply new animation CSS
      applyStateCSS(newState);
      currentState = newState;

      // Enter animation
      stage.classList.remove('exit');
      stage.classList.add('enter');
      setTimeout(() => stage.classList.remove('enter'), 500);
    }, 290);
  }

  /* ══════════════════════════════════════════
     INTERSECTION OBSERVER
  ══════════════════════════════════════════ */
  function observeSections () {
    let lastIdx = -1;

    const io = new IntersectionObserver((entries) => {
      // Pick most-visible intersecting entry
      let best = null, bestR = 0;
      entries.forEach(e => {
        if (e.isIntersecting && e.intersectionRatio > bestR) {
          best = e; bestR = e.intersectionRatio;
        }
      });
      if (!best) return;

      const sectionId = best.target.id;
      const idx = SECTIONS.findIndex(s => s.id === sectionId);
      if (idx < 0 || idx === lastIdx) return;
      lastIdx = idx;

      const sec = SECTIONS[idx];

      // Switch character animation
      switchState(sec.state);

      // Show speech bubble (slight delay after slide-in)
      setTimeout(() => showSpeech(sec.speech), 400);

      // Alternate side: even = right, odd = left
      if (idx % 2 === 0) {
        widget.classList.remove('side-left');
      } else {
        widget.classList.add('side-left');
      }

    }, { threshold: [0.3, 0.6] });

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  /* ══════════════════════════════════════════
     INIT
  ══════════════════════════════════════════ */
  function init () {
    injectWidgetStyles();
    buildWidget();

    // Start with walking state
    applyStateCSS('walk');
    currentState = 'walk';

    // Welcome speech after 1s
    setTimeout(() => showSpeech("👋 Hi, I'm Daffa!"), 1100);

    // Observe sections
    observeSections();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
