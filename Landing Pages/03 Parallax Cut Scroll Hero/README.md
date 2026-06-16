# Parallax Cut Scroll Hero

**[Live demo →](https://alex-buran.github.io/portfolio/Landing%20Pages/03%20Parallax%20Cut%20Scroll%20Hero/)**

Single-file demo. Open `index.html` directly in a browser (double-click it) — no build step, no server, no video files.

## What it is
An earlier build in the same "Cinematic Scroll Hero" family — same idea (one raymarched WebGL fog/light shader, no stock footage, color mood driven by scroll), but a different execution with its own distinct feel:

- **Filmic contrast curve.** The shader pushes a punchier tone-mapping pass — crushed shadows, hot highlights, boosted saturation — so the fog reads more "graded film" and less "soft haze" than the current Cinematic Scroll Hero (01).
- **Cursor-driven parallax.** The midground numerals (01/02/03) and the orbiting ring drift independently based on mouse position and scroll progress, layered at different speeds — this is the "parallax cut" the name refers to.
- **Heavier static grain.** Grain is a single hard-random sample per frame (no crossfading), giving it a coarser, more old-camera texture instead of the softer film-grain blend used in 01.
- **Different ray-marching model.** Camera drifts along a sine/cosine path as you scroll instead of pushing straight forward, and light is computed directionally (`lightDir`) rather than via volumetric light shafts.

## Notes
- Source code is otherwise unmodified from the original build — only the script loading order was fixed (see NOTES.md) so it reliably renders instead of occasionally getting stuck on the preloader.
- Brand mark and copy were rewritten to "DRIFT™" so this reads as its own concept instead of a duplicate of 01's "MOTION™" copy.
