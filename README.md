# FORME — strength club

A short, motion-led landing page: four sections, three photographs.
Plain HTML, CSS, GSAP + ScrollTrigger and Lenis — no framework, no build step.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Page (4 sections only)

1. **Hero** — "STRONGER / EVERY DAY." split into letters, with a full-bleed athlete
   photograph between the two lines (the type overlaps the image edge), a rotating
   badge, vertical rail label and a scroll cue.
2. **Programs** — "FIND YOUR POWER." plus three compact rows (Strength / Conditioning /
   Personal training) with counting numerals, a beige sweep and arrow rotation on hover.
3. **Impact** — full-width monochrome campaign photograph with parallax and slow zoom,
   "NO SHORTCUTS. JUST RESULTS." revealed line by line.
4. **Final CTA** — "READY TO LEVEL UP?" with the Join FORME button, followed by a
   minimal footer.

## Motion

- Lenis smooth scrolling, wired into the GSAP ticker (skipped under reduced motion).
- Letter-by-letter splitting for the hero, programs and closing headlines.
- Clip-path image reveals, image parallax/zoom on scroll, batched fade-ups.
- Counter animation on the program numerals, letter-spacing ease on the closing headline.
- Custom two-part cursor with blend-mode difference (pointer devices only).
- Continuous floating background elements: soft orb, outlined ring, vertical rail labels.

All of it is bypassed when `prefers-reduced-motion: reduce` is set, and there are no pinned
sections or scroll locks.

## Design system

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#F7F4EF` | warm-white page |
| `--ink` | `#121211` | type |
| `--beige` / `--beige-deep` | `#D9CFBF` / `#C3B198` | minimal accent |
| `--line` | `rgba(18,18,17,.14)` | hairlines |

- Display: Archivo 800/900, tight negative tracking, uppercase.
- Micro labels: JetBrains Mono 400, uppercase, wide tracking.
- Both self-hosted as `woff2` in `assets/fonts/`.

## Editing

- Copy — plain text in `index.html`.
- Colours, spacing, type scale — `:root` in `assets/css/styles.css`.
- Motion timings — `assets/js/main.js`.
- Contact details — footer and mobile panel placeholders.

## Notes

- Photography is AI-generated black-and-white placeholder imagery (3 images total).
- "Join FORME" opens a pre-filled `mailto:` draft; nothing is sent to a backend or stored.
- Vendored: `gsap.min.js`, `ScrollTrigger.min.js`, `lenis.min.js`.
