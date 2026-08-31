// ===== YIL =====
document.getElementById("year").textContent = new Date().getFullYear();

// Sichqonchali qurilmami yoki yo'qmi — bir necha bo'limda ishlatiladi
// (custom cursor, magnetic tugmalar, tilt effekt, hero freym tilt)
const isFinePointer = window.matchMedia("(pointer: fine)").matches;

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
      setTimeout(function () {
        loader.classList.add("done");
      }, 300);
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
  if (window.scrollY > 10) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
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

// ===== CUSTOM CURSOR (faqat sichqoncha bo'lgan qurilmalarda) =====
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

  function bindHoverCursor(el) {
    el.addEventListener("mouseenter", function () {
      cursorRing.classList.add("hovered");
    });
    el.addEventListener("mouseleave", function () {
      cursorRing.classList.remove("hovered");
    });
  }

  document.querySelectorAll("[data-hover]").forEach(bindHoverCursor);
} else {
  document.body.style.cursor = "auto";
}

// ===== MAGNETIC BUTTONS (btn-fill) =====
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

// data-hover va "Ko'rish" kursor-label'ni dinamik qo'shilgan elementlarga ulash
if (isFinePointer) {
  document.querySelectorAll(".work-link").forEach(function (el) {
    el.addEventListener("mouseenter", function () { cursorRing.classList.add("hovered"); });
    el.addEventListener("mouseleave", function () { cursorRing.classList.remove("hovered"); });
  });

  document.querySelectorAll(".work-media").forEach(function (el) {
    el.addEventListener("mouseenter", function () {
      cursorLabel.classList.add("active");
      cursorRing.classList.add("hidden-for-label");
    });
    el.addEventListener("mouseleave", function () {
      cursorLabel.classList.remove("active");
      cursorRing.classList.remove("hidden-for-label");
    });
  });
}

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
