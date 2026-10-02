# Portfolio — Xojiakbar Saydullayev

**Live → https://xojiakbar3031.github.io/portfolio-pro/**

Personal site of an **AI engineer & frontend developer**. It's a single page in three
languages (UZ / RU / EN) with a Three.js background that reacts to scroll, and it needs
no build step: plain HTML, CSS and vanilla JavaScript.

## Highlights

- **3D background** (Three.js) with floating crystals that react to scroll and the
  mouse. It turns off automatically with `prefers-reduced-motion`, when WebGL is
  unavailable, and when the tab is hidden.
- **Three languages**, switched instantly and remembered. All copy lives in
  [`i18n.js`](i18n.js).
- **Projects** are rendered from [`projects.js`](projects.js) and open in a details
  modal. Projects without a live demo (bots, desktop agent) show only the code link.
- A working **contact form** (FormSubmit), a **CV download**, live **GitHub repo
  count** from the API, and an "available for freelance" badge.
- Micro-interactions: loader, custom cursor, magnetic buttons, word-by-word hero,
  3D tilt cards, scroll progress and a section indicator.

## Run locally

```bash
npx serve .
# or
python -m http.server 8000
```

## Add a project

Add an entry to `WORK_PROJECTS` in `projects.js` (`title`, `description` in uz/ru/en,
`tags`, `image`, `code`, and optionally `demo`). Put a 1280×800 screenshot in `assets/`.
