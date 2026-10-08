// Til, loyihalar ro'yxati, scroll animatsiyalari va aloqa formasi.
(function () {
  "use strict";

  var LANGS = ["uz", "ru", "en"];
  var lang = "en";
  try {
    var saved = localStorage.getItem("lang");
    if (LANGS.indexOf(saved) !== -1) lang = saved;
    else if (/^uz/i.test(navigator.language)) lang = "uz";
    else if (/^ru/i.test(navigator.language)) lang = "ru";
  } catch (e) {
    /* storage yopiq bo'lsa standart til */
  }

  // ---------------- loyihalar ----------------
  var ICON_ARROW = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9"/></svg>';

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function renderProjects() {
    var dict = I18N[lang];
    var list = document.getElementById("projects");
    list.textContent = "";
    WORK_PROJECTS.forEach(function (p) {
      var item = el("article", "project reveal");

      var media = el("a", "project-media");
      media.href = p.demo || p.code;
      media.target = "_blank";
      media.rel = "noopener";
      media.setAttribute("aria-label", p.title);
      var img = el("img");
      img.src = p.image;
      img.alt = p.title;
      img.loading = "lazy";
      img.width = 1280;
      img.height = 800;
      media.appendChild(img);

      var body = el("div", "project-body");
      body.appendChild(el("p", "project-meta", p.num + " — " + p.year));
      body.appendChild(el("h3", null, p.title));
      body.appendChild(el("p", "project-desc", p.description[lang] || p.description.en));

      var tags = el("ul", "tags");
      p.tags.forEach(function (t) { tags.appendChild(el("li", null, t)); });
      body.appendChild(tags);

      var links = el("div", "project-links");
      [[p.demo, dict.linkDemo], [p.code, dict.linkCode]].forEach(function (pair) {
        if (!pair[0]) return;
        var a = el("a");
        a.href = pair[0];
        a.target = "_blank";
        a.rel = "noopener";
        a.innerHTML = ICON_ARROW;
        a.insertBefore(document.createTextNode(pair[1] + " "), a.firstChild);
        links.appendChild(a);
      });
      body.appendChild(links);

      item.appendChild(media);
      item.appendChild(body);
      list.appendChild(item);
    });
    observeReveals();
  }

  // ---------------- tarjima ----------------
  function applyLang(next) {
    lang = next;
    var dict = I18N[lang];
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(function (n) {
      var v = dict[n.getAttribute("data-i18n")];
      if (v != null) n.textContent = v;
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (n) {
      var v = dict[n.getAttribute("data-i18n-ph")];
      if (v != null) n.placeholder = v;
    });
    document.querySelectorAll(".lang button").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-lang") === lang);
      b.setAttribute("aria-pressed", b.getAttribute("data-lang") === lang);
    });
    document.getElementById("cvLink").href =
      lang === "uz" ? "assets/Xojiakbar-Saydullayev-CV-UZ.pdf" : "assets/Xojiakbar-Saydullayev-CV.pdf";
    renderProjects();
    try { localStorage.setItem("lang", lang); } catch (e) { /* ixtiyoriy */ }
  }

  document.querySelectorAll(".lang button").forEach(function (b) {
    b.addEventListener("click", function () { applyLang(b.getAttribute("data-lang")); });
  });

  // ---------------- scroll'da paydo bo'lish ----------------
  var io = "IntersectionObserver" in window
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px" })
    : null;

  function observeReveals() {
    document.querySelectorAll(".reveal:not(.in)").forEach(function (n) {
      if (io) io.observe(n);
      else n.classList.add("in");
    });
  }

  // ---------------- nav fon ----------------
  var nav = document.getElementById("nav");
  function onScroll() { nav.classList.toggle("scrolled", window.scrollY > 20); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------------- aloqa formasi (AJAX, sahifadan chiqmasdan) ----------------
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var dict = I18N[lang];
    var btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = dict.cfSending;
    status.className = "form-status";
    status.textContent = "";
    fetch(form.action, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form)
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (!res.ok || String(res.j.success) !== "true") throw new Error("failed");
        form.reset();
        status.className = "form-status ok";
        status.textContent = dict.cfOk;
      })
      .catch(function () {
        status.className = "form-status err";
        status.textContent = dict.cfErr;
      })
      .then(function () {
        btn.disabled = false;
        btn.textContent = dict.cfSend;
      });
  });

  document.getElementById("year").textContent = new Date().getFullYear();
  applyLang(lang);
})();
