# Cinematic Scroll Hero

A single-file landing page demo built around one hand-written WebGL fog/light shader, raymarched live in the browser — no stock video, no image sequences, nothing to load but code.

Open `index.html` directly in a browser (double-click it). No build step, no server, no dependencies beyond a CDN font/Three.js include.

## What it does

- One raymarched fog volume with volumetric light shafts and drifting "dust" sparkle — fully procedural (3D noise), no textures or video.
- Color mood shifts continuously across the whole scroll range using a cosine palette function: no hard cuts, no chapters, just one smooth gradient of color and light from top to bottom.
- Scroll position and mouse position are both smoothed (lerped) before driving the shader, so camera drift feels fluid instead of snapping to raw input.
- Render resolution is intentionally scaled down (~0.55–0.68x) and upscaled by the browser, keeping it smooth on laptops and phones; a grain overlay hides the softness and reinforces the cinematic look.
- Subtle letterboxing bars on wide screens for a film aspect feel (auto-hidden on tall/mobile screens).
- Custom cursor, magnetic CTA button, staggered section reveals, and a preloader intro-settle transition.

## To customize

1. The mood palette is controlled by the `palette()` function inside the shader — tweak the `a/b/c/d` vectors to shift the color story (currently blue → gold → magenta → blue).
2. Copy lives in the `<section>` blocks; contact links are in the footer + CTA.
3. Brand mark "MOTION™" in the nav — swap for your own.
4. `renderScale` near the top of the script controls the performance/sharpness tradeoff.

## Deploying for free

Drag this folder into any of these — no card required, live `https://` URL in under a minute:

- [Cloudflare Pages](https://pages.cloudflare.com)
- [Netlify Drop](https://app.netlify.com/drop)
- GitHub Pages
