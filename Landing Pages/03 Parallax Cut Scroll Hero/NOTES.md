# Parallax Cut Scroll Hero

Single-file demo. Open `index.html` directly in a browser (double-click it) — no build step, no server, no video files.

## Where this came from
This is an earlier build from the same "Cinematic Scroll Hero" exploration — made before the current concept 1 was settled on. Worth keeping as its own concept rather than throwing away: same core idea (one raymarched WebGL fog/light shader, no stock footage), but a different camera model, contrast treatment, and interaction layer. See the README in this folder for the technical breakdown.

## Fix applied
The original file loaded Three.js with a plain `<script src="...three.min.js"></script>` tag immediately followed by an inline `<script>` that used `THREE` right away. On a slow connection this races the CDN load and the page can get stuck on the preloader. Fixed the same way as concept 1: the inline logic is wrapped in `__motionInit()`, and the Three.js script tag is created dynamically with an `onload` handler that polls for `typeof THREE !== 'undefined'` before calling it, plus an `onerror` fallback that hides the preloader if the CDN fails. No other code was touched.

## Copy pass
The on-page text was originally identical to concept 1 (title, brand mark "MOTION™", headline, chapter labels, CTA, footer) since both came from the same base file. Rewrote all of it — brand is now "DRIFT™", headline and chapter labels (Hold / Drift / Settle) speak to the cursor-parallax + film-contrast identity of this build — so it reads as a distinct concept instead of a duplicate.

## Notes
- Source code (HTML structure, CSS, JS interaction logic, GLSL shader) is otherwise unmodified from the original build.
- Built for the "Cinematic scroll hero" concept family — concept 3 of the Landing Pages series.
