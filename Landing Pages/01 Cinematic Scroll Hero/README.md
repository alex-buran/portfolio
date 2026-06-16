# Cinematic Scroll Hero

**[Live demo →](https://alex-buran.github.io/portfolio/Landing%20Pages/01%20Cinematic%20Scroll%20Hero/)**

A single-file landing page demo built around one hand-written WebGL fog/light shader, raymarched live in the browser — no stock video, no image sequences, nothing to load but code.

## What it does

- One raymarched fog volume with volumetric light shafts and drifting "dust" sparkle — fully procedural (3D noise), no textures or video.
- Color mood shifts continuously across the whole scroll range using a cosine palette function: no hard cuts, no chapters, just one smooth gradient of color and light from top to bottom.
- Scroll position and mouse position are both smoothed (lerped) before driving the shader, so camera drift feels fluid instead of snapping to raw input.
- Render resolution is intentionally scaled down (~0.55–0.68x) and upscaled by the browser, keeping it smooth on laptops and phones; a grain overlay hides the softness and reinforces the cinematic look.
- Subtle letterboxing bars on wide screens for a film aspect feel (auto-hidden on tall/mobile screens).
- Custom cursor, magnetic CTA button, staggered section reveals, and a preloader intro-settle transition.
