// Hero plane vertex shader.
//
// The plane itself is a plain 1x1 unit quad — all the sizing happens on
// the JS side (scaled every frame to exactly fill the camera frustum at
// its fixed distance). This shader just passes the UV through untouched;
// every visual trick (zoom, parallax, cover-fit, darkening, vignette)
// happens per-pixel in the fragment stage.

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
