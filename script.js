import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const canvas = document.getElementById('webgl');
const loader = document.getElementById('loader');
const quoteEl = document.getElementById('quote');

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.0014);
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(32, window.innerWidth / window.innerHeight, 0.1, 1800);
camera.position.set(0, 20, 56);

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
renderer.toneMappingExposure = 2.45;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  3.05,
  0.38,
  0.32
);
composer.addPass(bloomPass);
const outputPass = new OutputPass();
composer.addPass(outputPass);

// Lighting – hyper-real cinematic multi-rig with elevated iridescent response
const ambient = new THREE.AmbientLight(0x0a0a18, 0.03);
scene.add(ambient);

const key = new THREE.DirectionalLight(0xffe8c0, 6.2);
key.position.set(26, 46, 28);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 0.5;
key.shadow.camera.far = 220;
key.shadow.bias = -0.0002;
scene.add(key);

const rim = new THREE.DirectionalLight(0x6688ff, 4.2);
rim.position.set(-32, 26, -24);
scene.add(rim);

const fill = new THREE.PointLight(0xff5500, 16.0, 150);
fill.position.set(0, 10, 0);
fill.castShadow = true;
scene.add(fill);

const accent = new THREE.PointLight(0xffee66, 8.0, 80);
accent.position.set(18, 24, 16);
scene.add(accent);

const cool = new THREE.PointLight(0x55bbff, 5.4, 90);
cool.position.set(-18, 18, -16);
scene.add(cool);

const surgeLight = new THREE.PointLight(0xff7700, 0, 120);
surgeLight.position.set(0, 16, 0);
scene.add(surgeLight);

// Ground
const groundGeo = new THREE.PlaneGeometry(560, 560, 260, 260);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x020208,
  roughness: 0.98,
  metalness: 0.02,
  emissive: 0x080200,
  emissiveIntensity: 0.05
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -26;
ground.receiveShadow = true;
scene.add(ground);

// Primary particles – rising determination streams (320k)
const particleCount = 320000;
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
const sizes = new Float32Array(particleCount);
const velocities = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
  const i3 = i * 3;
  positions[i3] = (Math.random() - 0.5) * 220;
  positions[i3 + 1] = Math.random() * 120 - 30;
  positions[i3 + 2] = (Math.random() - 0.5) * 220;

  const t = Math.random();
  colors[i3] = 1.0;
  colors[i3 + 1] = 0.10 + t * 0.75;
  colors[i3 + 2] = 0.002 + t * 0.55;

  sizes[i] = 0.006 + Math.random() * 0.26;
  velocities[i] = 0.032 + Math.random() * 0.20;
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

const particleMat = new THREE.PointsMaterial({
  size: 0.11,
  vertexColors: true,
  transparent: true,
  opacity: 0.97,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  sizeAttenuation: true
});
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// Secondary denser core stream particles (200k) – volumetric feel near spine
const coreParticleCount = 200000;
const corePositions = new Float32Array(coreParticleCount * 3);
const coreColors = new Float32Array(coreParticleCount * 3);
const coreVelocities = new Float32Array(coreParticleCount);

for (let i = 0; i < coreParticleCount; i++) {
  const i3 = i * 3;
  const r = Math.random() * 10;
  const a = Math.random() * Math.PI * 2;
  corePositions[i3] = Math.cos(a) * r;
  corePositions[i3 + 1] = Math.random() * 60 - 22;
  corePositions[i3 + 2] = Math.sin(a) * r;

  coreColors[i3] = 1.0;
  coreColors[i3 + 1] = 0.35 + Math.random() * 0.58;
  coreColors[i3 + 2] = 0.05 + Math.random() * 0.38;

  coreVelocities[i] = 0.052 + Math.random() * 0.24;
}

const coreParticleGeo = new THREE.BufferGeometry();
coreParticleGeo.setAttribute('position', new THREE.BufferAttribute(corePositions, 3));
coreParticleGeo.setAttribute('color', new THREE.BufferAttribute(coreColors, 3));

const coreParticleMat = new THREE.PointsMaterial({
  size: 0.14,
  vertexColors: true,
  transparent: true,
  opacity: 0.92,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  sizeAttenuation: true
});
const coreParticles = new THREE.Points(coreParticleGeo, coreParticleMat);
scene.add(coreParticles);

// Central ascending structure – determination spine + energy helix with elevated iridescence
const spineGroup = new THREE.Group();
const helixGroup = new THREE.Group();

for (let i = 0; i < 80; i++) {
  const geo = new THREE.CylinderGeometry(0.020 + Math.random()*0.10, 0.48, 1.30, 40);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xff4a00,
    emissive: 0xff2200,
    emissiveIntensity: 2.1,
    metalness: 0.97,
    roughness: 0.03,
    clearcoat: 1.0,
    clearcoatRoughness: 0.015,
    transmission: 0.25,
    thickness: 0.60,
    ior: 1.50,
    iridescence: 0.92,
    iridescenceIOR: 1.35,
    iridescenceThicknessRange: [90, 450]
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = i * 1.05 - 20;
  mesh.rotation.z = Math.sin(i * 0.13) * 0.38;
  mesh.castShadow = true;
  spineGroup.add(mesh);
}

// Helix energy rings with elevated iridescence
for (let i = 0; i < 120; i++) {
  const angle = (i / 120) * Math.PI * 15;
  const y = (i / 120) * 56 - 20;
  const geo = new THREE.TorusGeometry(0.62 + i * 0.034, 0.028, 24, 52);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffee99,
    emissive: 0xffaa00,
    emissiveIntensity: 2.45,
    metalness: 0.998,
    roughness: 0.012,
    clearcoat: 1.0,
    clearcoatRoughness: 0.012,
    iridescence: 0.96,
    iridescenceIOR: 1.30,
    iridescenceThicknessRange: [70, 400]
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(Math.cos(angle) * 2.8, y, Math.sin(angle) * 2.8);
  mesh.rotation.x = Math.PI / 2;
  mesh.rotation.z = angle;
  mesh.castShadow = true;
  helixGroup.add(mesh);
}

spineGroup.add(helixGroup);
scene.add(spineGroup);

// Base core – pulsing determination source with elevated iridescence
const coreGeo = new THREE.SphereGeometry(2.6, 108, 108);
const coreMat = new THREE.MeshPhysicalMaterial({
  color: 0xff1000,
  emissive: 0xff0000,
  emissiveIntensity: 4.2,
  metalness: 0.70,
  roughness: 0.04,
  clearcoat: 0.98,
  clearcoatRoughness: 0.02,
  transmission: 0.18,
  iridescence: 0.82,
  iridescenceIOR: 1.38,
  iridescenceThicknessRange: [110, 520]
});
const core = new THREE.Mesh(coreGeo, coreMat);
core.position.y = -9;
core.castShadow = true;
scene.add(core);

// Additional floating energy orbs
const orbs = [];
for (let i = 0; i < 64; i++) {
  const geo = new THREE.SphereGeometry(0.06 + Math.random() * 0.42, 40, 40);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffdd88,
    emissive: 0xff9900,
    emissiveIntensity: 3.1,
    metalness: 0.92,
    roughness: 0.025,
    iridescence: 0.70,
    iridescenceIOR: 1.32,
    iridescenceThicknessRange: [55, 320]
  });
  const orb = new THREE.Mesh(geo, mat);
  orb.userData = {
    radius: 5.0 + Math.random() * 24,
    speed: 0.12 + Math.random() * 1.3,
    offset: Math.random() * Math.PI * 2,
    yBase: 0.6 + Math.random() * 28
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
  "Pt.15: denser multi-layer iridescent streams, stronger volumetric presence, unbreakable rise.",
  "Hyper-real PBR with elevated iridescence. The architecture refuses to fall.",
  "The quiet engine never stops rewriting the board."
];
let quoteIndex = 0;

function updateQuote() {
  quoteEl.style.opacity = 0;
  setTimeout(() => {
    quoteIndex = (quoteIndex + 1) % quotes.length;
    quoteEl.textContent = quotes[quoteIndex];
    quoteEl.style.opacity = 1;
  }, 750);
}
setInterval(updateQuote, 6600);

let time = 0;
let mouseX = 0, mouseY = 0;
let mouseWorld = new THREE.Vector3();
let boost = 1.0;

const raycaster = new THREE.Raycaster();
const mouseNDC = new THREE.Vector2();

function triggerSurge() {
  boost = Math.min(boost + 1.05, 6.0);
  surgeLight.intensity = 32;
  setTimeout(() => {
    boost = Math.max(boost - 1.05, 1.0);
    surgeLight.intensity = 0;
  }, 3800);
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

  // Animate primary particles
  const pos = particleGeo.attributes.position.array;
  const attractStrength = 0.028;
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    pos[i3 + 1] += velocities[i] * boost;
    pos[i3] += Math.sin(time * 0.52 + i * 0.0024) * 0.024;
    pos[i3 + 2] += Math.cos(time * 0.42 + i * 0.0024) * 0.024;

    const dx = mouseWorld.x - pos[i3];
    const dz = mouseWorld.z - pos[i3 + 2];
    const dist = Math.sqrt(dx * dx + dz * dz) + 0.1;
    if (dist < 48) {
      pos[i3] += (dx / dist) * attractStrength * boost;
      pos[i3 + 2] += (dz / dist) * attractStrength * boost;
    }

    if (pos[i3 + 1] > 72) {
      pos[i3 + 1] = -30;
      pos[i3] = (Math.random() - 0.5) * 220;
      pos[i3 + 2] = (Math.random() - 0.5) * 220;
    }
  }
  particleGeo.attributes.position.needsUpdate = true;

  // Animate core particles (denser volumetric stream)
  const cpos = coreParticleGeo.attributes.position.array;
  for (let i = 0; i < coreParticleCount; i++) {
    const i3 = i * 3;
    cpos[i3 + 1] += coreVelocities[i] * boost * 1.55;
    const swirl = time * 0.92 + i * 0.008;
    cpos[i3] += Math.cos(swirl) * 0.048;
    cpos[i3 + 2] += Math.sin(swirl) * 0.048;

    if (cpos[i3 + 1] > 48) {
      const r = Math.random() * 10;
      const a = Math.random() * Math.PI * 2;
      cpos[i3] = Math.cos(a) * r;
      cpos[i3 + 1] = -22;
      cpos[i3 + 2] = Math.sin(a) * r;
    }
  }
  coreParticleGeo.attributes.position.needsUpdate = true;

  // Spine and helix
  spineGroup.rotation.y = time * 0.15;
  spineGroup.position.y = Math.sin(time * 0.40) * 1.5;
  helixGroup.rotation.y = time * 0.38;

  // Core pulse
  const pulse = 1 + Math.sin(time * 2.2) * 0.52;
  core.scale.setScalar(pulse);
  coreMat.emissiveIntensity = 3.6 + Math.sin(time * 2.8) * 1.6;

  // Orbs
  orbs.forEach((orb, idx) => {
    const d = orb.userData;
    const a = time * d.speed + d.offset;
    orb.position.set(
      Math.cos(a) * d.radius,
      d.yBase + Math.sin(time * 0.82 + idx) * 3.2,
      Math.sin(a) * d.radius
    );
    orb.scale.setScalar(1 + Math.sin(time * 1.6 + idx) * 0.40);
  });

  // Camera cinematic drift + mouse influence
  camera.position.x = Math.sin(time * 0.048) * 10.0 + mouseX * 8.0;
  camera.position.y = 20 + Math.sin(time * 0.11) * 3.5 + mouseY * 4.0;
  camera.position.z = 56 + Math.cos(time * 0.038) * 8.0;
  camera.lookAt(0, 13, 0);

  // Dynamic lights
  fill.intensity = 12.5 + Math.sin(time * 1.8) * 3.0;
  accent.intensity = 5.5 + Math.sin(time * 1.4) * 2.0;
  accent.position.x = Math.sin(time * 0.70) * 20;
  accent.position.z = Math.cos(time * 0.70) * 20;
  cool.intensity = 3.5 + Math.sin(time * 0.90) * 1.4;
  surgeLight.intensity *= 0.88;

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
}, 2400);
