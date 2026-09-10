// ============================================================
// 3D ANIMATSIYALI FON — suzuvchi kristallar (Three.js)
// ------------------------------------------------------------
// Sahifa ortida sekin aylanib, suzib yuradigan qirrali,
// olmos kabi shakllar. Yorug'likni tutadi (issiq tilla + pushti
// nur). Scroll qilganda: tezroq aylanadi, bir-biridan uzoqlashadi,
// kamera yaqinlashadi, nur ranglari asta siljiydi.
// Sichqoncha bilan yengil parallaks.
// O'chadigan hollar: WebGL yo'q / "reduced motion" / tab yashiringan.
// ============================================================
(function () {
  var canvas = document.getElementById("bg3d");
  if (!canvas || typeof THREE === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  var lerp = (THREE.MathUtils && THREE.MathUtils.lerp) || function (a, b, t) { return a + (b - a) * t; };
  var clamp = (THREE.MathUtils && THREE.MathUtils.clamp) || function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 300);
  camera.position.set(0, 0, 42);

  // --- Yorug'lik: qirralar tilla va pushti nur tutadi ---
  scene.add(new THREE.AmbientLight(0x2a1c12, 1.0));
  var keyLight = new THREE.DirectionalLight(0xffcf7a, 2.2);  // tilla, yuqori-o'ngdan
  keyLight.position.set(6, 8, 5);
  scene.add(keyLight);
  var rimLight = new THREE.DirectionalLight(0xff3f6e, 1.8);  // pushti, past-chapdan
  rimLight.position.set(-7, -5, 3);
  scene.add(rimLight);
  var glint = new THREE.PointLight(0xffe0a0, 1.4, 120);      // aylanib yuradigan "chaqnash"
  scene.add(glint);

  // --- Kristal shakllar ---
  var shapeGeos = [
    new THREE.OctahedronGeometry(1, 0),
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.TetrahedronGeometry(1.15, 0)
  ];
  var edgeColors = [0xffb020, 0xff3b1f, 0xff2f56, 0xffd27a];

  var crystals = [];
  var GROUP = new THREE.Group();
  scene.add(GROUP);

  var LAYOUT = [
    // [x, y, z, scale, stretchY]
    [11, 3, -4, 3.4, 1.9],
    [-13, -4, -8, 4.2, 1.5],
    [7, -8, 2, 2.2, 2.2],
    [-8, 7, -3, 2.0, 1.7],
    [15, -6, -12, 3.0, 1.6],
    [-4, -1, 6, 1.5, 2.4],
    [3, 9, -10, 2.6, 1.4],
    [-16, 2, -5, 2.4, 2.0],
    [18, 8, -16, 3.6, 1.5]
  ];

  for (var i = 0; i < LAYOUT.length; i++) {
    var L = LAYOUT[i];
    var g = shapeGeos[i % shapeGeos.length];
    var mat = new THREE.MeshStandardMaterial({
      color: 0x140a06, metalness: 0.6, roughness: 0.22, flatShading: true,
      transparent: true, opacity: 0.92
    });
    var mesh = new THREE.Mesh(g, mat);
    mesh.scale.set(L[3], L[3] * L[4], L[3]);

    // porlaydigan qirralar
    var edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(g),
      new THREE.LineBasicMaterial({
        color: edgeColors[i % edgeColors.length],
        transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false
      })
    );
    mesh.add(edges);

    var holder = new THREE.Group();
    holder.position.set(L[0], L[1], L[2]);
    holder.add(mesh);
    GROUP.add(holder);

    crystals.push({
      holder: holder,
      mesh: mesh,
      base: new THREE.Vector3(L[0], L[1], L[2]),
      rx: (Math.random() - 0.5) * 0.006 + 0.002,
      ry: (Math.random() - 0.5) * 0.006 + 0.003,
      floatSpeed: 0.3 + Math.random() * 0.5,
      floatRange: 1.2 + Math.random() * 2.0,
      phase: Math.random() * Math.PI * 2
    });
  }

  // --- Scroll holati ---
  var scrollTarget = 0, scrollCur = 0;
  function readScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    scrollTarget = h > 0 ? clamp(window.scrollY / h, 0, 1) : 0;
  }
  window.addEventListener("scroll", readScroll, { passive: true });
  readScroll();

  // --- Sichqoncha ---
  var mx = 0, my = 0;
  window.addEventListener("mousemove", function (e) {
    mx = e.clientX / window.innerWidth - 0.5;
    my = e.clientY / window.innerHeight - 0.5;
  });

  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  window.addEventListener("resize", resize);
  resize();

  var clock = new THREE.Clock();
  var running = true;
  var keyHSL = { h: 0.09, s: 0.9, l: 0.62 };
  var rimHSL = { h: 0.95, s: 0.85, l: 0.6 };
  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
    if (running) { clock.start(); animate(); }
  });

  function animate() {
    if (!running) return;
    requestAnimationFrame(animate);

    var t = clock.getElapsedTime();
    scrollCur += (scrollTarget - scrollCur) * 0.06;
    var s = scrollCur;
    var eS = easeInOut(s);
    var swell = Math.sin(s * Math.PI);

    var rotMul = 1 + s * 2.4;
    var spread = 1 + s * 0.55 + swell * 0.15;

    for (var i = 0; i < crystals.length; i++) {
      var c = crystals[i];
      c.mesh.rotation.x += c.rx * rotMul;
      c.mesh.rotation.y += c.ry * rotMul;
      c.holder.position.x = c.base.x * spread + Math.sin(t * c.floatSpeed * 0.6 + c.phase) * 0.8;
      c.holder.position.y = c.base.y * spread + Math.sin(t * c.floatSpeed + c.phase) * c.floatRange;
      c.holder.position.z = c.base.z * (1 + s * 0.2);
      var sc = 1 + swell * 0.12;
      c.holder.scale.setScalar(sc);
    }

    // butun to'p scroll bo'yicha biroz buriladi + sichqoncha parallaksi
    GROUP.rotation.y = lerp(GROUP.rotation.y, s * 0.7 + mx * 0.25, 0.05);
    GROUP.rotation.x = lerp(GROUP.rotation.x, my * 0.18 - s * 0.15, 0.05);

    // aylanib yuradigan chaqnash
    glint.position.set(Math.cos(t * 0.5) * 22, Math.sin(t * 0.4) * 14, Math.sin(t * 0.5) * 18 + 8);

    // nur ranglarini scroll bo'yicha ozgina siljitamiz
    keyLight.color.setHSL(keyHSL.h - s * 0.03, keyHSL.s, keyHSL.l);
    rimLight.color.setHSL(rimHSL.h - s * 0.04, rimHSL.s, rimHSL.l);

    // kamera yaqinlashadi + parallaks
    camera.position.x = lerp(camera.position.x, mx * 6, 0.04);
    camera.position.y = lerp(camera.position.y, my * 4, 0.04);
    camera.position.z = lerp(camera.position.z, lerp(42, 30, eS) - swell * 3, 0.04);
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  animate();
})();
