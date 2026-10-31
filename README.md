# FORME — Premium Fitness Club

A single-page, editorial landing page for a luxury fitness club. Built with plain HTML, CSS and
GSAP (ScrollTrigger) — no build step, no framework.

## Run locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Structure

```
index.html               – the landing page
assets/css/styles.css    – design tokens, layout, responsive rules
assets/js/main.js        – loader, hero intro, reveals, parallax, menu
assets/js/*.min.js       – GSAP + ScrollTrigger (vendored)
assets/fonts/            – Cormorant Garamond + Jost (self-hosted woff2)
assets/img/              – photography
assets/favicon.svg
```

## Editing content

- **Membership prices** — in `index.html`, change the `data-price` value *and* the visible
  number inside each `.plan__amount` span.
- **Copy** — all section copy is plain text in `index.html`.
- **Contact details** — placeholders live in the footer and the mobile menu; update them
  before going live.
- **Colours / type / spacing** — the `:root` block at the top of `styles.css`.
- **Motion** — timings live in `main.js`; all animation is disabled automatically for
  `prefers-reduced-motion: reduce`.

## Notes

- Photography is AI-generated placeholder imagery, licensed for this demo.
- The "Start your journey" button opens a `mailto:` draft. No form data is sent or stored.
- No pinned sections, no scroll hijacking, no custom smooth-scroll library.
