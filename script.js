// ===== YIL =====
document.getElementById("year").textContent = new Date().getFullYear();

// Sichqonchali qurilmami yoki yo'qmi
const isFinePointer = window.matchMedia("(pointer: fine)").matches;

// ===== TIL (i18n) =====
var LANG_KEY = "pp_lang";
var currentLang = "uz";

function safeGet(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}
function safeSet(key, val) {
  try { localStorage.setItem(key, val); } catch (e) {}
}

function applyLang(lang) {
  if (!I18N[lang]) lang = "uz";
  currentLang = lang;
  var dict = I18N[lang];

  document.documentElement.setAttribute("lang", lang);

  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    var key = el.getAttribute("data-i18n");
    if (dict[key] != null) el.textContent = dict[key];
  });
  document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
    var key = el.getAttribute("data-i18n-html");
    if (dict[key] != null) el.innerHTML = dict[key];
  });

  // til tugmalari holati
  document.querySelectorAll("#langSwitch button").forEach(function (b) {
    b.classList.toggle("active", b.getAttribute("data-lang") === lang);
  });

  // loyihalarni qayta render qilamiz (tavsiflar tilga bog'liq)
  renderWork();
  safeSet(LANG_KEY, lang);
}

document.getElementById("langSwitch").addEventListener("click", function (e) {
  var btn = e.target.closest("button[data-lang]");
  if (btn) applyLang(btn.getAttribute("data-lang"));
});

// ===== MAVZU (dark / light) =====
var THEME_KEY = "pp_theme";

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  safeSet(THEME_KEY, theme);
}

document.getElementById("themeToggle").addEventListener("click", function () {
  var next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
  applyTheme(next);
});

// ===== LOADER: 0 -> 100% animatsiya =====
const loaderNum = document.getElementById("loaderNum");
const loaderBarFill = document.getElementById("loaderBarFill");
const loader = document.getElementById("loader");

(function runLoader() {
  const duration = 1600;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const percent = Math.round(progress * 100);
    loaderNum.textContent = percent;
    loaderBarFill.style.width = percent + "%";
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      setTimeout(function () { loader.classList.add("done"); }, 300);
    }
  }
  requestAnimationFrame(tick);
})();

// ===== SCROLL PROGRESS BAR =====
const scrollProgress = document.getElementById("scrollProgress");
function updateScrollProgress() {
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const percent = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;
  scrollProgress.style.width = percent + "%";
}
window.addEventListener("scroll", updateScrollProgress);

// ===== NAVBAR: scroll qilganda fon qo'shish =====
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", function () {
  navbar.classList.toggle("scrolled", window.scrollY > 10);
});

// ===== HERO FREYM: sichqoncha bilan yengil 3D tilt =====
const heroFrame = document.getElementById("heroFrame");
if (heroFrame && isFinePointer) {
  heroFrame.addEventListener("mousemove", function (e) {
    const rect = heroFrame.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / rect.height) * -10;
    const rotateY = ((x - rect.width / 2) / rect.width) * 10;
    heroFrame.style.transform =
      "perspective(1000px) rotateX(" + rotateX + "deg) rotateY(" + (rotateY + 2) + "deg)";
  });
  heroFrame.addEventListener("mouseleave", function () {
    heroFrame.style.transform = "perspective(1000px) rotateX(0) rotateY(2deg)";
  });
}

// ===== CUSTOM CURSOR =====
const cursorDot = document.getElementById("cursorDot");
const cursorRing = document.getElementById("cursorRing");
const cursorLabel = document.getElementById("cursorLabel");

if (isFinePointer) {
  let ringX = 0, ringY = 0, mouseX = 0, mouseY = 0;
  window.addEventListener("mousemove", function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.transform = "translate(" + mouseX + "px, " + mouseY + "px)";
    cursorLabel.style.transform = "translate(" + mouseX + "px, " + mouseY + "px)";
  });
  function animateRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    cursorRing.style.left = ringX + "px";
    cursorRing.style.top = ringY + "px";
    requestAnimationFrame(animateRing);
  }
  animateRing();
  window.bindHoverCursor = function (el) {
    el.addEventListener("mouseenter", function () { cursorRing.classList.add("hovered"); });
    el.addEventListener("mouseleave", function () { cursorRing.classList.remove("hovered"); });
  };
  document.querySelectorAll("[data-hover]").forEach(window.bindHoverCursor);
} else {
  document.body.style.cursor = "auto";
  window.bindHoverCursor = function () {};
}

// ===== MAGNETIC BUTTONS =====
if (isFinePointer) {
  document.querySelectorAll(".btn-fill").forEach(function (btn) {
    btn.addEventListener("mousemove", function (e) {
      const rect = btn.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = "translate(" + relX * 0.25 + "px, " + relY * 0.25 + "px)";
    });
    btn.addEventListener("mouseleave", function () {
      btn.style.transform = "translate(0, 0)";
    });
  });
}

// ===== BENTO CARD TILT =====
function bindTilt(card) {
  if (!isFinePointer) return;
  card.addEventListener("mousemove", function (e) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -6;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 6;
    card.style.transform = "perspective(600px) rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg)";
  });
  card.addEventListener("mouseleave", function () {
    card.style.transform = "perspective(600px) rotateX(0) rotateY(0)";
  });
}
document.querySelectorAll(".tilt").forEach(bindTilt);

// ===== WORK RO'YXATINI RENDER QILISH =====
const workList = document.getElementById("workList");
const revealObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

function renderWork() {
  var dict = I18N[currentLang];
  workList.innerHTML = "";

  WORK_PROJECTS.forEach(function (project, index) {
    var desc = typeof project.description === "string"
      ? project.description
      : (project.description[currentLang] || project.description.uz);

    const item = document.createElement("div");
    item.className = "work-item reveal" + (index % 2 === 1 ? " reverse" : "");

    const tagsHTML = project.tags.map(function (tag) {
      return '<span class="tag">' + tag + '</span>';
    }).join("");

    item.innerHTML =
      '<span class="work-num">' + project.num + '</span>' +
      '<div class="work-media" data-index="' + index + '"><img src="' + project.image + '" alt="' + project.title + '"></div>' +
      '<div class="work-body">' +
        '<p class="work-year">' + project.year + '</p>' +
        '<h3 class="work-title">' + project.title + '</h3>' +
        '<p class="work-desc">' + desc + '</p>' +
        '<div class="work-tags">' + tagsHTML + '</div>' +
        '<div class="work-links">' +
          '<a href="' + project.demo + '" target="_blank" rel="noopener" class="work-link" data-hover>' +
            '<img src="https://api.iconify.design/mdi:open-in-new.svg?color=%23ffffff" alt=""> ' + dict.workView + '</a>' +
          '<a href="' + project.code + '" target="_blank" rel="noopener" class="work-link" data-hover>' +
            '<img src="https://api.iconify.design/mdi:github.svg?color=%23ffffff" alt=""> ' + dict.workCode + '</a>' +
        '</div>' +
      '</div>';

    workList.appendChild(item);
    revealObserver.observe(item);

    var media = item.querySelector(".work-media");
    media.addEventListener("click", function () { openModal(index); });

    if (isFinePointer) {
      item.querySelectorAll(".work-link").forEach(function (el) {
        el.addEventListener("mouseenter", function () { cursorRing.classList.add("hovered"); });
        el.addEventListener("mouseleave", function () { cursorRing.classList.remove("hovered"); });
      });
      media.addEventListener("mouseenter", function () {
        cursorLabel.classList.add("active");
        cursorRing.classList.add("hidden-for-label");
      });
      media.addEventListener("mouseleave", function () {
        cursorLabel.classList.remove("active");
        cursorRing.classList.remove("hidden-for-label");
      });
    }
  });
}

// ===== LOYIHA OYNASI (modal) =====
var modal = document.getElementById("projectModal");
var modalImg = document.getElementById("modalImg");
var modalYear = document.getElementById("modalYear");
var modalTitle = document.getElementById("modalTitle");
var modalDesc = document.getElementById("modalDesc");
var modalTags = document.getElementById("modalTags");
var modalDemo = document.getElementById("modalDemo");
var modalCode = document.getElementById("modalCode");

function openModal(index) {
  var p = WORK_PROJECTS[index];
  if (!p) return;
  var desc = typeof p.description === "string" ? p.description : (p.description[currentLang] || p.description.uz);
  modalImg.src = p.image;
  modalImg.alt = p.title;
  modalYear.textContent = p.year;
  modalTitle.textContent = p.title;
  modalDesc.textContent = desc;
  modalTags.innerHTML = p.tags.map(function (t) { return '<span class="tag">' + t + '</span>'; }).join("");
  modalDemo.href = p.demo;
  modalCode.href = p.code;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("modalBackdrop").addEventListener("click", closeModal);
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
});

// ===== RAQAMLARNI SANASH ANIMATSIYASI (stats) =====
const statObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.count);
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    statObserver.unobserve(el);
  });
}, { threshold: 0.5 });

// ===== BOSHLASH =====
(function init() {
  // mavzu: saqlangan -> tizim sozlamasi -> dark
  var savedTheme = safeGet(THEME_KEY);
  if (!savedTheme) {
    savedTheme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  document.documentElement.setAttribute("data-theme", savedTheme);

  // til: saqlangan -> brauzer tili -> uz
  var savedLang = safeGet(LANG_KEY);
  if (!savedLang) {
    var nav = (navigator.language || "uz").slice(0, 2).toLowerCase();
    savedLang = (nav === "ru" || nav === "en") ? nav : "uz";
  }
  applyLang(savedLang);

  // statik "reveal" elementlarni kuzatish
  document.querySelectorAll(".reveal").forEach(function (el) { revealObserver.observe(el); });
  document.querySelectorAll(".stat-num").forEach(function (el) { statObserver.observe(el); });
})();
