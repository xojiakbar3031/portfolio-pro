// ============================================================
// 3D ANIMATSIYALI FON — "aurora" + neyron tarmoq (Three.js)
// ------------------------------------------------------------
// 1) Aurora: GPU shader'da oqib turuvchi iliq yorug'lik (domain-warped
//    fbm shovqin). Past o'lchamli buferga chiziladi va kattalashtiriladi —
//    zaif videokartalarda ham yengil ishlaydi.
// 2) Neyron tarmoq: fazoda sekin suzuvchi nuqtalar, yaqinlari chiziq bilan
//    ulanadi. Sichqoncha yaqinidagi nuqtalar yorishadi va kursorga ulanadi.
// Scroll: aurora rangi siljiydi, tarmoq buriladi, kamera yaqinlashadi.
// O'chadigan hollar: WebGL yo'q / "reduced motion" / tab yashiringan.
// ============================================================
(function () {
  var canvas = document.getElementById("bg3d");
  if (!canvas || typeof THREE === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: false, antialias: true, powerPreference: "high-performance" });
  } catch (e) { return; }
  var DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(DPR);
  renderer.autoClear = false;
  document.body.classList.add("has-bg3d");

  var isMobile = window.matchMedia("(max-width: 760px)").matches;
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  // ---------------- 1) AURORA ----------------
  var AURORA_SCALE = 0.35; // bufer o'lchami (ekranga nisbatan)
  var orthoCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  var quad = new THREE.PlaneGeometry(2, 2);

  var auroraUniforms = {
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uScroll: { value: 0 }
  };

  var auroraMat = new THREE.ShaderMaterial({
    uniforms: auroraUniforms,
    depthTest: false,
    depthWrite: false,
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
    fragmentShader: [
      "precision highp float;",
      "varying vec2 vUv;",
      "uniform float uTime; uniform vec2 uRes; uniform vec2 uMouse; uniform float uScroll;",
      "float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }",
      "float noise(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); f = f*f*(3.0-2.0*f);",
      "  return mix(mix(hash(i), hash(i+vec2(1.,0.)), f.x), mix(hash(i+vec2(0.,1.)), hash(i+vec2(1.,1.)), f.x), f.y); }",
      "float fbm(vec2 p){ float v = 0.0; float a = 0.5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);",
      "  for (int i = 0; i < 4; i++){ v += a * noise(p); p = m * p; a *= 0.5; } return v; }",
      "void main(){",
      "  float aspect = uRes.x / uRes.y;",
      "  vec2 uv = vUv; vec2 p = vec2(uv.x * aspect, uv.y) * 1.7;",
      "  float t = uTime * 0.045;",
      "  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));",
      "  vec2 r = vec2(fbm(p + 3.2*q + vec2(1.7, 9.2) + t*1.4), fbm(p + 3.2*q + vec2(8.3, 2.8) - t*1.2));",
      "  float f = fbm(p + 2.6*r);",
      "  vec3 base = vec3(0.039, 0.024, 0.012);",
      "  vec3 ember = vec3(1.0, 0.23, 0.12);",
      "  vec3 gold = vec3(1.0, 0.69, 0.13);",
      "  vec3 rose = vec3(1.0, 0.18, 0.34);",
      "  vec3 violet = vec3(0.45, 0.2, 1.0);",
      // scroll bo'yicha: iliq oltin -> qizil/pushti -> binafsha urg'u
      "  vec3 hi = mix(gold, rose, smoothstep(0.15, 0.6, uScroll));",
      "  vec3 accent = mix(ember, violet, smoothstep(0.55, 1.0, uScroll) * 0.6);",
      "  vec3 col = base;",
      "  col = mix(col, accent * 0.85, smoothstep(0.38, 0.9, f));",
      "  col = mix(col, hi * 0.7, smoothstep(0.5, 1.0, r.x) * 0.8);",
      "  col += rose * 0.22 * smoothstep(0.55, 1.0, q.y);",
      // aurora tasmasi — yuqori qismda kuchliroq, matn joylashgan pastki qismda xiraroq
      "  float band = smoothstep(0.0, 0.9, uv.y) * 0.45 + 0.55;",
      "  col *= band;",
      // kursor nuri
      "  vec2 d = vec2((uv.x - uMouse.x) * aspect, uv.y - uMouse.y);",
      "  col += ember * 0.28 * exp(-dot(d, d) * 6.0);",
      // vin'etka
      "  vec2 v = uv - 0.5; col *= 1.0 - dot(v, v) * 0.7;",
      "  gl_FragColor = vec4(col, 1.0);",
      "}"
    ].join("\n")
  });
  var auroraScene = new THREE.Scene();
  auroraScene.add(new THREE.Mesh(quad, auroraMat));

  var rt = new THREE.WebGLRenderTarget(4, 4, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false });
  var blitMat = new THREE.ShaderMaterial({
    uniforms: { tDiffuse: { value: rt.texture } },
    depthTest: false,
    depthWrite: false,
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
    fragmentShader: "precision mediump float; varying vec2 vUv; uniform sampler2D tDiffuse; void main(){ gl_FragColor = texture2D(tDiffuse, vUv); }"
  });
  var blitScene = new THREE.Scene();
  blitScene.add(new THREE.Mesh(quad, blitMat));

  // ---------------- 2) NEYRON TARMOQ ----------------
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
  camera.position.set(0, 0, 38);

  var N = isMobile ? 60 : 120;
  var LINK_DIST = isMobile ? 8 : 7.4;
  var MOUSE_DIST = 9;
  var BOX = { x: 30, y: 17, z: 12 };

  var nodes = [];
  var pointPos = new Float32Array(N * 3);
  var pointCol = new Float32Array(N * 3);
  for (var i = 0; i < N; i++) {
    nodes.push({
      p: new THREE.Vector3((Math.random() * 2 - 1) * BOX.x, (Math.random() * 2 - 1) * BOX.y, (Math.random() * 2 - 1) * BOX.z),
      v: new THREE.Vector3((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.012),
      glow: 0
    });
  }

  // yumaloq porlaydigan nuqta teksturasi
  var spriteCanvas = document.createElement("canvas");
  spriteCanvas.width = spriteCanvas.height = 64;
  var sctx = spriteCanvas.getContext("2d");
  var grad = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.25, "rgba(255,255,255,0.85)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  sctx.fillStyle = grad;
  sctx.fillRect(0, 0, 64, 64);
  var sprite = new THREE.CanvasTexture(spriteCanvas);

  var pointGeo = new THREE.BufferGeometry();
  pointGeo.setAttribute("position", new THREE.BufferAttribute(pointPos, 3));
  pointGeo.setAttribute("color", new THREE.BufferAttribute(pointCol, 3));
  var points = new THREE.Points(pointGeo, new THREE.PointsMaterial({
    size: 0.9, map: sprite, vertexColors: true, transparent: true,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
  }));

  var MAX_SEG = N * 8;
  var linePos = new Float32Array(MAX_SEG * 6);
  var lineCol = new Float32Array(MAX_SEG * 6);
  var lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
  lineGeo.setAttribute("color", new THREE.BufferAttribute(lineCol, 3));
  var lines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({
    vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  }));

  var net = new THREE.Group();
  net.add(lines);
  net.add(points);
  scene.add(net);

  var GOLD = new THREE.Color(0xffb020);
  var EMBER = new THREE.Color(0xff5a1f);
  var ROSE = new THREE.Color(0xff3b6e);
  var tmpCol = new THREE.Color();

  // ---------------- HOLAT: scroll, sichqoncha, o'lcham ----------------
  var scrollTarget = 0, scrollCur = 0;
  function readScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    scrollTarget = h > 0 ? clamp(window.scrollY / h, 0, 1) : 0;
  }
  window.addEventListener("scroll", readScroll, { passive: true });
  readScroll();

  var mouse = new THREE.Vector2(0.5, 0.5), mouseSmooth = new THREE.Vector2(0.5, 0.5), mouseActive = 0, mouseSeen = false;
  window.addEventListener("mousemove", function (e) {
    mouse.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight);
    mouseSeen = true;
  }, { passive: true });
  document.addEventListener("mouseleave", function () { mouseSeen = false; });

  var raycaster = new THREE.Raycaster();
  var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  var mouseWorld = new THREE.Vector3();
  var invNet = new THREE.Matrix4();

  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    rt.setSize(Math.max(2, Math.round(w * DPR * AURORA_SCALE)), Math.max(2, Math.round(h * DPR * AURORA_SCALE)));
    auroraUniforms.uRes.value.set(w, h);
  }
  window.addEventListener("resize", resize);
  resize();

  var clock = new THREE.Clock();
  var running = true;
  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
    if (running) { clock.getDelta(); requestAnimationFrame(animate); }
  });

  function animate() {
    if (!running) return;
    requestAnimationFrame(animate);

    var dt = Math.min(clock.getDelta(), 0.05);
    var t = clock.elapsedTime;
    scrollCur += (scrollTarget - scrollCur) * 0.05;
    mouseSmooth.lerp(mouse, 0.08);
    mouseActive = lerp(mouseActive, mouseSeen ? 1 : 0, 0.05);

    // --- aurora ---
    auroraUniforms.uTime.value = t;
    auroraUniforms.uScroll.value = scrollCur;
    auroraUniforms.uMouse.value.copy(mouseSmooth);

    // --- tarmoq: sahna burilishi va kamera ---
    net.rotation.y = lerp(net.rotation.y, scrollCur * 0.9 + (mouseSmooth.x - 0.5) * 0.25, 0.05);
    net.rotation.x = lerp(net.rotation.x, (mouseSmooth.y - 0.5) * -0.15 + scrollCur * 0.2, 0.05);
    camera.position.z = lerp(camera.position.z, 38 - scrollCur * 10, 0.05);
    net.updateMatrixWorld();

    // kursorning tarmoq koordinatalaridagi o'rni
    raycaster.setFromCamera({ x: mouseSmooth.x * 2 - 1, y: mouseSmooth.y * 2 - 1 }, camera);
    raycaster.ray.intersectPlane(plane, mouseWorld);
    invNet.copy(net.matrixWorld).invert();
    mouseWorld.applyMatrix4(invNet);

    var palette = tmpCol.copy(GOLD).lerp(ROSE, clamp(scrollCur * 1.4, 0, 1));
    var speed = 1 + scrollCur * 1.5;

    // nuqtalarni siljitish
    for (var i = 0; i < N; i++) {
      var n = nodes[i];
      n.p.x += n.v.x * speed * dt * 60;
      n.p.y += n.v.y * speed * dt * 60;
      n.p.z += n.v.z * speed * dt * 60;
      if (n.p.x > BOX.x || n.p.x < -BOX.x) n.v.x *= -1;
      if (n.p.y > BOX.y || n.p.y < -BOX.y) n.v.y *= -1;
      if (n.p.z > BOX.z || n.p.z < -BOX.z) n.v.z *= -1;

      var md = n.p.distanceTo(mouseWorld);
      var near = mouseActive * clamp(1 - md / MOUSE_DIST, 0, 1);
      n.glow = lerp(n.glow, near, 0.12);

      var pulse = 0.75 + 0.3 * Math.sin(t * 1.3 + i * 1.7);
      var b = pulse + n.glow * 1.4;
      pointPos[i * 3] = n.p.x; pointPos[i * 3 + 1] = n.p.y; pointPos[i * 3 + 2] = n.p.z;
      pointCol[i * 3] = palette.r * b; pointCol[i * 3 + 1] = palette.g * b; pointCol[i * 3 + 2] = palette.b * b;
    }

    // yaqin nuqtalarni ulash (+ kursorga ulanish)
    var seg = 0;
    for (var a = 0; a < N && seg < MAX_SEG; a++) {
      var pa = nodes[a];
      for (var c = a + 1; c < N && seg < MAX_SEG; c++) {
        var pb = nodes[c];
        var dx = pa.p.x - pb.p.x, dy = pa.p.y - pb.p.y, dz = pa.p.z - pb.p.z;
        var d2 = dx * dx + dy * dy + dz * dz;
        if (d2 > LINK_DIST * LINK_DIST) continue;
        var s = (1 - Math.sqrt(d2) / LINK_DIST);
        var k = s * (0.55 + (pa.glow + pb.glow) * 0.9);
        writeSeg(seg++, pa.p, pb.p, EMBER, k);
      }
      if (pa.glow > 0.05 && seg < MAX_SEG) writeSeg(seg++, pa.p, mouseWorld, GOLD, pa.glow * 0.45);
    }
    lineGeo.setDrawRange(0, seg * 2);
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.attributes.color.needsUpdate = true;
    pointGeo.attributes.position.needsUpdate = true;
    pointGeo.attributes.color.needsUpdate = true;

    // --- chizish: aurora (past o'lcham) -> ekran -> tarmoq ---
    renderer.setRenderTarget(rt);
    renderer.render(auroraScene, orthoCam);
    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(blitScene, orthoCam);
    renderer.render(scene, camera);
  }

  function writeSeg(idx, p1, p2, color, k) {
    var o = idx * 6;
    linePos[o] = p1.x; linePos[o + 1] = p1.y; linePos[o + 2] = p1.z;
    linePos[o + 3] = p2.x; linePos[o + 4] = p2.y; linePos[o + 5] = p2.z;
    var r = color.r * k, g = color.g * k, b = color.b * k;
    lineCol[o] = r; lineCol[o + 1] = g; lineCol[o + 2] = b;
    lineCol[o + 3] = r; lineCol[o + 4] = g; lineCol[o + 5] = b;
  }

  requestAnimationFrame(animate);
})();
