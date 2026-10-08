# Portfolio — Xojiakbar Saydullayev

**Live → https://xojiakbar3031.github.io/portfolio-pro/**

Personal site of an **AI engineer & frontend developer**. The whole page is one 3D
world, and scrolling flies a camera through it like a motion piece. Three languages
(UZ / RU / EN), no build step: plain HTML, CSS and vanilla JavaScript with Three.js.

## The 3D journey ([`bg3d.js`](bg3d.js))

Scroll position is mapped to a point on a camera spline that passes through five zones:

| Section | Scene |
|---|---|
| Hero | gyroscope rings orbiting the portrait |
| About | a dive through a twisting tunnel |
| Work | floating glass panels |
| Process | a low flight over a wireframe terrain towards four light pillars |
| Contact | a rise and orbit around a ringed globe |

- The camera never rests: idle sway, roll, mouse parallax, and a wider field of view
  with speed streaks when you scroll fast.
- On load the camera flies in from a distance instead of showing a loading screen.
- Each zone is drawn only while the camera is near it, and fog hides the rest.
- The canvas sits between the portrait and the hero text, so the rings pass in front
  of the photo but behind the copy.
- The scene is skipped with `prefers-reduced-motion` or without WebGL, and it pauses
  when the tab is hidden. Append `#p=2.3` to the URL to park the camera at a point on
  the path (handy for debugging).

## Page

- Monochrome palette with blue and cyan accents, glass content panels, a vignette and
  a chapter indicator that follows the scroll.
- All copy lives in [`i18n.js`](i18n.js); projects are rendered from
  [`projects.js`](projects.js) and open in a details modal.
- Contact form (FormSubmit), CV download, live GitHub repo count.

## Run locally

```bash
npx serve .
# or
python -m http.server 8000
```

## Add a project

Add an entry to `WORK_PROJECTS` in `projects.js` (`title`, `description` in uz/ru/en,
`tags`, `image`, `code`, and optionally `demo`). Put a 1280×800 screenshot in `assets/`.
