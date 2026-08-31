// ===== YIL =====
document.getElementById("year").textContent = new Date().getFullYear();

// Sichqonchali qurilmami yoki yo'qmi — bir necha bo'limda ishlatiladi
// (custom cursor, magnetic tugmalar, tilt effekt, hero parallaks)
const isFinePointer = window.matchMedia("(pointer: fine)").matches;

// ===== LOADER =====
window.addEventListener("load", function () {
  setTimeout(function () {
    document.getElementById("loader").classList.add("done");
  }, 500);
});

// ===== NAVBAR: scroll qilganda fon qo'shish =====
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", function () {
  if (window.scrollY > 10) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// ===== HERO RASM PARALLAKS (sichqoncha + scroll birgalikda) =====
const heroPhotoImg = document.getElementById("heroPhotoImg");
let heroPanX = 0;
let heroPanY = 0;
let heroScrollY = 0;

function applyHeroTransform() {
  if (!heroPhotoImg) return;
  heroPhotoImg.style.transform =
    "scale(1.06) translate(" + heroPanX + "px, " + (heroPanY + heroScrollY) + "px)";
}

if (heroPhotoImg && isFinePointer) {
  document.getElementById("heroMedia").addEventListener("mousemove", function (e) {
    heroPanX = -(e.clientX / window.innerWidth - 0.5) * 24;
    heroPanY = -(e.clientY / window.innerHeight - 0.5) * 24;
    applyHeroTransform();
  });
}

window.addEventListener("scroll", function () {
  heroScrollY = window.scrollY * 0.2;
  applyHeroTransform();
});

// ===== CUSTOM CURSOR (faqat sichqoncha bo'lgan qurilmalarda) =====
const cursorDot = document.getElementById("cursorDot");
const cursorRing = document.getElementById("cursorRing");

if (isFinePointer) {
  let ringX = 0, ringY = 0, mouseX = 0, mouseY = 0;

  window.addEventListener("mousemove", function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.transform = "translate(" + mouseX + "px, " + mouseY + "px)";
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    cursorRing.style.left = ringX + "px";
    cursorRing.style.top = ringY + "px";
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll("[data-hover]").forEach(function (el) {
    el.addEventListener("mouseenter", function () {
      cursorRing.classList.add("hovered");
    });
    el.addEventListener("mouseleave", function () {
      cursorRing.classList.remove("hovered");
    });
  });
}

// ===== MAGNETIC BUTTONS =====
if (isFinePointer) {
  document.querySelectorAll(".magnetic-btn").forEach(function (btn) {
    btn.addEventListener("mousemove", function (e) {
      const rect = btn.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = "translate(" + relX * 0.3 + "px, " + relY * 0.3 + "px)";
    });
    btn.addEventListener("mouseleave", function () {
      btn.style.transform = "translate(0, 0)";
    });
  });
}

// ===== BENTO CARD TILT EFFEKTI =====
if (isFinePointer) {
  document.querySelectorAll(".tilt").forEach(function (card) {
    card.addEventListener("mousemove", function (e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;
      card.style.transform = "perspective(600px) rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg)";
    });
    card.addEventListener("mouseleave", function () {
      card.style.transform = "perspective(600px) rotateX(0) rotateY(0)";
    });
  });
}

// ===== WORK RO'YXATINI RENDER QILISH =====
const workList = document.getElementById("workList");

WORK_PROJECTS.forEach(function (project, index) {
  const item = document.createElement("div");
  item.className = "work-item reveal" + (index % 2 === 1 ? " reverse" : "");

  const tagsHTML = project.tags.map(function (tag) {
    return '<span class="tag">' + tag + '</span>';
  }).join("");

  item.innerHTML =
    '<span class="work-num">' + project.num + '</span>' +
    '<div class="work-media"><img src="' + project.image + '" alt="' + project.title + '"></div>' +
    '<div class="work-body">' +
      '<p class="work-year">' + project.year + '</p>' +
      '<h3 class="work-title">' + project.title + '</h3>' +
      '<p class="work-desc">' + project.description + '</p>' +
      '<div class="work-tags">' + tagsHTML + '</div>' +
      '<div class="work-links">' +
        '<a href="' + project.demo + '" target="_blank" rel="noopener" class="work-link" data-hover>' +
          '<img src="https://api.iconify.design/mdi:open-in-new.svg?color=%23ffffff" alt=""> Ko\'rish</a>' +
        '<a href="' + project.code + '" target="_blank" rel="noopener" class="work-link" data-hover>' +
          '<img src="https://api.iconify.design/mdi:github.svg?color=%23ffffff" alt=""> Kod</a>' +
      '</div>' +
    '</div>';

  workList.appendChild(item);
});

// ===== SCROLL'DA PAYDO BO'LISH (Intersection Observer) =====
const revealObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll(".reveal").forEach(function (el) {
  revealObserver.observe(el);
});

// data-hover elementlarga cursor hover qayta ulash (work-link'lar dinamik qo'shilgani uchun)
if (isFinePointer) {
  document.querySelectorAll("[data-hover]").forEach(function (el) {
    el.addEventListener("mouseenter", function () {
      cursorRing.classList.add("hovered");
    });
    el.addEventListener("mouseleave", function () {
      cursorRing.classList.remove("hovered");
    });
  });
}

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
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }
    requestAnimationFrame(tick);
    statObserver.unobserve(el);
  });
}, { threshold: 0.5 });

document.querySelectorAll(".stat-num").forEach(function (el) {
  statObserver.observe(el);
});
