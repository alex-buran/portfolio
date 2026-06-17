// Tiny fetch-based loader for the .glsl source files.
// Kept separate so main.js doesn't need inline template-string shaders --
// the shader source lives in real .glsl files that GitHub's language
// detection can see and credit on the repo's language breakdown.

const cache = new Map();

export async function loadShader(path) {
  if (cache.has(path)) return cache.get(path);
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Failed to load shader: ${path} (${res.status})`);
  }
  const text = await res.text();
  cache.set(path, text);
  return text;
}

export async function loadShaderPair(vertPath, fragPath) {
  const [vertexShader, fragmentShader] = await Promise.all([
    loadShader(vertPath),
    loadShader(fragPath),
  ]);
  return { vertexShader, fragmentShader };
}
