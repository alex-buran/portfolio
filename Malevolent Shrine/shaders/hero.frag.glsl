// Hero plane fragment shader.
//
// The hero is a looping video now, not a still image -- the water
// motion and the red aura drift are real frames, not something faked
// here. This shader only handles framing and grading on top of that:
// a CSS "background-size: cover"-equivalent aspect correction done by
// hand, a scroll-driven zoom around the frame center, a mouse-driven
// parallax-lite UV shift, a darken pass, a distance-based vignette,
// and a faint warm color grade -- all per-pixel, all in GLSL.

uniform sampler2D uTexture;
uniform float uScreenAspect;   // viewport width / height
uniform float uImageAspect;    // source video width / height
uniform float uZoom;           // 1.0 = no zoom, grows with scroll
uniform vec2 uMouseOffset;     // small UV shift driven by pointer position
uniform float uDarken;         // overall brightness multiplier
uniform float uVignette;       // vignette strength, 0..1

varying vec2 vUv;

void main() {
  // Zoom around the center, then nudge with the mouse-driven offset --
  // this is the "camera" for a scene that's really just one flat plane.
  vec2 uv = (vUv - 0.5) / uZoom + 0.5;
  uv += uMouseOffset;

  // Cover-fit: scale whichever axis needs it so the video fills the
  // frame without stretching, identical in spirit to CSS object-fit:
  // cover, computed here per-pixel instead of by the browser.
  vec2 ratio = vec2(
    min(uScreenAspect / uImageAspect, 1.0),
    min(uImageAspect / uScreenAspect, 1.0)
  );
  vec2 coverUv = (uv - 0.5) * ratio + 0.5;

  vec4 tex = texture2D(uTexture, clamp(coverUv, 0.0, 1.0));
  vec3 color = tex.rgb;

  // Darken pass -- the source render came out brighter than the mood
  // wants, so pull it down before anything else touches it.
  color *= uDarken;

  // Vignette: smooth falloff from center to edge.
  float dist = distance(vUv, vec2(0.5));
  float vig = smoothstep(0.85, 0.25, dist);
  color *= mix(1.0 - uVignette, 1.0, vig);

  // Faint warm grade, leaning into the ember palette rather than a
  // neutral color correction.
  color = mix(color, color * vec3(1.05, 0.97, 0.9), 0.4);

  gl_FragColor = vec4(color, 1.0);
}
