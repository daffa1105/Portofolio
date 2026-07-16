/**
 * ═══════════════════════════════════════════════════════════
 *  REALISTIC CROW — Canvas 2D Animation Engine
 *
 *  Menggambar gagak realistis menggunakan Canvas API:
 *  - Body shape berdasarkan proporsi gagak asli
 *  - Sayap dengan siklus kepak yang realistis (4 fase)
 *  - Bulu detail dengan strokes
 *  - Ekor berbentuk kipas
 *  - Mata dengan highlight
 *  - Jalur terbang melengkung alami (bezier)
 *  - Bertengger di sudut atas bingkai foto
 *  - Saat scroll → zoom ke layar seperti menyerang
 * ═══════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  /* ══ CONFIG ══ */
  const CFG = {
    FLY_IN_DELAY : 1800,   // ms sebelum mulai terbang masuk
    FLY_IN_DUR   : 3000,   // ms durasi terbang masuk
    PERCH_X      : 0,      // offset X dari sudut kanan atas foto (ditentukan runtime)
    PERCH_Y      : 0,      // offset Y
    WING_SPEED   : 0.18,   // kecepatan kepak (radian per frame)
    CROW_SCALE   : 1.0,    // ukuran crow
  };

  /* ══ STATE ══ */
  let canvas, ctx;
  let phase     = 'hidden';   // hidden → flying → perching → perched → attacking
  let t         = 0;          // animasi timer
  let wingsT    = 0;          // timer kepak
  let rafId     = null;
  let perchRect = null;       // posisi canvas dalam viewport
  let flyStart  = null;

  /* Posisi crow saat ini (canvas pixels) */
  let crow = { x: 0, y: 0, scale: 1, opacity: 0, rotation: 0 };

  /* Path terbang masuk: off-screen kanan → titik bertengger */
  let flyPath = { x0:0, y0:0, cx:0, cy:0, x1:0, y1:0 };

  /* ══════════════════════════════════════════
     GAMBAR CROW — fungsi utama
  ══════════════════════════════════════════ */

  /**
   * Menggambar gagak lengkap pada posisi (cx, cy)
   * wingAngle: sudut kepak sayap (radian), 0 = horizontal, + = atas, - = bawah
   * perched: jika true, gambar pose bertengger
   */
  function drawCrow(cx, cy, scale, wingAngle, perched, opacity) {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    if (perched) {
      drawPerchedCrow();
    } else {
      drawFlyingCrow(wingAngle);
    }

    ctx.restore();
  }

  /* ── Palette warna gagak ── */
  function crowGrad(x1, y1, x2, y2, color1, color2) {
    const g = ctx.createLinearGradient(x1, y1, x2, y2);
    g.addColorStop(0, color1);
    g.addColorStop(1, color2);
    return g;
  }

  /* ══ GAGAK TERBANG ══ */
  function drawFlyingCrow(wingAngle) {
    // Sayap atas (power stroke ke atas)
    const wa = wingAngle;   // 0..PI  (naik turun)

    /* ── SAYAP KIRI ── */
    ctx.save();
    ctx.rotate(-0.05);
    drawWing(-1, wa);
    ctx.restore();

    /* ── SAYAP KANAN (mirror) ── */
    ctx.save();
    ctx.scale(-1, 1);
    ctx.rotate(-0.05);
    drawWing(-1, wa);
    ctx.restore();

    /* ── BADAN ── */
    drawBody();

    /* ── EKOR ── */
    drawFlyingTail();

    /* ── KEPALA + PARUH ── */
    drawHead(12, -8, 0.18);  // offset sedikit ke depan
  }

  function drawWing(dir, wa) {
    // wa dari -1 (bawah) ke 1 (atas)
    // Wing shape: primary feathers lebih panjang di ujung

    const wUp = wa;  // -1..1

    ctx.save();
    // Putar dari root sayap
    ctx.rotate(wUp * 0.55);

    // Primary feathers (paling luar)
    const featherColors = ['#0a0a14', '#0d0d1a', '#111122', '#0a0a14'];
    const featherLengths = [85, 95, 100, 88, 72];
    const featherAngles  = [-0.15, -0.08, 0, 0.08, 0.15];

    featherAngles.forEach((fa, i) => {
      const fl = featherLengths[i] || 80;
      ctx.save();
      ctx.rotate(fa);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      // Bezier untuk bulu melengkung alami
      ctx.bezierCurveTo(
        fl * 0.35, wUp * 12,
        fl * 0.7,  wUp * 8,
        fl,        0
      );
      // Lebar bulu
      ctx.bezierCurveTo(
        fl * 0.7,  6,
        fl * 0.35, 10,
        0, 14
      );
      ctx.closePath();

      const g = ctx.createLinearGradient(0, 0, fl, 0);
      g.addColorStop(0, '#1a1a2e');
      g.addColorStop(0.4, '#0d0d1a');
      g.addColorStop(1, '#05050f');
      ctx.fillStyle = g;
      ctx.fill();

      // Kilap iridescent biru/hijau pada bulu
      if (i === 2 || i === 3) {
        const gi = ctx.createLinearGradient(fl*0.2, 0, fl*0.8, 10);
        gi.addColorStop(0, 'rgba(0,194,255,0)');
        gi.addColorStop(0.5, 'rgba(0,194,255,0.12)');
        gi.addColorStop(1, 'rgba(124,58,237,0.08)');
        ctx.fillStyle = gi;
        ctx.fill();
      }

      ctx.restore();
    });

    // Secondary feathers (dalam)
    for (let i = 0; i < 4; i++) {
      const sx = i * 14;
      const sl = 55 - i * 5;
      ctx.save();
      ctx.translate(sx * 0.3, 12 + i * 2);
      ctx.rotate(0.05 * i);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(sl*0.4, wUp*6, sl*0.7, wUp*4, sl, 2);
      ctx.bezierCurveTo(sl*0.7, 10, sl*0.4, 12, 0, 12);
      ctx.closePath();

      ctx.fillStyle = '#111122';
      ctx.fill();
      ctx.restore();
    }

    // Covert feathers (coverts — bulu penutup)
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(20, wUp * 8 + 5, 45, wUp * 6 + 8, 55, 16);
    ctx.bezierCurveTo(35, 22, 12, 20, 0, 16);
    ctx.closePath();
    ctx.fillStyle = '#1a1a2e';
    ctx.fill();

    ctx.restore();
  }

  function drawBody() {
    // Tubuh utama — oval memanjang
    ctx.beginPath();
    ctx.ellipse(0, 2, 28, 16, 0.12, 0, Math.PI * 2);

    const g = ctx.createRadialGradient(-5, -5, 2, 0, 0, 30);
    g.addColorStop(0, '#1e1e30');
    g.addColorStop(0.5, '#0d0d1a');
    g.addColorStop(1, '#05050e');
    ctx.fillStyle = g;
    ctx.fill();

    // Kilap tubuh
    ctx.beginPath();
    ctx.ellipse(-8, -4, 12, 6, -0.3, 0, Math.PI * 2);
    const gi = ctx.createRadialGradient(-8, -4, 0, -8, -4, 12);
    gi.addColorStop(0, 'rgba(0,194,255,0.14)');
    gi.addColorStop(1, 'rgba(0,194,255,0)');
    ctx.fillStyle = gi;
    ctx.fill();
  }

  function drawFlyingTail() {
    // Ekor berbentuk baji/kipas
    ctx.save();
    ctx.translate(-26, 8);

    for (let i = 0; i < 6; i++) {
      const angle = -0.3 + i * 0.12;
      const tLen  = 32 + Math.abs(i - 2.5) * (-2);

      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(tLen * 0.3, 3, tLen * 0.7, 3, tLen, 0);
      ctx.bezierCurveTo(tLen * 0.7, 6, tLen * 0.3, 6, 0, 6);
      ctx.closePath();

      const g = ctx.createLinearGradient(0, 0, tLen, 0);
      g.addColorStop(0, '#1a1a2e');
      g.addColorStop(1, '#05050e');
      ctx.fillStyle = g;
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  function drawHead(ox, oy, rot) {
    ctx.save();
    ctx.translate(ox, oy);
    ctx.rotate(rot);

    // Kepala
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 13, -0.1, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(-3, -4, 1, 0, 0, 16);
    g.addColorStop(0, '#20203a');
    g.addColorStop(0.6, '#0d0d1a');
    g.addColorStop(1, '#04040d');
    ctx.fillStyle = g;
    ctx.fill();

    // Mahkota kepala (sedikit terangkat)
    ctx.beginPath();
    ctx.ellipse(-2, -8, 8, 5, 0.1, 0, Math.PI * 2);
    ctx.fillStyle = '#141428';
    ctx.fill();

    // Paruh — kuat, melengkung ke bawah (seperti gagak asli)
    ctx.save();
    ctx.translate(13, -2);
    // Paruh atas
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(6, -1, 14, 1, 18, 4);
    ctx.bezierCurveTo(14, 2, 6, 2, 0, 4);
    ctx.closePath();
    ctx.fillStyle = '#111118';
    ctx.fill();
    // Paruh bawah
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.bezierCurveTo(5, 4, 13, 5, 16, 6);
    ctx.bezierCurveTo(11, 5, 5, 5, 0, 4);
    ctx.closePath();
    ctx.fillStyle = '#0a0a12';
    ctx.fill();
    // Celah paruh
    ctx.beginPath();
    ctx.moveTo(0, 3);
    ctx.lineTo(15, 5);
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.restore();

    // Mata — glowing amber/orange (gagak punya mata gelap dengan kilap)
    ctx.beginPath();
    ctx.arc(8, -3, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0810';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(8, -3, 3.2, 0, Math.PI * 2);
    ctx.fillStyle = '#1a0800';
    ctx.fill();

    // Iris gagak — gelap dengan sedikit coklat
    ctx.beginPath();
    ctx.arc(8, -3, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = '#3d1500';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(8, -3, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = '#1a0500';
    ctx.fill();

    // Highlight mata (spekuler)
    ctx.beginPath();
    ctx.arc(6.5, -4.5, 1.1, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,220,120,0.85)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(9, -2.5, 0.6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fill();

    // Bulu di sekitar mata (loral area)
    ctx.beginPath();
    ctx.ellipse(7, -3, 6, 5, -0.1, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(10,10,20,0.6)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.restore();
  }

  /* ══ GAGAK BERTENGGER ══ */
  function drawPerchedCrow() {
    // Pose bertengger: badan lebih tegak, ekor ke bawah, sayap terlipat

    ctx.save();
    ctx.rotate(-0.15);  // sedikit miring

    /* Sayap terlipat kiri */
    drawPerchedWing(-1);
    /* Sayap terlipat kanan */
    ctx.save();
    ctx.scale(-1, 1);
    drawPerchedWing(-1);
    ctx.restore();

    /* Badan tegak */
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 26, 0.0, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(-4, -8, 2, 0, 0, 28);
    g.addColorStop(0, '#20203a');
    g.addColorStop(0.5, '#0d0d1a');
    g.addColorStop(1, '#050510');
    ctx.fillStyle = g;
    ctx.fill();

    // Kilap badan
    ctx.beginPath();
    ctx.ellipse(-6, -10, 8, 5, -0.3, 0, Math.PI * 2);
    const gi = ctx.createRadialGradient(-6, -10, 0, -6, -10, 9);
    gi.addColorStop(0, 'rgba(0,194,255,0.12)');
    gi.addColorStop(1, 'rgba(0,194,255,0)');
    ctx.fillStyle = gi;
    ctx.fill();

    /* Ekor ke bawah */
    ctx.save();
    ctx.translate(0, 22);
    ctx.rotate(0.05);
    for (let i = 0; i < 5; i++) {
      const fa = -0.25 + i * 0.12;
      ctx.save();
      ctx.rotate(fa);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(2, 10, 2, 20, 0, 28);
      ctx.bezierCurveTo(-5, 20, -5, 10, 0, 0);
      ctx.closePath();
      const gf = ctx.createLinearGradient(0, 0, 0, 28);
      gf.addColorStop(0, '#1a1a2e');
      gf.addColorStop(1, '#04040e');
      ctx.fillStyle = gf;
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    /* Kepala */
    ctx.save();
    ctx.translate(0, -24);
    drawHead(0, 0, 0);
    ctx.restore();

    /* Kaki */
    drawFeet();

    ctx.restore();
  }

  function drawPerchedWing(dir) {
    // Sayap terlipat — tampak hanya dari sisi
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.bezierCurveTo(18, -10, 22, 0, 20, 14);
    ctx.bezierCurveTo(12, 20, 4, 22, 0, 22);
    ctx.bezierCurveTo(-2, 10, -2, -5, 0, -16);
    ctx.closePath();

    const g = ctx.createLinearGradient(0, -16, 20, 14);
    g.addColorStop(0, '#1a1a30');
    g.addColorStop(0.5, '#0d0d1a');
    g.addColorStop(1, '#060610');
    ctx.fillStyle = g;
    ctx.fill();

    // Detail bulu terlipat
    for (let i = 0; i < 5; i++) {
      const fy = -12 + i * 7;
      ctx.beginPath();
      ctx.moveTo(0, fy);
      ctx.bezierCurveTo(15, fy + 1, 20, fy + 3, 18 - i, fy + 5);
      ctx.strokeStyle = 'rgba(40,40,60,0.6)';
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }

    // Kilap iridescent
    const gi = ctx.createLinearGradient(4, -8, 20, 8);
    gi.addColorStop(0, 'rgba(0,194,255,0)');
    gi.addColorStop(0.5, 'rgba(0,194,255,0.10)');
    gi.addColorStop(1, 'rgba(124,58,237,0.06)');
    ctx.fillStyle = gi;
    ctx.fill();
  }

  function drawFeet() {
    ctx.save();
    ctx.translate(0, 26);

    // Kaki kiri
    ctx.save();
    ctx.translate(-7, 0);
    drawFoot();
    ctx.restore();

    // Kaki kanan
    ctx.save();
    ctx.translate(7, 0);
    drawFoot();
    ctx.restore();

    ctx.restore();
  }

  function drawFoot() {
    ctx.strokeStyle = '#0a0a14';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    // Tibia
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 10);
    ctx.stroke();

    // Jari-jari (3 depan + 1 belakang)
    const toes = [[10, 6], [6, 8], [0, 10], [-8, 7]];
    toes.forEach(([tx, ty]) => {
      ctx.beginPath();
      ctx.moveTo(0, 10);
      ctx.bezierCurveTo(tx*0.5, ty*0.5 + 8, tx, ty + 8, tx, ty + 8);
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }

  /* ══════════════════════════════════════════
     LOOP ANIMASI
  ══════════════════════════════════════════ */
  function loop(ts) {
    rafId = requestAnimationFrame(loop);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (phase === 'hidden') return;

    wingsT += CFG.WING_SPEED;

    if (phase === 'flying') {
      animateFlyIn(ts);
    } else if (phase === 'perching') {
      animatePerching(ts);
    } else if (phase === 'perched') {
      animatePerched(ts);
    } else if (phase === 'attacking') {
      animateAttack(ts);
    }
  }

  /* ── Terbang masuk ── */
  function animateFlyIn(ts) {
    if (!flyStart) flyStart = ts;
    const elapsed = ts - flyStart;
    const prog    = Math.min(elapsed / CFG.FLY_IN_DUR, 1);
    const ease    = easeOutCubic(prog);

    // Quadratic bezier
    const bx = bezierQ(flyPath.x0, flyPath.cx, flyPath.x1, ease);
    const by  = bezierQ(flyPath.y0, flyPath.cy, flyPath.y1, ease);

    // Rotasi sesuai arah gerak
    const dx  = bezierQ(flyPath.x0, flyPath.cx, flyPath.x1, Math.min(ease + 0.01, 1)) - bx;
    const dy  = bezierQ(flyPath.y0, flyPath.cy, flyPath.y1, Math.min(ease + 0.01, 1)) - by;
    const rot = Math.atan2(dy, dx) * 0.25;

    crow.x       = bx;
    crow.y       = by;
    crow.opacity = Math.min(prog * 3, 1);
    crow.rotation = rot;

    // Wing flap cepat saat terbang
    const wAngle = Math.sin(wingsT * 1.8) * 0.75;

    ctx.save();
    ctx.rotate(crow.rotation);
    drawCrow(crow.x, crow.y, 1.0, wAngle, false, crow.opacity);
    ctx.restore();

    if (prog >= 1) {
      phase    = 'perching';
      flyStart = null;
    }
  }

  /* ── Animasi mendarat (badan turun, sayap melambat) ── */
  function animatePerching(ts) {
    if (!flyStart) flyStart = ts;
    const elapsed = ts - flyStart;
    const prog    = Math.min(elapsed / 500, 1);

    // Sayap melambat
    const wAngle = Math.sin(wingsT * (1.8 - prog * 1.5)) * (0.75 - prog * 0.75);

    drawCrow(crow.x, crow.y + Math.sin(prog * Math.PI) * -8, 1.0,
             wAngle, prog > 0.5, prog > 0.5 ? prog : 1);

    if (prog >= 1) {
      phase    = 'perched';
      flyStart = null;
    }
  }

  /* ── Bertengger — idle dengan sesekali gerakan ── */
  function animatePerched(ts) {
    // Gerakan kecil: kepala tilt, ekor kibas
    const bobY  = Math.sin(ts * 0.0012) * 1.5;
    const tiltR = Math.sin(ts * 0.0008) * 0.04;

    ctx.save();
    ctx.translate(crow.x, crow.y + bobY);
    ctx.rotate(tiltR);
    drawCrow(0, 0, 1.0, 0, true, 1);
    ctx.restore();
  }

  /* ── Menyerang / terbang ke layar ── */
  let attackStart = null;
  function animateAttack(ts) {
    if (!attackStart) attackStart = ts;
    const elapsed = ts - attackStart;
    const prog    = Math.min(elapsed / 900, 1);
    const ease    = easeInCubic(prog);

    // Scale dari 1 ke 10 (menutupi layar)
    const sc = 1 + ease * 12;
    // Gerak ke tengah canvas
    const tx = crow.x + (canvas.width * 0.5 - crow.x) * ease;
    const ty = crow.y + (canvas.height * 0.5 - crow.y) * ease;
    // Opacity: fade out setelah 70%
    const op = prog < 0.7 ? 1 : 1 - (prog - 0.7) / 0.3;

    // Wing spread lebar saat menyerang
    const wAngle = Math.sin(wingsT * 2.5) * 0.9 + 0.2;

    drawCrow(tx, ty, sc, wAngle, false, op);

    if (prog >= 1) {
      cancelAnimationFrame(rafId);
    }
  }

  /* ══════════════════════════════════════════
     EASING + MATH
  ══════════════════════════════════════════ */
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInCubic(t)  { return t * t * t; }
  function bezierQ(p0, p1, p2, t) {
    return (1-t)*(1-t)*p0 + 2*(1-t)*t*p1 + t*t*p2;
  }

  /* ══════════════════════════════════════════
     SETUP CANVAS
  ══════════════════════════════════════════ */
  function setupCanvas() {
    canvas = document.createElement('canvas');
    canvas.id    = 'crow-canvas';
    canvas.style.cssText = `
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 8000;
    `;
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  /* ══════════════════════════════════════════
     HITUNG POSISI BERTENGGER
  ══════════════════════════════════════════ */
  function calcPerchPos() {
    const pic = document.getElementById('profile-pic');
    if (!pic) {
      // fallback
      return { x: window.innerWidth * 0.72, y: window.innerHeight * 0.2 };
    }
    const r = pic.getBoundingClientRect();
    return {
      x: r.right  - 30,   // sudut kanan
      y: r.top    + 10,   // tepat di atas bingkai
    };
  }

  /* ══════════════════════════════════════════
     START FLY-IN
  ══════════════════════════════════════════ */
  function startFlyIn() {
    const perch = calcPerchPos();

    // Mulai dari kanan layar, lebih tinggi
    flyPath.x0 = window.innerWidth + 120;
    flyPath.y0 = window.innerHeight * 0.1;
    // Control point untuk kurva alami
    flyPath.cx = window.innerWidth * 0.75;
    flyPath.cy = -60;
    // Tujuan: titik bertengger
    flyPath.x1 = perch.x;
    flyPath.y1 = perch.y;

    crow.x = flyPath.x0;
    crow.y = flyPath.y0;

    phase = 'flying';
  }

  /* ══════════════════════════════════════════
     DETEKSI SCROLL → SERANG LAYAR
  ══════════════════════════════════════════ */
  function observeHero() {
    const hero = document.getElementById('home') || document.querySelector('.hero');
    if (!hero) return;

    let hasAttacked = false;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting && phase === 'perched' && !hasAttacked) {
          hasAttacked = true;
          phase = 'attacking';

          // Overlay gelap
          const overlay = document.createElement('div');
          overlay.style.cssText = `
            position:fixed;inset:0;background:#000;
            z-index:7999;opacity:0;
            transition:opacity 0.35s ease;pointer-events:none;
          `;
          document.body.appendChild(overlay);
          setTimeout(() => { overlay.style.opacity = '0.85'; }, 500);
          setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 500);
          }, 950);
        }
      });
    }, { threshold: 0.2 });

    io.observe(hero);
  }

  /* ══════════════════════════════════════════
     MAIN INIT
  ══════════════════════════════════════════ */
  function init() {
    // Hapus crow SVG lama jika ada
    const oldWrap = document.getElementById('crow-wrap');
    if (oldWrap) oldWrap.innerHTML = '';

    setupCanvas();
    rafId = requestAnimationFrame(loop);

    setTimeout(() => {
      startFlyIn();
      observeHero();
    }, CFG.FLY_IN_DELAY);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
