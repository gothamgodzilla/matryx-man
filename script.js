import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const canvas = document.getElementById('webgl');
const loader = document.getElementById('loader');
const quoteEl = document.getElementById('quote');

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.0007);
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(28, window.innerWidth / window.innerHeight, 0.1, 2400);
camera.position.set(0, 24, 65);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: "high-performance",
  stencil: false,
  depth: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 3.2;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  4.2,
  0.25,
  0.15
);
composer.addPass(bloomPass);
const outputPass = new OutputPass();
composer.addPass(outputPass);

// Lighting – hyper-real cinematic multi-rig with elevated iridescent response
const ambient = new THREE.AmbientLight(0x0a0a18, 0.012);
scene.add(ambient);

const key = new THREE.DirectionalLight(0xffe8c0, 9.0);
key.position.set(32, 55, 35);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 0.5;
key.shadow.camera.far = 280;
key.shadow.bias = -0.0002;
scene.add(key);

const rim = new THREE.DirectionalLight(0x6688ff, 6.5);
rim.position.set(-38, 32, -30);
scene.add(rim);

const fill = new THREE.PointLight(0xff5500, 28.0, 220);
fill.position.set(0, 14, 0);
fill.castShadow = true;
scene.add(fill);

const accent = new THREE.PointLight(0xffee66, 16.0, 120);
accent.position.set(24, 30, 22);
scene.add(accent);

const cool = new THREE.PointLight(0x55bbff, 10.0, 130);
cool.position.set(-24, 24, -22);
scene.add(cool);

const surgeLight = new THREE.PointLight(0xff7700, 0, 200);
surgeLight.position.set(0, 20, 0);
scene.add(surgeLight);

// Ground
const groundGeo = new THREE.PlaneGeometry(800, 800, 400, 400);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x020208,
  roughness: 0.99,
  metalness: 0.01,
  emissive: 0x080200,
  emissiveIntensity: 0.12
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -32;
ground.receiveShadow = true;
scene.add(ground);

// Primary particles – rising determination streams (600k)
const particleCount = 600000;
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
const sizes = new Float32Array(particleCount);
const velocities = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
  const i3 = i * 3;
  positions[i3] = (Math.random() - 0.5) * 280;
  positions[i3 + 1] = Math.random() * 150 - 38;
  positions[i3 + 2] = (Math.random() - 0.5) * 280;

  const t = Math.random();
  colors[i3] = 1.0;
  colors[i3 + 1] = 0.05 + t * 0.85;
  colors[i3 + 2] = 0.001 + t * 0.65;

  sizes[i] = 0.003 + Math.random() * 0.38;
  velocities[i] = 0.035 + Math.random() * 0.28;
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

const particleMat = new THREE.PointsMaterial({
  size: 0.16,
  vertexColors: true,
  transparent: true,
  opacity: 0.995,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  sizeAttenuation: true
});
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// Secondary denser core stream particles (400k)
const coreParticleCount = 400000;
const corePositions = new Float32Array(coreParticleCount * 3);
const coreColors = new Float32Array(coreParticleCount * 3);
const coreVelocities = new Float32Array(coreParticleCount);

for (let i = 0; i < coreParticleCount; i++) {
  const i3 = i * 3;
  const r = Math.random() * 18;
  const a = Math.random() * Math.PI * 2;
  corePositions[i3] = Math.cos(a) * r;
  corePositions[i3 + 1] = Math.random() * 75 - 28;
  corePositions[i3 + 2] = Math.sin(a) * r;

  coreColors[i3] = 1.0;
  coreColors[i3 + 1] = 0.3 + Math.random() * 0.7;
  coreColors[i3 + 2] = 0.02 + Math.random() * 0.5;

  coreVelocities[i] = 0.055 + Math.random() * 0.32;
}

const coreParticleGeo = new THREE.BufferGeometry();
coreParticleGeo.setAttribute('position', new THREE.BufferAttribute(corePositions, 3));
coreParticleGeo.setAttribute('color', new THREE.BufferAttribute(coreColors, 3));

const coreParticleMat = new THREE.PointsMaterial({
  size: 0.19,
  vertexColors: true,
  transparent: true,
  opacity: 0.97,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  sizeAttenuation: true
});
const coreParticles = new THREE.Points(coreParticleGeo, coreParticleMat);
scene.add(coreParticles);

// Tertiary atmospheric sparks (250k)
const atmParticleCount = 250000;
const atmPositions = new Float32Array(atmParticleCount * 3);
const atmColors = new Float32Array(atmParticleCount * 3);
const atmVelocities = new Float32Array(atmParticleCount);

for (let i = 0; i < atmParticleCount; i++) {
  const i3 = i * 3;
  atmPositions[i3] = (Math.random() - 0.5) * 380;
  atmPositions[i3 + 1] = Math.random() * 190 - 48;
  atmPositions[i3 + 2] = (Math.random() - 0.5) * 380;

  const t = Math.random();
  atmColors[i3] = 1.0;
  atmColors[i3 + 1] = 0.1 + t * 0.7;
  atmColors[i3 + 2] = 0.03 + t * 0.48;

  atmVelocities[i] = 0.016 + Math.random() * 0.15;
}

const atmParticleGeo = new THREE.BufferGeometry();
atmParticleGeo.setAttribute('position', new THREE.BufferAttribute(atmPositions, 3));
atmParticleGeo.setAttribute('color', new THREE.BufferAttribute(atmColors, 3));

const atmParticleMat = new THREE.PointsMaterial({
  size: 0.1,
  vertexColors: true,
  transparent: true,
  opacity: 0.72,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  sizeAttenuation: true
});
const atmParticles = new THREE.Points(atmParticleGeo, atmParticleMat);
scene.add(atmParticles);

// Quaternary ultra-dense micro-sparks (150k) near core
const microParticleCount = 150000;
const microPositions = new Float32Array(microParticleCount * 3);
const microColors = new Float32Array(microParticleCount * 3);
const microVelocities = new Float32Array(microParticleCount);

for (let i = 0; i < microParticleCount; i++) {
  const i3 = i * 3;
  const r = Math.random() * 9;
  const a = Math.random() * Math.PI * 2;
  microPositions[i3] = Math.cos(a) * r;
  microPositions[i3 + 1] = Math.random() * 45 - 16;
  microPositions[i3 + 2] = Math.sin(a) * r;

  microColors[i3] = 1.0;
  microColors[i3 + 1] = 0.42 + Math.random() * 0.58;
  microColors[i3 + 2] = 0.04 + Math.random() * 0.38;

  microVelocities[i] = 0.09 + Math.random() * 0.45;
}

const microParticleGeo = new THREE.BufferGeometry();
microParticleGeo.setAttribute('position', new THREE.BufferAttribute(microPositions, 3));
microParticleGeo.setAttribute('color', new THREE.BufferAttribute(microColors, 3));

const microParticleMat = new THREE.PointsMaterial({
  size: 0.13,
  vertexColors: true,
  transparent: true,
  opacity: 0.94,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  sizeAttenuation: true
});
const microParticles = new THREE.Points(microParticleGeo, microParticleMat);
scene.add(microParticles);

// Central ascending structure – determination spine + energy helix with elevated iridescence
const spineGroup = new THREE.Group();
const helixGroup = new THREE.Group();

for (let i = 0; i < 140; i++) {
  const geo = new THREE.CylinderGeometry(0.012 + Math.random()*0.18, 0.65, 1.6, 48);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xff4a00,
    emissive: 0xff2200,
    emissiveIntensity: 3.2,
    metalness: 0.995,
    roughness: 0.012,
    clearcoat: 1.0,
    clearcoatRoughness: 0.004,
    transmission: 0.5,
    thickness: 1.0,
    ior: 1.68,
    iridescence: 0.998,
    iridescenceIOR: 1.52,
    iridescenceThicknessRange: [150, 650]
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = i * 1.08 - 26;
  mesh.rotation.z = Math.sin(i * 0.09) * 0.55;
  mesh.castShadow = true;
  spineGroup.add(mesh);
}

// Helix energy rings with elevated iridescence
for (let i = 0; i < 200; i++) {
  const angle = (i / 200) * Math.PI * 22;
  const y = (i / 200) * 75 - 26;
  const geo = new THREE.TorusGeometry(0.8 + i * 0.035, 0.028, 32, 64);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffee99,
    emissive: 0xffaa00,
    emissiveIntensity: 3.6,
    metalness: 1.0,
    roughness: 0.003,
    clearcoat: 1.0,
    clearcoatRoughness: 0.003,
    iridescence: 0.999,
    iridescenceIOR: 1.45,
    iridescenceThicknessRange: [110, 600]
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(Math.cos(angle) * 3.8, y, Math.sin(angle) * 3.8);
  mesh.rotation.x = Math.PI / 2;
  mesh.rotation.z = angle;
  mesh.castShadow = true;
  helixGroup.add(mesh);
}

spineGroup.add(helixGroup);
scene.add(spineGroup);

// Base core – pulsing determination source with elevated iridescence
const coreGeo = new THREE.SphereGeometry(3.4, 128, 128);
const coreMat = new THREE.MeshPhysicalMaterial({
  color: 0xff1000,
  emissive: 0xff0000,
  emissiveIntensity: 6.5,
  metalness: 0.85,
  roughness: 0.012,
  clearcoat: 1.0,
  clearcoatRoughness: 0.006,
  transmission: 0.42,
  iridescence: 0.98,
  iridescenceIOR: 1.55,
  iridescenceThicknessRange: [170, 720]
});
const core = new THREE.Mesh(coreGeo, coreMat);
core.position.y = -14;
core.castShadow = true;
scene.add(core);

// Additional floating energy orbs
const orbs = [];
for (let i = 0; i < 140; i++) {
  const geo = new THREE.SphereGeometry(0.035 + Math.random() * 0.62, 48, 48);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffdd88,
    emissive: 0xff9900,
    emissiveIntensity: 4.5,
    metalness: 0.98,
    roughness: 0.01,
    iridescence: 0.92,
    iridescenceIOR: 1.48,
    iridescenceThicknessRange: [90, 520]
  });
  const orb = new THREE.Mesh(geo, mat);
  orb.userData = {
    radius: 5.5 + Math.random() * 36,
    speed: 0.11 + Math.random() * 1.9,
    offset: Math.random() * Math.PI * 2,
    yBase: 0.5 + Math.random() * 42
  };
  scene.add(orb);
  orbs.push(orb);
}

const quotes = [
  "The ones who were counted out write the rules that outlast the counters.",
  "Underestimated is not a verdict. It is fuel.",
  "Determination is the quiet refusal to become the story others wrote.",
  "They measured the odds. You measured the work.",
  "MatryxX: the architecture of becoming undeniable.",
  "What begins as overlooked sparks becomes an unstoppable rise.",
  "The underestimated write the code that outlasts the counters.",
  "Refuse the narrative. Build the ascent.",
  "Underestimated determination is the quiet engine that rewrites the board.",
  "Every dismissed spark is fuel for the next elevation.",
  "Quiet engines rewrite the visible skyline.",
  "The overlooked become the architecture.",
  "The mouse aligns the sparks. The click unleashes the surge.",
  "Pt.20: denser multi-layer iridescent streams, multi-octave turbulence, stronger volumetric presence, unbreakable rise.",
  "Hyper-real PBR with elevated iridescence on Three.js r187. The architecture refuses to fall.",
  "The quiet engine never stops rewriting the board.",
  "Underestimated determination is the architecture that outlasts every count.",
  "Pt.20 remaster: magnetic attraction, elevated density, multi-octave rise that cannot be counted out."
];
let quoteIndex = 0;

function updateQuote() {
  quoteEl.style.opacity = 0;
  setTimeout(() => {
    quoteIndex = (quoteIndex + 1) % quotes.length;
    quoteEl.textContent = quotes[quoteIndex];
    quoteEl.style.opacity = 1;
  }, 850);
}
setInterval(updateQuote, 7000);

let time = 0;
let mouseX = 0, mouseY = 0;
let mouseWorld = new THREE.Vector3();
let boost = 1.0;

const raycaster = new THREE.Raycaster();
const mouseNDC = new THREE.Vector2();

function triggerSurge() {
  boost = Math.min(boost + 1.6, 9.0);
  surgeLight.intensity = 65;
  setTimeout(() => {
    boost = Math.max(boost - 1.6, 1.0);
    surgeLight.intensity = 0;
  }, 5000);
}

window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  mouseNDC.x = mouseX;
  mouseNDC.y = -mouseY;
  raycaster.setFromCamera(mouseNDC, camera);
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  raycaster.ray.intersectPlane(plane, mouseWorld);
});

window.addEventListener('click', triggerSurge);
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    triggerSurge();
  }
});

window.addEventListener('touchstart', (e) => {
  if (e.touches.length > 0) {
    const touch = e.touches[0];
    mouseX = (touch.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (touch.clientY / window.innerHeight - 0.5) * 2;
  }
  triggerSurge();
});

function animate() {
  requestAnimationFrame(animate);
  time += 0.016 * boost;

  // Animate primary particles with multi-octave turbulence
  const pos = particleGeo.attributes.position.array;
  const attractStrength = 0.055;
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    pos[i3 + 1] += velocities[i] * boost;
    // Multi-octave turbulence
    pos[i3] += Math.sin(time * 0.55 + i * 0.0016) * 0.038 + Math.sin(time * 1.3 + i * 0.0035) * 0.016 + Math.sin(time * 2.6 + i * 0.0065) * 0.007;
    pos[i3 + 2] += Math.cos(time * 0.45 + i * 0.0016) * 0.038 + Math.cos(time * 1.0 + i * 0.003) * 0.018 + Math.cos(time * 2.0 + i * 0.0055) * 0.008;

    const dx = mouseWorld.x - pos[i3];
    const dz = mouseWorld.z - pos[i3 + 2];
    const dist = Math.sqrt(dx * dx + dz * dz) + 0.1;
    if (dist < 80) {
      pos[i3] += (dx / dist) * attractStrength * boost;
      pos[i3 + 2] += (dz / dist) * attractStrength * boost;
    }

    if (pos[i3 + 1] > 95) {
      pos[i3 + 1] = -38;
      pos[i3] = (Math.random() - 0.5) * 280;
      pos[i3 + 2] = (Math.random() - 0.5) * 280;
    }
  }
  particleGeo.attributes.position.needsUpdate = true;

  // Animate core particles
  const cpos = coreParticleGeo.attributes.position.array;
  for (let i = 0; i < coreParticleCount; i++) {
    const i3 = i * 3;
    cpos[i3 + 1] += coreVelocities[i] * boost * 1.9;
    const swirl = time * 1.2 + i * 0.006;
    cpos[i3] += Math.cos(swirl) * 0.072 + Math.cos(time * 2.4 + i * 0.008) * 0.022;
    cpos[i3 + 2] += Math.sin(swirl) * 0.072 + Math.sin(time * 2.0 + i * 0.007) * 0.02;

    if (cpos[i3 + 1] > 65) {
      const r = Math.random() * 18;
      const a = Math.random() * Math.PI * 2;
      cpos[i3] = Math.cos(a) * r;
      cpos[i3 + 1] = -28;
      cpos[i3 + 2] = Math.sin(a) * r;
    }
  }
  coreParticleGeo.attributes.position.needsUpdate = true;

  // Animate atmospheric particles
  const apos = atmParticleGeo.attributes.position.array;
  for (let i = 0; i < atmParticleCount; i++) {
    const i3 = i * 3;
    apos[i3 + 1] += atmVelocities[i] * boost * 0.95;
    apos[i3] += Math.sin(time * 0.24 + i * 0.0008) * 0.022;
    apos[i3 + 2] += Math.cos(time * 0.22 + i * 0.001) * 0.022;

    if (apos[i3 + 1] > 130) {
      apos[i3 + 1] = -48;
      apos[i3] = (Math.random() - 0.5) * 380;
      apos[i3 + 2] = (Math.random() - 0.5) * 380;
    }
  }
  atmParticleGeo.attributes.position.needsUpdate = true;

  // Animate micro particles
  const mpos = microParticleGeo.attributes.position.array;
  for (let i = 0; i < microParticleCount; i++) {
    const i3 = i * 3;
    mpos[i3 + 1] += microVelocities[i] * boost * 2.4;
    const microSwirl = time * 1.5 + i * 0.011;
    mpos[i3] += Math.cos(microSwirl) * 0.05;
    mpos[i3 + 2] += Math.sin(microSwirl) * 0.05;

    if (mpos[i3 + 1] > 38) {
      const r = Math.random() * 9;
      const a = Math.random() * Math.PI * 2;
      mpos[i3] = Math.cos(a) * r;
      mpos[i3 + 1] = -16;
      mpos[i3 + 2] = Math.sin(a) * r;
    }
  }
  microParticleGeo.attributes.position.needsUpdate = true;

  // Spine and helix
  spineGroup.rotation.y = time * 0.22;
  spineGroup.position.y = Math.sin(time * 0.45) * 2.4;
  helixGroup.rotation.y = time * 0.55;

  // Core pulse
  const pulse = 1 + Math.sin(time * 3.0) * 0.72;
  core.scale.setScalar(pulse);
  coreMat.emissiveIntensity = 5.5 + Math.sin(time * 3.8) * 2.8;

  // Orbs
  orbs.forEach((orb, idx) => {
    const d = orb.userData;
    const a = time * d.speed + d.offset;
    orb.position.set(
      Math.cos(a) * d.radius,
      d.yBase + Math.sin(time * 1.1 + idx) * 5.0,
      Math.sin(a) * d.radius
    );
    orb.scale.setScalar(1 + Math.sin(time * 2.2 + idx) * 0.55);
  });

  // Camera cinematic drift + mouse influence
  camera.position.x = Math.sin(time * 0.05) * 15 + mouseX * 13.0;
  camera.position.y = 24 + Math.sin(time * 0.13) * 5.5 + mouseY * 6.5;
  camera.position.z = 65 + Math.cos(time * 0.04) * 13;
  camera.lookAt(0, 18, 0);

  // Dynamic lights
  fill.intensity = 22 + Math.sin(time * 2.4) * 5.5;
  accent.intensity = 10.0 + Math.sin(time * 1.9) * 3.5;
  accent.position.x = Math.sin(time * 0.95) * 30;
  accent.position.z = Math.cos(time * 0.95) * 30;
  cool.intensity = 6.0 + Math.sin(time * 1.2) * 2.4;
  surgeLight.intensity *= 0.8;

  composer.render();
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  bloomPass.setSize(window.innerWidth, window.innerHeight);
});

setTimeout(() => {
  loader.classList.add('hidden');
  animate();
}, 2800);
