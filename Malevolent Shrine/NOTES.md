# Malevolent Shrine — build notes

Internal notes on how this one came together.

## Where this came from

Started from a reference video of a cinematic scroll-driven 3D product page — cloud reveal, frosted object morphing into a mountain, slow camera, serif type. The brief from that reference was narrowed down to one thing: the smoothness and the cinematic camera feel. Fonts, palette, and concept were all deliberately built different so this doesn't read as a copy.

Concept landed on Sukuna's Domain Expansion from Jujutsu Kaisen — a shrine with a fanged gate opening, curled roofline horns, a blood-red volumetric sky, lanterns, dead trees on a rocky island, and a water reflection. It's named and disclosed openly as a fan redesign in the README; nothing here traces or reproduces official art.

## Three passes, not one

This piece went through three full builds before landing where it is now.

**Pass one** was a pure raymarched SDF scene — boxes, cylinders, spheres, `smin` blending, no textures, no meshes, everything evaluated per-pixel in one fragment shader. It matched the "techy" goal but fell well short of the reference mood, which read as art-directed matte-painting-quality composites. Pure procedural primitives couldn't close that gap on their own.

**Pass two** rebuilt the shrine as real Three.js geometry instead — pillars, a ring of individually-angled teeth, curled horns extruded along Catmull-Rom curves, stacked roof tiers, recursively-branched dead trees, all skinned with self-generated (Python/numpy/PIL, layered value noise) sky and stone/wood textures, with a real shader doing the sky's cloud drift and the water's ripple/fresnel. It looked better than pass one but procedural geometry still couldn't reach the lighting and composition quality the reference demanded.

**Pass three** dropped procedural modeling entirely. The gate scene became a single rendered hero image. The GLSL work moved from "build the world" to "stage and grade one photograph": a frustum-filling plane parented to the camera, a hand-written cover-fit aspect correction, a scroll-driven UV zoom, a mouse-driven parallax-lite UV shift, a masked water ripple, a darken pass, a vignette, a warm grade, and a flicker — all per-pixel, all written from scratch. A real `THREE.Points` ember system and a world-space camera dolly (for the embers' parallax) carried over from pass two unchanged.

**Pass four** — the current build — replaces the still image with a short AI-generated video. See "The hero becomes a video" below for why and what changed.

## Making the water move (pass three, superseded)

A flat photograph can't actually animate, but its water region was the one part where motion read as plausible rather than fake. Pass three's fragment shader masked everything below a hand-picked waterline (found by eye, inspecting where the rock meets the reflection in the source image), displaced the sample point inside that mask with three overlapping sine waves at different frequencies and speeds, and layered a sparse hash-based sparkle pass on top for light catching the wave crests.

The mask itself went through one real bug fix worth recording: the first version computed it in raw screen-space UV, on the assumption that would keep the masked band "anchored" regardless of zoom. That's backwards — screen-space UV doesn't correspond to a fixed point on the actual photo once the cover-fit aspect correction or the scroll zoom changes which part of the image lands under a given screen pixel. The visible symptom was the ripple and sparkle drifting onto the rock at certain window sizes and scroll positions. The fix was masking in `coverUv` instead — the same post-cover-fit, post-zoom coordinate already used to sample the texture — so the mask always means "this pixel of the source photo," not "this pixel of the screen."

This entire mechanism (the waterline mask, the ripple displacement, the sparkle pass, and the brightness flicker that stood in for lantern light) was removed in pass four. Once the hero is a real video with its own water motion and its own light pulsing baked into the frames, faking the same things in the shader on top is redundant at best and visually conflicting at worst — two independent ripple patterns overlapping rarely reads as one coherent wave.

## The hero becomes a video

Pass three's static image, however well it was graded, still couldn't deliver what a scroll-driven domain-expansion piece really wants: water that actually moves and a red aura that actually drifts. Pass four replaces `assets/hero.png` with `assets/hero.mp4`, a short (8s, looping, no audio) AI-generated video, played through a hidden `<video>` element and wrapped in a `THREE.VideoTexture` in place of the old `THREE.TextureLoader` call. Everything downstream — the frustum-filling plane, the cover-fit, the scroll zoom, the mouse parallax, the darken/vignette/grade — stays exactly the same, because all of it operates on whatever texture is bound to `uTexture`, whether that's a static image or a video frame.

The video was generated from a more detailed reference image than the one pass three's hero photo was abstracted from — this one shows Sukuna's face, throne, and the domain's name in its original kanji directly, rather than the deliberately-different gate redesign pass three used. That's a real shift in exposure: pass three could honestly claim "redesigned, not copied," while pass four directly depicts the character's likeness and the official text. This was a deliberate, informed choice, not an oversight — flagged and confirmed before implementing rather than assumed. The disclosure language in the page footer and this README were updated to reflect it honestly ("fan project" depicting the character, not "fan redesign").

The ember `THREE.Points` system and the world-space camera dolly that gave it parallax were removed in the same pass. They were pass two's stand-in for "something moving independently of the static hero plane" — once the hero plane has its own real motion, that stand-in has no job left to do, and removing it simplified `js/main.js` and `shaders/hero.frag.glsl` substantially (no more `uTime`, no more flicker term, no more glow-sprite texture).

## The video that rendered as solid black

An early cut of pass four shipped with the hero plane starting well below full size at scroll 0 (a flat scale multiplier) and growing out to full frustum-fill over the first ~30% of scroll, meant to read as "approaching the gate" rather than arriving already inside it. That mechanic was removed — not because the idea was wrong, but because while debugging an unrelated problem it turned out to be the wrong fix for the wrong bug, and once the real bug was fixed the geometry-scale intro stopped earning its complexity.

The real bug: the `<video>` element supplying the `THREE.VideoTexture` was hidden via `width: 1px; height: 1px; opacity: 0`, on the assumption that "off-screen but still in the DOM" would keep it decoding. It didn't. Chrome has a power-saving heuristic that pauses frame decoding for video elements it judges effectively invisible, and a 1px box qualifies — so the video element existed, `play()` resolved without error, and the texture stayed permanently black. Diagnosed by sampling actual pixel values from a screen recording: the canvas region was flat `(0, 0, 0)`, not a darkened video frame, which ruled out the shader's darken/vignette pass and pointed straight at "no frame ever arrived."

Two follow-up attempts at "give it real dimensions but still hide it" didn't hold up either: pushing it off-screen with a large negative `left` offset still reads as "not visible" to Chrome, and so does keeping it on-screen at full size with `opacity: 0` — opacity is just another way of saying "nothing to paint here." The fix that actually sticks: keep the video full-opacity and full-size, sitting directly behind the opaque WebGL canvas via `z-index: -1`. The canvas paints over it completely every frame, so the user never sees it, but nothing about the element itself looks invisible to Chrome, so decoding never pauses.

With the video actually playing, the geometry-scale intro reveal was dropped per a direct call to not have the shrine "start from far." The scroll journey now lives entirely in the shader-side zoom (`uZoom`, scaling UV coordinates around the frame center) — the plane is full-frustum from the first frame, and scrolling pushes deeper into the gate rather than growing it from nothing.

## Why there's no camera dolly anymore

Passes two and three kept a real camera dolly through world space, purely so the world-space embers would get genuine parallax against the camera-locked hero plane — the plane itself can't get parallax against anything since it's parented to the camera by definition. With the embers gone in pass four, nothing in the scene lives in world space anymore except the camera and its child plane, so the dolly had no job left to do. It was removed along with the embers; the shader-side scroll zoom (scaling the video's own UV coordinates) is now the only "push toward the gate" motion, and it didn't need the dolly's help even when both existed.

## Notes

- House chrome (preloader, custom cursor, grain overlay, scroll reveal) never depended on the scene content in any pass and was carried forward untouched.
- `assets/hero.png` is no longer the hero itself, but it wasn't deleted — it's reused as a CSS fallback background so something reasonable shows if JS or WebGL fails to load.
