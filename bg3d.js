// ============================================================
// 3D ANIMATSIYALI FON — deformatsiyalanadigan wireframe shar
// ------------------------------------------------------------
// Sahifa ortida sekin buraladigan, "nafas oladigan" katta shakl.
// Scroll qilganda:
//   - shakl kuchliroq deformatsiyalanadi (tikanlanadi), keyin tinchlanadi
//   - aylanish tezlashadi, butun shakl qo'shimcha buriladi
//   - kamera yaqinlashadi
//   - rang palitrasi asta siljiydi
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
  var camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.set(0, 0, 58);

  // --- Asosiy shakl: bo'lingan ikosaedr (silliq shar) ---
  var RADIUS = 15;
  var geo = new THREE.IcosahedronGeometry(RADIUS, 4); // ~2.5k vertex (sekin qurilmalar uchun yengil)
  var basePos = geo.attributes.position.array.slice(0); // asl koordinatalar
  var vcount = geo.attributes.position.count;

  // har vertex uchun markazdan yo'nalish (normal) — deformatsiya shu bo'yicha
  var normDir = new Float32Array(vcount * 3);
  for (var v = 0; v < vcount; v++) {
    var x = basePos[v * 3], y = basePos[v * 3 + 1], z = basePos[v * 3 + 2];
    var len = Math.sqrt(x * x + y * y + z * z) || 1;
    normDir[v * 3] = x / len; normDir[v * 3 + 1] = y / len; normDir[v * 3 + 2] = z / len;
  }

  // vertex ranglari (y bo'yicha gradient)
  var colors = new Float32Array(vcount * 3);
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  var cA = new THREE.Color(), cB = new THREE.Color(), cC = new THREE.Color(), tmp = new THREE.Color();
  function recolor(scrollN) {
    var hs = -0.05 * scrollN;
    cA.setHSL(clamp(0.97 + hs, 0, 1), 0.85, 0.58);
    cB.setHSL(clamp(0.02 + hs * 0.5, 0, 1), 0.95, 0.55);
    cC.setHSL(clamp(0.10 + hs * 0.3, 0, 1), 0.95, 0.55);
    var arr = geo.attributes.color.array;
    for (var n = 0; n < vcount; n++) {
      var ny = (basePos[n * 3 + 1] / RADIUS + 1) / 2; // 0..1
      if (ny < 0.5) tmp.copy(cA).lerp(cB, ny * 2);
      else tmp.copy(cB).lerp(cC, (ny - 0.5) * 2);
      arr[n * 3] = tmp.r; arr[n * 3 + 1] = tmp.g; arr[n * 3 + 2] = tmp.b;
    }
    geo.attributes.color.needsUpdate = true;
  }
  recolor(0);

  // to'liq shakl (juda xira, "tana" beradi)
  var solid = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
    vertexColors: true, transparent: true, opacity: 0.06, depthWrite: false
  }));
  // wireframe (asosiy vizual — porlaydigan to'r)
  var wire = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
    vertexColors: true, wireframe: true, transparent: true, opacity: 0.5,
    depthWrite: false, blending: THREE.AdditiveBlending
  }));

  var group = new THREE.Group();
  group.add(solid);
  group.add(wire);
  group.position.x = 7;
  scene.add(group);

  // ikkinchi kichik shakl (chuqurlik uchun) — halqa
  var ring = new THREE.Mesh(
    new THREE.TorusGeometry(9, 0.25, 8, 90),
    new THREE.MeshBasicMaterial({ color: 0xffb020, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  ring.position.set(-14, -6, -8);
  scene.add(ring);

  // --- pseudo-3D shovqin (arzon, sin/cos qatlamlari) ---
  function noise(x, y, z, t) {
    return (
      Math.sin(x * 1.5 + t) * 0.5 +
      Math.sin(y * 1.8 - t * 1.1) * 0.5 +
      Math.sin(z * 1.3 + t * 0.7) * 0.5 +
      Math.sin((x + y) * 1.1 + t * 0.9) * 0.35 +
      Math.sin((y + z) * 0.9 - t * 0.8) * 0.35 +
      Math.sin((x + z) * 1.2 + t * 0.6) * 0.3
    );
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
  var running = true, frame = 0, lastRecolor = -1;
  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
    if (running) { clock.start(); animate(); }
  });

  var pos = geo.attributes.position.array;

  function animate() {
    if (!running) return;
    requestAnimationFrame(animate);
    frame++;

    var t = clock.getElapsedTime();
    scrollCur += (scrollTarget - scrollCur) * 0.06;
    var s = scrollCur;
    var eS = easeInOut(s);
    var swell = Math.sin(s * Math.PI);              // 0 -> 1 (o'rta) -> 0

    var amp = 1.1 + swell * 3.4 + s * 0.6;          // deformatsiya kuchi
    var nt = t * (0.5 + s * 1.3);                    // shovqin tezligi scroll bo'yicha

    // --- Vertexlarni normal bo'yicha deformatsiya ---
    for (var i = 0; i < vcount; i++) {
      var bx = basePos[i * 3], by = basePos[i * 3 + 1], bz = basePos[i * 3 + 2];
      var d = noise(bx * 0.13, by * 0.13, bz * 0.13, nt) * amp;
      pos[i * 3] = bx + normDir[i * 3] * d;
      pos[i * 3 + 1] = by + normDir[i * 3 + 1] * d;
      pos[i * 3 + 2] = bz + normDir[i * 3 + 2] * d;
    }
    geo.attributes.position.needsUpdate = true;

    // rang — har ~14 kadrda / scroll sezilarli o'zgarganda
    if (frame % 14 === 0 && Math.abs(s - lastRecolor) > 0.02) {
      recolor(s); lastRecolor = s;
    }

    // --- Aylanish: doimiy + scroll bo'yicha tezlashadi + sichqoncha ---
    group.rotation.y += 0.002 + s * 0.011;
    group.rotation.x = lerp(group.rotation.x, 0.2 + my * 0.4 + s * 1.4, 0.05);
    group.rotation.z = lerp(group.rotation.z, mx * 0.3 + swell * 0.3, 0.05);
    group.position.x = lerp(group.position.x, 7 - s * 5 + mx * 4, 0.05);
    group.position.y = lerp(group.position.y, my * 3 - s * 2, 0.05);

    ring.rotation.x += 0.004 + s * 0.004;
    ring.rotation.y -= 0.003;
    ring.position.x = lerp(ring.position.x, -14 + s * 6, 0.05);

    // --- Kamera yaqinlashadi ---
    camera.position.z = lerp(camera.position.z, lerp(58, 40, eS) - swell * 4, 0.05);
    camera.position.x = lerp(camera.position.x, mx * 5, 0.05);
    camera.lookAt(0, 0, 0);

    wire.material.opacity = 0.42 + swell * 0.18;
    ring.material.opacity = 0.22 + swell * 0.14;

    renderer.render(scene, camera);
  }
  animate();
})();
