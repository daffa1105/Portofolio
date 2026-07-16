(function () {
  const canvas = document.getElementById('tech-bg');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const C = {
    mint: [0, 245, 160],
    cyan: [0, 194, 255],
    violet: [124, 58, 237]
  };

  const CODE_CHARS = '01<>{}[];/=#$&';
  const UI_TAGS = ['</>', '{ }', 'API', 'UI', 'CSS', 'JS'];

  let width = 0;
  let height = 0;
  let nodes = [];
  let links = [];
  let pulses = [];
  let streams = [];
  let columns = [];
  let wireframes = [];
  let floatTags = [];
  let mouse = { x: 0.5, y: 0.5 };
  let smoothMouse = { x: 0.5, y: 0.5 };
  let frameId = 0;
  let gridOffset = 0;
  let nextPulseAt = 0;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function rgba(rgb, a) {
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})`;
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    buildNodes();
    rebuildLinks();
    buildStreams();
    buildColumns();
    buildWireframes();
    buildFloatTags();
    pulses = [];
  }

  function buildNodes() {
    const count = Math.min(48, Math.floor((width * height) / 24000));
    nodes = [];
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.88,
        vx: rand(-0.2, 0.2),
        vy: rand(-0.16, 0.16),
        r: rand(1.4, 3),
        pulse: Math.random() * Math.PI * 2,
        color: Math.random() < 0.5 ? C.mint : Math.random() < 0.85 ? C.cyan : C.violet
      });
    }
  }

  function rebuildLinks() {
    const maxDist = width < 768 ? 110 : 150;
    links = [];
    for (let i = 0; i < nodes.length; i++) {
      const nearest = [];
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (dist < maxDist) nearest.push({ j, dist });
      }
      nearest.sort((a, b) => a.dist - b.dist);
      nearest.slice(0, 3).forEach(({ j, dist }) => {
        if (i < j) links.push({ a: i, b: j, dist });
      });
    }
  }

  function buildStreams() {
    const count = reducedMotion ? 0 : Math.min(10, Math.floor(width / 140));
    streams = [];
    for (let i = 0; i < count; i++) {
      streams.push({
        x: rand(0, width),
        y: rand(-height, 0),
        speed: rand(1.5, 4),
        len: rand(60, 140),
        opacity: rand(0.2, 0.5),
        color: Math.random() < 0.6 ? C.cyan : C.mint,
        width: rand(1, 2.5)
      });
    }
  }

  function buildColumns() {
    const count = reducedMotion ? 0 : Math.min(14, Math.floor(width / 110));
    columns = [];
    for (let i = 0; i < count; i++) {
      const len = Math.floor(rand(6, 12));
      const chars = [];
      for (let j = 0; j < len; j++) {
        chars.push({
          char: CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)],
          opacity: rand(0.04, 0.28)
        });
      }
      columns.push({
        x: rand(0, width),
        y: rand(-400, 0),
        speed: rand(0.5, 1.4),
        chars,
        gap: Math.floor(rand(15, 20))
      });
    }
  }

  function buildWireframes() {
    const count = reducedMotion ? 2 : Math.min(6, Math.floor(width / 280));
    wireframes = [];
    for (let i = 0; i < count; i++) {
      wireframes.push({
        x: rand(0, width),
        y: rand(0, height * 0.7),
        w: rand(50, 110),
        h: rand(35, 75),
        rot: rand(0, Math.PI * 2),
        rotSpeed: rand(-0.003, 0.003),
        vx: rand(-0.12, 0.12),
        vy: rand(-0.08, 0.08),
        opacity: rand(0.06, 0.14),
        color: Math.random() < 0.5 ? C.cyan : C.mint
      });
    }
  }

  function buildFloatTags() {
    const count = reducedMotion ? 0 : Math.min(8, Math.floor(width / 200));
    floatTags = [];
    for (let i = 0; i < count; i++) {
      floatTags.push({
        text: UI_TAGS[Math.floor(Math.random() * UI_TAGS.length)],
        x: rand(0, width),
        y: rand(0, height),
        vx: rand(-0.08, 0.08),
        vy: rand(-0.06, 0.06),
        size: rand(10, 13),
        opacity: rand(0.08, 0.2),
        color: Math.random() < 0.5 ? C.mint : C.cyan
      });
    }
  }

  function spawnPulse(now) {
    if (reducedMotion || links.length === 0 || now < nextPulseAt) return;
    nextPulseAt = now + rand(400, 1200);
    const link = links[Math.floor(Math.random() * links.length)];
    pulses.push({
      link,
      t: 0,
      speed: rand(0.012, 0.028),
      color: Math.random() < 0.5 ? C.cyan : C.mint
    });
  }

  function drawHexGrid() {
    const size = 28;
    const hexH = size * Math.sqrt(3);
    const rows = Math.ceil((height * 0.45) / hexH) + 2;

    ctx.save();
    ctx.globalAlpha = 0.35;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < Math.ceil(width / (size * 1.5)) + 2; col++) {
        const offsetX = (row % 2) * (size * 0.75);
        const cx = col * size * 1.5 + offsetX;
        const cy = row * hexH * 0.85;
        if (cy > height * 0.5) continue;

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          const x = cx + size * 0.5 * Math.cos(angle);
          const y = cy + size * 0.5 * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = rgba(C.mint, 0.06 + (1 - cy / (height * 0.5)) * 0.04);
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawGrid(time) {
    const horizon = height * 0.36;
    const vanishX = width * 0.5 + (smoothMouse.x - 0.5) * 70;
    if (!reducedMotion) gridOffset = (gridOffset + 0.75) % 50;

    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = rgba(C.mint, 0.4);

    for (let i = 0; i < 26; i++) {
      const progress = ((i + gridOffset / 50) % 26) / 26;
      const t = progress;
      const y = horizon + (height - horizon + 50) * (t * t);
      const spread = (y - horizon) * (1.35 + t * 0.75);
      const alpha = 0.05 + t * 0.2;
      const isBright = t > 0.75;

      ctx.shadowBlur = isBright ? 14 : 4;
      ctx.beginPath();
      ctx.moveTo(vanishX - spread, y);
      ctx.lineTo(vanishX + spread, y);
      ctx.strokeStyle = rgba(isBright ? C.cyan : C.mint, alpha);
      ctx.lineWidth = isBright ? 1.4 : 0.8;
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    const vLines = 18;
    for (let i = -vLines; i <= vLines; i++) {
      const factor = i / vLines;
      const xEnd = vanishX + factor * width;
      const alpha = 0.04 + (1 - Math.abs(factor)) * 0.1;

      ctx.beginPath();
      ctx.moveTo(vanishX, horizon);
      ctx.lineTo(xEnd, height + 40);
      ctx.strokeStyle = rgba(C.cyan, alpha);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();

    const glow = ctx.createRadialGradient(vanishX, horizon, 0, vanishX, horizon, width * 0.4);
    glow.addColorStop(0, rgba(C.cyan, 0.18));
    glow.addColorStop(0.25, rgba(C.mint, 0.08));
    glow.addColorStop(0.6, rgba(C.violet, 0.03));
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  }

  function drawRadar(time) {
    if (reducedMotion) return;
    const horizon = height * 0.36;
    const vanishX = width * 0.5 + (smoothMouse.x - 0.5) * 70;
    const sweep = (time * 0.0006) % (Math.PI * 2);
    const radius = Math.min(width, height) * 0.55;

    ctx.save();
    ctx.translate(vanishX, horizon);
    ctx.rotate(sweep);
    const cone = ctx.createLinearGradient(0, 0, radius, 0);
    cone.addColorStop(0, rgba(C.cyan, 0.14));
    cone.addColorStop(0.4, rgba(C.mint, 0.05));
    cone.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, -0.35, 0.35);
    ctx.closePath();
    ctx.fillStyle = cone;
    ctx.fill();
    ctx.restore();
  }

  function drawWireframes() {
    for (const f of wireframes) {
      if (!reducedMotion) {
        f.x += f.vx;
        f.y += f.vy;
        f.rot += f.rotSpeed;
        if (f.x < -120 || f.x > width + 120) f.vx *= -1;
        if (f.y < -80 || f.y > height * 0.85) f.vy *= -1;
      }

      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rot);
      ctx.globalAlpha = f.opacity;
      ctx.strokeStyle = rgba(f.color, 0.7);
      ctx.lineWidth = 1;
      const r = 6;
      const hw = f.w / 2;
      const hh = f.h / 2;
      ctx.strokeRect(-hw, -hh, f.w, f.h);

      const corner = 10;
      [[-hw, -hh, 1, 1], [hw, -hh, -1, 1], [-hw, hh, 1, -1], [hw, hh, -1, -1]].forEach(([cx, cy, sx, sy]) => {
        ctx.beginPath();
        ctx.moveTo(cx, cy + sy * corner);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx + sx * corner, cy);
        ctx.stroke();
      });
      ctx.restore();
    }
  }

  function drawCodeRain() {
    ctx.textAlign = 'center';
    for (const col of columns) {
      if (!reducedMotion) col.y += col.speed;

      col.chars.forEach((ch, i) => {
        const y = col.y + i * col.gap;
        if (y < -20 || y > height + 20) return;

        const isHead = i === 0;
        const alpha = isHead ? 0.75 : ch.opacity * (1 - i / col.chars.length);
        ctx.font = `${isHead ? 12 : 10}px monospace`;
        ctx.fillStyle = isHead ? rgba(C.cyan, alpha) : rgba(C.mint, alpha);
        if (isHead) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = rgba(C.cyan, 0.8);
        }
        ctx.fillText(ch.char, col.x, y);
        ctx.shadowBlur = 0;

        if (!reducedMotion && Math.random() < 0.003) {
          ch.char = CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
        }
      });

      if (!reducedMotion && col.y > height + col.chars.length * col.gap) {
        col.y = rand(-350, -80);
        col.x = rand(0, width);
      }
    }
  }

  function drawStreams() {
    for (const s of streams) {
      ctx.save();
      ctx.shadowBlur = 12;
      ctx.shadowColor = rgba(s.color, 0.6);
      const grad = ctx.createLinearGradient(s.x, s.y, s.x, s.y + s.len);
      grad.addColorStop(0, rgba(s.color, 0));
      grad.addColorStop(0.35, rgba(s.color, s.opacity));
      grad.addColorStop(0.7, rgba(s.color, s.opacity * 0.6));
      grad.addColorStop(1, rgba(s.color, 0));
      ctx.strokeStyle = grad;
      ctx.lineWidth = s.width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x, s.y + s.len);
      ctx.stroke();
      ctx.restore();

      if (!reducedMotion) {
        s.y += s.speed;
        if (s.y > height + s.len) {
          s.y = rand(-180, -40);
          s.x = rand(0, width);
        }
      }
    }
  }

  function drawFloatTags() {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const tag of floatTags) {
      if (!reducedMotion) {
        tag.x += tag.vx;
        tag.y += tag.vy;
        if (tag.x < 0 || tag.x > width) tag.vx *= -1;
        if (tag.y < 0 || tag.y > height) tag.vy *= -1;
      }
      ctx.font = `600 ${tag.size}px Poppins, sans-serif`;
      ctx.fillStyle = rgba(tag.color, tag.opacity);
      ctx.fillText(tag.text, tag.x, tag.y);
    }
  }

  function drawNetwork(time) {
    const parallaxX = (smoothMouse.x - 0.5) * 24;
    const parallaxY = (smoothMouse.y - 0.5) * 14;

    for (const n of nodes) {
      if (!reducedMotion) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height * 0.92) n.vy *= -1;
      }
      n.pulse += 0.035;
    }

    for (const { a, b, dist } of links) {
      const n1 = nodes[a];
      const n2 = nodes[b];
      if (!n1 || !n2) continue;

      const x1 = n1.x + parallaxX * 0.12;
      const y1 = n1.y + parallaxY * 0.12;
      const x2 = n2.x + parallaxX * 0.12;
      const y2 = n2.y + parallaxY * 0.12;
      const alpha = (1 - dist / (width < 768 ? 110 : 150)) * 0.28;

      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, rgba(n1.color, alpha));
      grad.addColorStop(0.5, rgba(C.cyan, alpha * 0.8));
      grad.addColorStop(1, rgba(n2.color, alpha * 0.6));

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    pulses = pulses.filter((p) => p.t <= 1);
    for (const p of pulses) {
      const n1 = nodes[p.link.a];
      const n2 = nodes[p.link.b];
      if (!n1 || !n2) continue;
      const x = n1.x + (n2.x - n1.x) * p.t + parallaxX * 0.12;
      const y = n1.y + (n2.y - n1.y) * p.t + parallaxY * 0.12;

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = rgba(p.color, 0.95);
      ctx.shadowBlur = 16;
      ctx.shadowColor = rgba(p.color, 1);
      ctx.fill();
      ctx.shadowBlur = 0;

      p.t += p.speed;
    }

    for (const n of nodes) {
      const pulse = 0.55 + 0.45 * Math.sin(n.pulse);
      const px = n.x + parallaxX * 0.15;
      const py = n.y + parallaxY * 0.15;

      ctx.beginPath();
      ctx.arc(px, py, n.r * 3.5, 0, Math.PI * 2);
      ctx.fillStyle = rgba(n.color, 0.1 * pulse);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px, py, n.r * pulse, 0, Math.PI * 2);
      ctx.fillStyle = rgba(n.color, 0.9 * pulse);
      ctx.shadowBlur = 8;
      ctx.shadowColor = rgba(n.color, 0.7);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function drawMouseGlow() {
    const x = smoothMouse.x * width;
    const y = smoothMouse.y * height;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, 220);
    glow.addColorStop(0, rgba(C.cyan, 0.12));
    glow.addColorStop(0.4, rgba(C.mint, 0.05));
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  }

  function drawVignette() {
    const v = ctx.createRadialGradient(
      width * 0.5, height * 0.45, width * 0.15,
      width * 0.5, height * 0.5, width * 0.85
    );
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(0.7, 'rgba(0,0,0,0.15)');
    v.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, width, height);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function draw(time) {
    if (!reducedMotion) {
      smoothMouse.x = lerp(smoothMouse.x, mouse.x, 0.06);
      smoothMouse.y = lerp(smoothMouse.y, mouse.y, 0.06);
    }

    ctx.clearRect(0, 0, width, height);
    drawHexGrid();
    drawGrid(time);
    drawRadar(time);
    drawWireframes();
    drawCodeRain();
    drawStreams();
    drawFloatTags();
    drawNetwork(time);
    if (!reducedMotion) {
      drawMouseGlow();
      spawnPulse(time);
    }
    drawVignette();
    frameId = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  if (!reducedMotion) {
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = e.clientY / window.innerHeight;
    });
  }

  resize();
  if (reducedMotion) {
    drawHexGrid();
    drawGrid(0);
    drawNetwork(0);
    drawVignette();
  } else {
    frameId = requestAnimationFrame(draw);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(frameId);
    else if (!reducedMotion) frameId = requestAnimationFrame(draw);
  });
})();
