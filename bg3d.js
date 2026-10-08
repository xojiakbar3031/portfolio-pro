// ============================================================
// 3D FON — scroll bilan shakl o'zgartiradigan zarrachalar (Three.js)
// ------------------------------------------------------------
// ~7000 ta nuqta har bir bo'limda boshqa shaklga yig'iladi:
//   hero    -> portret atrofida aylanuvchi orbita halqasi
//   about   -> sfera
//   work    -> to'lqinli tekislik
//   process -> qo'sh spiral (DNK)
//   contact -> katta globus
// Har bir nuqtaning 5 ta shakldagi o'rni GPU'ga oldindan beriladi,
// bo'limlar orasida og'irliklar silliq almashadi — sakrashlarsiz morf.
// Sichqoncha yaqinidagi nuqtalar chetga suriladi va ko'k rangga kiradi.
// O'chadigan hollar: WebGL yo'q / "reduced motion" / tab yashiringan.
// ============================================================
(function () {
  var canvas = document.getElementById("bg3d");
  if (!canvas || typeof THREE === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
  } catch (e) { return; }
  var PR = Math.min(window.devicePixelRatio || 1, 1.75);
  renderer.setPixelRatio(PR);
  renderer.setClearColor(0x000000, 0);
  document.body.classList.add("has-bg3d");

  var isMobile = window.matchMedia("(max-width: 1000px)").matches;
  var N = isMobile ? 3600 : 7000;
  var SECTIONS = ["top", "about", "work", "process", "contact"];
  var K = SECTIONS.length;

  // ---------------- tasodifiy yordamchilar ----------------
  function gauss() {
    var u = 1 - Math.random(), v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  var tmpV = new THREE.Vector3();
  var tmpE = new THREE.Euler();

  // ---------------- shakllar ----------------
  // har biri: { pos: Float32Array(N*3), center, axis, spin }
  function orbitRing(center, R, tilt) {
    var pos = new Float32Array(N * 3);
    tmpE.set(tilt[0], 0, tilt[1]);
    for (var i = 0; i < N; i++) {
      var a = Math.random() * Math.PI * 2, r, y;
      var k = Math.random();
      if (k < 0.72) { r = R + gauss() * 0.28; y = gauss() * 0.18; }          // asosiy halqa
      else if (k < 0.9) { r = R * 1.32 + gauss() * 0.5; y = gauss() * 0.35; } // ikkinchi, xira orbita
      else { r = R * (0.6 + Math.random() * 1.2); y = gauss() * 2.2; }        // atrofdagi chang
      tmpV.set(Math.cos(a) * r, y, Math.sin(a) * r).applyEuler(tmpE).add(center);
      pos[i * 3] = tmpV.x; pos[i * 3 + 1] = tmpV.y; pos[i * 3 + 2] = tmpV.z;
    }
    var axis = new THREE.Vector3(0, 1, 0).applyEuler(tmpE).normalize();
    return { pos: pos, center: center, axis: axis, spin: 0.18 };
  }

  function sphere(center, R, spin) {
    var pos = new Float32Array(N * 3);
    var golden = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < N; i++) {
      var y = 1 - (i / (N - 1)) * 2;
      var rr = Math.sqrt(1 - y * y);
      var th = golden * i;
      var shell = Math.random() < 0.86 ? 1 + gauss() * 0.012 : Math.random() * 0.9;
      pos[i * 3] = center.x + Math.cos(th) * rr * R * shell;
      pos[i * 3 + 1] = center.y + y * R * shell;
      pos[i * 3 + 2] = center.z + Math.sin(th) * rr * R * shell;
    }
    return { pos: pos, center: center, axis: new THREE.Vector3(0.15, 1, 0).normalize(), spin: spin };
  }

  function wavePlane(center, W, D) {
    var pos = new Float32Array(N * 3);
    var cols = Math.round(Math.sqrt(N * (W / D))), rows = Math.ceil(N / cols);
    for (var i = 0; i < N; i++) {
      var cx = i % cols, cz = Math.floor(i / cols);
      var x = (cx / (cols - 1) - 0.5) * W;
      var z = (cz / (rows - 1) - 0.5) * D;
      var y = Math.sin(x * 0.28) * Math.cos(z * 0.33) * 1.8 + Math.sin((x + z) * 0.12) * 1.2;
      pos[i * 3] = center.x + x; pos[i * 3 + 1] = center.y + y; pos[i * 3 + 2] = center.z + z;
    }
    return { pos: pos, center: center, axis: new THREE.Vector3(0, 1, 0), spin: 0.03 };
  }

  function helix(center, L, R) {
    var pos = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) {
      var x = (Math.random() - 0.5) * L, a = x * 0.42, y, z;
      if (Math.random() < 0.8) {                       // ikki ip
        var strand = Math.random() < 0.5 ? 0 : Math.PI;
        y = Math.cos(a + strand) * R + gauss() * 0.12;
        z = Math.sin(a + strand) * R + gauss() * 0.12;
      } else {                                          // ular orasidagi "zinapoyalar"
        x = Math.round(x / 1.5) * 1.5; a = x * 0.42;
        var t = Math.random() * 2 - 1;
        y = Math.cos(a) * R * t; z = Math.sin(a) * R * t;
      }
      pos[i * 3] = center.x + x; pos[i * 3 + 1] = center.y + y; pos[i * 3 + 2] = center.z + z;
    }
    return { pos: pos, center: center, axis: new THREE.Vector3(1, 0, 0), spin: 0.35 };
  }

  // kamera z=30, fov=50 -> ekran yarim balandligi ~14 birlik
  var shapes = isMobile ? [
    orbitRing(new THREE.Vector3(0, 6.5, 0), 6.5, [1.2, -0.25]),
    sphere(new THREE.Vector3(0, 0, -4), 7, 0.12),
    wavePlane(new THREE.Vector3(0, -7, -4), 34, 26),
    helix(new THREE.Vector3(0, 0, -6), 34, 2.6),
    sphere(new THREE.Vector3(0, 0, -6), 9, 0.08)
  ] : [
    orbitRing(new THREE.Vector3(10.5, 3.2, 1), 8.6, [1.18, -0.32]),
    sphere(new THREE.Vector3(12.5, -0.5, -2), 7.2, 0.12),
    wavePlane(new THREE.Vector3(0, -8.5, -6), 64, 34),
    helix(new THREE.Vector3(0, -1, -4), 56, 3.2),
    sphere(new THREE.Vector3(0, 0, -8), 11.5, 0.07)
  ];

  // ---------------- geometriya ----------------
  var geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(shapes[0].pos.slice(), 3));
  for (var s = 0; s < K; s++) geo.setAttribute("p" + s, new THREE.BufferAttribute(shapes[s].pos, 3));
  var rnd = new Float32Array(N * 3);
  for (var i = 0; i < rnd.length; i++) rnd[i] = Math.random();
  geo.setAttribute("aRand", new THREE.BufferAttribute(rnd, 3));

  var uniforms = {
    uTime: { value: 0 },
    uW: { value: [1, 0, 0, 0, 0] },
    uC: { value: shapes.map(function (sh) { return sh.center; }) },
    uAx: { value: shapes.map(function (sh) { return sh.axis; }) },
    uSpin: { value: shapes.map(function (sh) { return sh.spin; }) },
    uMorph: { value: 0 },
    uMouse: { value: new THREE.Vector3(999, 999, 0) },
    uMouseOn: { value: 0 },
    uSize: { value: isMobile ? 2.6 : 2.2 },
    uPR: { value: PR },
    uOpacity: { value: 1 }
  };

  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: [
      "attribute vec3 p0; attribute vec3 p1; attribute vec3 p2; attribute vec3 p3; attribute vec3 p4;",
      "attribute vec3 aRand;",
      "uniform float uW[5]; uniform vec3 uC[5]; uniform vec3 uAx[5]; uniform float uSpin[5];",
      "uniform float uTime; uniform float uMorph; uniform vec3 uMouse; uniform float uMouseOn;",
      "uniform float uSize; uniform float uPR;",
      "varying vec3 vCol; varying float vA;",
      "vec3 rot(vec3 p, vec3 c, vec3 ax, float a){",
      "  p -= c; float s = sin(a); float co = cos(a);",
      "  return c + p * co + cross(ax, p) * s + ax * dot(ax, p) * (1.0 - co);",
      "}",
      "void main(){",
      "  float t = uTime;",
      "  vec3 pos = uW[0] * rot(p0, uC[0], uAx[0], t * uSpin[0])",
      "          + uW[1] * rot(p1, uC[1], uAx[1], t * uSpin[1])",
      "          + uW[2] * rot(p2, uC[2], uAx[2], t * uSpin[2])",
      "          + uW[3] * rot(p3, uC[3], uAx[3], t * uSpin[3])",
      "          + uW[4] * rot(p4, uC[4], uAx[4], t * uSpin[4]);",
      // tirik "nafas" va to'lqin tekisligidagi harakat
      "  pos += vec3(sin(t * 0.7 + aRand.x * 6.28), cos(t * 0.6 + aRand.y * 6.28), sin(t * 0.5 + aRand.z * 6.28)) * 0.08;",
      "  pos.y += uW[2] * sin(pos.x * 0.25 + t * 0.9) * 0.6;",
      // morf paytida nuqtalar biroz tarqaladi
      "  vec3 dir = normalize(aRand - 0.5 + 0.0001);",
      "  pos += dir * uMorph * (3.0 + aRand.y * 5.0);",
      // sichqoncha: yaqin nuqtalarni itaradi
      "  vec2 d = pos.xy - uMouse.xy; float l = length(d);",
      "  float f = uMouseOn * (1.0 - smoothstep(0.0, 4.2, l));",
      "  pos.xy += normalize(d + 0.0001) * f * 2.4; pos.z += f * 1.5;",
      "  vec4 mv = modelViewMatrix * vec4(pos, 1.0);",
      "  gl_Position = projectionMatrix * mv;",
      "  gl_PointSize = uSize * (0.55 + aRand.y * 0.9) * uPR * (30.0 / -mv.z);",
      "  vec3 white = vec3(0.86, 0.89, 1.0); vec3 blue = vec3(0.43, 0.55, 1.0);",
      "  vCol = mix(white, blue, clamp(aRand.x * 0.75 + f, 0.0, 1.0));",
      "  vA = (0.25 + 0.75 * aRand.z) * (1.0 + f * 1.5) * clamp(1.2 - (-mv.z - 20.0) / 30.0, 0.25, 1.0);",
      "}"
    ].join("\n"),
    fragmentShader: [
      "uniform float uOpacity;",
      "varying vec3 vCol; varying float vA;",
      "void main(){",
      "  float d = length(gl_PointCoord - 0.5);",
      "  float a = smoothstep(0.5, 0.0, d);",
      "  gl_FragColor = vec4(vCol, a * a * vA * uOpacity);",
      "}"
    ].join("\n")
  });

  var points = new THREE.Points(geo, material);
  points.frustumCulled = false;
  var scene = new THREE.Scene();
  scene.add(points);
  var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
  camera.position.set(0, 0, 30);

  // ---------------- bo'limni aniqlash ----------------
  var sectionEls = SECTIONS.map(function (id) { return document.getElementById(id); });
  var target = 0;
  function readSection() {
    var mid = window.scrollY + window.innerHeight * 0.45;
    var idx = 0;
    for (var i = 0; i < K; i++) {
      var el = sectionEls[i];
      if (el && el.getBoundingClientRect().top + window.scrollY <= mid) idx = i;
    }
    target = idx;
  }
  window.addEventListener("scroll", readSection, { passive: true });
  readSection();

  // ---------------- sichqoncha ----------------
  var mouseNdc = new THREE.Vector2(9, 9), mouseOn = false;
  window.addEventListener("mousemove", function (e) {
    mouseNdc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    mouseOn = true;
  }, { passive: true });
  document.addEventListener("mouseleave", function () { mouseOn = false; });
  var raycaster = new THREE.Raycaster();
  var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  var hit = new THREE.Vector3();

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
  var weights = [1, 0, 0, 0, 0];
  var camX = 0, camY = 0;
  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
    if (running) { clock.getDelta(); requestAnimationFrame(animate); }
  });

  function animate() {
    if (!running) return;
    requestAnimationFrame(animate);
    var dt = Math.min(clock.getDelta(), 0.05);
    uniforms.uTime.value = clock.elapsedTime;

    // og'irliklarni maqsadli shaklga silliq yaqinlashtiramiz
    var k = 1 - Math.pow(0.035, dt), sum = 0, maxW = 0;
    for (var i = 0; i < K; i++) {
      weights[i] += ((i === target ? 1 : 0) - weights[i]) * k;
      sum += weights[i];
    }
    for (var j = 0; j < K; j++) { weights[j] /= sum; maxW = Math.max(maxW, weights[j]); uniforms.uW.value[j] = weights[j]; }
    uniforms.uMorph.value = Math.pow(1 - maxW, 0.8) * 1.6;
    // hero'da to'liq yorqin, matnli bo'limlarda vazminroq
    uniforms.uOpacity.value = 0.75 + weights[0] * 0.25;

    // sichqoncha
    raycaster.setFromCamera(mouseNdc, camera);
    if (raycaster.ray.intersectPlane(plane, hit)) uniforms.uMouse.value.copy(hit);
    uniforms.uMouseOn.value += ((mouseOn ? 1 : 0) - uniforms.uMouseOn.value) * 0.06;

    // kameraning yengil parallaksi
    camX += (mouseNdc.x * (mouseOn ? 1.2 : 0) - camX) * 0.03;
    camY += (mouseNdc.y * (mouseOn ? 0.8 : 0) - camY) * 0.03;
    camera.position.x = camX;
    camera.position.y = camY;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);
})();
