import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const canvas = document.getElementById('webgl');
const loader = document.getElementById('loader');
const quoteEl = document.getElementById('quote');

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.0009);
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
renderer.toneMappingExposure = 2.9;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  3.6,
  0.30,
  0.20
);
composer.addPass(bloomPass);
const outputPass = new OutputPass();
composer.addPass(outputPass);

// Lighting – hyper-real cinematic multi-rig with elevated iridescent response
const ambient = new THREE.AmbientLight(0x0a0a18, 0.018);
scene.add(ambient);

const key = new THREE.DirectionalLight(0xffe8c0, 7.6);
key.position.set(28, 48, 30);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 0.5;
key.shadow.camera.far = 240;
key.shadow.bias = -0.0002;
scene.add(key);

const rim = new THREE.DirectionalLight(0x6688ff, 5.4);
rim.position.set(-34, 28, -26);
scene.add(rim);

const fill = new THREE.PointLight(0xff5500, 22.0, 180);
fill.position.set(0, 10, 0);
fill.castShadow = true;
scene.add(fill);

const accent = new THREE.PointLight(0xffee66, 12.0, 100);
accent.position.set(20, 26, 18);
scene.add(accent);

const cool = new THREE.PointLight(0x55bbff, 8.0, 110);
cool.position.set(-20, 20, -18);
scene.add(cool);

const surgeLight = new THREE.PointLight(0xff7700, 0, 160);
surgeLight.position.set(0, 16, 0);
scene.add(surgeLight);

// Ground
const groundGeo = new THREE.PlaneGeometry(600, 600, 300, 300);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x020208,
  roughness: 0.97,
  metalness: 0.03,
  emissive: 0x080200,
  emissiveIntensity: 0.09
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -28;
ground.receiveShadow = true;
scene.add(ground);

// Primary particles – rising determination streams (450k)
const particleCount = 450000;
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

  sizes[i] = 0.005 + Math.random() * 0.32;
  velocities[i] = 0.035 + Math.random() * 0.24;
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

const particleMat = new THREE.PointsMaterial({
  size: 0.14,
  vertexColors: true,
  transparent: true,
  opacity: 0.98,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  sizeAttenuation: true
});
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// Secondary denser core stream particles (300k) – volumetric feel near spine
const coreParticleCount = 300000;
const corePositions = new Float32Array(coreParticleCount * 3);
const coreColors = new Float32Array(coreParticleCount * 3);
const coreVelocities = new Float32Array(coreParticleCount);

for (let i = 0; i < coreParticleCount; i++) {
  const i3 = i * 3;
  const r = Math.random() * 14;
  const a = Math.random() * Math.PI * 2;
  corePositions[i3] = Math.cos(a) * r;
  corePositions[i3 + 1] = Math.random() * 65 - 24;
  corePositions[i3 + 2] = Math.sin(a) * r;

  coreColors[i3] = 1.0;
  coreColors[i3 + 1] = 0.32 + Math.random() * 0.62;
  coreColors[i3 + 2] = 0.04 + Math.random() * 0.42;

  coreVelocities[i] = 0.055 + Math.random() * 0.28;
}

const coreParticleGeo = new THREE.BufferGeometry();
coreParticleGeo.setAttribute('position', new THREE.BufferAttribute(corePositions, 3));
coreParticleGeo.setAttribute('color', new THREE.BufferAttribute(coreColors, 3));

const coreParticleMat = new THREE.PointsMaterial({
  size: 0.17,
  vertexColors: true,
  transparent: true,
  opacity: 0.95,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  sizeAttenuation: true
});
const coreParticles = new THREE.Points(coreParticleGeo, coreParticleMat);
scene.add(coreParticles);

// Tertiary atmospheric sparks (150k) – distant multi-octave volumetric
const atmParticleCount = 150000;
const atmPositions = new Float32Array(atmParticleCount * 3);
const atmColors = new Float32Array(atmParticleCount * 3);
const atmVelocities = new Float32Array(atmParticleCount);

for (let i = 0; i < atmParticleCount; i++) {
  const i3 = i * 3;
  atmPositions[i3] = (Math.random() - 0.5) * 320;
  atmPositions[i3 + 1] = Math.random() * 160 - 40;
  atmPositions[i3 + 2] = (Math.random() - 0.5) * 320;

  const t = Math.random();
  atmColors[i3] = 1.0;
  atmColors[i3 + 1] = 0.15 + t * 0.6;
  atmColors[i3 + 2] = 0.05 + t * 0.4;

  atmVelocities[i] = 0.02 + Math.random() * 0.12;
}

const atmParticleGeo = new THREE.BufferGeometry();
atmParticleGeo.setAttribute('position', new THREE.BufferAttribute(atmPositions, 3));
atmParticleGeo.setAttribute('color', new THREE.BufferAttribute(atmColors, 3));

const atmParticleMat = new THREE.PointsMaterial({
  size: 0.08,
  vertexColors: true,
  transparent: true,
  opacity: 0.65,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  sizeAttenuation: true
});
const atmParticles = new THREE.Points(atmParticleGeo, atmParticleMat);
scene.add(atmParticles);

// Central ascending structure – determination spine + energy helix with elevated iridescence
const spineGroup = new THREE.Group();
const helixGroup = new THREE.Group();

for (let i = 0; i < 100; i++) {
  const geo = new THREE.CylinderGeometry(0.018 + Math.random()*0.14, 0.55, 1.4, 48);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xff4a00,
    emissive: 0xff2200,
    emissiveIntensity: 2.8,
    metalness: 0.98,
    roughness: 0.018,
    clearcoat: 1.0,
    clearcoatRoughness: 0.008,
    transmission: 0.42,
    thickness: 0.85,
    ior: 1.62,
    iridescence: 0.99,
    iridescenceIOR: 1.46,
    iridescenceThicknessRange: [120, 560]
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = i * 1.0 - 22;
  mesh.rotation.z = Math.sin(i * 0.12) * 0.45;
  mesh.castShadow = true;
  spineGroup.add(mesh);
}

// Helix energy rings with elevated iridescence
for (let i = 0; i < 160; i++) {
  const angle = (i / 160) * Math.PI * 18;
  const y = (i / 160) * 62 - 22;
  const geo = new THREE.TorusGeometry(0.7 + i * 0.030, 0.028, 28, 56);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffee99,
    emissive: 0xffaa00,
    emissiveIntensity: 3.1,
    metalness: 0.999,
    roughness: 0.006,
    clearcoat: 1.0,
    clearcoatRoughness: 0.006,
    iridescence: 0.995,
    iridescenceIOR: 1.38,
    iridescenceThicknessRange: [90, 520]
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(Math.cos(angle) * 3.2, y, Math.sin(angle) * 3.2);
  mesh.rotation.x = Math.PI / 2;
  mesh.rotation.z = angle;
  mesh.castShadow = true;
  helixGroup.add(mesh);
}

spineGroup.add(helixGroup);
scene.add(spineGroup);

// Base core – pulsing determination source with elevated iridescence
const coreGeo = new THREE.SphereGeometry(2.9, 128, 128);
const coreMat = new THREE.MeshPhysicalMaterial({
  color: 0xff1000,
  emissive: 0xff0000,
  emissiveIntensity: 5.6,
  metalness: 0.78,
  roughness: 0.02,
  clearcoat: 1.0,
  clearcoatRoughness: 0.01,
  transmission: 0.35,
  iridescence: 0.95,
  iridescenceIOR: 1.48,
  iridescenceThicknessRange: [140, 620]
});
const core = new THREE.Mesh(coreGeo, coreMat);
core.position.y = -10;
core.castShadow = true;
scene.add(core);

// Additional floating energy orbs
const orbs = [];
for (let i = 0; i < 100; i++) {
  const geo = new THREE.SphereGeometry(0.05 + Math.random() * 0.52, 48, 48);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffdd88,
    emissive: 0xff9900,
    emissiveIntensity: 3.8,
    metalness: 0.96,
    roughness: 0.015,
    iridescence: 0.88,
    iridescenceIOR: 1.40,
    iridescenceThicknessRange: [70, 420]
  });
  const orb = new THREE.Mesh(geo, mat);
  orb.userData = {
    radius: 5.5 + Math.random() * 30,
    speed: 0.14 + Math.random() * 1.6,
    offset: Math.random() * Math.PI * 2,
    yBase: 0.8 + Math.random() * 34
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
  "Pt.18: denser multi-layer iridescent streams, multi-octave turbulence, stronger volumetric presence, unbreakable rise.",
  "Hyper-real PBR with elevated iridescence. The architecture refuses to fall.",
  "The quiet engine never stops rewriting the board.",
  "Underestimated determination is the architecture that outlasts every count.",
  "Pt.18 remaster: magnetic attraction, elevated density, multi-octave rise that cannot be counted out."
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
  boost = Math.min(boost + 1.3, 7.5);
  surgeLight.intensity = 48;
  setTimeout(() => {
    boost = Math.max(boost - 1.3, 1.0);
    surgeLight.intensity = 0;
  }, 4500);
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
  const attractStrength = 0.042;
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    pos[i3 + 1] += velocities[i] * boost;
    // Multi-octave turbulence
    pos[i3] += Math.sin(time * 0.55 + i * 0.0020) * 0.032 + Math.sin(time * 1.1 + i * 0.004) * 0.012;
    pos[i3 + 2] += Math.cos(time * 0.45 + i * 0.0020) * 0.032 + Math.cos(time * 0.9 + i * 0.0035) * 0.014;

    const dx = mouseWorld.x - pos[i3];
    const dz = mouseWorld.z - pos[i3 + 2];
    const dist = Math.sqrt(dx * dx + dz * dz) + 0.1;
    if (dist < 62) {
      pos[i3] += (dx / dist) * attractStrength * boost;
      pos[i3 + 2] += (dz / dist) * attractStrength * boost;
    }

    if (pos[i3 + 1] > 82) {
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
    cpos[i3 + 1] += coreVelocities[i] * boost * 1.75;
    const swirl = time * 1.05 + i * 0.0070;
    cpos[i3] += Math.cos(swirl) * 0.062 + Math.cos(time * 2.1 + i * 0.01) * 0.018;
    cpos[i3 + 2] += Math.sin(swirl) * 0.062 + Math.sin(time * 1.8 + i * 0.009) * 0.016;

    if (cpos[i3 + 1] > 55) {
      const r = Math.random() * 14;
      const a = Math.random() * Math.PI * 2;
      cpos[i3] = Math.cos(a) * r;
      cpos[i3 + 1] = -24;
      cpos[i3 + 2] = Math.sin(a) * r;
    }
  }
  coreParticleGeo.attributes.position.needsUpdate = true;

  // Animate atmospheric particles
  const apos = atmParticleGeo.attributes.position.array;
  for (let i = 0; i < atmParticleCount; i++) {
    const i3 = i * 3;
    apos[i3 + 1] += atmVelocities[i] * boost * 0.85;
    apos[i3] += Math.sin(time * 0.25 + i * 0.001) * 0.018;
    apos[i3 + 2] += Math.cos(time * 0.22 + i * 0.0012) * 0.018;

    if (apos[i3 + 1] > 110) {
      apos[i3 + 1] = -40;
      apos[i3] = (Math.random() - 0.5) * 320;
      apos[i3 + 2] = (Math.random() - 0.5) * 320;
    }
  }
  atmParticleGeo.attributes.position.needsUpdate = true;

  // Spine and helix
  spineGroup.rotation.y = time * 0.19;
  spineGroup.position.y = Math.sin(time * 0.45) * 1.9;
  helixGroup.rotation.y = time * 0.48;

  // Core pulse
  const pulse = 1 + Math.sin(time * 2.7) * 0.62;
  core.scale.setScalar(pulse);
  coreMat.emissiveIntensity = 4.8 + Math.sin(time * 3.3) * 2.2;

  // Orbs
  orbs.forEach((orb, idx) => {
    const d = orb.userData;
    const a = time * d.speed + d.offset;
    orb.position.set(
      Math.cos(a) * d.radius,
      d.yBase + Math.sin(time * 0.95 + idx) * 4.0,
      Math.sin(a) * d.radius
    );
    orb.scale.setScalar(1 + Math.sin(time * 1.9 + idx) * 0.48);
  });

  // Camera cinematic drift + mouse influence
  camera.position.x = Math.sin(time * 0.05) * 12.5 + mouseX * 11.0;
  camera.position.y = 20 + Math.sin(time * 0.13) * 4.5 + mouseY * 5.5;
  camera.position.z = 56 + Math.cos(time * 0.04) * 10.5;
  camera.lookAt(0, 14, 0);

  // Dynamic lights
  fill.intensity = 17.5 + Math.sin(time * 2.1) * 4.5;
  accent.intensity = 8.0 + Math.sin(time * 1.7) * 2.8;
  accent.position.x = Math.sin(time * 0.85) * 26;
  accent.position.z = Math.cos(time * 0.85) * 26;
  cool.intensity = 5.0 + Math.sin(time * 1.05) * 2.0;
  surgeLight.intensity *= 0.84;

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
