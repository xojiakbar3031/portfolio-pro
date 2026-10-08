// ============================================================
// KINEMATIK 3D SAHNA (Three.js)
// ------------------------------------------------------------
// Butun sayt — bitta 3D dunyo. Scroll kamerani shu dunyo ichida
// oldindan chizilgan yo'l bo'ylab uchiradi:
//   hero    -> portret atrofidagi giroskop halqalari, kamera ularni aylanadi
//   about   -> buralgan tunnel ichidan uchish
//   work    -> fazoda suzuvchi ramkalar orasidan o'tish
//   process -> to'lqinli relyef ustidan past uchish, oldinda 4 nur ustuni
//   contact -> ko'tarilib, katta globusni aylanib o'tish
// Kamera hech qachon qotib turmaydi: sekin tebranadi, og'adi (roll),
// sichqonchaga ergashadi, tez scroll qilinganda ko'rish burchagi kengayadi.
// O'chadigan hollar: WebGL yo'q / "reduced motion" / tab yashiringan.
// ============================================================
(function () {
  var canvas = document.getElementById("bg3d");
  if (!canvas || typeof THREE === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  } catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);
  document.body.classList.add("has-bg3d");

  var isMobile = window.matchMedia("(max-width: 1000px)").matches;
  var WHITE = 0xdfe4ff, BLUE = 0x6e8bff;

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0b0b0d, 0.017);
  var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 400);

  // ---------------- yordamchilar ----------------
  function lineMat(color, opacity) {
    return new THREE.LineBasicMaterial({
      color: color, transparent: true, opacity: opacity,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
  }
  function polygon(radius, sides, mat) {
    var pts = [];
    for (var i = 0; i < sides; i++) {
      var a = (i / sides) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0));
    }
    return new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), mat);
  }
  function rect(w, h, mat) {
    var x = w / 2, y = h / 2;
    var pts = [new THREE.Vector3(-x, -y, 0), new THREE.Vector3(x, -y, 0), new THREE.Vector3(x, y, 0), new THREE.Vector3(-x, y, 0)];
    return new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), mat);
  }
  // yumaloq porlaydigan nuqta teksturasi
  var sprite = (function () {
    var c = document.createElement("canvas");
    c.width = c.height = 64;
    var x = c.getContext("2d");
    var g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.3, "rgba(255,255,255,0.7)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  function pointsMat(color, size, opacity) {
    return new THREE.PointsMaterial({
      color: color, size: size, map: sprite, transparent: true, opacity: opacity,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
    });
  }

  // zonalar: [obyekt, p boshlanishi, p tugashi] — kamera uzoqda bo'lsa chizilmaydi
  var zones = [];
  function zone(o, from, to) { zones.push([o, from, to]); return o; }

  var spinners = []; // har kadrda aylantiriladigan obyektlar: { o, x, y, z }
  function spin(o, x, y, z) { spinners.push({ o: o, x: x, y: y, z: z }); return o; }

  // ================= 1) HERO: giroskop =================
  var CORE = isMobile ? new THREE.Vector3(0, 6.5, 0) : new THREE.Vector3(13.5, 4.2, 0);
  var core = new THREE.Group();
  core.position.copy(CORE);
  scene.add(core);
  zone(core, -1, 1.25);
  var coreScale = isMobile ? 0.72 : 1;
  [
    { r: 7.6, tilt: [1.18, 0, -0.32], color: WHITE, op: 0.8, speed: 0.22 },
    { r: 9.0, tilt: [0.55, 0.5, 0.9], color: BLUE, op: 0.9, speed: -0.16 },
    { r: 10.6, tilt: [-0.95, 0.25, 0.3], color: WHITE, op: 0.4, speed: 0.11 }
  ].forEach(function (cfg) {
    var holder = new THREE.Group();
    holder.rotation.set(cfg.tilt[0], cfg.tilt[1], cfg.tilt[2]);
    var ring = polygon(cfg.r * coreScale, 160, lineMat(cfg.color, cfg.op));
    // halqa bo'ylab yuguruvchi "elektronlar"
    var dots = new Float32Array(9);
    for (var i = 0; i < 3; i++) {
      var a = (i / 3) * Math.PI * 2;
      dots[i * 3] = Math.cos(a) * cfg.r * coreScale; dots[i * 3 + 1] = Math.sin(a) * cfg.r * coreScale;
    }
    var dg = new THREE.BufferGeometry();
    dg.setAttribute("position", new THREE.BufferAttribute(dots, 3));
    var glowN = 220, glow = new Float32Array(glowN * 3);
    for (var q = 0; q < glowN; q++) {
      var ga = (q / glowN) * Math.PI * 2;
      glow[q * 3] = Math.cos(ga) * cfg.r * coreScale; glow[q * 3 + 1] = Math.sin(ga) * cfg.r * coreScale;
    }
    var gg = new THREE.BufferGeometry();
    gg.setAttribute("position", new THREE.BufferAttribute(glow, 3));
    var spinner = new THREE.Group();
    spinner.add(ring);
    spinner.add(new THREE.Points(gg, pointsMat(cfg.color, 0.28, cfg.op * 0.7)));
    spinner.add(new THREE.Points(dg, pointsMat(cfg.color, 0.9, 0.95)));
    holder.add(spinner);
    core.add(holder);
    spin(spinner, 0, 0, cfg.speed);
    spin(holder, 0.03, 0.05, 0);
  });

  // ================= chang (butun yo'l bo'ylab) =================
  (function () {
    var n = isMobile ? 1300 : 2600;
    var pos = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 2] = 45 - Math.random() * 440;
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(g, pointsMat(WHITE, 0.32, 0.55)));
  })();

  // ================= 2) ABOUT: buralgan tunnel =================
  var tunnel = new THREE.Group();
  scene.add(tunnel);
  zone(tunnel, 0.3, 2.05);
  var frames = [];
  for (var f = 0; f < 30; f++) {
    var blue = f % 3 === 0;
    var frame = polygon(9, 6, lineMat(blue ? BLUE : WHITE, blue ? 0.95 : 0.45));
    frame.position.z = -28 - f * 3.8;
    frame.rotation.z = f * 0.13;
    if (blue) frame.add(polygon(5.2, 6, lineMat(BLUE, 0.35)));
    tunnel.add(frame);
    frames.push(frame);
  }

  // ================= 3) WORK: suzuvchi ramkalar =================
  var panels = [];
  (function () {
    var rnd = function (a, b) { return a + Math.random() * (b - a); };
    for (var i = 0; i < 16; i++) {
      var w = rnd(6, 13), h = w * rnd(0.55, 0.7);
      var g = new THREE.Group();
      var blue = i % 4 === 0;
      g.add(rect(w, h, lineMat(blue ? BLUE : WHITE, blue ? 0.95 : 0.6)));
      // ekran "sarlavha chizig'i" va ichki chiziqlar — interfeys silueti
      var bar = rect(w, h * 0.12, lineMat(blue ? BLUE : WHITE, 0.25));
      bar.position.y = h * 0.44;
      g.add(bar);
      var inner = rect(w * 0.42, h * 0.5, lineMat(WHITE, 0.16));
      inner.position.set(-w * 0.22, -h * 0.08, 0);
      g.add(inner);
      g.position.set(-36 + (i % 8) * 10.5 + rnd(-2, 2), rnd(-7, 9), -172 - Math.floor(i / 8) * 12 - rnd(0, 8));
      g.rotation.set(rnd(-0.15, 0.15), rnd(-0.5, 0.5), rnd(-0.06, 0.06));
      g.userData = { y: g.position.y, phase: Math.random() * 6.28, ry: g.rotation.y };
      scene.add(g);
      zone(g, 1.45, 3.0);
      panels.push(g);
    }
  })();

  // ================= 4) PROCESS: relyef + nur ustunlari =================
  (function () {
    var geo = new THREE.PlaneGeometry(170, 120, 68, 48);
    geo.rotateX(-Math.PI / 2);
    var p = geo.attributes.position;
    for (var i = 0; i < p.count; i++) {
      var x = p.getX(i), z = p.getZ(i);
      p.setY(i, Math.sin(x * 0.11) * Math.cos(z * 0.13) * 2.6 + Math.sin((x + z) * 0.05) * 2.2);
    }
    var terrain = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      color: BLUE, wireframe: true, transparent: true, opacity: 0.15,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    terrain.position.set(0, -7, -265);
    scene.add(terrain);
    zone(terrain, 2.55, 4.1);

    for (var k = 0; k < 4; k++) {
      var beam = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 30, 0.22),
        new THREE.MeshBasicMaterial({ color: k % 2 ? WHITE : BLUE, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      beam.position.set(-21 + k * 14, 8, -282);
      scene.add(beam);
      zone(beam, 2.55, 3.9);
      var base = polygon(2.2, 40, lineMat(k % 2 ? WHITE : BLUE, 0.6));
      base.rotation.x = Math.PI / 2;
      base.position.set(beam.position.x, -5.5, -282);
      scene.add(base);
      zone(base, 2.55, 3.9);
      spin(base, 0, 0, 0.5);
    }
  })();

  // ================= 5) CONTACT: globus =================
  var GLOBE = new THREE.Vector3(0, 6, -352);
  (function () {
    var g = new THREE.Group();
    g.position.copy(GLOBE);
    var ico = new THREE.IcosahedronGeometry(12, 2);
    g.add(new THREE.Mesh(ico, new THREE.MeshBasicMaterial({
      color: WHITE, wireframe: true, transparent: true, opacity: 0.26, blending: THREE.AdditiveBlending, depthWrite: false
    })));
    g.add(new THREE.Points(ico, pointsMat(BLUE, 0.55, 0.9)));
    scene.add(g);
    zone(g, 3.05, 9);
    spin(g, 0.02, 0.09, 0);
    [[16, 1.35, 0.2, BLUE, 0.6], [19.5, 1.1, -0.6, WHITE, 0.3]].forEach(function (c) {
      var ring = polygon(c[0], 180, lineMat(c[3], c[4]));
      var holder = new THREE.Group();
      holder.position.copy(GLOBE);
      holder.rotation.set(c[1], 0, c[2]);
      holder.add(ring);
      scene.add(holder);
      zone(holder, 3.05, 9);
      spin(ring, 0, 0, 0.12);
    });
  })();

  // ================= KAMERA YO'LI =================
  // p: 0 hero, 1 about, 2 work, 3 process, 4 contact (kasrlar — oraliq nuqtalar)
  var KEYS = isMobile ? [
    [0.0, [0, 3, 34], [0, 5.5, 0]],
    [0.55, [14, 8, 14], [0, 6.5, 0]],
    [1.0, [3, 1, -34], [0, 0, -70]],
    [1.6, [0, 0, -100], [0, 0, -135]],
    [2.0, [-18, 2, -146], [-10, 1, -180]],
    [2.6, [18, 2, -146], [10, 1, -180]],
    [3.0, [0, 4, -208], [0, -1, -262]],
    [3.6, [0, 8, -262], [0, 5, -330]],
    [4.0, [-14, 9, -312], [0, 6, -352]],
    [4.4, [14, 12, -314], [0, 6, -352]]
  ] : [
    [0.0, [0, 1.2, 30], [5, 1.6, 0]],
    [0.55, [24, 7, 13], [13.5, 4.2, 0]],
    [1.0, [4, 1, -34], [0, 0, -70]],
    [1.6, [0, 0, -100], [0, 0, -135]],
    [2.0, [-24, 2.5, -150], [-15, 1, -182]],
    [2.6, [24, 2.5, -150], [15, 1, -182]],
    [3.0, [0, 4, -212], [0, -1, -262]],
    [3.6, [0, 8, -268], [0, 5, -330]],
    [4.0, [-17, 9, -318], [0, 6, -352]],
    [4.4, [17, 12, -322], [0, 6, -352]]
  ];
  var v3 = function (a) { return new THREE.Vector3(a[0], a[1], a[2]); };
  var posCurve = new THREE.CatmullRomCurve3(KEYS.map(function (k) { return v3(k[1]); }), false, "catmullrom", 0.35);
  var lookCurve = new THREE.CatmullRomCurve3(KEYS.map(function (k) { return v3(k[2]); }), false, "catmullrom", 0.35);
  var P_MAX = KEYS[KEYS.length - 1][0];

  // p qiymatini egri chiziq parametriga (0..1) o'giradi
  function paramFor(p) {
    p = Math.max(0, Math.min(P_MAX, p));
    for (var i = 0; i < KEYS.length - 1; i++) {
      var a = KEYS[i][0], b = KEYS[i + 1][0];
      if (p <= b) return (i + (p - a) / (b - a)) / (KEYS.length - 1);
    }
    return 1;
  }

  // ---------------- scroll -> p ----------------
  var ids = ["top", "about", "work", "process", "contact"];
  var els = ids.map(function (id) { return document.getElementById(id); });
  var pTarget = 0, p = 0;
  function readScroll() {
    var vh = window.innerHeight;
    var y = window.scrollY + vh * 0.35 * Math.min(1, window.scrollY / (vh * 0.5));
    var tops = els.map(function (el) { return el ? el.getBoundingClientRect().top + window.scrollY : 0; });
    tops[0] = 0;
    var end = document.documentElement.scrollHeight - vh * 0.65;
    var val = 0;
    for (var i = 0; i < tops.length; i++) {
      var next = i < tops.length - 1 ? tops[i + 1] : end;
      if (y >= tops[i]) {
        var span = Math.max(1, next - tops[i]);
        var extra = i === tops.length - 1 ? P_MAX - i : 1;
        val = i + Math.min(1, (y - tops[i]) / span) * extra;
      }
    }
    pTarget = val;
  }
  window.addEventListener("scroll", readScroll, { passive: true });
  window.addEventListener("resize", readScroll);
  readScroll();
  // test/demo uchun: sahifa URL'ida #p=2.3 bo'lsa kamera o'sha nuqtada turadi
  var forced = /[#&]p=([\d.]+)/.exec(location.hash);
  if (forced) { pTarget = p = parseFloat(forced[1]); window.removeEventListener("scroll", readScroll); }

  // ---------------- sichqoncha ----------------
  var mx = 0, my = 0, mxS = 0, myS = 0;
  window.addEventListener("mousemove", function (e) {
    mx = e.clientX / window.innerWidth - 0.5;
    my = e.clientY / window.innerHeight - 0.5;
  }, { passive: true });

  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  // ---------------- animatsiya ----------------
  var clock = new THREE.Clock();
  var running = true;
  var camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
  var fov = 50, roll = 0;
  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
    if (running) { clock.getDelta(); requestAnimationFrame(animate); }
  });

  function smooth(a, b, x) { x = Math.max(0, Math.min(1, (x - a) / (b - a))); return x * x * (3 - 2 * x); }

  function animate() {
    if (!running) return;
    requestAnimationFrame(animate);
    var dt = Math.min(clock.getDelta(), 0.05);
    var t = clock.elapsedTime;

    // scroll'ni yumshatamiz — kamera "og'irlik" bilan harakatlanadi
    var prev = p;
    p += (pTarget - p) * (1 - Math.pow(0.012, dt));
    var vel = (p - prev) / Math.max(dt, 0.001); // bo'lim/soniya

    var u = paramFor(p);
    posCurve.getPoint(u, camPos);
    lookCurve.getPoint(u, camLook);

    // kamera hech qachon qotib turmaydi: sekin tebranish + sichqoncha
    mxS += (mx - mxS) * 0.04; myS += (my - myS) * 0.04;
    camPos.x += Math.sin(t * 0.31) * 0.9 + mxS * 2.4;
    camPos.y += Math.cos(t * 0.27) * 0.55 - myS * 1.5;
    camPos.z += Math.sin(t * 0.19) * 0.7;
    camLook.x += Math.sin(t * 0.23 + 1.3) * 0.35;
    camLook.y += Math.cos(t * 0.21) * 0.25;

    camera.position.copy(camPos);
    camera.lookAt(camLook);
    // og'ish: sekin "nafas" + tunnelda buralish + tezlikka bog'liq burilish
    var targetRoll = Math.sin(t * 0.22) * 0.03 + smooth(0.8, 1.2, p) * (1 - smooth(1.5, 1.9, p)) * Math.sin(p * 6.0) * 0.22 + Math.max(-0.12, Math.min(0.12, vel * 0.08));
    roll += (targetRoll - roll) * 0.08;
    camera.rotateZ(roll);
    // tez harakatda ko'rish burchagi kengayadi ("warp")
    var targetFov = 50 + Math.min(16, Math.abs(vel) * 9);
    fov += (targetFov - fov) * 0.1;
    if (Math.abs(camera.fov - fov) > 0.01) { camera.fov = fov; camera.updateProjectionMatrix(); }

    // faqat kameraga yaqin zonalar chiziladi
    for (var z = 0; z < zones.length; z++) zones[z][0].visible = p >= zones[z][1] && p <= zones[z][2];

    // obyektlar hayoti
    for (var i = 0; i < spinners.length; i++) {
      var s = spinners[i];
      s.o.rotation.x += s.x * dt; s.o.rotation.y += s.y * dt; s.o.rotation.z += s.z * dt;
    }
    for (var j = 0; j < frames.length; j++) frames[j].rotation.z += dt * 0.12 * (j % 2 ? 1 : -1);
    for (var k = 0; k < panels.length; k++) {
      var g = panels[k];
      g.position.y = g.userData.y + Math.sin(t * 0.5 + g.userData.phase) * 0.9;
      g.rotation.y = g.userData.ry + Math.sin(t * 0.3 + g.userData.phase) * 0.12;
    }

    // matnli bo'limlarda sahna biroz xiralashadi (o'qishga xalaqit bermasin)
    var dim = 1 - 0.42 * smooth(0.35, 0.95, p);
    canvas.style.opacity = dim.toFixed(3);

    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);
})();
