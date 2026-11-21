import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const canvas = document.getElementById('webgl');
const loader = document.getElementById('loader');
const quoteEl = document.getElementById('quote');

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.0016);
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 1600);
camera.position.set(0, 18, 52);

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
renderer.toneMappingExposure = 2.35;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  2.85,
  0.42,
  0.38
);
composer.addPass(bloomPass);
const outputPass = new OutputPass();
composer.addPass(outputPass);

// Lighting – hyper-real cinematic multi-rig with iridescent response
const ambient = new THREE.AmbientLight(0x0a0a18, 0.04);
scene.add(ambient);

const key = new THREE.DirectionalLight(0xffe8c0, 5.8);
key.position.set(24, 42, 26);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 0.5;
key.shadow.camera.far = 200;
key.shadow.bias = -0.0002;
scene.add(key);

const rim = new THREE.DirectionalLight(0x6688ff, 3.8);
rim.position.set(-30, 24, -22);
scene.add(rim);

const fill = new THREE.PointLight(0xff5500, 14.0, 140);
fill.position.set(0, 8, 0);
fill.castShadow = true;
scene.add(fill);

const accent = new THREE.PointLight(0xffee66, 7.2, 70);
accent.position.set(16, 22, 14);
scene.add(accent);

const cool = new THREE.PointLight(0x55bbff, 4.8, 80);
cool.position.set(-16, 16, -14);
scene.add(cool);

const surgeLight = new THREE.PointLight(0xff7700, 0, 110);
surgeLight.position.set(0, 14, 0);
scene.add(surgeLight);

// Ground
const groundGeo = new THREE.PlaneGeometry(520, 520, 240, 240);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x020208,
  roughness: 0.97,
  metalness: 0.03,
  emissive: 0x080200,
  emissiveIntensity: 0.06
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -24;
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
  positions[i3] = (Math.random() - 0.5) * 200;
  positions[i3 + 1] = Math.random() * 110 - 28;
  positions[i3 + 2] = (Math.random() - 0.5) * 200;

  const t = Math.random();
  colors[i3] = 1.0;
  colors[i3 + 1] = 0.12 + t * 0.72;
  colors[i3 + 2] = 0.002 + t * 0.52;

  sizes[i] = 0.007 + Math.random() * 0.24;
  velocities[i] = 0.028 + Math.random() * 0.18;
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

const particleMat = new THREE.PointsMaterial({
  size: 0.12,
  vertexColors: true,
  transparent: true,
  opacity: 0.96,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  sizeAttenuation: true
});
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// Secondary denser core stream particles (160k) – volumetric feel near spine
const coreParticleCount = 160000;
const corePositions = new Float32Array(coreParticleCount * 3);
const coreColors = new Float32Array(coreParticleCount * 3);
const coreVelocities = new Float32Array(coreParticleCount);

for (let i = 0; i < coreParticleCount; i++) {
  const i3 = i * 3;
  const r = Math.random() * 9;
  const a = Math.random() * Math.PI * 2;
  corePositions[i3] = Math.cos(a) * r;
  corePositions[i3 + 1] = Math.random() * 55 - 20;
  corePositions[i3 + 2] = Math.sin(a) * r;

  coreColors[i3] = 1.0;
  coreColors[i3 + 1] = 0.32 + Math.random() * 0.55;
  coreColors[i3 + 2] = 0.04 + Math.random() * 0.35;

  coreVelocities[i] = 0.048 + Math.random() * 0.22;
}

const coreParticleGeo = new THREE.BufferGeometry();
coreParticleGeo.setAttribute('position', new THREE.BufferAttribute(corePositions, 3));
coreParticleGeo.setAttribute('color', new THREE.BufferAttribute(coreColors, 3));

const coreParticleMat = new THREE.PointsMaterial({
  size: 0.15,
  vertexColors: true,
  transparent: true,
  opacity: 0.90,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  sizeAttenuation: true
});
const coreParticles = new THREE.Points(coreParticleGeo, coreParticleMat);
scene.add(coreParticles);

// Central ascending structure – determination spine + energy helix with iridescence
const spineGroup = new THREE.Group();
const helixGroup = new THREE.Group();

for (let i = 0; i < 72; i++) {
  const geo = new THREE.CylinderGeometry(0.022 + Math.random()*0.09, 0.45, 1.25, 36);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xff4a00,
    emissive: 0xff2200,
    emissiveIntensity: 1.9,
    metalness: 0.96,
    roughness: 0.04,
    clearcoat: 0.99,
    clearcoatRoughness: 0.02,
    transmission: 0.22,
    thickness: 0.55,
    ior: 1.48,
    iridescence: 0.85,
    iridescenceIOR: 1.32,
    iridescenceThicknessRange: [80, 420]
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = i * 1.02 - 18;
  mesh.rotation.z = Math.sin(i * 0.14) * 0.35;
  mesh.castShadow = true;
  spineGroup.add(mesh);
}

// Helix energy rings with iridescence
for (let i = 0; i < 108; i++) {
  const angle = (i / 108) * Math.PI * 14;
  const y = (i / 108) * 52 - 18;
  const geo = new THREE.TorusGeometry(0.58 + i * 0.036, 0.030, 22, 48);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffee99,
    emissive: 0xffaa00,
    emissiveIntensity: 2.25,
    metalness: 0.995,
    roughness: 0.015,
    clearcoat: 1.0,
    clearcoatRoughness: 0.015,
    iridescence: 0.92,
    iridescenceIOR: 1.28,
    iridescenceThicknessRange: [60, 380]
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(Math.cos(angle) * 2.6, y, Math.sin(angle) * 2.6);
  mesh.rotation.x = Math.PI / 2;
  mesh.rotation.z = angle;
  mesh.castShadow = true;
  helixGroup.add(mesh);
}

spineGroup.add(helixGroup);
scene.add(spineGroup);

// Base core – pulsing determination source with iridescence
const coreGeo = new THREE.SphereGeometry(2.4, 96, 96);
const coreMat = new THREE.MeshPhysicalMaterial({
  color: 0xff1000,
  emissive: 0xff0000,
  emissiveIntensity: 3.8,
  metalness: 0.65,
  roughness: 0.05,
  clearcoat: 0.95,
  clearcoatRoughness: 0.03,
  transmission: 0.15,
  iridescence: 0.75,
  iridescenceIOR: 1.35,
  iridescenceThicknessRange: [100, 500]
});
const core = new THREE.Mesh(coreGeo, coreMat);
core.position.y = -8;
core.castShadow = true;
scene.add(core);

// Additional floating energy orbs
const orbs = [];
for (let i = 0; i < 56; i++) {
  const geo = new THREE.SphereGeometry(0.07 + Math.random() * 0.38, 36, 36);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffdd88,
    emissive: 0xff9900,
    emissiveIntensity: 2.8,
    metalness: 0.90,
    roughness: 0.03,
    iridescence: 0.6,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [50, 300]
  });
  const orb = new THREE.Mesh(geo, mat);
  orb.userData = {
    radius: 4.5 + Math.random() * 22,
    speed: 0.10 + Math.random() * 1.2,
    offset: Math.random() * Math.PI * 2,
    yBase: 0.5 + Math.random() * 26
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
  "Pt.14: denser iridescent streams, volumetric presence, unbreakable rise.",
  "Hyper-real PBR with iridescence. The architecture refuses to fall."
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
setInterval(updateQuote, 6800);

let time = 0;
let mouseX = 0, mouseY = 0;
let mouseWorld = new THREE.Vector3();
let boost = 1.0;

const raycaster = new THREE.Raycaster();
const mouseNDC = new THREE.Vector2();

function triggerSurge() {
  boost = Math.min(boost + 0.95, 5.5);
  surgeLight.intensity = 26;
  setTimeout(() => {
    boost = Math.max(boost - 0.95, 1.0);
    surgeLight.intensity = 0;
  }, 3600);
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
  const attractStrength = 0.025;
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    pos[i3 + 1] += velocities[i] * boost;
    pos[i3] += Math.sin(time * 0.48 + i * 0.0026) * 0.022;
    pos[i3 + 2] += Math.cos(time * 0.38 + i * 0.0026) * 0.022;

    const dx = mouseWorld.x - pos[i3];
    const dz = mouseWorld.z - pos[i3 + 2];
    const dist = Math.sqrt(dx * dx + dz * dz) + 0.1;
    if (dist < 42) {
      pos[i3] += (dx / dist) * attractStrength * boost;
      pos[i3 + 2] += (dz / dist) * attractStrength * boost;
    }

    if (pos[i3 + 1] > 68) {
      pos[i3 + 1] = -28;
      pos[i3] = (Math.random() - 0.5) * 200;
      pos[i3 + 2] = (Math.random() - 0.5) * 200;
    }
  }
  particleGeo.attributes.position.needsUpdate = true;

  // Animate core particles (denser volumetric stream)
  const cpos = coreParticleGeo.attributes.position.array;
  for (let i = 0; i < coreParticleCount; i++) {
    const i3 = i * 3;
    cpos[i3 + 1] += coreVelocities[i] * boost * 1.5;
    const swirl = time * 0.85 + i * 0.009;
    cpos[i3] += Math.cos(swirl) * 0.045;
    cpos[i3 + 2] += Math.sin(swirl) * 0.045;

    if (cpos[i3 + 1] > 44) {
      const r = Math.random() * 9;
      const a = Math.random() * Math.PI * 2;
      cpos[i3] = Math.cos(a) * r;
      cpos[i3 + 1] = -20;
      cpos[i3 + 2] = Math.sin(a) * r;
    }
  }
  coreParticleGeo.attributes.position.needsUpdate = true;

  // Spine and helix
  spineGroup.rotation.y = time * 0.14;
  spineGroup.position.y = Math.sin(time * 0.38) * 1.4;
  helixGroup.rotation.y = time * 0.36;

  // Core pulse
  const pulse = 1 + Math.sin(time * 2.1) * 0.48;
  core.scale.setScalar(pulse);
  coreMat.emissiveIntensity = 3.2 + Math.sin(time * 2.6) * 1.5;

  // Orbs
  orbs.forEach((orb, idx) => {
    const d = orb.userData;
    const a = time * d.speed + d.offset;
    orb.position.set(
      Math.cos(a) * d.radius,
      d.yBase + Math.sin(time * 0.78 + idx) * 3.0,
      Math.sin(a) * d.radius
    );
    orb.scale.setScalar(1 + Math.sin(time * 1.5 + idx) * 0.38);
  });

  // Camera cinematic drift + mouse influence
  camera.position.x = Math.sin(time * 0.052) * 9.0 + mouseX * 7.0;
  camera.position.y = 18 + Math.sin(time * 0.10) * 3.2 + mouseY * 3.6;
  camera.position.z = 52 + Math.cos(time * 0.040) * 7.0;
  camera.lookAt(0, 12, 0);

  // Dynamic lights
  fill.intensity = 11.5 + Math.sin(time * 1.7) * 2.8;
  accent.intensity = 5.0 + Math.sin(time * 1.3) * 1.8;
  accent.position.x = Math.sin(time * 0.65) * 18;
  accent.position.z = Math.cos(time * 0.65) * 18;
  cool.intensity = 3.2 + Math.sin(time * 0.85) * 1.3;
  surgeLight.intensity *= 0.90;

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
