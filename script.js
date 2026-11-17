import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const canvas = document.getElementById('webgl');
const loader = document.getElementById('loader');
const quoteEl = document.getElementById('quote');

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.0018);
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.1, 1400);
camera.position.set(0, 16, 48);

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
renderer.toneMappingExposure = 2.15;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  2.65,
  0.48,
  0.42
);
composer.addPass(bloomPass);
const outputPass = new OutputPass();
composer.addPass(outputPass);

// Lighting – hyper-real cinematic multi-rig
const ambient = new THREE.AmbientLight(0x0a0a18, 0.05);
scene.add(ambient);

const key = new THREE.DirectionalLight(0xffe8c0, 5.2);
key.position.set(22, 40, 24);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 0.5;
key.shadow.camera.far = 180;
key.shadow.bias = -0.0002;
scene.add(key);

const rim = new THREE.DirectionalLight(0x6688ff, 3.4);
rim.position.set(-28, 22, -20);
scene.add(rim);

const fill = new THREE.PointLight(0xff5500, 12.0, 120);
fill.position.set(0, 6, 0);
fill.castShadow = true;
scene.add(fill);

const accent = new THREE.PointLight(0xffee66, 6.0, 60);
accent.position.set(14, 20, 12);
scene.add(accent);

const cool = new THREE.PointLight(0x55bbff, 4.2, 70);
cool.position.set(-14, 14, -12);
scene.add(cool);

const surgeLight = new THREE.PointLight(0xff7700, 0, 90);
surgeLight.position.set(0, 12, 0);
scene.add(surgeLight);

// Ground
const groundGeo = new THREE.PlaneGeometry(480, 480, 220, 220);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x020208,
  roughness: 0.96,
  metalness: 0.04,
  emissive: 0x080200,
  emissiveIntensity: 0.08
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -22;
ground.receiveShadow = true;
scene.add(ground);

// Primary particles – rising determination streams (256k)
const particleCount = 256000;
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
const sizes = new Float32Array(particleCount);
const velocities = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
  const i3 = i * 3;
  positions[i3] = (Math.random() - 0.5) * 180;
  positions[i3 + 1] = Math.random() * 100 - 26;
  positions[i3 + 2] = (Math.random() - 0.5) * 180;

  const t = Math.random();
  colors[i3] = 1.0;
  colors[i3 + 1] = 0.15 + t * 0.68;
  colors[i3 + 2] = 0.004 + t * 0.48;

  sizes[i] = 0.008 + Math.random() * 0.22;
  velocities[i] = 0.032 + Math.random() * 0.16;
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

const particleMat = new THREE.PointsMaterial({
  size: 0.11,
  vertexColors: true,
  transparent: true,
  opacity: 0.94,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  sizeAttenuation: true
});
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// Secondary denser core stream particles (128k) – volumetric feel near spine
const coreParticleCount = 128000;
const corePositions = new Float32Array(coreParticleCount * 3);
const coreColors = new Float32Array(coreParticleCount * 3);
const coreVelocities = new Float32Array(coreParticleCount);

for (let i = 0; i < coreParticleCount; i++) {
  const i3 = i * 3;
  const r = Math.random() * 8;
  const a = Math.random() * Math.PI * 2;
  corePositions[i3] = Math.cos(a) * r;
  corePositions[i3 + 1] = Math.random() * 50 - 18;
  corePositions[i3 + 2] = Math.sin(a) * r;

  coreColors[i3] = 1.0;
  coreColors[i3 + 1] = 0.35 + Math.random() * 0.5;
  coreColors[i3 + 2] = 0.05 + Math.random() * 0.3;

  coreVelocities[i] = 0.05 + Math.random() * 0.2;
}

const coreParticleGeo = new THREE.BufferGeometry();
coreParticleGeo.setAttribute('position', new THREE.BufferAttribute(corePositions, 3));
coreParticleGeo.setAttribute('color', new THREE.BufferAttribute(coreColors, 3));

const coreParticleMat = new THREE.PointsMaterial({
  size: 0.14,
  vertexColors: true,
  transparent: true,
  opacity: 0.88,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  sizeAttenuation: true
});
const coreParticles = new THREE.Points(coreParticleGeo, coreParticleMat);
scene.add(coreParticles);

// Central ascending structure – determination spine + energy helix
const spineGroup = new THREE.Group();
const helixGroup = new THREE.Group();

for (let i = 0; i < 64; i++) {
  const geo = new THREE.CylinderGeometry(0.025 + Math.random()*0.08, 0.42, 1.3, 32);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xff4a00,
    emissive: 0xff2200,
    emissiveIntensity: 1.7,
    metalness: 0.95,
    roughness: 0.05,
    clearcoat: 0.98,
    clearcoatRoughness: 0.03,
    transmission: 0.18,
    thickness: 0.5,
    ior: 1.45
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = i * 1.05 - 16;
  mesh.rotation.z = Math.sin(i * 0.16) * 0.32;
  mesh.castShadow = true;
  spineGroup.add(mesh);
}

// Helix energy rings
for (let i = 0; i < 96; i++) {
  const angle = (i / 96) * Math.PI * 12;
  const y = (i / 96) * 48 - 16;
  const geo = new THREE.TorusGeometry(0.62 + i * 0.038, 0.032, 20, 44);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffee99,
    emissive: 0xffaa00,
    emissiveIntensity: 2.05,
    metalness: 0.99,
    roughness: 0.02,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(Math.cos(angle) * 2.4, y, Math.sin(angle) * 2.4);
  mesh.rotation.x = Math.PI / 2;
  mesh.rotation.z = angle;
  mesh.castShadow = true;
  helixGroup.add(mesh);
}

spineGroup.add(helixGroup);
scene.add(spineGroup);

// Base core – pulsing determination source
const coreGeo = new THREE.SphereGeometry(2.2, 80, 80);
const coreMat = new THREE.MeshPhysicalMaterial({
  color: 0xff1000,
  emissive: 0xff0000,
  emissiveIntensity: 3.4,
  metalness: 0.6,
  roughness: 0.06,
  clearcoat: 0.9,
  clearcoatRoughness: 0.04,
  transmission: 0.12
});
const core = new THREE.Mesh(coreGeo, coreMat);
core.position.y = -7;
core.castShadow = true;
scene.add(core);

// Additional floating energy orbs
const orbs = [];
for (let i = 0; i < 48; i++) {
  const geo = new THREE.SphereGeometry(0.08 + Math.random() * 0.36, 32, 32);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffdd88,
    emissive: 0xff9900,
    emissiveIntensity: 2.6,
    metalness: 0.88,
    roughness: 0.04
  });
  const orb = new THREE.Mesh(geo, mat);
  orb.userData = {
    radius: 5 + Math.random() * 20,
    speed: 0.12 + Math.random() * 1.1,
    offset: Math.random() * Math.PI * 2,
    yBase: 1 + Math.random() * 24
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
  "Pt.12: denser multi-layer streams, volumetric presence, unbreakable rise."
];
let quoteIndex = 0;

function updateQuote() {
  quoteEl.style.opacity = 0;
  setTimeout(() => {
    quoteIndex = (quoteIndex + 1) % quotes.length;
    quoteEl.textContent = quotes[quoteIndex];
    quoteEl.style.opacity = 1;
  }, 800);
}
setInterval(updateQuote, 7000);

let time = 0;
let mouseX = 0, mouseY = 0;
let mouseWorld = new THREE.Vector3();
let boost = 1.0;

const raycaster = new THREE.Raycaster();
const mouseNDC = new THREE.Vector2();

function triggerSurge() {
  boost = Math.min(boost + 0.85, 5.0);
  surgeLight.intensity = 22;
  setTimeout(() => {
    boost = Math.max(boost - 0.85, 1.0);
    surgeLight.intensity = 0;
  }, 3400);
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
  const attractStrength = 0.022;
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    pos[i3 + 1] += velocities[i] * boost;
    pos[i3] += Math.sin(time * 0.5 + i * 0.0028) * 0.02;
    pos[i3 + 2] += Math.cos(time * 0.4 + i * 0.0028) * 0.02;

    const dx = mouseWorld.x - pos[i3];
    const dz = mouseWorld.z - pos[i3 + 2];
    const dist = Math.sqrt(dx * dx + dz * dz) + 0.1;
    if (dist < 38) {
      pos[i3] += (dx / dist) * attractStrength * boost;
      pos[i3 + 2] += (dz / dist) * attractStrength * boost;
    }

    if (pos[i3 + 1] > 62) {
      pos[i3 + 1] = -26;
      pos[i3] = (Math.random() - 0.5) * 180;
      pos[i3 + 2] = (Math.random() - 0.5) * 180;
    }
  }
  particleGeo.attributes.position.needsUpdate = true;

  // Animate core particles (denser volumetric stream)
  const cpos = coreParticleGeo.attributes.position.array;
  for (let i = 0; i < coreParticleCount; i++) {
    const i3 = i * 3;
    cpos[i3 + 1] += coreVelocities[i] * boost * 1.4;
    const swirl = time * 0.8 + i * 0.01;
    cpos[i3] += Math.cos(swirl) * 0.04;
    cpos[i3 + 2] += Math.sin(swirl) * 0.04;

    if (cpos[i3 + 1] > 40) {
      const r = Math.random() * 8;
      const a = Math.random() * Math.PI * 2;
      cpos[i3] = Math.cos(a) * r;
      cpos[i3 + 1] = -18;
      cpos[i3 + 2] = Math.sin(a) * r;
    }
  }
  coreParticleGeo.attributes.position.needsUpdate = true;

  // Spine and helix
  spineGroup.rotation.y = time * 0.12;
  spineGroup.position.y = Math.sin(time * 0.4) * 1.2;
  helixGroup.rotation.y = time * 0.32;

  // Core pulse
  const pulse = 1 + Math.sin(time * 2.0) * 0.45;
  core.scale.setScalar(pulse);
  coreMat.emissiveIntensity = 2.8 + Math.sin(time * 2.4) * 1.3;

  // Orbs
  orbs.forEach((orb, idx) => {
    const d = orb.userData;
    const a = time * d.speed + d.offset;
    orb.position.set(
      Math.cos(a) * d.radius,
      d.yBase + Math.sin(time * 0.75 + idx) * 2.8,
      Math.sin(a) * d.radius
    );
    orb.scale.setScalar(1 + Math.sin(time * 1.4 + idx) * 0.35);
  });

  // Camera cinematic drift + mouse influence
  camera.position.x = Math.sin(time * 0.055) * 8.0 + mouseX * 6.0;
  camera.position.y = 16 + Math.sin(time * 0.11) * 2.8 + mouseY * 3.2;
  camera.position.z = 48 + Math.cos(time * 0.042) * 6.0;
  camera.lookAt(0, 10, 0);

  // Dynamic lights
  fill.intensity = 10.0 + Math.sin(time * 1.6) * 2.5;
  accent.intensity = 4.2 + Math.sin(time * 1.2) * 1.6;
  accent.position.x = Math.sin(time * 0.6) * 16;
  accent.position.z = Math.cos(time * 0.6) * 16;
  cool.intensity = 2.8 + Math.sin(time * 0.8) * 1.1;
  surgeLight.intensity *= 0.91;

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
}, 2600);
