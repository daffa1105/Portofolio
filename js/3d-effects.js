/**
 * 3D Effects Engine — Portfolio (v2, fixed)
 * Hanya efek yang BENAR-BENAR bekerja tanpa konflik:
 * - Mouse tilt pada cards (skill, project, testimonial)
 * - Glow cursor
 * - Floating icon animasi
 * - Button 3D press
 * - Scroll-reveal yang tidak konflik dengan AOS
 */

(function () {
  'use strict';

  const lerp = (a, b, t) => a + (b - a) * t;
  const map  = (v, a, b, c, d) => c + ((v - a) / (b - a)) * (d - c);

  /* ══════════════════════════════════════════
     1. MOUSE-TILT CARDS
     skill-box, project-card, testimonial-card, quote-card
  ══════════════════════════════════════════ */
  function initTiltCards() {
    const sel   = '.skill-box, .testimonial-card, .quote-card';
    const cards = document.querySelectorAll(sel);

    cards.forEach(card => {
      let rect, animId, isHovered = false;
      let curX = 0, curY = 0, tarX = 0, tarY = 0;

      card.style.transformStyle = 'preserve-3d';
      card.style.willChange     = 'transform';

      // Shine overlay
      const shine = document.createElement('div');
      shine.style.cssText = `
        position:absolute;inset:0;border-radius:inherit;
        pointer-events:none;z-index:10;transition:background 0.1s ease;
      `;
      card.style.position = 'relative';
      card.style.overflow = 'visible';
      card.appendChild(shine);

      card.addEventListener('mouseenter', () => {
        isHovered = true;
        rect = card.getBoundingClientRect();
        card.style.transition = 'box-shadow 0.3s ease';
        animId = requestAnimationFrame(tick);
      });

      card.addEventListener('mousemove', e => {
        if (!rect) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        tarX = map(y, 0, rect.height, 12, -12);
        tarY = map(x, 0, rect.width, -12, 12);
        const px = (x / rect.width)  * 100;
        const py = (y / rect.height) * 100;
        shine.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,0.10) 0%, transparent 60%)`;
      });

      card.addEventListener('mouseleave', () => {
        isHovered = false;
        tarX = 0; tarY = 0;
        shine.style.background = 'transparent';
        cancelAnimationFrame(animId);
        card.style.transition = 'transform 0.6s cubic-bezier(0.22,1,0.36,1), box-shadow 0.6s ease';
        card.style.transform  = '';
        card.style.boxShadow  = '';
        curX = 0; curY = 0;
      });

      function tick() {
        curX = lerp(curX, tarX, 0.1);
        curY = lerp(curY, tarY, 0.1);
        card.style.transition = 'none';
        card.style.transform  = `perspective(800px) rotateX(${curX}deg) rotateY(${curY}deg) translateZ(6px)`;
        card.style.boxShadow  = `
          0 ${20 + Math.abs(curX)}px ${50 + Math.abs(curY)*2}px rgba(0,0,0,0.5),
          0 0 25px rgba(0,245,160,${0.05 + Math.abs(curX)*0.005}),
          ${-curY*0.4}px ${-curX*0.4}px 15px rgba(0,194,255,0.06)
        `;
        if (isHovered) animId = requestAnimationFrame(tick);
      }
    });
  }

  /* ══════════════════════════════════════════
     2. FLOATING 3D SKILL ICONS
  ══════════════════════════════════════════ */
  function initFloatingIcons() {
    document.querySelectorAll('.skill-box i, .skill-box .skill-icon').forEach((icon, i) => {
      icon.style.display         = 'inline-block';
      icon.style.animation       = `skillIconFloat ${2.5 + (i % 4) * 0.4}s ease-in-out infinite`;
      icon.style.animationDelay  = `${(i * 0.2) % 1.8}s`;
    });
  }

  /* ══════════════════════════════════════════
     3. BUTTON 3D PRESS
  ══════════════════════════════════════════ */
  function initButtons3D() {
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        btn.style.transition = 'transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s ease';
        btn.style.transform  = 'perspective(400px) translateZ(10px) translateY(-3px)';
      });
      btn.addEventListener('mousedown', () => {
        btn.style.transform = 'perspective(400px) translateZ(3px) translateY(1px)';
      });
      btn.addEventListener('mouseup', () => {
        btn.style.transform = 'perspective(400px) translateZ(10px) translateY(-3px)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transition = 'transform 0.4s cubic-bezier(0.22,1,0.36,1)';
        btn.style.transform  = '';
      });
    });
  }

  /* ══════════════════════════════════════════
     4. GLOW CURSOR
  ══════════════════════════════════════════ */
  function initGlowCursor() {
    if ('ontouchstart' in window) return;

    // Inject cursor styles
    const style = document.createElement('style');
    style.textContent = `
      .glow-dot {
        position:fixed;width:14px;height:14px;border-radius:50%;
        pointer-events:none;z-index:9999;mix-blend-mode:screen;
        background:radial-gradient(circle,rgba(0,245,160,0.9) 0%,rgba(0,194,255,0.4) 50%,transparent 70%);
        filter:blur(3px);transform:translate(-50%,-50%);
        transition:transform 0.1s ease,width 0.2s ease,height 0.2s ease;
      }
      .glow-ring {
        position:fixed;width:36px;height:36px;border-radius:50%;
        pointer-events:none;z-index:9998;
        border:1.5px solid rgba(0,245,160,0.5);
        transform:translate(-50%,-50%);
        box-shadow:0 0 12px rgba(0,245,160,0.2);
        transition:width 0.3s ease,height 0.3s ease,border-color 0.3s ease;
      }
    `;
    document.head.appendChild(style);

    const dot  = document.createElement('div'); dot.className  = 'glow-dot';
    const ring = document.createElement('div'); ring.className = 'glow-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mx = -100, my = -100, rx = -100, ry = -100;

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    // Expand on interactive elements
    document.querySelectorAll('a,button,.btn,.skill-box,.project-card,.testimonial-card,.contact-icon,.social-link').forEach(el => {
      el.addEventListener('mouseenter', () => {
        ring.style.width = '55px'; ring.style.height = '55px';
        ring.style.borderColor = 'rgba(0,245,160,0.8)';
        dot.style.transform = 'translate(-50%,-50%) scale(1.8)';
      });
      el.addEventListener('mouseleave', () => {
        ring.style.width = '36px'; ring.style.height = '36px';
        ring.style.borderColor = 'rgba(0,245,160,0.5)';
        dot.style.transform = 'translate(-50%,-50%) scale(1)';
      });
    });

    (function loop() {
      dot.style.left  = mx + 'px'; dot.style.top  = my + 'px';
      rx = lerp(rx, mx, 0.14);    ry = lerp(ry, my, 0.14);
      ring.style.left = rx + 'px'; ring.style.top  = ry + 'px';
      requestAnimationFrame(loop);
    })();
  }

  /* ══════════════════════════════════════════
     5. NAV LINK HOVER DEPTH
  ══════════════════════════════════════════ */
  function initNavDepth() {
    document.querySelectorAll('nav a').forEach(a => {
      a.addEventListener('mouseenter', () => {
        a.style.transition = 'transform 0.25s cubic-bezier(0.22,1,0.36,1), background 0.25s ease';
        a.style.transform  = 'perspective(300px) translateZ(6px) translateY(-2px)';
      });
      a.addEventListener('mouseleave', () => {
        a.style.transform = '';
      });
    });
  }

  /* ══════════════════════════════════════════
     6. CONTACT ICONS 3D HOVER
  ══════════════════════════════════════════ */
  function initContactIcons() {
    document.querySelectorAll('.contact-icon').forEach(icon => {
      icon.style.transition = 'transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease';
      icon.addEventListener('mouseenter', () => {
        icon.style.transform = 'perspective(200px) rotateY(20deg) rotateX(-10deg) translateZ(10px) scale(1.12)';
        icon.style.boxShadow = '0 10px 30px rgba(0,245,160,0.3)';
      });
      icon.addEventListener('mouseleave', () => {
        icon.style.transform = '';
        icon.style.boxShadow = '';
      });
    });
  }

  /* ══════════════════════════════════════════
     7. SOCIAL LINKS SPIN
  ══════════════════════════════════════════ */
  function initSocialLinks() {
    document.querySelectorAll('.social-link').forEach(link => {
      link.addEventListener('mouseenter', () => {
        link.style.transition = 'transform 0.5s cubic-bezier(0.22,1,0.36,1), background 0.3s ease, box-shadow 0.3s ease';
        link.style.transform  = 'perspective(200px) rotateY(360deg) translateZ(6px) scale(1.1)';
      });
      link.addEventListener('mouseleave', () => {
        link.style.transition = 'transform 0.4s ease';
        link.style.transform  = '';
      });
    });
  }

  /* ══════════════════════════════════════════
     8. H2 TILT ON HOVER
  ══════════════════════════════════════════ */
  function initHeadings() {
    document.querySelectorAll('h2').forEach(h2 => {
      h2.style.transition = 'transform 0.4s cubic-bezier(0.22,1,0.36,1), text-shadow 0.4s ease';
      h2.addEventListener('mouseenter', () => {
        h2.style.transform  = 'perspective(400px) rotateX(-6deg) translateZ(8px)';
        h2.style.textShadow = '0 8px 25px rgba(0,245,160,0.35), 0 0 50px rgba(0,194,255,0.15)';
      });
      h2.addEventListener('mouseleave', () => {
        h2.style.transform  = '';
        h2.style.textShadow = '';
      });
    });
  }

  /* ══════════════════════════════════════════
     9. PROJECT IMAGE HOVER LIFT
  ══════════════════════════════════════════ */
  function initProjectImages() {
    document.querySelectorAll('.project-card').forEach(card => {
      const img = card.querySelector('.project-image');
      if (!img) return;
      img.style.transition = 'transform 0.4s cubic-bezier(0.22,1,0.36,1)';
      card.addEventListener('mouseenter', () => {
        img.style.transform = 'scale(1.06)';
      });
      card.addEventListener('mouseleave', () => {
        img.style.transform = '';
      });
    });
  }

  /* ══════════════════════════════════════════
     10. TAG HOVER
  ══════════════════════════════════════════ */
  function initTags() {
    document.querySelectorAll('.tag').forEach(tag => {
      tag.style.display    = 'inline-block';
      tag.style.transition = 'transform 0.25s ease, background 0.25s ease, box-shadow 0.25s ease';
      tag.addEventListener('mouseenter', () => {
        tag.style.transform  = 'translateY(-3px)';
        tag.style.background = 'rgba(0,245,160,0.18)';
        tag.style.boxShadow  = '0 4px 12px rgba(0,245,160,0.2)';
      });
      tag.addEventListener('mouseleave', () => {
        tag.style.transform  = '';
        tag.style.background = '';
        tag.style.boxShadow  = '';
      });
    });
  }

  /* ══════════════════════════════════════════
     11. INJECT KEYFRAMES
  ══════════════════════════════════════════ */
  function injectKeyframes() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes skillIconFloat {
        0%,100% { transform: translateY(0) rotateZ(0deg) scale(1); }
        33%     { transform: translateY(-7px) rotateZ(4deg) scale(1.05); }
        66%     { transform: translateY(3px) rotateZ(-3deg) scale(0.98); }
      }

      /* h2 underline expand on hover */
      h2::after {
        transition: width 0.4s cubic-bezier(0.22,1,0.36,1) !important;
      }
      h2:hover::after {
        width: 100% !important;
      }

      /* Skill box hover text lift */
      .skill-box:hover h3 {
        color: #00F5A0;
        text-shadow: 0 0 16px rgba(0,245,160,0.5);
        transition: color 0.3s ease, text-shadow 0.3s ease;
      }

      /* Profile pic hover */
      .profile-pic {
        transition: transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease;
        cursor: default;
      }
      .profile-pic:hover {
        transform: translateY(-6px) scale(1.015) !important;
        box-shadow: 0 40px 100px rgba(0,0,0,0.6), 0 0 40px rgba(0,245,160,0.2) !important;
      }

      /* Testimonial card hover */
      .testimonial-card {
        transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), border-color 0.3s ease, box-shadow 0.3s ease;
      }
      .testimonial-card:hover {
        border-color: rgba(0,245,160,0.3) !important;
      }

      /* Custom scrollbar */
      ::-webkit-scrollbar { width: 5px; }
      ::-webkit-scrollbar-track { background: rgba(5,8,18,0.8); }
      ::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #00F5A0, #00C2FF);
        border-radius: 3px;
      }
    `;
    document.head.appendChild(style);
  }

  /* ══════════════════════════════════════════
     INIT
  ══════════════════════════════════════════ */
  function init() {
    injectKeyframes();
    initTiltCards();
    initFloatingIcons();
    initButtons3D();
    initGlowCursor();
    initNavDepth();
    initContactIcons();
    initSocialLinks();
    initHeadings();
    initProjectImages();
    initTags();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
