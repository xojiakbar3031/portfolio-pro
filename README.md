# Portfolio — Xojiakbar Saydullayev

**Live → https://xojiakbar3031.github.io/portfolio-pro/**

Personal site of an **AI engineer & frontend developer**. It's a single page in three
languages (UZ / RU / EN) with a monochrome design and a scroll-driven Three.js particle
scene. No build step: plain HTML, CSS and vanilla JavaScript.

## Highlights

- **Scroll-driven 3D particles** (Three.js, custom shaders). About 7,000 points re-form
  for each section: an orbit ring around the hero portrait, a sphere, a wave field, a
  DNA helix, then a globe. All five layouts live on the GPU and blend by weight, so
  the transitions never jump. The cursor pushes nearby points away. The scene turns
  off with `prefers-reduced-motion`, without WebGL, and when the tab is hidden.
- **Editorial hero**: a large black-and-white portrait that fades into the page, with
  the particle ring drawn between the photo and the text.
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
