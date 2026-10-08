# Portfolio — Xojiakbar Saydullayev

**Live → https://xojiakbar3031.github.io/portfolio-pro/**

Personal site of an **AI engineer & frontend developer**. It's a minimal single page in
three languages (UZ / RU / EN) with one centrepiece: a 3D portrait. There is no build
step, only HTML, CSS and vanilla JavaScript.

## The 3D portrait

[`portrait3d.js`](portrait3d.js) turns a photo into two aligned layers that share a
depth map built from the image's smoothed luminance:

- a **displaced photo mesh**, so the picture stays sharp but has real volume and
  shifts in parallax as the cursor tilts it;
- about **40,000 particles** sampled from the same photo, with the studio backdrop
  keyed out.

On load the particles fly in from a scattered cloud and resolve into the photo. On
scroll the photo dissolves back into particles. Rendering pauses when the hero is
off screen or the tab is hidden. With `prefers-reduced-motion` or without WebGL, a
plain image is shown instead.

## Everything else

- Minimal layout: neutral dark palette, one accent colour, Inter + JetBrains Mono.
- Projects are rendered from [`projects.js`](projects.js); all copy lives in
  [`content.js`](content.js) in three languages, and the choice is remembered.
- Contact form posts via FormSubmit without leaving the page.
- Responsive from phones to desktops, with visible focus states.

## Run locally

```bash
npx serve .
# or
python -m http.server 8000
```

## Add a project

Add an entry to `WORK_PROJECTS` in `projects.js` (`title`, `description` in uz/ru/en,
`tags`, `image`, `code`, and optionally `demo`). Put a 1280×800 screenshot in `assets/`.
