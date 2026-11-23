import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const canvas = document.getElementById('webgl');
const loader = document.getElementById('loader');
const quoteEl = document.getElementById('quote');

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.0012);
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(32, window.innerWidth / window.innerHeight, 0.1, 2000);
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
renderer.toneMappingExposure = 2.6;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  3.2,
  0.36,
  0.28
);
composer.addPass(bloomPass);
const outputPass = new OutputPass();
composer.addPass(outputPass);

// Lighting – hyper-real cinematic multi-rig with elevated iridescent response
const ambient = new THREE.AmbientLight(0x0a0a18, 0.025);
scene.add(ambient);

const key = new THREE.DirectionalLight(0xffe8c0, 6.8);
key.position.set(28, 48, 30);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 0.5;
key.shadow.camera.far = 240;
key.shadow.bias = -0.0002;
scene.add(key);

const rim = new THREE.DirectionalLight(0x6688ff, 4.6);
rim.position.set(-34, 28, -26);
scene.add(rim);

const fill = new THREE.PointLight(0xff5500, 18.0, 160);
fill.position.set(0, 10, 0);
fill.castShadow = true;
scene.add(fill);

const accent = new THREE.PointLight(0xffee66, 9.0, 90);
accent.position.set(20, 26, 18);
scene.add(accent);

const cool = new THREE.PointLight(0x55bbff, 6.0, 100);
cool.position.set(-20, 20, -18);
scene.add(cool);

const surgeLight = new THREE.PointLight(0xff7700, 0, 140);
surgeLight.position.set(0, 16, 0);
scene.add(surgeLight);

// Ground
const groundGeo = new THREE.PlaneGeometry(600, 600, 300, 300);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x020208,
  roughness: 0.97,
  metalness: 0.03,
  emissive: 0x080200,
  emissiveIntensity: 0.06
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -28;
ground.receiveShadow = true;
scene.add(ground);

// Primary particles – rising determination streams (400k)
const particleCount = 400000;
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
const sizes = new Float32Array(particleCount);
const velocities = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
  const i3 = i * 3;
  positions[i3] = (Math.random() - 0.5) * 240;
  positions[i3 + 1] = Math.random() * 130 - 32;
  positions[i3 + 2] = (Math.random() - 0.5) * 240;

  const t = Math.random();
  colors[i3] = 1.0;
  colors[i3 + 1] = 0.08 + t * 0.78;
  colors[i3 + 2] = 0.001 + t * 0.58;

  sizes[i] = 0.005 + Math.random() * 0.28;
  velocities[i] = 0.035 + Math.random() * 0.22;
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

const particleMat = new THREE.PointsMaterial({
  size: 0.12,
  vertexColors: true,
  transparent: true,
  opacity: 0.98,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  sizeAttenuation: true
});
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// Secondary denser core stream particles (250k) – volumetric feel near spine
const coreParticleCount = 250000;
const corePositions = new Float32Array(coreParticleCount * 3);
const coreColors = new Float32Array(coreParticleCount * 3);
const coreVelocities = new Float32Array(coreParticleCount);

for (let i = 0; i < coreParticleCount; i++) {
  const i3 = i * 3;
  const r = Math.random() * 12;
  const a = Math.random() * Math.PI * 2;
  corePositions[i3] = Math.cos(a) * r;
  corePositions[i3 + 1] = Math.random() * 65 - 24;
  corePositions[i3 + 2] = Math.sin(a) * r;

  coreColors[i3] = 1.0;
  coreColors[i3 + 1] = 0.32 + Math.random() * 0.62;
  coreColors[i3 + 2] = 0.04 + Math.random() * 0.42;

  coreVelocities[i] = 0.055 + Math.random() * 0.26;
}

const coreParticleGeo = new THREE.BufferGeometry();
coreParticleGeo.setAttribute('position', new THREE.BufferAttribute(corePositions, 3));
coreParticleGeo.setAttribute('color', new THREE.BufferAttribute(coreColors, 3));

const coreParticleMat = new THREE.PointsMaterial({
  size: 0.15,
  vertexColors: true,
  transparent: true,
  opacity: 0.94,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  sizeAttenuation: true
});
const coreParticles = new THREE.Points(coreParticleGeo, coreParticleMat);
scene.add(coreParticles);

// Central ascending structure – determination spine + energy helix with elevated iridescence
const spineGroup = new THREE.Group();
const helixGroup = new THREE.Group();

for (let i = 0; i < 90; i++) {
  const geo = new THREE.CylinderGeometry(0.018 + Math.random()*0.12, 0.52, 1.35, 48);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xff4a00,
    emissive: 0xff2200,
    emissiveIntensity: 2.4,
    metalness: 0.98,
    roughness: 0.025,
    clearcoat: 1.0,
    clearcoatRoughness: 0.012,
    transmission: 0.32,
    thickness: 0.70,
    ior: 1.55,
    iridescence: 0.96,
    iridescenceIOR: 1.38,
    iridescenceThicknessRange: [100, 500]
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = i * 1.02 - 22;
  mesh.rotation.z = Math.sin(i * 0.12) * 0.42;
  mesh.castShadow = true;
  spineGroup.add(mesh);
}

// Helix energy rings with elevated iridescence
for (let i = 0; i < 140; i++) {
  const angle = (i / 140) * Math.PI * 16;
  const y = (i / 140) * 60 - 22;
  const geo = new THREE.TorusGeometry(0.65 + i * 0.032, 0.026, 28, 56);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffee99,
    emissive: 0xffaa00,
    emissiveIntensity: 2.7,
    metalness: 0.999,
    roughness: 0.01,
    clearcoat: 1.0,
    clearcoatRoughness: 0.01,
    iridescence: 0.98,
    iridescenceIOR: 1.32,
    iridescenceThicknessRange: [80, 450]
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(Math.cos(angle) * 3.0, y, Math.sin(angle) * 3.0);
  mesh.rotation.x = Math.PI / 2;
  mesh.rotation.z = angle;
  mesh.castShadow = true;
  helixGroup.add(mesh);
}

spineGroup.add(helixGroup);
scene.add(spineGroup);

// Base core – pulsing determination source with elevated iridescence
const coreGeo = new THREE.SphereGeometry(2.8, 128, 128);
const coreMat = new THREE.MeshPhysicalMaterial({
  color: 0xff1000,
  emissive: 0xff0000,
  emissiveIntensity: 4.8,
  metalness: 0.75,
  roughness: 0.03,
  clearcoat: 1.0,
  clearcoatRoughness: 0.015,
  transmission: 0.25,
  iridescence: 0.88,
  iridescenceIOR: 1.42,
  iridescenceThicknessRange: [120, 560]
});
const core = new THREE.Mesh(coreGeo, coreMat);
core.position.y = -10;
core.castShadow = true;
scene.add(core);

// Additional floating energy orbs
const orbs = [];
for (let i = 0; i < 80; i++) {
  const geo = new THREE.SphereGeometry(0.05 + Math.random() * 0.48, 48, 48);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffdd88,
    emissive: 0xff9900,
    emissiveIntensity: 3.4,
    metalness: 0.95,
    roughness: 0.02,
    iridescence: 0.78,
    iridescenceIOR: 1.35,
    iridescenceThicknessRange: [60, 360]
  });
  const orb = new THREE.Mesh(geo, mat);
  orb.userData = {
    radius: 5.5 + Math.random() * 26,
    speed: 0.14 + Math.random() * 1.4,
    offset: Math.random() * Math.PI * 2,
    yBase: 0.8 + Math.random() * 30
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
  "Pt.16: denser multi-layer iridescent streams, stronger volumetric presence, unbreakable rise.",
  "Hyper-real PBR with elevated iridescence. The architecture refuses to fall.",
  "The quiet engine never stops rewriting the board.",
  "Underestimated determination is the architecture that outlasts every count."
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
setInterval(updateQuote, 6400);

let time = 0;
let mouseX = 0, mouseY = 0;
let mouseWorld = new THREE.Vector3();
let boost = 1.0;

const raycaster = new THREE.Raycaster();
const mouseNDC = new THREE.Vector2();

function triggerSurge() {
  boost = Math.min(boost + 1.1, 6.5);
  surgeLight.intensity = 36;
  setTimeout(() => {
    boost = Math.max(boost - 1.1, 1.0);
    surgeLight.intensity = 0;
  }, 4000);
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
  const attractStrength = 0.032;
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    pos[i3 + 1] += velocities[i] * boost;
    pos[i3] += Math.sin(time * 0.55 + i * 0.0022) * 0.026;
    pos[i3 + 2] += Math.cos(time * 0.45 + i * 0.0022) * 0.026;

    const dx = mouseWorld.x - pos[i3];
    const dz = mouseWorld.z - pos[i3 + 2];
    const dist = Math.sqrt(dx * dx + dz * dz) + 0.1;
    if (dist < 52) {
      pos[i3] += (dx / dist) * attractStrength * boost;
      pos[i3 + 2] += (dz / dist) * attractStrength * boost;
    }

    if (pos[i3 + 1] > 78) {
      pos[i3 + 1] = -32;
      pos[i3] = (Math.random() - 0.5) * 240;
      pos[i3 + 2] = (Math.random() - 0.5) * 240;
    }
  }
  particleGeo.attributes.position.needsUpdate = true;

  // Animate core particles (denser volumetric stream)
  const cpos = coreParticleGeo.attributes.position.array;
  for (let i = 0; i < coreParticleCount; i++) {
    const i3 = i * 3;
    cpos[i3 + 1] += coreVelocities[i] * boost * 1.6;
    const swirl = time * 0.95 + i * 0.0075;
    cpos[i3] += Math.cos(swirl) * 0.052;
    cpos[i3 + 2] += Math.sin(swirl) * 0.052;

    if (cpos[i3 + 1] > 52) {
      const r = Math.random() * 12;
      const a = Math.random() * Math.PI * 2;
      cpos[i3] = Math.cos(a) * r;
      cpos[i3 + 1] = -24;
      cpos[i3 + 2] = Math.sin(a) * r;
    }
  }
  coreParticleGeo.attributes.position.needsUpdate = true;

  // Spine and helix
  spineGroup.rotation.y = time * 0.16;
  spineGroup.position.y = Math.sin(time * 0.42) * 1.6;
  helixGroup.rotation.y = time * 0.42;

  // Core pulse
  const pulse = 1 + Math.sin(time * 2.4) * 0.55;
  core.scale.setScalar(pulse);
  coreMat.emissiveIntensity = 4.0 + Math.sin(time * 3.0) * 1.8;

  // Orbs
  orbs.forEach((orb, idx) => {
    const d = orb.userData;
    const a = time * d.speed + d.offset;
    orb.position.set(
      Math.cos(a) * d.radius,
      d.yBase + Math.sin(time * 0.85 + idx) * 3.5,
      Math.sin(a) * d.radius
    );
    orb.scale.setScalar(1 + Math.sin(time * 1.7 + idx) * 0.42);
  });

  // Camera cinematic drift + mouse influence
  camera.position.x = Math.sin(time * 0.05) * 11.0 + mouseX * 9.0;
  camera.position.y = 20 + Math.sin(time * 0.12) * 4.0 + mouseY * 4.5;
  camera.position.z = 56 + Math.cos(time * 0.04) * 9.0;
  camera.lookAt(0, 14, 0);

  // Dynamic lights
  fill.intensity = 14.0 + Math.sin(time * 1.9) * 3.5;
  accent.intensity = 6.0 + Math.sin(time * 1.5) * 2.2;
  accent.position.x = Math.sin(time * 0.75) * 22;
  accent.position.z = Math.cos(time * 0.75) * 22;
  cool.intensity = 4.0 + Math.sin(time * 0.95) * 1.6;
  surgeLight.intensity *= 0.87;

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
