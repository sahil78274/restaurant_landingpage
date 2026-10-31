# FORME — Performance Fitness Club

A single-page, campaign-style landing page for a performance fitness brand.
Plain HTML, CSS and GSAP (ScrollTrigger) — no framework, no build step.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Design system

| Token | Value | Use |
| --- | --- | --- |
| `--white` | `#FFFFFF` | page background |
| `--ink` | `#0B0B0B` | type, rules, inverted sections |
| `--beige` / `--beige-soft` | `#D8D0C3` / `#EFEAE1` | minimal accent, featured plan |
| `--line` | `rgba(11,11,11,.16)` | hairline separators |

- **Display / UI:** Archivo 700–900, tight negative tracking, uppercase.
- **Data / labels:** JetBrains Mono 400–500, uppercase, wide tracking.
- Both self-hosted as `woff2` in `assets/fonts/`.

## Page structure

1. `hero` — oversized "NO EXCUSES. / JUST PROGRESS." with the athlete photograph set *inside* the headline, stepping over it and under the second line. Vertical margin labels, rotating scroll disc.
2. `data` — hairline-separated counters (12,000+ / 24/7 / 100%).
3. `programs` — three full-width editorial rows with oversized numbering; on desktop the photograph is revealed from the right edge on hover and drifts with the pointer.
4. `campaign` — full-bleed monochrome campaign image, parallax, "BUILT THROUGH REPETITION."
5. `marquee` — oversized type strip with outlined words.
6. `philosophy` — asymmetric image/type grid, sticky image column on desktop, "PROGRESS IS EARNED. NOT GIVEN."
7. `membership` — typographic table (Starter / Performance / Elite), hairline separators, ink fill on hover.
8. `final` — "YOUR NEXT REP STARTS HERE." plus the Join FORME action.
9. `footer` — ink block with an outlined FORME wordmark.

## Editing

- **Prices** — change `data-price` *and* the visible number inside each `.plan__amount`.
- **Copy** — all plain text in `index.html`.
- **Contact details** — placeholders in the footer and mobile menu.
- **Colours / type / spacing** — the `:root` block at the top of `assets/css/styles.css`.
- **Motion timings** — `assets/js/main.js`; everything is bypassed under
  `prefers-reduced-motion: reduce`.

## Notes

- Photography is AI-generated black-and-white placeholder imagery.
- "Join FORME" and the plan links open a pre-filled `mailto:` draft — no form data is
  sent to a backend or stored.
- No pinned sections, no scroll hijacking, no custom smooth-scroll library.
