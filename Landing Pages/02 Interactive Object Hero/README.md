# Interactive Object Hero

A single-file landing page demo built around a procedurally generated 3D "sculpture" — drag to rotate, scroll to dolly the camera and scale the object. No downloaded `.glb`/`.obj` models, no textures, nothing to license.

Open `index.html` directly in a browser (double-click it). No build step, no external assets.

## What it does

- The centerpiece is a procedurally displaced icosahedron, built by pushing every vertex outward along its normal with layered pseudo-noise — reads as an organic rock/gem form instead of a perfect geometric solid.
- **Drag to rotate**, with inertia: letting go keeps it spinning and decaying instead of stopping dead.
- **Idle auto-rotate** kicks back in a couple of seconds after you stop touching it.
- **Scroll-linked camera dolly and scale** — the object grows and the camera pulls in as you scroll, tying it to the page's progress instead of leaving it static.
- Two-mesh material trick: a solid Phong mesh plus a slightly larger wireframe shell at low opacity, giving a faceted/technical read without real environment maps or physical materials.
- Custom cursor with a "drag" label over the object, magnetic CTA buttons, staggered section reveals, and a preloader intro.
- The object is permanently offset to one side of the frame by design, so it never sits behind the text columns — no overlay/scrim tricks needed for readability.

## To customize

1. Swap the brand mark "MATTER®" in the nav/footer.
2. The displacement noise frequencies/amplitudes are the three `noise(...)` calls right after `IcosahedronGeometry` — raise the amplitudes for a rougher/rockier look, lower them for something closer to a smooth gem.
3. Accent color is `--accent` (currently burnt orange) and `--accent2` (olive) in the CSS variables — these also drive the rim lights in the JS, so change both together if you recolor.
4. Copy lives in the `<section>` blocks; the contact line is in the `#cta` section.

## Deploying for free

Drag this folder into any of these — no card required, live `https://` URL in under a minute:

- [Cloudflare Pages](https://pages.cloudflare.com)
- [Netlify Drop](https://app.netlify.com/drop)
- GitHub Pages
