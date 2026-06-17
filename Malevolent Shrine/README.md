# Malevolent Shrine

**[Live demo →](https://alex-buran.github.io/portfolio/Malevolent%20Shrine/)**

A case study in pairing art direction with shader work: a scroll-driven WebGL piece built around a looping hero video and a hand-written GLSL pass on top of it. It's the only project in this portfolio split across multiple source files on purpose, so the repo's language stats reflect the work directly: HTML, CSS, JavaScript, and GLSL, instead of one flattened file.

The gate scene is a short video, mapped onto a plane parented to the camera so it always fills the frame exactly, at any window size, with no stretching or letterboxing. The water ripple and the red aura drift are real frames in that video, not a shader effect layered on top. The shader's job is framing and grading: the zoom into the gate, the parallax tilt, the darkening, the vignette, the warm color grade. Everything that looks like motion design here is either baked into the footage or computed per pixel in GLSL. Nothing is a pre-rendered effect or a third-party plugin.

## What this demonstrates

- **Shader work from scratch.** Cover-fit aspect correction, scroll-driven UV zoom, cursor-driven parallax, a darken/vignette/grade stack, all hand-written GLSL, no shader libraries.
- **Real camera math, not CSS tricks.** The hero plane is sized once from the camera's vertical FOV (and resized live) so it's a true frustum-filling quad in 3D space, not a background image faking depth.
- **Video as a texture source.** A `THREE.VideoTexture` feeds the same shader pipeline a static image would, so the grading logic doesn't care what's underneath it.
- **Knowing when to stop building.** This piece went through three earlier builds (a raymarched SDF scene, then full procedural Three.js geometry with self-generated textures) before landing on the video-hero approach. Both are documented in `NOTES.md`. Cutting two technically harder versions in favor of a simpler, better-looking one is the actual skill on display, not just the GLSL.
- **House chrome consistency.** Preloader, custom cursor, grain overlay, and staggered section reveals match the rest of the portfolio, proving the systemized parts of the site work independently of whatever's running in the hero.

## How it works

- The hero video sits on a plane parented to the camera, sized once from the camera's vertical FOV (and again on resize), so it always exactly fills the frustum. A frustum-filling quad, not a CSS background.
- The fragment shader does its own cover-fit aspect correction, comparing screen aspect to video aspect before sampling, so the video never warps or letterboxes as the window resizes.
- Scrolling drives a shader-side zoom that scales the video's UV coordinates around the frame center, pushing into the gate without moving any real geometry toward it.
- Pointer movement nudges the shader's UV offset, adding a parallax tilt on top of the video's own motion.
- A darken pass, a distance-based vignette, and a faint warm color grade run on top of every frame, entirely in GLSL. Grading the footage, not replacing it.
- House chrome (preloader, custom cursor, canvas grain overlay, staggered section reveals) is consistent with the rest of the portfolio.

## Structure

- `index.html` — markup, section copy, and the hidden `<video>` element that sources the hero footage
- `css/style.css` — house chrome styling (preloader, cursor, nav, reveal sections)
- `js/main.js` — hero plane setup, video texture, render loop, scroll/mouse capture
- `js/shaderLoader.js` — small fetch-based loader for the `.glsl` files
- `shaders/` — the hero plane's vertex + fragment shaders, each its own file
- `assets/hero.mp4` — the looping hero video (AI-generated, 8s, no audio)
- `assets/hero.png` — a still frame, used as a CSS fallback background

## Concept and disclosure

This is a non-commercial fan project depicting Sukuna's Domain Expansion ("Malevolent Shrine") from *Jujutsu Kaisen*, including the character's likeness and the domain's name in its original script. It was generated via AI video tools from a fan-art reference, not traced or extracted from official footage. It exists purely as a portfolio demo to show technical and art-direction skill, not for sale or monetized. All rights to the original characters and concept belong to their creators.
