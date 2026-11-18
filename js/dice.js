/* ==========================================================================
   CONTOS DE RUNETERRA — runeterra-dice.js   (DADOS 3D)
   Dados d3, d4, d6, d8, d10, d12 e d20 desenhados em 3D no canvas, sem
   bibliotecas (mesmo motor da ficha Persona — Phobia), com o visual de cada
   modalidade: cristal hextec, cartas de anime ou vidro estelar.
   • Botão flutuante abre o painel: testes de atributo (1d20 + atributo),
     Trocando Golpes, dados livres, fórmula e histórico.
   • O selo d20 em cada atributo rola o teste direto.
   API: RxDice.roll('1d20+3', 'TESTE DE FOR', { mode:'vant', forced:[14] })
   ========================================================================== */
(function () {
  'use strict';
  if (window.RxDice) return;

  /* ---------- álgebra ---------- */
  function v3(x, y, z) { return [x, y, z]; }
  function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function mulS(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function len(a) { return Math.sqrt(dot(a, a)); }
  function norm(a) { var l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function matAxis(ax, t) {
    ax = norm(ax); var c = Math.cos(t), s = Math.sin(t), C = 1 - c, x = ax[0], y = ax[1], z = ax[2];
    return [x * x * C + c, x * y * C - z * s, x * z * C + y * s, y * x * C + z * s, y * y * C + c, y * z * C - x * s, z * x * C - y * s, z * y * C + x * s, z * z * C + c];
  }
  function matMul(a, b) {
    var r = [];
    for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) r[i * 3 + j] = a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j];
    return r;
  }
  function apply(m, p) { return [m[0] * p[0] + m[1] * p[1] + m[2] * p[2], m[3] * p[0] + m[4] * p[1] + m[5] * p[2], m[6] * p[0] + m[7] * p[1] + m[8] * p[2]]; }
  var I3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];

  /* ---------- sólidos ---------- */
  function polyFrom(verts, normals) {
    verts = verts.map(function (v) { return norm(v); });
    var faces = normals.map(function (n) {
      n = norm(n);
      var md = -9; verts.forEach(function (v) { md = Math.max(md, dot(v, n)); });
      var idx = []; verts.forEach(function (v, i) { if (dot(v, n) > md - 1e-4) idx.push(i); });
      return face(verts, idx, n);
    });
    return { verts: verts, faces: faces };
  }
  function face(verts, idx, n) {
    var c = [0, 0, 0]; idx.forEach(function (i) { c = add(c, verts[i]); }); c = mulS(c, 1 / idx.length);
    if (!n) { /* normal pelo método de Newell */
      var nn = [0, 0, 0];
      for (var k = 0; k < idx.length; k++) { var a = verts[idx[k]], b = verts[idx[(k + 1) % idx.length]]; nn = add(nn, [(a[1] - b[1]) * (a[2] + b[2]), (a[2] - b[2]) * (a[0] + b[0]), (a[0] - b[0]) * (a[1] + b[1])]); }
      n = norm(nn); if (dot(n, c) < 0) n = mulS(n, -1);
    }
    var ax = norm(Math.abs(n[0]) < .9 ? cross(n, [1, 0, 0]) : cross(n, [0, 1, 0])), bx = cross(n, ax);
    idx = idx.slice().sort(function (i, j) { var p = sub(verts[i], c), q = sub(verts[j], c); return Math.atan2(dot(p, bx), dot(p, ax)) - Math.atan2(dot(q, bx), dot(q, ax)); });
    var up = norm(sub(verts[idx[0]], c));
    var inr = 9; idx.forEach(function (i, k) { var a = verts[i], b = verts[idx[(k + 1) % idx.length]]; var m = mulS(add(a, b), .5); inr = Math.min(inr, len(sub(m, c))); });
    return { idx: idx, n: n, c: c, up: up, right: cross(up, n), inr: inr };
  }
  var PHI = (1 + Math.sqrt(5)) / 2;
  var ICO = [[-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0], [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI], [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1]];
  var DOD = (function () {
    var o = [], s = [-1, 1];
    s.forEach(function (a) { s.forEach(function (b) { s.forEach(function (c) { o.push([a, b, c]); }); }); });
    s.forEach(function (a) { s.forEach(function (b) { o.push([0, a * PHI, b / PHI]); o.push([a / PHI, 0, b * PHI]); o.push([a * PHI, b / PHI, 0]); }); });
    return o;
  })();
  var CUBE = [], OCTA = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  [-1, 1].forEach(function (a) { [-1, 1].forEach(function (b) { [-1, 1].forEach(function (c) { CUBE.push([a, b, c]); }); }); });
  function d10() {
    var h = 1, f = function (z0) {
      var T = [0, 0, h], R = function (k) { var a = k * Math.PI / 5; return [Math.cos(a), Math.sin(a), k % 2 ? -z0 : z0]; };
      return dot(sub(R(1), T), cross(sub(R(0), T), sub(R(2), T)));
    };
    var lo = 0.001, hi = 0.99; for (var i = 0; i < 60; i++) { var m = (lo + hi) / 2; if (f(lo) * f(m) <= 0) hi = m; else lo = m; }
    var z0 = (lo + hi) / 2, verts = [[0, 0, h], [0, 0, -h]];
    for (var k = 0; k < 10; k++) { var a = k * Math.PI / 5; verts.push([Math.cos(a), Math.sin(a), k % 2 ? -z0 : z0]); }
    var R = function (k) { return 2 + ((k % 10) + 10) % 10; }, faces = [];
    for (var j = 0; j < 5; j++) { faces.push(face(verts, [0, R(2 * j), R(2 * j + 1), R(2 * j + 2)])); faces.push(face(verts, [1, R(2 * j + 1), R(2 * j + 2), R(2 * j + 3)])); }
    var mx = 0; verts.forEach(function (v) { mx = Math.max(mx, len(v)); });
    verts = verts.map(function (v) { return mulS(v, 1 / mx); });
    faces = faces.map(function (fc) { return face(verts, fc.idx); });
    return { verts: verts, faces: faces };
  }
  var SHAPES = {};
  function shape(sides) {
    if (SHAPES[sides]) return SHAPES[sides];
    var s;
    if (sides === 4) { var T = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]]; s = polyFrom(T, T.map(function (v) { return mulS(v, -1); })); }
    else if (sides === 6) s = polyFrom(CUBE, OCTA);
    else if (sides === 8) s = polyFrom(OCTA, CUBE);
    else if (sides === 10) s = d10();
    else if (sides === 12) s = polyFrom(DOD, ICO);
    else s = polyFrom(ICO, DOD);
    /* valores nas faces: opostas somam N+1 sempre que possível */
    var n = s.faces.length, used = {}, v = 1;
    s.faces.forEach(function (f, i) {
      if (f.val) return;
      f.val = v++;
      var opp = -1, best = 2;
      s.faces.forEach(function (g, j) { if (j !== i && !g.val) { var d = dot(f.n, g.n); if (d < best) { best = d; opp = j; } } });
      if (opp >= 0 && best < -0.9) s.faces[opp].val = n + 1 - f.val;
    });
    /* corrige faces que ficaram sem valor ou repetidas */
    var seen = {}; s.faces.forEach(function (f) { if (!f.val || seen[f.val]) f.val = 0; else seen[f.val] = 1; });
    var miss = []; for (var k = 1; k <= n; k++) if (!seen[k]) miss.push(k);
    s.faces.forEach(function (f) { if (!f.val) f.val = miss.shift(); });
    SHAPES[sides] = s; return s;
  }
  function shapeFor(sides) { if (sides === 3) return shape(6); return [4, 6, 8, 10, 12, 20].indexOf(sides) >= 0 ? shape(sides) : shape(20); }

  /* orientação final: face com o valor virada para a câmera, número em pé */
  function finalMatrix(sh, val) {
    var f = sh.faces.filter(function (x) { return x.val === val; })[0] || sh.faces[0];
    var z = [0, 0, 1], n = f.n, ax = cross(n, z), d = dot(n, z), m1;
    if (len(ax) < 1e-6) m1 = d > 0 ? I3 : matAxis([1, 0, 0], Math.PI); else m1 = matAxis(ax, Math.acos(Math.max(-1, Math.min(1, d))));
    var up = apply(m1, f.up), ang = Math.atan2(up[0], up[1]);
    var m2 = matAxis(z, ang + (Math.random() - .5) * .35);
    var tilt = matAxis([1, 0, 0], -.32 + (Math.random() - .5) * .1);
    return matMul(tilt, matMul(m2, m1));
  }

  /* ---------- cores e fontes por modalidade ---------- */
  var probe = null;
  function rgb(css) {
    if (!probe) probe = document.createElement('canvas').getContext('2d');
    probe.fillStyle = '#000'; probe.fillStyle = css; var c = probe.fillStyle;
    if (c[0] === '#') return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
    var m = c.match(/[\d.]+/g) || [0, 0, 0]; return [+m[0], +m[1], +m[2]];
  }
  function mode() { return document.documentElement.getAttribute('data-visual-theme') || 'classic'; }
  function themeColors() {
    var cs = getComputedStyle(document.documentElement), g = function (n, f) { return (cs.getPropertyValue(n) || '').trim() || f; };
    var m = mode(), p = rgb(g('--a-primary', '#0ac8b9')), a = rgb(g('--a-accent', '#c8aa6e')), ph = rgb(g('--a-ph', '#a586ec')), mp = rgb(g('--a-mp', '#2fa6e8')), hp = rgb(g('--a-hp', '#3fcf8e')), head = g('--a-header', '#040d17');
    if (m === 'battle-academia') return { m: m, edge: '#0b1030', edgeW: .07, ink: '#ffffff', inkStroke: '#0b1030', font: 'Anton, Impact, sans-serif', weight: '400', lightMin: .62, lightK: .45, cols: { 4: hp, 6: [255, 255, 255], 8: a, 10: mp, 12: ph, 20: p }, darkInk: { 6: '#0b1030', 8: '#0b1030' } };
    if (m === 'star-guardian') return { m: m, edge: 'rgba(255,255,255,.85)', edgeW: .03, ink: '#ffffff', inkStroke: 'rgba(40,10,60,.85)', font: 'Marcellus, Georgia, serif', weight: '400', lightMin: .5, lightK: .6, glass: true, cols: { 4: hp, 6: mp, 8: a, 10: ph, 12: [255, 160, 200], 20: p }, darkInk: {} };
    return { m: m, edge: head, edgeW: .04, ink: '#f7ecd2', inkStroke: '#03080e', font: 'Cinzel, Georgia, serif', weight: '700', lightMin: .32, lightK: .8, metal: a, cols: { 4: hp, 6: mp, 8: a, 10: ph, 12: [214, 120, 80], 20: p }, darkInk: { 8: '#1d1408' } };
  }
  function shade(c, k) { return 'rgb(' + Math.min(255, Math.round(c[0] * k)) + ',' + Math.min(255, Math.round(c[1] * k)) + ',' + Math.min(255, Math.round(c[2] * k)) + ')'; }

  /* ---------- palco ---------- */
  var shown = false, stage, cv, ctx, dpr = 1, W = 0, H = 0, raf = 0, dice = [], t0 = 0, DUR = 1500, panelEl = null, resultEl = null, current = null;
  var LIGHT = norm([-.45, .6, .75]);
  function ensureStage() {
    if (stage) return;
    stage = document.createElement('div'); stage.className = 'rd-stage'; stage.hidden = true; stage.setAttribute('aria-live', 'polite');
    stage.innerHTML = '<div class="rd-dim"></div><canvas class="rd-canvas" aria-hidden="true"></canvas><div class="rd-result"></div>';
    document.body.appendChild(stage);
    cv = stage.querySelector('canvas'); ctx = cv.getContext('2d'); resultEl = stage.querySelector('.rd-result');
    stage.addEventListener('click', function (e) { if (e.target.closest('.rd-again')) { roll(current.expr, current.label, Object.assign({}, current.opts, { forced: null })); return; } if (!e.target.closest('.rd-result') || e.target.closest('.rd-close')) hide(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !stage.hidden) { e.stopImmediatePropagation(); hide(); } }, true);
    addEventListener('resize', size);
  }
  function size() {
    if (!cv) return;
    dpr = Math.min(2, window.devicePixelRatio || 1); W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
  }
  function hide() { if (!stage) return; stage.classList.add('out'); setTimeout(function () { stage.hidden = true; stage.classList.remove('out'); cancelAnimationFrame(raf); raf = 0; }, 220); }
  function reduced() { return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; }

  function drawDie(d, M, x, y, R, T, alpha) {
    var sh = d.sh, col = d.col, P = 900;
    var pts = sh.verts.map(function (v) { var p = apply(M, v); var k = P / (P - p[2] * R); return [x + p[0] * R * k, y - p[1] * R * k, p[2]]; });
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.fillStyle = T.m === 'battle-academia' ? 'rgba(0,0,0,.45)' : 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(x + R * .25, y + R * 1.05, R * .9, R * .22, 0, 0, Math.PI * 2); ctx.fill();
    if (T.glass || T.m === 'classic') { ctx.save(); ctx.globalAlpha = alpha * .35; var gl = ctx.createRadialGradient(x, y, R * .2, x, y, R * 1.7); gl.addColorStop(0, 'rgba(' + col.join(',') + ',.55)'); gl.addColorStop(1, 'rgba(' + col.join(',') + ',0)'); ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x, y, R * 1.7, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    var faces = sh.faces.map(function (f) { var n = apply(M, f.n); return { f: f, n: n, z: apply(M, f.c)[2] }; }).filter(function (o) { return o.n[2] > 0.001; }).sort(function (a, b) { return a.z - b.z; });
    faces.forEach(function (o) {
      var f = o.f, lit = T.lightMin + T.lightK * Math.max(0, dot(o.n, LIGHT));
      ctx.beginPath(); f.idx.forEach(function (i, k) { var p = pts[i]; k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.closePath();
      if (T.glass) { ctx.globalAlpha = alpha * .82; }
      ctx.fillStyle = shade(col, lit); ctx.fill(); ctx.globalAlpha = alpha;
      if (T.m === 'classic') { /* brilho de cristal */ var cc = apply(M, f.c), gx = x + cc[0] * R, gy = y - cc[1] * R, g2 = ctx.createLinearGradient(gx - R * .4, gy - R * .4, gx + R * .4, gy + R * .4); g2.addColorStop(0, 'rgba(255,255,255,' + (.18 * lit) + ')'); g2.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g2; ctx.fill(); }
      ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(1.5, R * T.edgeW); ctx.strokeStyle = T.metal ? 'rgb(' + T.metal.join(',') + ')' : T.edge; ctx.stroke();
      var c = apply(M, f.c), up = apply(M, f.up), rt = apply(M, f.right), k = P / (P - c[2] * R);
      var cx = x + c[0] * R * k, cy = y - c[1] * R * k, s = R * k * f.inr * (sh.faces.length === 4 ? .62 : sh.faces.length >= 12 ? 1.05 : .95);
      var front = o.n[2];
      ctx.save();
      ctx.setTransform(dpr * rt[0] * s, -dpr * rt[1] * s, -dpr * up[0] * s, dpr * up[1] * s, dpr * cx, dpr * cy);
      ctx.font = T.weight + ' 1px ' + T.font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      var label = String(f.val) + ((f.val === 6 || f.val === 9) && sh.faces.length > 6 ? '.' : '');
      var fs = label.length > 1 ? .74 : .95; ctx.scale(fs, fs);
      var ink = T.darkInk[d.sides] || T.ink;
      ctx.lineWidth = .14; ctx.strokeStyle = ink === T.ink ? T.inkStroke : 'rgba(255,255,255,.6)'; ctx.strokeText(label, 0, .05);
      ctx.fillStyle = d.done && f.val === d.val && front > .95 ? (T.m === 'classic' ? '#ffffff' : ink) : ink; ctx.globalAlpha = alpha * (.5 + .5 * front);
      ctx.fillText(label, 0, .05);
      ctx.restore();
    });
    if (d.glow) { ctx.globalAlpha = alpha * d.glow; ctx.strokeStyle = T.m === 'classic' && T.metal ? 'rgb(' + T.metal.join(',') + ')' : '#fff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, R * (1.25 + (1 - d.glow) * .5), 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
  }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function frame(now) {
    var T = themeColors(), all = true;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    dice.forEach(function (d) {
      var lt = Math.max(0, Math.min(1, (now - t0 - d.delay) / DUR));
      if (lt < 1) all = false;
      var e = ease(lt);
      var x = d.sx + (d.x - d.sx) * e;
      var bounce = Math.abs(Math.sin(lt * Math.PI * 3)) * (1 - lt) * (1 - lt) * d.hop;
      var y = d.sy + (d.y - d.sy) * e - bounce;
      var M = matMul(d.final, matAxis(d.axis, d.spin * (1 - e)));
      if (lt >= 1 && !d.done) { d.done = true; d.glowT = now; if (window.RxFx && !reduced()) RxFx.burst(x, y, d.sides === 20 ? 1.3 : .8); }
      d.glow = d.done ? Math.max(0, 1 - (now - d.glowT) / 600) : 0;
      drawDie(d, M, x, y, d.R * (1 + (d.done ? .06 * d.glow : 0)), T, d.drop ? .4 : 1);
      if (d.done && d.drop) { ctx.save(); ctx.strokeStyle = '#ff4d6a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x - d.R, y + d.R); ctx.lineTo(x + d.R, y - d.R); ctx.stroke(); ctx.restore(); }
    });
    if (all && !shown) { shown = true; showResult(); }
    var glowing = dice.some(function (d) { return d.glow > 0; });
    if (!all || glowing) raf = requestAnimationFrame(frame); else raf = 0;
  }

  /* ---------- rolagem ---------- */
  function parseExpr(expr) {
    var s = String(expr || '').replace(/\s+/g, '').replace(/[×x*]/gi, '*');
    var terms = [], re = /([+\-]?)(\d*)d(\d+)|([+\-]?)(\d+)/gi, m, ok = false;
    while ((m = re.exec(s))) {
      ok = true;
      if (m[3]) terms.push({ sign: m[1] === '-' ? -1 : 1, n: Math.min(40, Number(m[2] || 1)), sides: Math.max(2, Math.min(1000, Number(m[3]))) });
      else terms.push({ sign: m[4] === '-' ? -1 : 1, k: Number(m[5]) });
    }
    return ok ? terms : null;
  }
  function rnd(n) { var a = new Uint32Array(1); crypto.getRandomValues(a); return 1 + (a[0] % n); }

  function roll(expr, label, opts) {
    opts = opts || {};
    var terms = parseExpr(expr); if (!terms) return;
    ensureStage(); size();
    var rolls = [], bonus = 0, md = opts.mode || 'normal', forced = (opts.forced || []).slice();
    terms.forEach(function (t) {
      if (t.k != null) { bonus += t.sign * t.k; return; }
      for (var i = 0; i < t.n; i++) { var fv = forced.length ? Math.max(1, Math.min(t.sides, Number(forced.shift()) || 1)) : rnd(t.sides); rolls.push({ sides: t.sides, val: fv, sign: t.sign }); }
    });
    if (opts.extra) bonus += Number(opts.extra) || 0;
    var d20s = rolls.filter(function (r) { return r.sides === 20; });
    if (md !== 'normal' && d20s.length === 1) {
      var extra = { sides: 20, val: rnd(20), sign: 1 }; rolls.push(extra);
      var keep = md === 'vant' ? (extra.val > d20s[0].val ? extra : d20s[0]) : (extra.val < d20s[0].val ? extra : d20s[0]);
      (keep === extra ? d20s[0] : extra).drop = true;
    }
    var sum = rolls.reduce(function (s, r) { return s + (r.drop ? 0 : r.sign * r.val); }, 0) + bonus;
    current = { expr: expr, label: label || 'ROLAGEM', opts: opts, rolls: rolls, bonus: bonus, total: sum, mode: md, unit: opts.unit || '' };
    var vis = rolls.slice(0, 14), n = vis.length;
    var cols = Math.min(n, W < 600 ? 3 : 7), rows = Math.ceil(n / cols);
    var R = Math.max(26, Math.min(W < 600 ? 62 : 86, (W * .8) / (cols * 2.6), (H * .42) / (rows * 2.6)));
    var cx = W / 2, cy = H * (W < 600 ? .34 : .38);
    var T = themeColors();
    dice = vis.map(function (r, i) {
      var row = Math.floor(i / cols), col = i % cols, inRow = Math.min(cols, n - row * cols);
      var x = cx + (col - (inRow - 1) / 2) * R * 2.6, y = cy + (row - (rows - 1) / 2) * R * 2.6;
      var sh = shapeFor(r.sides), fv = r.sides <= sh.faces.length ? r.val : Math.max(1, Math.min(sh.faces.length, Math.ceil(r.val / r.sides * sh.faces.length)));
      var fromLeft = T.m !== 'star-guardian';
      return { sh: sh, sides: r.sides, val: fv, real: r.val, col: T.cols[r.sides] || T.cols[20], R: R, x: x, y: y,
        sx: fromLeft ? -R * 2 - Math.random() * 120 : W / 2 + (Math.random() - .5) * W * .6, sy: fromLeft ? H * (.15 + Math.random() * .6) : -R * 2 - Math.random() * 100, hop: R * (1.2 + Math.random()),
        axis: norm([Math.random() - .5, Math.random() - .5, Math.random() - .5]), spin: 12 + Math.random() * 10,
        final: finalMatrix(sh, fv), delay: reduced() ? 0 : i * 70, drop: r.drop };
    });
    DUR = reduced() ? 1 : 1400;
    resultEl.className = 'rd-result'; resultEl.innerHTML = '';
    stage.hidden = false; stage.classList.remove('crit', 'fumble', 'out');
    shown = false; t0 = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
    log(current);
  }
  var TAGS = { classic: ['GLÓRIA RÚNICA!', 'RUNA PARTIDA'], 'battle-academia': ['CRÍTICO!!', 'FALHA CRÍTICA'], 'star-guardian': ['ESTRELA CADENTE!', 'ECLIPSE'] };
  function showResult() {
    var c = current; if (!c) return;
    var nat = c.rolls.filter(function (r) { return r.sides === 20 && !r.drop; })[0];
    var isCrit = nat && nat.val >= (c.opts.crit || 20), isFumble = nat && nat.val === 1, tg = TAGS[mode()] || TAGS.classic;
    stage.classList.toggle('crit', !!isCrit); stage.classList.toggle('fumble', !!isFumble);
    if (isCrit && window.RxFx) { var r = stage.querySelector('.rd-canvas').getBoundingClientRect(); setTimeout(function () { RxFx.burst(innerWidth / 2, innerHeight * .38, 3); }, 50); }
    var parts = c.rolls.map(function (r) { return '<span class="rd-r' + (r.drop ? ' drop' : '') + (r.sides === 20 && r.val >= (c.opts.crit || 20) ? ' hi' : '') + (r.sides === 20 && r.val === 1 ? ' lo' : '') + '"><small>d' + r.sides + '</small>' + (r.sign < 0 ? '−' : '') + r.val + '</span>'; }).join('');
    resultEl.innerHTML =
      (isCrit ? '<div class="rd-tag crit">' + tg[0] + '</div>' : isFumble ? '<div class="rd-tag fumble">' + tg[1] + '</div>' : '') +
      '<div class="rd-card"><small>' + esc(c.label) + (c.mode === 'vant' ? ' · VANTAGEM' : c.mode === 'desv' ? ' · DESVANTAGEM' : '') + '</small>' +
      '<div class="rd-total"><b>' + c.total + '</b>' + (c.unit ? '<em>' + esc(c.unit) + '</em>' : '') + '</div>' +
      '<div class="rd-parts">' + parts + (c.bonus ? '<span class="rd-bonus">' + (c.bonus > 0 ? '+' : '−') + Math.abs(c.bonus) + '</span>' : '') + '</div>' +
      (c.opts.note ? '<div class="rd-note">' + esc(c.opts.note) + '</div>' : '') + '<div class="rd-expr">' + esc(String(c.expr)) + (c.opts.extra ? ' ' + (c.opts.extra > 0 ? '+' : '') + c.opts.extra : '') + '</div>' +
      '<div class="rd-actions"><button type="button" class="rd-again">↻ Rolar de novo</button><button type="button" class="rd-close">Fechar</button></div></div>';
    resultEl.classList.add('in');
  }
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); }

  /* ---------- histórico ---------- */
  var LOG = [];
  try { LOG = JSON.parse(sessionStorage.getItem('rx-dice-log') || '[]'); } catch (e) {}
  function log(c) { LOG.unshift({ label: c.label, total: c.total, expr: c.expr }); LOG = LOG.slice(0, 10); try { sessionStorage.setItem('rx-dice-log', JSON.stringify(LOG)); } catch (e) {} paintPanel(); }

  /* ---------- painel ---------- */
  var pool = {}, rmode = 'normal', extra = 0;
  function attrs() {
    try { var c = window.current(), D = derived(c);
      return [['ACERTO', 'Acerto', D.acerto], ['DEFESA', 'Defesa', D.defesa], ['APARAR', 'Aparar', D.aparar], ['VONTADE', 'Vontade', D.vontade], ['RESISTÊNCIA', 'Resistência', D.resist], ['INICIATIVA', 'Iniciativa', D.init]].map(function (x) { return { code: x[0], name: x[1], v: x[2] }; });
    } catch (e) { return []; }
  }
  function profs() { try { var c = window.current(); return c.profs.map(function (p) { var d = R2.PROF[p.k] || { name: 'Proficiência' }; return { code: d.name.toUpperCase(), name: d.name, v: profBonus(c, p).total }; }); } catch (e) { return []; } }
  function attrMap() { try { var c = window.current(), m = {}; R2.ATTRS.forEach(function (a) { m[a.code] = attr(c, a.k); }); return m; } catch (e) { return {}; } }
  function resolve(f) { var map = attrMap(); return String(f).toUpperCase().replace(/\b(VID|POD|PRE|DES|RES|ESP)\b/g, function (_, k) { return map[k] != null ? map[k] : 0; }).replace(/D/g, 'd'); }
  function sgn(n) { return (n >= 0 ? '+' : '') + n; }
  var BRAND = { classic: ['CÓDICE RÚNICO', 'Rolar <span>dados</span>'], 'battle-academia': ['ARQUIVO DE COMBATE', 'Rolar <span>dados!</span>'], 'star-guardian': ['PRIMEIRA ESTRELA', 'Rolar <span>dados</span>'] };
  function buildPanel() {
    panelEl = document.createElement('section'); panelEl.className = 'rd-panel'; panelEl.hidden = true; panelEl.setAttribute('aria-label', 'Rolar dados');
    document.body.appendChild(panelEl);
    panelEl.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.rdAdd) { var s = +b.dataset.rdAdd; pool[s] = (pool[s] || 0) + 1; paintPanel(); return; }
      if (b.dataset.rdSub) { var s2 = +b.dataset.rdSub; pool[s2] = Math.max(0, (pool[s2] || 0) - 1); paintPanel(); return; }
      if (b.hasAttribute('data-rd-clear')) { pool = {}; paintPanel(); return; }
      if (b.hasAttribute('data-rd-clearlog')) { LOG = []; try { sessionStorage.removeItem('rx-dice-log'); } catch (er) {} paintPanel(); return; }
      if (b.dataset.rdMode) { rmode = b.dataset.rdMode; paintPanel(); return; }
      if (b.hasAttribute('data-rd-pool')) { var ex = Object.keys(pool).filter(function (k) { return pool[k]; }).map(function (k) { return pool[k] + 'd' + k; }).join('+'); if (ex) roll(ex, 'DADOS LIVRES', { mode: rmode, extra: extra }); return; }
      if (b.dataset.rdTest) { var v = +b.dataset.rdBonus; roll('1d20' + (v ? sgn(v) : ''), b.dataset.rdTest, { mode: rmode, extra: extra }); return; }
      if (b.dataset.rdExpr) { roll(b.dataset.rdExpr, b.dataset.rdLabel, { mode: 'normal', unit: b.dataset.rdUnit || '' }); return; }
      if (b.hasAttribute('data-rd-x')) { panelEl.hidden = true; return; }
    });
    panelEl.addEventListener('input', function (e) { if (e.target.id === 'rdExtra') extra = Number(e.target.value) || 0; });
    panelEl.addEventListener('submit', function (e) {
      e.preventDefault(); var i = panelEl.querySelector('#rdExpr'); var ex = resolve(i.value);
      if (parseExpr(ex)) roll(ex, i.value.toUpperCase(), { mode: /1d20/i.test(ex) ? rmode : 'normal', extra: extra });
    });
  }
  function paintPanel() {
    if (!panelEl || panelEl.hidden) return;
    var A = attrs(), P = profs(), br = BRAND[mode()] || BRAND.classic;
    var diceBtns = [3, 4, 6, 8, 10, 12, 20, 100].map(function (s) {
      return '<div class="rd-die"><button type="button" data-rd-add="' + s + '" title="Adicionar d' + s + '"><i class="rd-ico d' + s + '"></i><b>d' + s + '</b></button>' +
        (pool[s] ? '<span>' + pool[s] + '</span><button type="button" class="rd-sub" data-rd-sub="' + s + '" aria-label="Tirar um d' + s + '">−</button>' : '') + '</div>';
    }).join('');
    var poolTxt = Object.keys(pool).filter(function (k) { return pool[k]; }).map(function (k) { return pool[k] + 'd' + k; }).join(' + ');
    panelEl.innerHTML =
      '<header><div><small>' + br[0] + '</small><b>' + br[1] + '</b></div><button type="button" class="rd-x" data-rd-x aria-label="Fechar">×</button></header>' +
      '<div class="rd-modes">' + [['desv', 'Desvantagem'], ['normal', 'Normal'], ['vant', 'Vantagem']].map(function (m) { return '<button type="button" data-rd-mode="' + m[0] + '" class="' + (rmode === m[0] ? 'on' : '') + '">' + m[1] + '</button>'; }).join('') +
        '<label>Bônus extra<input id="rdExtra" type="number" value="' + (extra || '') + '" placeholder="0"></label></div>' +
      (A.length ? '<h4>Testes <small>1d20 + bônus</small></h4><div class="rd-tests three">' + A.map(function (a) { return '<button type="button" data-rd-test="' + esc(a.code) + '" data-rd-bonus="' + a.v + '"><b>' + esc(a.name) + '</b><small>' + sgn(a.v) + '</small></button>'; }).join('') + '</div>' : '') +
      (P.length ? '<h4>Proficiências <small>1d20 + atributo + rank</small></h4><div class="rd-tests two">' + P.map(function (a) { return '<button type="button" data-rd-test="' + esc(a.code) + '" data-rd-bonus="' + a.v + '"><b>' + esc(a.name) + '</b><small>' + sgn(a.v) + '</small></button>'; }).join('') + '</div>' : '') +
      '<h4>Trocando Golpes <small>Rota Comum</small></h4><div class="rd-tests two"><button type="button" data-rd-expr="1d4" data-rd-label="TROCANDO GOLPES · CORPO A CORPO" data-rd-unit="trocas"><b>Corpo a corpo</b><small>1d4</small></button><button type="button" data-rd-expr="1d3" data-rd-label="TROCANDO GOLPES · DISTÂNCIA" data-rd-unit="trocas"><b>Distância</b><small>1d3</small></button></div>' +
      '<h4>Dados livres' + (poolTxt ? ' <small>' + poolTxt + '</small>' : '') + '</h4><div class="rd-dice">' + diceBtns + '</div>' +
      '<div class="rd-poolrow"><button type="button" class="rd-go" data-rd-pool ' + (poolTxt ? '' : 'disabled') + '>Rolar ' + (poolTxt || '') + '</button>' + (poolTxt ? '<button type="button" data-rd-clear>Limpar</button>' : '') + '</div>' +
      '<form class="rd-form"><input id="rdExpr" placeholder="Fórmula: 2d6+POD, 1d20+PRE…" autocomplete="off"><button type="submit">Rolar</button></form>' +
      (LOG.length ? '<h4>Últimas rolagens <button type="button" class="rd-clearlog" data-rd-clearlog>Limpar</button></h4><ol class="rd-log">' + LOG.map(function (l) { return '<li><span>' + esc(l.label) + '</span><em>' + esc(l.expr) + '</em><b>' + l.total + '</b></li>'; }).join('') + '</ol>' : '');
    placePanel();
  }
  function togglePanel() { if (!panelEl) buildPanel(); panelEl.hidden = !panelEl.hidden; paintPanel(); placePanel(); }

  /* ---------- botão flutuante arrastável ---------- */
  var POSKEY = 'runeterra-dice-pos';
  function loadPos() { try { var p = JSON.parse(localStorage.getItem(POSKEY) || 'null'); if (p && isFinite(p.x) && isFinite(p.y)) return p; } catch (e) {} return null; }
  function savePos(p) { try { localStorage.setItem(POSKEY, JSON.stringify(p)); } catch (e) {} }
  function clampPos(x, y, el) { var w = el.offsetWidth || 62, h = el.offsetHeight || 62; return { x: Math.max(6, Math.min(innerWidth - w - 6, x)), y: Math.max(6, Math.min(innerHeight - h - 6, y)) }; }
  function applyPos(el, p) {
    if (!p) { el.style.left = el.style.top = el.style.right = el.style.bottom = ''; return; }
    p = clampPos(p.x, p.y, el); el.style.left = p.x + 'px'; el.style.top = p.y + 'px'; el.style.right = 'auto'; el.style.bottom = 'auto';
  }
  function placePanel() {
    if (!panelEl || panelEl.hidden) return;
    var f = document.getElementById('rdFab'); if (!f) return;
    if (!loadPos()) { panelEl.style.left = panelEl.style.top = panelEl.style.right = panelEl.style.bottom = ''; return; }
    var r = f.getBoundingClientRect(), pw = panelEl.offsetWidth, ph = panelEl.offsetHeight, gap = 12;
    var left = r.left + r.width / 2 > innerWidth / 2 ? r.right - pw : r.left;
    var top = r.top > innerHeight / 2 ? r.top - ph - gap : r.bottom + gap;
    if (top < 6 || top + ph > innerHeight - 6) { top = Math.max(6, Math.min(innerHeight - ph - 6, r.top - ph / 2)); left = r.left + r.width / 2 > innerWidth / 2 ? r.left - pw - gap : r.right + gap; }
    left = Math.max(6, Math.min(innerWidth - pw - 6, left));
    panelEl.style.left = left + 'px'; panelEl.style.top = top + 'px'; panelEl.style.right = 'auto'; panelEl.style.bottom = 'auto';
  }
  function makeDraggable(btn) {
    var start = null, moved = false;
    btn.addEventListener('pointerdown', function (e) { if (e.button !== 0 && e.pointerType === 'mouse') return; var r = btn.getBoundingClientRect(); start = { px: e.clientX, py: e.clientY, x: r.left, y: r.top }; moved = false; btn.setPointerCapture(e.pointerId); });
    btn.addEventListener('pointermove', function (e) {
      if (!start) return; var dx = e.clientX - start.px, dy = e.clientY - start.py;
      if (!moved && Math.abs(dx) + Math.abs(dy) < 6) return; moved = true; btn.classList.add('dragging'); applyPos(btn, { x: start.x + dx, y: start.y + dy }); placePanel();
    });
    function end() { if (!start) return; if (moved) { var r = btn.getBoundingClientRect(); savePos({ x: r.left, y: r.top }); btn.classList.remove('dragging'); btn.dataset.justDragged = '1'; setTimeout(function () { delete btn.dataset.justDragged; }, 50); } start = null; }
    btn.addEventListener('pointerup', end); btn.addEventListener('pointercancel', end);
    btn.addEventListener('dblclick', function () { try { localStorage.removeItem(POSKEY); } catch (e) {} applyPos(btn, null); placePanel(); });
    addEventListener('resize', function () { applyPos(btn, loadPos()); placePanel(); });
    applyPos(btn, loadPos());
  }
  function fab() {
    if (document.getElementById('rdFab')) return;
    var b = document.createElement('button'); b.type = 'button'; b.id = 'rdFab'; b.className = 'rd-fab'; b.setAttribute('aria-label', 'Rolar dados');
    b.innerHTML = '<svg class="f-classic" viewBox="0 0 48 48" aria-hidden="true"><path d="M24 3 43 14v20L24 45 5 34V14z"/><path d="M24 3v13M43 14 32 21M5 14l11 7M24 45V33M43 34 32 27M5 34l11-7M16 21h16l-8 12z" fill="none"/></svg>' +
      '<svg class="f-academy" viewBox="0 0 48 48" aria-hidden="true"><path d="M24 2 44 9v15L24 46 4 24V9z"/><path d="M24 12 33 24 24 36 15 24Z" fill="none"/></svg>' +
      '<svg class="f-star" viewBox="0 0 48 48" aria-hidden="true"><path d="m24 2 6.5 14.5 15.5 1.6-11.6 10.6 3.3 15.6L24 36.4 10.3 44.3l3.3-15.6L2 18.1l15.5-1.6Z"/><path d="m24 13 3 7 7.6.8-5.7 5.1 1.6 7.6L24 29.7l-6.5 3.8 1.6-7.6-5.7-5.1L21 20Z" fill="none"/></svg><b>20</b>';
    b.title = 'Clique para rolar dados · arraste para mover · duplo clique volta ao canto';
    b.addEventListener('click', function () { if (b.dataset.justDragged) return; togglePanel(); });
    document.body.appendChild(b); makeDraggable(b);
  }

  document.addEventListener('sheet:render', function () { if (panelEl && !panelEl.hidden) paintPanel(); });
  window.RxDice = { roll: roll, open: togglePanel, parse: parseExpr };
  function init() { if (!document.body) { setTimeout(init, 100); return; } fab(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
