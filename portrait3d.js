// ============================================================
// 3D PORTRET (Three.js)
// ------------------------------------------------------------
// Ikki qatlam bir xil chuqurlik xaritasidan foydalanadi:
//   1) FOTO — tiniq oq-qora rasm, lekin tekis emas: setka yorqinlik
//      bo'yicha bo'rttirilgan, shuning uchun burilganda hajm seziladi.
//   2) NUQTALAR — xuddi shu rasmdan olingan ~40 000 zarracha.
// Harakatlar:
//   - ochilganda nuqtalar tarqoq bulutdan yig'iladi va tiniq fotoga aylanadi,
//   - sichqoncha: portret buriladi — yuz, burun va yelkalar turli
//     chuqurlikda siljiydi (parallaks),
//   - scroll: foto yana zarrachalarga sochilib ketadi.
// WebGL yo'q yoki "reduced motion" bo'lsa oddiy <img> ko'rinadi.
// ============================================================
(function () {
  "use strict";
  var holder = document.getElementById("heroVisual");
  var canvas = document.getElementById("portrait3d");
  if (!holder || !canvas || typeof THREE === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
  } catch (e) { return; }
  var PR = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(PR);
  renderer.setClearColor(0x000000, 0);

  var isSmall = window.matchMedia("(max-width: 960px)").matches;
  var COLS = isSmall ? 140 : 250;
  var FOV = 40, CAM_Z = 20;
  var PORTRAIT_H = 13.2;                       // dunyo birligida portret balandligi
  var TAN = Math.tan((FOV * Math.PI) / 360);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 200);
  camera.position.set(0, 0, CAM_Z);
  var group = new THREE.Group();
  scene.add(group);

  var uniforms = {
    uTime: { value: 0 },
    uIntro: { value: 0 },
    uScroll: { value: 0 },
    uMouse: { value: new THREE.Vector3(99, 99, 0) },
    uMouseOn: { value: 0 },
    uPoint: { value: 1 },
    uSolid: { value: 0 },          // 0 = faqat nuqtalar, 1 = tiniq foto
    uMap: { value: null },
    uDepth: { value: null }
  };

  var DEPTH_BASE = 0.3, DEPTH_GAIN = 1.3;
  // Kursor ostida nuqtalarni ochish effekti o'chirilgan (yuz ustida dog' kabi ko'rinardi).
  var LENS = "float lens(vec2 p){ return 0.0; }";

  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    vertexShader: [
      "attribute vec3 aScatter;",
      "attribute vec4 aData;",   // x: yorqinlik, yzw: tasodifiy
      "uniform float uTime; uniform float uIntro; uniform float uScroll;",
      "uniform vec3 uMouse; uniform float uMouseOn; uniform float uPoint; uniform float uSolid;",
      "varying float vAlpha; varying vec3 vColor;",
      LENS,
      "void main(){",
      // yig'ilish: har bir nuqta o'z kechikishi bilan joyiga keladi
      "  float k = clamp((uIntro - aData.y * 0.55) / 0.45, 0.0, 1.0);",
      "  k = 1.0 - pow(1.0 - k, 3.0);",
      "  vec3 pos = mix(aScatter, position, k);",
      // yengil "nafas"
      "  pos.z += (sin(position.x * 0.9 + uTime * 0.8) + sin(position.y * 1.2 + uTime * 0.6)) * 0.05;",
      // sichqoncha
      "  vec2 d = pos.xy - uMouse.xy; float l = length(d);",
      "  float f = uMouseOn * (1.0 - smoothstep(0.0, 1.5, l));", "  f *= f;",
      "  pos.xy += normalize(d + 0.0001) * f * 0.03;",
      "  pos.z += f * (0.35 + aData.w * 0.5);",
      // scroll: sochilib ketish
      "  float s = uScroll * uScroll;",
      "  pos += normalize(aScatter) * s * (5.0 + aData.z * 12.0);",
      "  pos.y += s * aData.w * 5.0;",
      "  vec4 mv = modelViewMatrix * vec4(pos, 1.0);",
      "  gl_Position = projectionMatrix * mv;",
      "  gl_PointSize = uPoint * (0.85 + aData.w * 0.35) * (1.0 + f * 0.15) / -mv.z;",
      "  vec3 base = vec3(0.92, 0.93, 0.96);",
      "  vec3 accent = vec3(0.49, 0.58, 1.0);",
      "  vColor = mix(base, accent, clamp(lens(position.xy) * 0.45 + s * 0.6, 0.0, 1.0));",
      // foto tiniqlashganda nuqtalar yo'qoladi; kursor "linzasi" ostida esa qaytadi
      "  float show = max(1.0 - uSolid, lens(position.xy));",
      "  vAlpha = aData.x * k * (1.0 - uScroll) * show * mix(1.0, 0.7, uSolid);",
      "}"
    ].join("\n"),
    fragmentShader: [
      "varying float vAlpha; varying vec3 vColor;",
      "void main(){",
      "  float d = length(gl_PointCoord - 0.5);",
      "  float a = smoothstep(0.5, 0.15, d);",
      "  gl_FragColor = vec4(vColor, a * vAlpha);",
      "}"
    ].join("\n")
  });

  var photoMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    vertexShader: [
      "uniform sampler2D uDepth; uniform float uTime; uniform vec3 uMouse; uniform float uMouseOn;",
      "varying vec2 vUv; varying vec2 vLocal;",
      "void main(){",
      "  vUv = uv; vLocal = position.xy;",
      "  vec3 pos = position;",
      "  pos.z = (texture2D(uDepth, uv).r - " + DEPTH_BASE.toFixed(2) + ") * " + DEPTH_GAIN.toFixed(2) + ";",
      "  pos.z += (sin(position.x * 0.9 + uTime * 0.8) + sin(position.y * 1.2 + uTime * 0.6)) * 0.05;",
      "  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);",
      "}"
    ].join("\n"),
    fragmentShader: [
      "uniform sampler2D uMap; uniform float uSolid; uniform float uScroll; uniform vec3 uMouse; uniform float uMouseOn;",
      "varying vec2 vUv; varying vec2 vLocal;",
      LENS,
      "void main(){",
      "  vec3 c = texture2D(uMap, vUv).rgb;",
      // chekkalar sahifa foniga silliq erib ketadi (ramka yo'q)
      "  float edge = smoothstep(0.0, 0.16, vUv.x) * smoothstep(1.0, 0.84, vUv.x)",
      "             * smoothstep(0.0, 0.24, vUv.y) * smoothstep(1.0, 0.82, vUv.y);",
      "  float a = uSolid * edge * (1.0 - lens(vLocal) * 0.55);",
      "  gl_FragColor = vec4(c, a);",
      "}"
    ].join("\n")
  });

  // ---------------- rasmdan nuqtalar ----------------
  // Ikki rasm ishlatiladi:
  //   hero.jpg    — rangli asl nusxa: to'q sariq fonni aniqlash uchun (siluet),
  //   hero-bw.jpg — oq-qora, foni qoraytirilgan: yorqinlik va chuqurlik uchun.
  var spacing = 1;
  function readPixels(img, cols, rows) {
    var c = document.createElement("canvas");
    c.width = cols; c.height = rows;
    var ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, cols, rows);
    return ctx.getImageData(0, 0, cols, rows).data;
  }

  function buildFromImages(color, bw) {
    var rows = Math.round(COLS * (bw.naturalHeight / bw.naturalWidth));
    var cpx = readPixels(color, COLS, rows);
    var bpx = readPixels(bw, COLS, rows);

    var W = PORTRAIT_H * (COLS / rows);
    spacing = W / COLS;
    var pos = [], scatter = [], data = [];

    // oq-qora rasmning yorqinligi + chuqurlik uchun silliqlangan nusxasi
    var lumMap = new Float32Array(COLS * rows);
    for (var q = 0; q < COLS * rows; q++) lumMap[q] = bpx[q * 4 + 1] / 255;
    var R = 5;
    function smoothLum(cx, cy) {
      var sum = 0, n = 0;
      for (var dy = -R; dy <= R; dy += 2) {
        for (var dx = -R; dx <= R; dx += 2) {
          var xx = cx + dx, yy = cy + dy;
          if (xx < 0 || yy < 0 || xx >= COLS || yy >= rows) continue;
          sum += lumMap[yy * COLS + xx]; n++;
        }
      }
      return sum / n;
    }

    for (var y = 0; y < rows; y++) {
      // oq-qora rasmdagi fonning shu qatordagi darajasi (tepada ~0.15, pastda ~0.05)
      var bgLevel = 0.15 - 0.10 * (y / (rows - 1));
      for (var x = 0; x < COLS; x++) {
        var i = (y * COLS + x) * 4;
        var r = cpx[i] / 255, g = cpx[i + 1] / 255, b = cpx[i + 2] / 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var sat = max === 0 ? 0 : (max - min) / max;
        var hue = 0;
        if (max !== min) {
          if (max === r) hue = ((g - b) / (max - min)) * 60;
          else if (max === g) hue = (2 + (b - r) / (max - min)) * 60;
          else hue = (4 + (r - g) / (max - min)) * 60;
          if (hue < 0) hue += 360;
        }
        var isBackdrop = sat > 0.72 && max > 0.45 && (hue < 40 || hue > 345);
        var lum = lumMap[y * COLS + x];
        // nuqta qoladi: agar u odam silueti ichida bo'lsa yoki fondan sezilarli yorug' bo'lsa
        var lit = lum - bgLevel;
        if (isBackdrop && lit < 0.07) continue;

        // soch va ko'ylak ham xira ko'rinib tursin (siluet yo'qolmasin)
        var bright = isBackdrop ? Math.min(1, lit * 1.6) : 0.1 + 0.9 * Math.pow(lum, 0.85);
        // pastki chekka keskin kesilmasin — silliq so'nadi
        var fade = Math.min(1, (rows - 1 - y) / (rows * 0.16));
        bright *= fade * fade * (3 - 2 * fade);
        if (bright < 0.02) continue;

        var wx = (x / (COLS - 1) - 0.5) * W;
        var wy = (0.5 - y / (rows - 1)) * PORTRAIT_H;
        pos.push(wx, wy, (smoothLum(x, y) - DEPTH_BASE) * DEPTH_GAIN);

        // boshlang'ich tarqoq holat: katta sfera ichida
        var th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1), rad = 9 + Math.random() * 16;
        scatter.push(Math.sin(ph) * Math.cos(th) * rad, Math.cos(ph) * rad, Math.sin(ph) * Math.sin(th) * rad);
        data.push(bright, Math.random(), Math.random(), Math.random());
      }
    }

    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("aScatter", new THREE.Float32BufferAttribute(scatter, 3));
    geo.setAttribute("aData", new THREE.Float32BufferAttribute(data, 4));
    var points = new THREE.Points(geo, material);
    points.frustumCulled = false;
    points.renderOrder = 2;
    group.add(points);

    // ---- foto qatlami: chuqurlik xaritasi bilan bo'rttirilgan setka ----
    var depthData = new Uint8Array(COLS * rows * 4);
    for (var yy = 0; yy < rows; yy++) {
      for (var xx = 0; xx < COLS; xx++) {
        var v = Math.round(Math.min(1, smoothLum(xx, yy)) * 255);
        var o = ((rows - 1 - yy) * COLS + xx) * 4;   // tekstura pastdan yuqoriga
        depthData[o] = depthData[o + 1] = depthData[o + 2] = v; depthData[o + 3] = 255;
      }
    }
    var depthTex = new THREE.DataTexture(depthData, COLS, rows, THREE.RGBAFormat);
    depthTex.minFilter = depthTex.magFilter = THREE.LinearFilter;
    depthTex.needsUpdate = true;
    var mapTex = new THREE.Texture(bw);
    mapTex.minFilter = THREE.LinearFilter;
    mapTex.generateMipmaps = false;
    mapTex.needsUpdate = true;
    uniforms.uMap.value = mapTex;
    uniforms.uDepth.value = depthTex;

    var photo = new THREE.Mesh(new THREE.PlaneGeometry(W, PORTRAIT_H, 150, 186), photoMaterial);
    photo.frustumCulled = false;
    photo.renderOrder = 1;
    group.add(photo);
  }

  // ---------------- o'lcham ----------------
  function resize() {
    var w = holder.clientWidth, h = holder.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // portret konteynerga to'liq sig'ishi uchun kamerani kerak bo'lsa uzoqlashtiramiz
    var visH = 2 * CAM_Z * TAN, visW = visH * camera.aspect;
    var W = PORTRAIT_H * 0.806;
    var fit = Math.max(PORTRAIT_H / (visH * 0.98), W / (visW * 1.02), 1);
    camera.position.z = CAM_Z * fit;
    camera.updateProjectionMatrix();
    // nuqta o'lchami: qo'shni nuqtalar orasidagi masofaga teng (ekran pikselida)
    uniforms.uPoint.value = spacing * 1.3 * ((h * PR) / (2 * TAN));
  }

  // ---------------- sichqoncha / barmoq ----------------
  var ndc = new THREE.Vector2(9, 9), pointerOn = false;
  var tiltX = 0, tiltY = 0;
  function onPointer(clientX, clientY) {
    var rect = canvas.getBoundingClientRect();
    var nx = ((clientX - rect.left) / rect.width) * 2 - 1;
    var ny = -(((clientY - rect.top) / rect.height) * 2 - 1);
    ndc.set(nx, ny);
    pointerOn = Math.abs(nx) < 1.4 && Math.abs(ny) < 1.3;
  }
  window.addEventListener("mousemove", function (e) { onPointer(e.clientX, e.clientY); }, { passive: true });
  window.addEventListener("touchmove", function (e) {
    if (e.touches[0]) onPointer(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  window.addEventListener("touchend", function () { pointerOn = false; }, { passive: true });
  document.addEventListener("mouseleave", function () { pointerOn = false; });

  var raycaster = new THREE.Raycaster();
  var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  var hit = new THREE.Vector3(), inv = new THREE.Matrix4();

  // ---------------- animatsiya ----------------
  var clock = new THREE.Clock();
  var visible = true, started = false, rafId = 0;
  var INTRO_SECONDS = 2.4, introT = 0;

  function frame() {
    rafId = 0;
    if (!visible || document.hidden) return;
    rafId = requestAnimationFrame(frame);
    var dt = Math.min(clock.getDelta(), 0.05);
    uniforms.uTime.value += dt;
    introT = Math.min(1.5, introT + dt / INTRO_SECONDS);
    uniforms.uIntro.value = Math.min(1, introT);
    var sc = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.85)));
    uniforms.uScroll.value = sc;
    // nuqtalar yig'ilgach foto tiniqlashadi; scroll boshlanishi bilan yana nuqtalarga qaytadi
    var solidIn = Math.min(1, Math.max(0, (introT - 0.9) / 0.5));
    var solidOut = 1 - Math.min(1, sc / 0.35);
    uniforms.uSolid.value = solidIn * solidIn * (3 - 2 * solidIn) * solidOut;

    // portretning burilishi (chuqurlik shu yerda seziladi)
    var tx = pointerOn ? ndc.x : 0, ty = pointerOn ? ndc.y : 0;
    tiltY += (tx * 0.38 - tiltY) * 0.06;
    tiltX += (-ty * 0.2 - tiltX) * 0.06;
    group.rotation.y = tiltY + Math.sin(uniforms.uTime.value * 0.35) * 0.05;
    group.rotation.x = tiltX;
    group.updateMatrixWorld();

    // kursorning portret (lokal) koordinatalaridagi o'rni
    raycaster.setFromCamera(ndc, camera);
    if (raycaster.ray.intersectPlane(plane, hit)) {
      inv.copy(group.matrixWorld).invert();
      uniforms.uMouse.value.copy(hit.applyMatrix4(inv));
    }
    uniforms.uMouseOn.value += ((pointerOn ? 1 : 0) - uniforms.uMouseOn.value) * 0.08;

    renderer.render(scene, camera);
    if (!started) { started = true; holder.classList.add("is-3d"); }
  }
  function play() { if (!rafId) { clock.getDelta(); rafId = requestAnimationFrame(frame); } }

  // ekranda ko'rinmasa chizmaymiz (batareya va GPU tejaladi)
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) play();
    }).observe(holder);
  }
  document.addEventListener("visibilitychange", play);
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(holder);
  else window.addEventListener("resize", resize);

  // ikkala rasm yuklangach nuqtalar quriladi
  var color = new Image(), bw = new Image(), loaded = 0;
  function ready() {
    if (++loaded < 2) return;
    buildFromImages(color, bw);
    resize();
    play();
  }
  color.onload = ready;
  bw.onload = ready;
  color.src = "assets/hero.jpg";
  bw.src = "assets/hero-bw.jpg";
})();
