/* ==========================================================================
   CONTOS DE RUNETERRA — runeterra-fx.js
   Animações e interações da camada "Prisma":
     • céu animado por modalidade (motes hextec, linhas de velocidade, estrelas)
     • abertura, troca de modalidade e troca de página com efeitos próprios
     • indicador deslizante das abas, contadores animados, faíscas ao clicar
     • inclinação 3D dos atributos e rolagem pelo selo de cada atributo
   Só mexe na aparência; nenhuma regra ou dado salvo depende deste arquivo.
   ========================================================================== */
(function () {
  'use strict';
  if (window.RxFx) return;
  var root = document.documentElement;
  var reduced = function () { return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; };
  var mode = function () { return root.getAttribute('data-visual-theme') || 'classic'; };
  var ready = false;
  function cssVar(n, f) { var v = getComputedStyle(root).getPropertyValue(n).trim(); return v || f; }
  var probe = document.createElement('canvas').getContext('2d');
  function rgb(c) {
    probe.fillStyle = '#000'; probe.fillStyle = c; var s = probe.fillStyle;
    if (s[0] === '#') return [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
    var m = s.match(/[\d.]+/g) || [255, 255, 255]; return [+m[0], +m[1], +m[2]];
  }
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  function palette() {
    return { p: rgb(cssVar('--a-primary', '#0ac8b9')), a: rgb(cssVar('--a-accent', '#c8aa6e')), ph: rgb(cssVar('--a-ph', '#c69bff')), bg: rgb(cssVar('--a-background', '#010a13')), head: rgb(cssVar('--a-header', '#040d17')) };
  }
  var R = Math.random;

  /* ---------- modo ---------------------------------------------------- */
  function syncMode() { root.setAttribute('data-rx', mode()); }
  syncMode();

  /* ---------- céu (canvas de fundo) ------------------------------------ */
  var sky = document.createElement('canvas'); sky.id = 'rxSky'; sky.setAttribute('aria-hidden', 'true');
  var sctx = sky.getContext('2d'), SW = 0, SH = 0, sdpr = 1, skyRaf = 0, skyMode = '', P = null, parts = [], mouse = { x: .5, y: .5 }, lastT = 0, nextShoot = 0, shooting = [];
  function sizeSky() { sdpr = Math.min(1.5, window.devicePixelRatio || 1); SW = innerWidth; SH = innerHeight; sky.width = SW * sdpr; sky.height = SH * sdpr; }
  var runeImg = null;
  function makeRuneCircle(col, col2) {
    var c = document.createElement('canvas'), S = 900; c.width = c.height = S; var g = c.getContext('2d'), m = S / 2;
    g.translate(m, m); g.strokeStyle = rgba(col, 1); g.fillStyle = rgba(col, 1);
    var ring = function (r, w) { g.lineWidth = w; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.stroke(); };
    ring(430, 2); ring(418, 1); ring(330, 1.5); ring(250, 1); ring(120, 1.5);
    for (var i = 0; i < 72; i++) { var a = i / 72 * Math.PI * 2, l = i % 6 ? 10 : 26; g.lineWidth = i % 6 ? 1 : 2; g.beginPath(); g.moveTo(Math.cos(a) * 418, Math.sin(a) * 418); g.lineTo(Math.cos(a) * (418 - l), Math.sin(a) * (418 - l)); g.stroke(); }
    /* glifos entre os anéis */
    for (i = 0; i < 12; i++) {
      a = i / 12 * Math.PI * 2; g.save(); g.rotate(a); g.translate(0, -372); g.lineWidth = 2;
      g.beginPath(); var k = i % 4;
      if (k === 0) { g.moveTo(0, -18); g.lineTo(12, 0); g.lineTo(0, 18); g.lineTo(-12, 0); g.closePath(); g.moveTo(0, -18); g.lineTo(0, 18); }
      else if (k === 1) { g.moveTo(-12, 14); g.lineTo(0, -16); g.lineTo(12, 14); g.moveTo(-7, 3); g.lineTo(7, 3); }
      else if (k === 2) { g.arc(0, 0, 12, 0, Math.PI * 2); g.moveTo(0, -18); g.lineTo(0, 18); g.moveTo(-14, 6); g.lineTo(14, 6); }
      else { g.moveTo(-12, -14); g.lineTo(12, -14); g.lineTo(-12, 14); g.lineTo(12, 14); }
      g.stroke(); g.restore();
    }
    /* hexágono + estrela */
    g.lineWidth = 2; g.beginPath(); for (i = 0; i <= 6; i++) { a = i / 6 * Math.PI * 2 - Math.PI / 2; g[i ? 'lineTo' : 'moveTo'](Math.cos(a) * 330, Math.sin(a) * 330); } g.stroke();
    g.lineWidth = 1; g.beginPath(); for (i = 0; i <= 6; i++) { a = (i * 2) / 6 * Math.PI * 2 - Math.PI / 2; g[i ? 'lineTo' : 'moveTo'](Math.cos(a) * 330, Math.sin(a) * 330); } g.stroke();
    g.beginPath(); for (i = 0; i <= 6; i++) { a = (i * 2 + 1) / 6 * Math.PI * 2 - Math.PI / 2; g[i ? 'lineTo' : 'moveTo'](Math.cos(a) * 330, Math.sin(a) * 330); } g.stroke();
    g.strokeStyle = rgba(col2, 1); g.lineWidth = 2; ring(250, 2);
    for (i = 0; i < 6; i++) { a = i / 6 * Math.PI * 2; g.beginPath(); g.arc(Math.cos(a) * 250, Math.sin(a) * 250, 9, 0, Math.PI * 2); g.stroke(); }
    g.beginPath(); for (i = 0; i <= 3; i++) { a = i / 3 * Math.PI * 2 - Math.PI / 2; g[i ? 'lineTo' : 'moveTo'](Math.cos(a) * 120, Math.sin(a) * 120); } g.stroke();
    return c;
  }
  var crestImg = null;
  function makeCrest(col) {
    var c = document.createElement('canvas'), S = 700; c.width = c.height = S; var g = c.getContext('2d');
    g.translate(S / 2, S / 2); g.strokeStyle = rgba(col, 1); g.lineJoin = 'round';
    var shield = function (s, w) { g.lineWidth = w; g.beginPath(); g.moveTo(0, -300 * s); g.lineTo(260 * s, -200 * s); g.lineTo(260 * s, 60 * s); g.lineTo(0, 300 * s); g.lineTo(-260 * s, 60 * s); g.lineTo(-260 * s, -200 * s); g.closePath(); g.stroke(); };
    shield(1, 10); shield(.88, 3);
    g.lineWidth = 8; g.beginPath(); g.moveTo(0, -170); g.lineTo(150, 0); g.lineTo(0, 170); g.lineTo(-150, 0); g.closePath(); g.stroke();
    g.lineWidth = 6; g.beginPath(); g.moveTo(0, -230); g.lineTo(0, 230); g.moveTo(-200, 0); g.lineTo(200, 0); g.stroke();
    g.lineWidth = 14; g.beginPath(); g.moveTo(-120, 120); g.lineTo(120, -120); g.stroke();
    return c;
  }
  function initSky() {
    skyMode = mode(); P = palette(); parts = []; shooting = [];
    var n, i;
    if (skyMode === 'classic') {
      runeImg = makeRuneCircle(P.a, P.p);
      n = Math.round(Math.min(90, SW * SH / 16000));
      for (i = 0; i < n; i++) parts.push({ x: R() * SW, y: R() * SH, r: .6 + R() * 2.1, vy: -(.12 + R() * .45), ph: R() * 6.28, sw: .3 + R() * .8, c: R() < .62 ? P.a : P.p, f: .4 + R() * .6 });
    } else if (skyMode === 'battle-academia') {
      crestImg = makeCrest([255, 255, 255]);
      n = Math.round(Math.min(46, SW / 32));
      for (i = 0; i < n; i++) parts.push(speedLine(true));
      for (i = 0; i < 14; i++) parts.push({ k: 'shape', x: R() * SW, y: R() * SH, s: 6 + R() * 16, rot: R() * 6.28, vr: (R() - .5) * .01, vx: -.15 - R() * .3, vy: (R() - .5) * .12, t: i % 3, c: [P.p, P.a, [255, 255, 255]][i % 3], al: .08 + R() * .12 });
    } else {
      n = Math.round(Math.min(320, SW * SH / 5200));
      for (i = 0; i < n; i++) { var d = R(); parts.push({ x: R() * SW, y: R() * SH, d: d, r: .3 + d * 1.6, ph: R() * 6.28, sp: .6 + R() * 2.2, c: [[255, 255, 255], P.p, P.a, P.ph][R() < .55 ? 0 : 1 + Math.floor(R() * 3)], big: d > .93 }); }
    }
  }
  function speedLine(anywhere) {
    var c = R() < .14 ? P.p : R() < .2 ? P.a : [255, 255, 255];
    return { k: 'line', x: anywhere ? R() * SW * 1.4 : SW + R() * SW * .4, y: R() * SH * 1.3 - SH * .15, l: 60 + R() * 320, v: 3 + R() * 9, w: .6 + R() * 2.2, c: c, al: .04 + R() * .13 };
  }
  var ANG = -0.33;
  function drawSky(now) {
    skyRaf = requestAnimationFrame(drawSky);
    if (document.hidden) return;
    var dt = Math.min(50, now - (lastT || now)); lastT = now; var k = dt / 16.7;
    if (skyMode !== mode()) initSky();
    sctx.setTransform(sdpr, 0, 0, sdpr, 0, 0); sctx.clearRect(0, 0, SW, SH);
    var t = now / 1000, i, p, sy = (window.scrollY || 0);
    if (skyMode === 'classic') {
      var s1 = Math.min(SW, SH) * 1.05;
      sctx.save(); sctx.globalAlpha = .075; sctx.translate(SW * .86 + (mouse.x - .5) * -14, SH * .32 + (mouse.y - .5) * -10); sctx.rotate(t * .025); sctx.drawImage(runeImg, -s1 / 2, -s1 / 2, s1, s1); sctx.restore();
      sctx.save(); sctx.globalAlpha = .05; sctx.translate(SW * .08, SH * .92); sctx.rotate(-t * .04); sctx.drawImage(runeImg, -s1 * .3, -s1 * .3, s1 * .6, s1 * .6); sctx.restore();
      for (i = 0; i < parts.length; i++) {
        p = parts[i]; p.y += p.vy * k; p.x += Math.sin(t * p.sw + p.ph) * .25 * k;
        if (p.y < -10) { p.y = SH + 10; p.x = R() * SW; }
        var fl = p.f * (.55 + .45 * Math.sin(t * 2 * p.sw + p.ph));
        sctx.fillStyle = rgba(p.c, fl * .14); sctx.beginPath(); sctx.arc(p.x, p.y, p.r * 4, 0, 6.283); sctx.fill();
        sctx.fillStyle = rgba(p.c, fl * .9); sctx.beginPath(); sctx.arc(p.x, p.y, p.r, 0, 6.283); sctx.fill();
      }
    } else if (skyMode === 'battle-academia') {
      var cs = Math.min(SW, SH) * .95;
      sctx.save(); sctx.globalAlpha = .045; sctx.translate(SW * .78, SH * .55 - sy * .04); sctx.rotate(-.12 + Math.sin(t * .3) * .02); sctx.drawImage(crestImg, -cs / 2, -cs / 2, cs, cs); sctx.restore();
      var ca = Math.cos(ANG), sa = Math.sin(ANG);
      for (i = 0; i < parts.length; i++) {
        p = parts[i];
        if (p.k === 'line') {
          p.x -= p.v * k; if (p.x + p.l < -100) { var nl = speedLine(false); for (var q in nl) p[q] = nl[q]; }
          var y2 = p.y + (p.x - SW / 2) * sa;
          sctx.strokeStyle = rgba(p.c, p.al); sctx.lineWidth = p.w; sctx.beginPath(); sctx.moveTo(p.x, y2); sctx.lineTo(p.x + p.l * ca, y2 - p.l * sa * -1); sctx.stroke();
        } else {
          p.x += p.vx * k; p.y += p.vy * k; p.rot += p.vr * k; if (p.x < -40) { p.x = SW + 40; p.y = R() * SH; }
          sctx.save(); sctx.translate(p.x, p.y); sctx.rotate(p.rot); sctx.strokeStyle = rgba(p.c, p.al); sctx.lineWidth = 2; sctx.beginPath();
          if (p.t === 0) { sctx.moveTo(0, -p.s); sctx.lineTo(p.s * .87, p.s * .5); sctx.lineTo(-p.s * .87, p.s * .5); sctx.closePath(); }
          else if (p.t === 1) { sctx.moveTo(-p.s, 0); sctx.lineTo(p.s, 0); sctx.moveTo(0, -p.s); sctx.lineTo(0, p.s); }
          else { sctx.moveTo(-p.s, -p.s * .4); sctx.lineTo(0, p.s * .4); sctx.lineTo(p.s, -p.s * .4); }
          sctx.stroke(); sctx.restore();
        }
      }
    } else {
      var mx = (mouse.x - .5), my = (mouse.y - .5);
      for (i = 0; i < parts.length; i++) {
        p = parts[i];
        var x = p.x - mx * 30 * p.d, y = ((p.y - sy * .08 * p.d) % SH + SH) % SH - my * 24 * p.d;
        var tw = .35 + .65 * Math.abs(Math.sin(t * p.sp * .7 + p.ph));
        sctx.fillStyle = rgba(p.c, tw * (.35 + p.d * .65));
        if (p.big) {
          var s = p.r * 4.5 * tw; sctx.beginPath(); sctx.moveTo(x, y - s); sctx.quadraticCurveTo(x, y, x + s, y); sctx.quadraticCurveTo(x, y, x, y + s); sctx.quadraticCurveTo(x, y, x - s, y); sctx.quadraticCurveTo(x, y, x, y - s); sctx.fill();
          sctx.fillStyle = rgba(p.c, tw * .12); sctx.beginPath(); sctx.arc(x, y, s * 1.6, 0, 6.283); sctx.fill();
        } else { sctx.beginPath(); sctx.arc(x, y, p.r, 0, 6.283); sctx.fill(); }
      }
      if (now > nextShoot) { nextShoot = now + 3500 + R() * 6000; shooting.push({ x: SW * (.3 + R() * .8), y: -20 + R() * SH * .4, vx: -(7 + R() * 6), vy: 3 + R() * 3, life: 1, c: R() < .5 ? P.p : [255, 255, 255] }); }
      for (i = shooting.length - 1; i >= 0; i--) {
        var o = shooting[i]; o.x += o.vx * k; o.y += o.vy * k; o.life -= .012 * k; if (o.life <= 0) { shooting.splice(i, 1); continue; }
        var gr = sctx.createLinearGradient(o.x, o.y, o.x - o.vx * 14, o.y - o.vy * 14); gr.addColorStop(0, rgba(o.c, o.life)); gr.addColorStop(1, rgba(o.c, 0));
        sctx.strokeStyle = gr; sctx.lineWidth = 2; sctx.lineCap = 'round'; sctx.beginPath(); sctx.moveTo(o.x, o.y); sctx.lineTo(o.x - o.vx * 14, o.y - o.vy * 14); sctx.stroke();
        sctx.fillStyle = rgba([255, 255, 255], o.life); sctx.beginPath(); sctx.arc(o.x, o.y, 1.8, 0, 6.283); sctx.fill();
      }
    }
  }
  function startSky() {
    if (reduced()) return;
    document.body.prepend(sky); sizeSky(); initSky(); cancelAnimationFrame(skyRaf); skyRaf = requestAnimationFrame(drawSky);
  }
  addEventListener('resize', function () { if (!sky.isConnected) return; sizeSky(); initSky(); positionInk(); });
  addEventListener('pointermove', function (e) { mouse.x = e.clientX / innerWidth; mouse.y = e.clientY / innerHeight; }, { passive: true });

  /* ---------- partículas (canvas de efeitos) -------------------------- */
  var fx = document.createElement('canvas'); fx.id = 'rxFx'; fx.setAttribute('aria-hidden', 'true');
  var fctx = fx.getContext('2d'), FW = 0, FH = 0, fdpr = 1, sparks = [], fxRaf = 0;
  function sizeFx() { fdpr = Math.min(2, window.devicePixelRatio || 1); FW = innerWidth; FH = innerHeight; fx.width = FW * fdpr; fx.height = FH * fdpr; }
  addEventListener('resize', sizeFx);
  function fxLoop() {
    fctx.setTransform(fdpr, 0, 0, fdpr, 0, 0); fctx.clearRect(0, 0, FW, FH);
    for (var i = sparks.length - 1; i >= 0; i--) {
      var s = sparks[i]; s.life -= s.decay; if (s.life <= 0) { sparks.splice(i, 1); continue; }
      s.x += s.vx; s.y += s.vy; s.vy += s.g; s.vx *= s.fr; s.vy *= s.fr; s.rot += s.vr;
      var a = Math.max(0, s.life);
      fctx.save(); fctx.translate(s.x, s.y); fctx.rotate(s.rot); fctx.globalAlpha = a;
      if (s.k === 'ring') { fctx.strokeStyle = rgba(s.c, 1); fctx.lineWidth = 2 * a; fctx.beginPath(); fctx.arc(0, 0, s.r + (1 - a) * s.grow, 0, 6.283); fctx.stroke(); if (s.dia) { var rr = s.r + (1 - a) * s.grow; for (var d = 0; d < 4; d++) { fctx.rotate(Math.PI / 2); fctx.fillStyle = rgba(s.c, 1); fctx.fillRect(-2, -rr - 3, 4, 6); } } }
      else if (s.k === 'star') { var z = s.r * (.6 + a * .4); fctx.fillStyle = rgba(s.c, 1); fctx.beginPath(); for (var j = 0; j < 10; j++) { var ang = j / 10 * 6.283 - Math.PI / 2, rad = j % 2 ? z * .42 : z; fctx[j ? 'lineTo' : 'moveTo'](Math.cos(ang) * rad, Math.sin(ang) * rad); } fctx.closePath(); fctx.fill(); }
      else if (s.k === 'shard') { fctx.fillStyle = rgba(s.c, 1); fctx.beginPath(); fctx.moveTo(0, -s.r * 1.8); fctx.lineTo(s.r * .5, 0); fctx.lineTo(0, s.r * 1.8); fctx.lineTo(-s.r * .5, 0); fctx.closePath(); fctx.fill(); }
      else if (s.k === 'line') { fctx.strokeStyle = rgba(s.c, 1); fctx.lineWidth = 3 * a; fctx.beginPath(); fctx.moveTo(0, 0); fctx.lineTo(s.r * (1.4 - a), 0); fctx.stroke(); }
      else { fctx.fillStyle = rgba(s.c, 1); fctx.beginPath(); fctx.arc(0, 0, s.r * a, 0, 6.283); fctx.fill(); fctx.globalAlpha = a * .25; fctx.beginPath(); fctx.arc(0, 0, s.r * 3 * a, 0, 6.283); fctx.fill(); }
      fctx.restore();
    }
    fxRaf = sparks.length ? requestAnimationFrame(fxLoop) : 0;
  }
  function add(s) { sparks.push(Object.assign({ vx: 0, vy: 0, g: 0, fr: .94, rot: 0, vr: 0, life: 1, decay: .03, r: 2 }, s)); if (!fxRaf) fxRaf = requestAnimationFrame(fxLoop); }
  function burst(x, y, power) {
    if (reduced()) return; power = power || 1; var Pl = palette(), m = mode(), i, a, v;
    if (m === 'classic') {
      add({ k: 'ring', x: x, y: y, r: 4, grow: 34 * power, c: Pl.a, decay: .045, dia: true });
      for (i = 0; i < 14 * power; i++) { a = R() * 6.283; v = 1.5 + R() * 4 * power; add({ k: 'dot', x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, g: .05, r: 1 + R() * 1.8, c: R() < .65 ? Pl.a : Pl.p, decay: .025 + R() * .02 }); }
    } else if (m === 'battle-academia') {
      for (i = 0; i < 8 * power; i++) { a = (i / (8 * power)) * 6.283 + R() * .3; v = 6 + R() * 6 * power; add({ k: 'line', x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, rot: a, r: 18 + R() * 20, c: i % 2 ? Pl.p : Pl.a, fr: .82, decay: .06 }); }
      for (i = 0; i < 6 * power; i++) { a = R() * 6.283; v = 2 + R() * 5; add({ k: 'shard', x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, g: .25, rot: R() * 6, vr: (R() - .5) * .4, r: 3 + R() * 4, c: [Pl.p, Pl.a, [255, 255, 255]][i % 3], decay: .03 }); }
    } else {
      for (i = 0; i < 12 * power; i++) { a = R() * 6.283; v = 1 + R() * 3.6 * power; add({ k: R() < .6 ? 'star' : 'dot', x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - .6, g: .03, rot: R() * 6, vr: (R() - .5) * .2, r: 2.5 + R() * 4.5, c: [Pl.p, Pl.a, [255, 255, 255], Pl.ph][i % 4], decay: .018 + R() * .015, fr: .96 }); }
    }
  }
  var lastTrail = 0;
  addEventListener('pointermove', function (e) {
    if (mode() !== 'star-guardian' || reduced() || e.pointerType !== 'mouse') return;
    var now = performance.now(); if (now - lastTrail < 45) return; lastTrail = now;
    var Pl = palette(); add({ k: R() < .5 ? 'star' : 'dot', x: e.clientX + (R() - .5) * 8, y: e.clientY + (R() - .5) * 8, vy: .4 + R() * .6, vx: (R() - .5) * .5, r: 1.6 + R() * 2.4, c: [Pl.p, Pl.a, [255, 255, 255]][Math.floor(R() * 3)], decay: .03, rot: R() * 6, vr: .05, fr: .98 });
  }, { passive: true });
  document.addEventListener('pointerdown', function (e) {
    var b = e.target.closest && e.target.closest('.btn,.tab,.route-choice-button,.action-token,.rune-game-choice,.rune-tree-button,.chip,.dr-fab,.rx-roll-chip,.attr-card');
    if (!b || b.disabled) return; burst(e.clientX, e.clientY, b.classList.contains('primary') ? 1.4 : 1);
  }, true);

  /* ---------- ornamentos ---------------------------------------------- */
  var CORNER = '<svg viewBox="0 0 46 46"><path d="M3 43V12L12 3h31"/><path d="M9 43V15l6-6h28" opacity=".5"/><path d="m3 3 6 6M18 9l4-4 4 4-4 4Z"/></svg>';
  function decorate() {
    var sheet = document.querySelector('.sheet'); if (!sheet || sheet.querySelector('.rx-corner')) return;
    ['tl', 'tr', 'bl', 'br'].forEach(function (k) { var d = document.createElement('span'); d.className = 'rx-corner ' + k; d.setAttribute('aria-hidden', 'true'); d.innerHTML = CORNER; sheet.appendChild(d); });
  }

  /* ---------- indicador das abas -------------------------------------- */
  var ink = null;
  function positionInk(instant) {
    var nav = document.getElementById('tabs'); if (!nav) return;
    if (!ink || !ink.isConnected) { ink = document.createElement('span'); ink.className = 'rx-tab-ink'; ink.setAttribute('aria-hidden', 'true'); nav.prepend(ink); }
    var a = nav.querySelector('.tab.active:not([hidden])'); if (!a) { ink.style.opacity = '0'; return; }
    var nr = nav.getBoundingClientRect(), r = a.getBoundingClientRect();
    if (instant) ink.style.transition = 'none';
    ink.style.width = r.width + 'px'; ink.style.height = r.height + 'px'; ink.style.opacity = '1';
    ink.style.transform = 'translate(' + (r.left - nr.left + nav.scrollLeft) + 'px,' + (r.top - nr.top + nav.scrollTop) + 'px)';
    if (instant) { ink.getBoundingClientRect(); ink.style.transition = ''; }
  }

  /* ---------- transição de página ------------------------------------- */
  var PAGE_NAMES = { perfil: 'Perfil', combate: 'Combate', runas: 'Runas', habilidades: 'Técnicas', condicoes: 'Condições', inventario: 'Inventário', regras: 'Regras', estelares: 'Poderes estelares', arsenal: 'Arma Relicário' };
  function enterPage(name, from) {
    var page = document.querySelector('.page[data-page="' + name + '"]'); if (!page) return;
    page.classList.remove('rx-enter'); void page.offsetWidth;
    var i = 0; page.querySelectorAll('.panel').forEach(function (p) { if (i < 14) p.style.setProperty('--rx-i', i++); });
    if (!reduced()) page.classList.add('rx-enter');
    clearTimeout(page._rxT); page._rxT = setTimeout(function () { page.classList.remove('rx-enter'); }, 1400);
    if (!ready || reduced()) return;
    var m = mode(), tab = document.querySelector('.tab.active'), r = tab && tab.getBoundingClientRect();
    if (m === 'battle-academia') slashBanner(PAGE_NAMES[name] || name);
    else if (r) burst(r.left + r.width / 2, r.top + r.height / 2, 1.3);
  }
  function slashBanner(text) {
    var v = document.createElement('div'); v.className = 'rx-veil rx-slash';
    v.innerHTML = '<i class="s1"></i><i class="s2"></i><b>' + String(text).replace(/[<&]/g, '') + '!</b>';
    document.body.appendChild(v); setTimeout(function () { v.remove(); }, 900);
  }

  /* ---------- números animados ---------------------------------------- */
  var NUMSEL = '.attr-total-num,.derived b,.combat-hud-stat b,.resource-value,.inventory-summary-stat b,.stellar-budget b,.rune-game-budget b';
  var lastNums = {};
  function keyOf(el, i) { return (el.id || (el.closest('[data-edit-attr]') || {}).dataset?.editAttr || '') + '|' + el.className + '|' + i; }
  function animateNumbers() {
    if (!ready || reduced()) { snapshotNumbers(); return; }
    var els = document.querySelectorAll(NUMSEL), seen = {};
    els.forEach(function (el, i) {
      var tn = el.firstChild; if (!tn || tn.nodeType !== 3) return;
      var txt = tn.nodeValue, m = /^(\s*[-+]?)(\d+(?:[.,]\d+)?)(.*)$/.exec(txt); if (!m) return;
      var k = keyOf(el, i), val = parseFloat(m[2].replace(',', '.')); seen[k] = val;
      var old = lastNums[k];
      if (old == null || old === val || !el.offsetParent) return;
      var dec = (m[2].split(/[.,]/)[1] || '').length, t0 = performance.now(), dur = 650;
      el.classList.remove('rx-bump'); void el.offsetWidth; el.classList.add('rx-bump', val > old ? 'rx-up' : 'rx-down');
      setTimeout(function () { el.classList.remove('rx-bump', 'rx-up', 'rx-down'); }, 700);
      (function step(now) {
        if (tn.parentNode !== el) return;
        var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3), v = old + (val - old) * e;
        tn.nodeValue = m[1] + (dec ? v.toFixed(dec).replace('.', m[2].indexOf(',') >= 0 ? ',' : '.') : Math.round(v)) + m[3];
        if (p < 1) requestAnimationFrame(step); else tn.nodeValue = txt;
      })(t0);
    });
    for (var k in seen) lastNums[k] = seen[k];
  }
  function snapshotNumbers() {
    document.querySelectorAll(NUMSEL).forEach(function (el, i) { var tn = el.firstChild; if (!tn || tn.nodeType !== 3) return; var m = /^\s*[-+]?(\d+(?:[.,]\d+)?)/.exec(tn.nodeValue); if (m) lastNums[keyOf(el, i)] = parseFloat(m[1].replace(',', '.')); });
  }
  /* vida e mana: tremor ao perder, brilho ao recuperar */
  var lastHp = null, lastMp = null;
  function vitals() {
    var read = function (id) { var e = document.getElementById(id); if (!e) return null; var m = /(-?\d+(?:\.\d+)?)/.exec(e.textContent); return m ? +m[1] : null; };
    var hp = read('hpValue'), mp = read('mpValue');
    var fire = function (sel, cls) { document.querySelectorAll(sel).forEach(function (el) { el.classList.remove('rx-hit', 'rx-heal'); void el.offsetWidth; el.classList.add(cls); setTimeout(function () { el.classList.remove(cls); }, 800); }); };
    if (ready && lastHp != null && hp != null && hp !== lastHp) fire('.resource-card.hp,.combat-hud-resource.hp', hp < lastHp ? 'rx-hit' : 'rx-heal');
    if (ready && lastMp != null && mp != null && mp !== lastMp) fire('.resource-card.mp,.combat-hud-resource.mp', mp < lastMp ? 'rx-hit' : 'rx-heal');
    lastHp = hp; lastMp = mp;
  }

  /* ---------- atributos: inclinação 3D e rolagem ---------------------- */
  var D20 = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 9 5v10l-9 5-9-5V7Zm0 0L7 8l-4-1m9-5 5 6 4-1M7 8h10l-5 9Zm-4 9 9 0 9 0M7 8l-4 9m14-9 4 9m-9 0v5"/></svg>';
  function decorateAttrs() {
    document.querySelectorAll('#attrGrid .attr-card').forEach(function (card) {
      if (card.querySelector('.rx-roll-chip')) return;
      var b = document.createElement('button'); b.type = 'button'; b.className = 'rx-roll-chip'; b.innerHTML = D20;
      var code = (card.querySelector('.attr-code') || {}).textContent || '';
      b.title = 'Rolar 1d20 + ' + code; b.setAttribute('aria-label', 'Rolar teste de ' + ((card.querySelector('.attr-name') || {}).textContent || code));
      card.appendChild(b);
    });
  }
  document.addEventListener('click', function (e) {
    var chip = e.target.closest && e.target.closest('.rx-roll-chip'); if (!chip) return;
    e.preventDefault(); e.stopPropagation();
    var card = chip.closest('.attr-card'), code = (card.querySelector('.attr-code') || {}).textContent || '', v = parseInt((card.querySelector('.attr-total-num') || {}).textContent, 10) || 0;
    if (window.RxDice) RxDice.roll('1d20' + (v ? (v > 0 ? '+' : '') + v : ''), 'TESTE DE ' + code.trim().toUpperCase(), { attr: true });
  }, true);
  document.addEventListener('pointermove', function (e) {
    var c = e.target.closest && e.target.closest('.attr-card'); if (!c || reduced() || mode() === 'battle-academia') return;
    var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    c.style.transform = 'perspective(700px) rotateX(' + (-y * 14) + 'deg) rotateY(' + (x * 16) + 'deg) translateY(-6px) scale(1.03)';
  }, { passive: true });
  document.addEventListener('pointerout', function (e) { var c = e.target.closest && e.target.closest('.attr-card'); if (c && !c.contains(e.relatedTarget)) c.style.transform = ''; });

  /* ---------- abertura e troca de modalidade -------------------------- */
  var EMBLEM = {
    classic: '<svg viewBox="0 0 200 200"><g class="e-ring"><circle cx="100" cy="100" r="92"/><circle cx="100" cy="100" r="84" stroke-dasharray="2 6"/></g><path class="e-hex" d="m100 24 66 38v76l-66 38-66-38V62Z"/><path class="e-in" d="m100 24-34 47-32-9m66-38 34 47 32-9M66 71h68l-34 85ZM34 138l66-11 66 11M66 71l-32 67m100-67 32 67m-66-11v49"/></svg>',
    'battle-academia': '<svg viewBox="0 0 200 200"><path class="e-hex" d="M100 14 178 44v62l-78 82-78-82V44Z"/><path class="e-in" d="M100 44 140 94 100 144 60 94Z M100 30v150M40 94h120"/><path class="e-slash" d="M55 140 145 50"/></svg>',
    'star-guardian': '<svg viewBox="0 0 200 200"><g class="e-ring"><circle cx="100" cy="100" r="90" stroke-dasharray="1 9"/></g><path class="e-hex" d="m100 12 24 58 62 4-48 40 15 61-53-33-53 33 15-61-48-40 62-4Z"/><path class="e-in" d="m100 50 13 32 34 3-26 22 8 33-29-18-29 18 8-33-26-22 34-3Z"/></svg>'
  };
  var TITLES = { classic: ['Runearcana', 'Códice do Aventureiro'], 'battle-academia': ['Battle Academia', 'Registro do Estudante'], 'star-guardian': ['Star Guardian', 'Primeira Estrela'] };
  function curtain(m, intro) {
    if (reduced()) return;
    var v = document.createElement('div'); v.className = 'rx-curtain rx-c-' + m + (intro ? ' intro' : '');
    var t = TITLES[m] || TITLES.classic;
    v.innerHTML = '<div class="rx-c-bg"></div>' + (m === 'battle-academia' ? '<i class="rx-c-bar b1"></i><i class="rx-c-bar b2"></i><i class="rx-c-bar b3"></i>' : '') +
      '<div class="rx-c-mid"><div class="rx-c-emblem">' + EMBLEM[m] + '</div><small>Contos de Runeterra</small><h2>' + t[0] + '</h2><p>' + t[1] + '</p></div>';
    document.body.appendChild(v);
    var done = function () { if (!v.isConnected) return; v.classList.add('out'); setTimeout(function () { v.remove(); }, 700); };
    v.addEventListener('click', done);
    setTimeout(done, intro ? 1500 : 1050);
    setTimeout(function () { var r = v.querySelector('.rx-c-emblem').getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 2.4); }, intro ? 380 : 200);
  }

  /* ---------- ganchos nas funções da ficha ---------------------------- */
  function wrap(name, after, before) {
    var orig = window[name]; if (typeof orig !== 'function') return;
    window[name] = function () { var ctx = before ? before.apply(this, arguments) : null; var r = orig.apply(this, arguments); try { after && after.apply(this, [r, ctx].concat([].slice.call(arguments))); } catch (e) { console.warn('[RxFx]', name, e); } return r; };
  }
  function refresh() { syncMode(); decorate(); decorateAttrs(); positionInk(!ready); animateNumbers(); vitals(); }
  wrap('renderAll', function () { refresh(); });
  wrap('renderAttrs', function () { decorateAttrs(); });
  wrap('renderResources', function () { vitals(); });
  wrap('switchPage', function (r, prev, name) { requestAnimationFrame(function () { positionInk(); }); if (prev !== name) enterPage(name, prev); }, function () { var a = document.querySelector('.page.active'); return a ? a.dataset.page : null; });
  wrap('applyVisualTheme', function (r, prev) {
    syncMode(); requestAnimationFrame(function () { positionInk(true); });
    if (ready && prev && prev !== mode()) curtain(mode(), false);
  }, function () { return mode(); });
  new MutationObserver(function () { if (root.getAttribute('data-rx') !== mode()) { syncMode(); positionInk(true); } }).observe(root, { attributes: true, attributeFilter: ['data-visual-theme'] });

  function init() {
    document.body.appendChild(fx); sizeFx(); startSky(); refresh(); snapshotNumbers();
    var hasPlayed = false; try { hasPlayed = sessionStorage.getItem('rx-intro') === '1'; sessionStorage.setItem('rx-intro', '1'); } catch (e) {}
    if (!hasPlayed) curtain(mode(), true);
    setTimeout(function () { ready = true; positionInk(true); snapshotNumbers(); var a = document.querySelector('.page.active'); if (a) enterPage(a.dataset.page); }, 60);
    document.fonts && document.fonts.ready.then(function () { positionInk(true); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 0); }); else setTimeout(init, 0);

  window.RxFx = { burst: burst, curtain: curtain, refresh: refresh };
})();
