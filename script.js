const canvas = document.getElementById('webgl');
const loader = document.getElementById('loader');
const quoteEl = document.getElementById('quote');

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.008);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 300);
camera.position.set(0, 6, 22);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Lighting – hyper-real cinematic
const ambient = new THREE.AmbientLight(0x0a0a18, 0.35);
scene.add(ambient);

const key = new THREE.DirectionalLight(0xffbb77, 2.2);
key.position.set(8, 16, 10);
key.castShadow = true;
key.shadow.mapSize.width = 2048;
key.shadow.mapSize.height = 2048;
key.shadow.camera.near = 0.5;
key.shadow.camera.far = 50;
scene.add(key);

const rim = new THREE.DirectionalLight(0x4488ff, 1.1);
rim.position.set(-12, 8, -6);
scene.add(rim);

const fill = new THREE.PointLight(0xff5500, 3.5, 40);
fill.position.set(0, 1.5, 0);
fill.castShadow = true;
scene.add(fill);

const accent = new THREE.PointLight(0xffaa00, 1.8, 25);
accent.position.set(4, 8, 2);
scene.add(accent);

// Ground plane – dark reflective with subtle emissive
const groundGeo = new THREE.PlaneGeometry(120, 120, 128, 128);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x05050c,
  roughness: 0.92,
  metalness: 0.08,
  emissive: 0x080400,
  emissiveIntensity: 0.08
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -3;
ground.receiveShadow = true;
scene.add(ground);

// Determination particles – dense rising streams with turbulence
const particleCount = 28000;
const positions = new Float32Array(particleCount * 3);
const velocities = new Float32Array(particleCount);
const colors = new Float32Array(particleCount * 3);
const sizes = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
  const i3 = i * 3;
  positions[i3] = (Math.random() - 0.5) * 50;
  positions[i3 + 1] = Math.random() * 28 - 6;
  positions[i3 + 2] = (Math.random() - 0.5) * 50;
  velocities[i] = 0.012 + Math.random() * 0.055;
  const hue = 0.04 + Math.random() * 0.12;
  const c = new THREE.Color().setHSL(hue, 0.95, 0.4 + Math.random() * 0.35);
  colors[i3] = c.r;
  colors[i3 + 1] = c.g;
  colors[i3 + 2] = c.b;
  sizes[i] = 0.04 + Math.random() * 0.06;
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

const particleMat = new THREE.PointsMaterial({
  size: 0.07,
  vertexColors: true,
  transparent: true,
  opacity: 0.82,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  sizeAttenuation: true
});
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// Central ascending structure – determination spine + energy helix
const spineGroup = new THREE.Group();
const helixGroup = new THREE.Group();

for (let i = 0; i < 18; i++) {
  const geo = new THREE.CylinderGeometry(0.12, 0.28, 1.6, 12);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xff6b00,
    emissive: 0xff4400,
    emissiveIntensity: 0.75,
    metalness: 0.65,
    roughness: 0.25
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = i * 1.4 - 6;
  mesh.rotation.z = Math.sin(i * 0.4) * 0.12;
  mesh.castShadow = true;
  spineGroup.add(mesh);
}

// Helix rings
for (let i = 0; i < 24; i++) {
  const angle = (i / 24) * Math.PI * 4;
  const y = (i / 24) * 18 - 6;
  const geo = new THREE.TorusGeometry(0.8 + i * 0.04, 0.06, 8, 16);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffaa55,
    emissive: 0xff6600,
    emissiveIntensity: 0.9,
    metalness: 0.8,
    roughness: 0.2
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(Math.cos(angle) * 1.2, y, Math.sin(angle) * 1.2);
  mesh.rotation.x = Math.PI / 2;
  mesh.rotation.z = angle;
  helixGroup.add(mesh);
}

spineGroup.add(helixGroup);
scene.add(spineGroup);

// Base core – pulsing determination source
const coreGeo = new THREE.SphereGeometry(0.9, 32, 32);
const coreMat = new THREE.MeshStandardMaterial({
  color: 0xff3300,
  emissive: 0xff2200,
  emissiveIntensity: 1.4,
  metalness: 0.4,
  roughness: 0.3
});
const core = new THREE.Mesh(coreGeo, coreMat);
core.position.y = -2.2;
core.castShadow = true;
scene.add(core);

const quotes = [
  "The ones who were counted out write the rules that outlast the counters.",
  "Underestimated is not a verdict. It is fuel.",
  "Determination is the quiet refusal to become the story others wrote.",
  "They measured the odds. You measured the work.",
  "MatryxX: the architecture of becoming undeniable.",
  "What begins as overlooked sparks becomes an unstoppable rise.",
  "The underestimated write the code that outlasts the counters."
];
let quoteIndex = 0;

function updateQuote() {
  quoteEl.style.opacity = 0;
  setTimeout(() => {
    quoteIndex = (quoteIndex + 1) % quotes.length;
    quoteEl.textContent = quotes[quoteIndex];
    quoteEl.style.opacity = 1;
  }, 700);
}
setInterval(updateQuote, 8000);

let time = 0;
let mouseX = 0, mouseY = 0;

window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

function animate() {
  requestAnimationFrame(animate);
  time += 0.016;

  // Animate particles upward with slight turbulence
  const pos = particleGeo.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    pos[i3 + 1] += velocities[i];
    pos[i3] += Math.sin(time * 0.5 + i * 0.01) * 0.008;
    pos[i3 + 2] += Math.cos(time * 0.4 + i * 0.01) * 0.008;
    if (pos[i3 + 1] > 26) {
      pos[i3 + 1] = -8;
      pos[i3] = (Math.random() - 0.5) * 50;
      pos[i3 + 2] = (Math.random() - 0.5) * 50;
    }
  }
  particleGeo.attributes.position.needsUpdate = true;

  // Spine and helix rotation / breathing
  spineGroup.rotation.y = time * 0.12;
  spineGroup.position.y = Math.sin(time * 0.6) * 0.35;
  helixGroup.rotation.y = time * 0.25;

  // Core pulse
  const pulse = 1 + Math.sin(time * 2.2) * 0.18;
  core.scale.setScalar(pulse);
  coreMat.emissiveIntensity = 1.2 + Math.sin(time * 2.5) * 0.5;

  // Camera cinematic drift + mouse influence
  camera.position.x = Math.sin(time * 0.15) * 3 + mouseX * 2;
  camera.position.y = 6 + Math.sin(time * 0.25) * 0.8 + mouseY * 1.2;
  camera.position.z = 22 + Math.cos(time * 0.1) * 2;
  camera.lookAt(0, 3, 0);

  // Dynamic lights
  fill.intensity = 2.8 + Math.sin(time * 1.8) * 0.9;
  accent.intensity = 1.5 + Math.sin(time * 1.4) * 0.6;
  accent.position.x = Math.sin(time * 0.7) * 5;
  accent.position.z = Math.cos(time * 0.7) * 5;

  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Hide loader after cinematic pause
setTimeout(() => {
  loader.classList.add('hidden');
  animate();
}, 2000);