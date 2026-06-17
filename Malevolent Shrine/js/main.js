import { loadShaderPair } from './shaderLoader.js';

/* global THREE */
// THREE is loaded as a classic global script in index.html *before* this
// module runs, so it's safe to reference here without an import.

const IMAGE_ASPECT = 1280 / 720;
const PLANE_DISTANCE = 10; // fixed local distance from camera, in world units
const ZOOM_RANGE = 0.7;    // how far uZoom travels across the full scroll (1.0 -> 1.0 + ZOOM_RANGE)

const state = {
  scrollT: 0,
  scrollTarget: 0,
  mouseX: 0,
  mouseY: 0,
  mouseTargetX: 0,
  mouseTargetY: 0,
  clock: null,
};

init();

async function init() {
  setupPreloaderTextProgress();
  setupCustomCursor();
  setupGrainOverlay();
  setupRevealObserver();
  setupScrollAndMouse();

  const canvas = document.getElementById('scene-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // Matches --bg in style.css, so any edge case where the frustum-fill
  // math comes up slightly short of the viewport reads as part of the
  // page rather than an obvious canvas edge.
  renderer.setClearColor(0x0a0303, 1);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    52,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );

  // ---- Hero plane -----------------------------------------------------
  // The "scene" is a short looping video, mapped onto a plane that's
  // parented to the camera so it always exactly fills the frustum,
  // regardless of window size. The water and the red aura motion are
  // real video frames now, not a faked shader effect -- the fragment
  // shader only handles framing and grading on top: cover-fit, a
  // scroll-driven zoom, a mouse-driven parallax-lite shift, a darken
  // pass, a vignette, and a warm color grade.
  const heroVideo = document.getElementById('hero-video');
  heroVideo.play().catch(() => {
    // Autoplay can still be blocked in some browsers despite muted +
    // playsInline -- retry on the first interaction of any kind,
    // including a plain scroll, since that's the only gesture this
    // page can actually expect from someone who never clicks.
    const retry = () => {
      heroVideo.play().catch(() => {});
    };
    window.addEventListener('pointerdown', retry, { once: true });
    window.addEventListener('scroll', retry, { once: true, passive: true });
  });

  const heroTexture = new THREE.VideoTexture(heroVideo);
  heroTexture.colorSpace = THREE.SRGBColorSpace;
  heroTexture.minFilter = THREE.LinearFilter;
  heroTexture.magFilter = THREE.LinearFilter;

  const { vertexShader: heroVert, fragmentShader: heroFrag } = await loadShaderPair(
    'shaders/hero.vert.glsl',
    'shaders/hero.frag.glsl'
  );

  const heroMat = new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: heroTexture },
      uScreenAspect: { value: window.innerWidth / window.innerHeight },
      uImageAspect: { value: IMAGE_ASPECT },
      uZoom: { value: 1.0 },
      uMouseOffset: { value: new THREE.Vector2(0, 0) },
      uDarken: { value: 0.74 },
      uVignette: { value: 0.45 },
    },
    vertexShader: heroVert,
    fragmentShader: heroFrag,
    depthWrite: false,
    depthTest: false,
  });

  const heroPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), heroMat);
  heroPlane.position.set(0, 0, -PLANE_DISTANCE);
  camera.add(heroPlane);
  scene.add(camera);
  fitHeroPlane(camera, heroPlane);

  state.clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const dt = state.clock.getDelta();

    state.scrollT += (state.scrollTarget - state.scrollT) * Math.min(dt * 4, 1);
    state.mouseX += (state.mouseTargetX - state.mouseX) * Math.min(dt * 3, 1);
    state.mouseY += (state.mouseTargetY - state.mouseY) * Math.min(dt * 3, 1);

    // The entire scroll journey: a shader-side zoom into the video
    // itself, scaling UV coordinates around the frame center. The
    // plane stays full-frustum the whole time -- no geometry-scale
    // intro reveal, just the push deeper into the gate as you scroll.
    heroMat.uniforms.uZoom.value = 1.0 + state.scrollT * ZOOM_RANGE;
    heroMat.uniforms.uMouseOffset.value.set(state.mouseX * -0.025, state.mouseY * 0.015);

    renderer.render(scene, camera);
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    heroMat.uniforms.uScreenAspect.value = window.innerWidth / window.innerHeight;
    fitHeroPlane(camera, heroPlane);
  });

  animate();
  finishPreload();
}

// Sizes the hero plane so it exactly covers the camera frustum at its
// fixed local distance -- the standard "frustum-filling quad" formula,
// derived from the vertical FOV rather than hard-coded. Runs once on
// init and again on resize; the plane never changes size outside of
// that, since the scroll journey lives entirely in the shader zoom.
function fitHeroPlane(camera, plane) {
  const vFov = (camera.fov * Math.PI) / 180;
  const height = 2 * Math.tan(vFov / 2) * PLANE_DISTANCE;
  const width = height * camera.aspect;
  plane.scale.set(width, height, 1);
}

// ---------------------------------------------------------------------
// House chrome: preloader, custom cursor, grain overlay, scroll reveal,
// scroll/mouse capture. Kept deliberately framework-free to match the
// rest of the portfolio's hand-rolled approach.
// ---------------------------------------------------------------------

function setupPreloaderTextProgress() {
  const fill = document.querySelector('.preloader-fill');
  const pct = document.querySelector('.preloader-pct');
  let p = 0;
  const id = setInterval(() => {
    p = Math.min(p + Math.random() * 18, 96);
    if (fill) fill.style.width = `${p}%`;
    if (pct) pct.textContent = `${Math.round(p)}%`;
  }, 140);
  window.__finishPreload = () => {
    clearInterval(id);
    if (fill) fill.style.width = '100%';
    if (pct) pct.textContent = '100%';
  };
}

function finishPreload() {
  if (window.__finishPreload) window.__finishPreload();
  setTimeout(() => {
    const el = document.getElementById('preloader');
    if (el) {
      el.classList.add('is-done');
      setTimeout(() => el.remove(), 900);
    }
  }, 280);
}

function setupCustomCursor() {
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;
  let rx = 0, ry = 0, tx = 0, ty = 0;

  window.addEventListener('pointermove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
    dot.style.transform = `translate(${tx}px, ${ty}px)`;
  });

  document.querySelectorAll('a, button, .cursor-hover').forEach((el) => {
    el.addEventListener('mouseenter', () => ring.classList.add('is-active'));
    el.addEventListener('mouseleave', () => ring.classList.remove('is-active'));
  });

  function loop() {
    rx += (tx - rx) * 0.18;
    ry += (ty - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(loop);
  }
  loop();
}

function setupGrainOverlay() {
  const canvas = document.getElementById('grain-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = 128;
  canvas.width = size;
  canvas.height = size;

  function draw() {
    const imageData = ctx.createImageData(size, size);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const v = Math.random() * 255;
      imageData.data[i] = v;
      imageData.data[i + 1] = v;
      imageData.data[i + 2] = v;
      imageData.data[i + 3] = 14;
    }
    ctx.putImageData(imageData, 0, 0);
    requestAnimationFrame(draw);
  }
  draw();
}

function setupRevealObserver() {
  const items = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('show');
      });
    },
    { threshold: 0.18 }
  );
  items.forEach((el) => observer.observe(el));
}

function setupScrollAndMouse() {
  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    state.scrollTarget = max > 0 ? window.scrollY / max : 0;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  window.addEventListener('pointermove', (e) => {
    state.mouseTargetX = (e.clientX / window.innerWidth - 0.5) * -1;
    state.mouseTargetY = (e.clientY / window.innerHeight - 0.5) * -1;
  });
}
