// ============================================================
// 3D ANIMATSIYALI FON (Three.js particle wave)
// ------------------------------------------------------------
// Butun sahifa ortida turadigan, sekin to'lqinlanadigan zarralar
// maydoni. Ranglar saytning issiq gradientiga mos. Sichqoncha bilan
// yengil parallaks. Quyidagi hollarda o'chadi (fon blob'lar qoladi):
//   - brauzerda WebGL yo'q
//   - foydalanuvchi "reduced motion" ni yoqqan
//   - tab yashirilgan (batareya/CPU tejash uchun)
// ============================================================
(function () {
  var canvas = document.getElementById("bg3d");
  if (!canvas || typeof THREE === "undefined") return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (e) {
    return; // WebGL yo'q
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 20, 46);
  camera.lookAt(0, -4, -6);

  // --- Zarralar maydoni (tekislik) ---
  var COLS = 96, ROWS = 96, GAP = 1.7;
  var count = COLS * ROWS;
  var positions = new Float32Array(count * 3);
  var colors = new Float32Array(count * 3);

  var cA = new THREE.Color(0xff2f56); // accent-3
  var cB = new THREE.Color(0xff3b1f); // accent-1
  var cC = new THREE.Color(0xffb020); // accent-2
  var tmp = new THREE.Color();

  var i = 0;
  for (var x = 0; x < COLS; x++) {
    for (var z = 0; z < ROWS; z++) {
      var px = (x - COLS / 2) * GAP;
      var pz = (z - ROWS / 2) * GAP;
      positions[i * 3] = px;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = pz;

      // rang: diagonal bo'yicha cA -> cB -> cC
      var t = (x / COLS + z / ROWS) / 2;
      if (t < 0.5) tmp.copy(cA).lerp(cB, t * 2);
      else tmp.copy(cB).lerp(cC, (t - 0.5) * 2);
      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
      i++;
    }
  }

  var geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  var mat = new THREE.PointsMaterial({
    size: 0.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });

  var points = new THREE.Points(geo, mat);
  points.position.y = -7;
  points.rotation.x = -0.15;
  scene.add(points);

  // --- Sichqoncha parallaksi ---
  var targetRotY = 0, targetRotX = -0.15, curRotY = 0, curRotX = -0.15;
  window.addEventListener("mousemove", function (e) {
    var nx = e.clientX / window.innerWidth - 0.5;
    var ny = e.clientY / window.innerHeight - 0.5;
    targetRotY = nx * 0.35;
    targetRotX = -0.15 + ny * 0.15;
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
  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
    if (running) { clock.start(); animate(); }
  });

  function animate() {
    if (!running) return;
    requestAnimationFrame(animate);

    var t = clock.getElapsedTime();
    var pos = geo.attributes.position.array;
    var k = 0;
    for (var xx = 0; xx < COLS; xx++) {
      for (var zz = 0; zz < ROWS; zz++) {
        var wx = (xx - COLS / 2) * 0.28;
        var wz = (zz - ROWS / 2) * 0.28;
        pos[k * 3 + 1] =
          Math.sin(wx + t * 0.9) * 1.6 +
          Math.cos(wz * 0.8 + t * 0.7) * 1.6 +
          Math.sin((wx + wz) * 0.5 + t * 0.5) * 0.9;
        k++;
      }
    }
    geo.attributes.position.needsUpdate = true;

    curRotY += (targetRotY - curRotY) * 0.04;
    curRotX += (targetRotX - curRotX) * 0.04;
    points.rotation.y = curRotY + t * 0.03;
    points.rotation.x = curRotX;

    renderer.render(scene, camera);
  }
  animate();
})();
