// ============================================================
// 3D ANIMATSIYALI FON — scroll'ga reaksiya qiladi (Three.js)
// ------------------------------------------------------------
// Butun sahifa ortidagi zarralar maydoni. Sahifani scroll qilganda:
//   - kamera maydon ustidan uchib o'tadi (baland -> yaqin -> orqaga)
//   - to'lqin kuchayadi, tezlashadi, keyin tinchlanadi
//   - rang palitrasi asta o'zgaradi (qip-qizil -> to'q sariq -> kuydirilgan)
//   - butun maydon ~90 gradusga buriladi
// Sichqoncha bilan yengil parallaks ham bor.
// O'chadigan hollar: WebGL yo'q / "reduced motion" / tab yashiringan.
// ============================================================
(function () {
  var canvas = document.getElementById("bg3d");
  if (!canvas || typeof THREE === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (e) {
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 1000);

  var lerp = (THREE.MathUtils && THREE.MathUtils.lerp) || function (a, b, t) { return a + (b - a) * t; };
  var clamp = (THREE.MathUtils && THREE.MathUtils.clamp) || function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  // --- Yumaloq, yumshoq zarra teksturasi (kvadrat nuqtalar o'rniga) ---
  var sprite = (function () {
    var c = document.createElement("canvas");
    c.width = c.height = 64;
    var g = c.getContext("2d");
    var rg = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    rg.addColorStop(0, "rgba(255,255,255,1)");
    rg.addColorStop(0.35, "rgba(255,255,255,0.85)");
    rg.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = rg;
    g.fillRect(0, 0, 64, 64);
    var tex = new THREE.CanvasTexture(c);
    return tex;
  })();

  // --- Zarralar maydoni ---
  var COLS = 110, ROWS = 110, GAP = 1.5;
  var count = COLS * ROWS;
  var positions = new Float32Array(count * 3);
  var colors = new Float32Array(count * 3);
  var baseCol = new Float32Array(count); // har zarra uchun diagonal t (0..1) — rangni qayta hisoblash uchun

  var i = 0;
  for (var x = 0; x < COLS; x++) {
    for (var z = 0; z < ROWS; z++) {
      positions[i * 3] = (x - COLS / 2) * GAP;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = (z - ROWS / 2) * GAP;
      baseCol[i] = (x / COLS + z / ROWS) / 2;
      i++;
    }
  }

  var geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  var mat = new THREE.PointsMaterial({
    size: 0.55,
    map: sprite,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });

  var points = new THREE.Points(geo, mat);
  points.position.y = -7;
  scene.add(points);

  // --- Rang palitrasini scroll bo'yicha qayta hisoblash (tejamli, throttled) ---
  var cA = new THREE.Color(), cB = new THREE.Color(), cC = new THREE.Color(), tmp = new THREE.Color();
  function recolor(scrollN) {
    // palitra: yuqorida (0) qip-qizil/tilla, pastda (1) to'q kuydirilgan tomon suriladi
    var hueShift = -0.06 * scrollN;      // ozgina magenta -> qahrabo tomon
    cA.setHSL(clamp(0.97 + hueShift, 0, 1), 0.85, 0.55);  // ~#ff2f56
    cB.setHSL(clamp(0.03 + hueShift * 0.5, 0, 1), 0.95, 0.53); // ~#ff3b1f
    cC.setHSL(clamp(0.10 + hueShift * 0.3, 0, 1), 0.95, 0.55); // ~#ffb020
    var arr = geo.attributes.color.array;
    for (var n = 0; n < count; n++) {
      var t = baseCol[n];
      if (t < 0.5) tmp.copy(cA).lerp(cB, t * 2);
      else tmp.copy(cB).lerp(cC, (t - 0.5) * 2);
      arr[n * 3] = tmp.r; arr[n * 3 + 1] = tmp.g; arr[n * 3 + 2] = tmp.b;
    }
    geo.attributes.color.needsUpdate = true;
  }
  recolor(0);

  // --- Scroll holati ---
  var scrollTarget = 0, scrollCur = 0;
  function readScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    scrollTarget = h > 0 ? clamp(window.scrollY / h, 0, 1) : 0;
  }
  window.addEventListener("scroll", readScroll, { passive: true });
  readScroll();

  // --- Sichqoncha parallaksi ---
  var mx = 0, my = 0;
  window.addEventListener("mousemove", function (e) {
    mx = e.clientX / window.innerWidth - 0.5;
    my = e.clientY / window.innerHeight - 0.5;
  });

  // --- O'lcham ---
  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  window.addEventListener("resize", resize);
  resize();

  // --- Animatsiya ---
  var clock = new THREE.Clock();
  var running = true;
  var frame = 0, lastRecolorAt = -1;

  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
    if (running) { clock.start(); animate(); }
  });

  function animate() {
    if (!running) return;
    requestAnimationFrame(animate);
    frame++;

    var t = clock.getElapsedTime();
    scrollCur += (scrollTarget - scrollCur) * 0.06;
    var s = scrollCur;                 // 0..1 silliqlangan scroll
    var eS = easeInOut(s);
    var swell = Math.sin(s * Math.PI); // 0 -> 1 (o'rtada) -> 0

    // --- To'lqin: amplituda va tezlik scroll bo'yicha o'zgaradi ---
    var amp = 1.0 + swell * 1.9 + s * 0.4;          // tinch -> katta -> biroz tinch
    var speed = 0.6 + s * 1.7;                       // scroll -> tezroq
    var twist = swell * 0.9;                         // o'rtada buralish kuchli
    var pos = geo.attributes.position.array;
    var k = 0;
    for (var xx = 0; xx < COLS; xx++) {
      for (var zz = 0; zz < ROWS; zz++) {
        var wx = (xx - COLS / 2) * 0.26;
        var wz = (zz - ROWS / 2) * 0.26;
        var d = Math.sqrt(wx * wx + wz * wz);
        pos[k * 3 + 1] =
          (Math.sin(wx + t * speed) * 1.5 +
           Math.cos(wz * 0.8 + t * speed * 0.8) * 1.5 +
           Math.sin((wx + wz) * 0.5 + t * speed * 0.6) * 0.9 +
           Math.sin(d - t * speed * 0.9) * twist * 2.2) * amp;
        k++;
      }
    }
    geo.attributes.position.needsUpdate = true;

    // --- Rangni har ~12 kadrda va scroll sezilarli o'zgarganda yangilaymiz ---
    if (frame % 12 === 0 && Math.abs(s - lastRecolorAt) > 0.015) {
      recolor(s);
      lastRecolorAt = s;
    }

    // --- Kamera: baland/uzoq -> past/yaqin -> orqaga tortiladi ---
    var camY = lerp(24, 4, eS) + Math.sin(s * Math.PI) * -6;   // o'rtada sirtga yaqinlashadi
    var camZ = lerp(50, 28, eS) + swell * -6;
    camera.position.x = lerp(camera.position.x, mx * 8, 0.05);
    camera.position.y = lerp(camera.position.y, camY, 0.05);
    camera.position.z = lerp(camera.position.z, camZ, 0.05);
    camera.lookAt(mx * 4, -4 + s * 4 + my * 3, -6 + s * 14);

    // --- Butun maydon scroll bo'yicha buriladi + doimiy sekin aylanish ---
    points.rotation.y = s * Math.PI * 0.5 + t * 0.02 + mx * 0.25;
    points.rotation.x = -0.15 + my * 0.12 - swell * 0.08;
    points.rotation.z = twist * 0.12;

    // --- Zarra o'lchami va yorqinligi ---
    mat.size = 0.5 + eS * 0.4 + swell * 0.15;
    mat.opacity = 0.9 + swell * 0.08;

    renderer.render(scene, camera);
  }
  animate();
})();
