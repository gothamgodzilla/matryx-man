import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const canvas = document.getElementById('webgl');
const loader = document.getElementById('loader');
const quoteEl = document.getElementById('quote');

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.0008);
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 2200);
camera.position.set(0, 22, 60);

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
renderer.toneMappingExposure = 3.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  3.8,
  0.28,
  0.18
);
composer.addPass(bloomPass);
const outputPass = new OutputPass();
composer.addPass(outputPass);

// Lighting – hyper-real cinematic multi-rig with elevated iridescent response
const ambient = new THREE.AmbientLight(0x0a0a18, 0.015);
scene.add(ambient);

const key = new THREE.DirectionalLight(0xffe8c0, 8.0);
key.position.set(30, 50, 32);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 0.5;
key.shadow.camera.far = 260;
key.shadow.bias = -0.0002;
scene.add(key);

const rim = new THREE.DirectionalLight(0x6688ff, 5.8);
rim.position.set(-36, 30, -28);
scene.add(rim);

const fill = new THREE.PointLight(0xff5500, 24.0, 200);
fill.position.set(0, 12, 0);
fill.castShadow = true;
scene.add(fill);

const accent = new THREE.PointLight(0xffee66, 14.0, 110);
accent.position.set(22, 28, 20);
scene.add(accent);

const cool = new THREE.PointLight(0x55bbff, 9.0, 120);
cool.position.set(-22, 22, -20);
scene.add(cool);

const surgeLight = new THREE.PointLight(0xff7700, 0, 180);
surgeLight.position.set(0, 18, 0);
scene.add(surgeLight);

// Ground
const groundGeo = new THREE.PlaneGeometry(700, 700, 350, 350);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x020208,
  roughness: 0.98,
  metalness: 0.02,
  emissive: 0x080200,
  emissiveIntensity: 0.1
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -30;
ground.receiveShadow = true;
scene.add(ground);

// Primary particles – rising determination streams (500k)
const particleCount = 500000;
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
const sizes = new Float32Array(particleCount);
const velocities = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
  const i3 = i * 3;
  positions[i3] = (Math.random() - 0.5) * 260;
  positions[i3 + 1] = Math.random() * 140 - 35;
  positions[i3 + 2] = (Math.random() - 0.5) * 260;

  const t = Math.random();
  colors[i3] = 1.0;
  colors[i3 + 1] = 0.06 + t * 0.82;
  colors[i3 + 2] = 0.001 + t * 0.62;

  sizes[i] = 0.004 + Math.random() * 0.36;
  velocities[i] = 0.032 + Math.random() * 0.26;
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

const particleMat = new THREE.PointsMaterial({
  size: 0.15,
  vertexColors: true,
  transparent: true,
  opacity: 0.99,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  sizeAttenuation: true
});
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// Secondary denser core stream particles (350k)
const coreParticleCount = 350000;
const corePositions = new Float32Array(coreParticleCount * 3);
const coreColors = new Float32Array(coreParticleCount * 3);
const coreVelocities = new Float32Array(coreParticleCount);

for (let i = 0; i < coreParticleCount; i++) {
  const i3 = i * 3;
  const r = Math.random() * 16;
  const a = Math.random() * Math.PI * 2;
  corePositions[i3] = Math.cos(a) * r;
  corePositions[i3 + 1] = Math.random() * 70 - 26;
  corePositions[i3 + 2] = Math.sin(a) * r;

  coreColors[i3] = 1.0;
  coreColors[i3 + 1] = 0.28 + Math.random() * 0.68;
  coreColors[i3 + 2] = 0.03 + Math.random() * 0.48;

  coreVelocities[i] = 0.05 + Math.random() * 0.3;
}

const coreParticleGeo = new THREE.BufferGeometry();
coreParticleGeo.setAttribute('position', new THREE.BufferAttribute(corePositions, 3));
coreParticleGeo.setAttribute('color', new THREE.BufferAttribute(coreColors, 3));

const coreParticleMat = new THREE.PointsMaterial({
  size: 0.18,
  vertexColors: true,
  transparent: true,
  opacity: 0.96,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  sizeAttenuation: true
});
const coreParticles = new THREE.Points(coreParticleGeo, coreParticleMat);
scene.add(coreParticles);

// Tertiary atmospheric sparks (200k)
const atmParticleCount = 200000;
const atmPositions = new Float32Array(atmParticleCount * 3);
const atmColors = new Float32Array(atmParticleCount * 3);
const atmVelocities = new Float32Array(atmParticleCount);

for (let i = 0; i < atmParticleCount; i++) {
  const i3 = i * 3;
  atmPositions[i3] = (Math.random() - 0.5) * 360;
  atmPositions[i3 + 1] = Math.random() * 180 - 45;
  atmPositions[i3 + 2] = (Math.random() - 0.5) * 360;

  const t = Math.random();
  atmColors[i3] = 1.0;
  atmColors[i3 + 1] = 0.12 + t * 0.65;
  atmColors[i3 + 2] = 0.04 + t * 0.45;

  atmVelocities[i] = 0.018 + Math.random() * 0.14;
}

const atmParticleGeo = new THREE.BufferGeometry();
atmParticleGeo.setAttribute('position', new THREE.BufferAttribute(atmPositions, 3));
atmParticleGeo.setAttribute('color', new THREE.BufferAttribute(atmColors, 3));

const atmParticleMat = new THREE.PointsMaterial({
  size: 0.09,
  vertexColors: true,
  transparent: true,
  opacity: 0.7,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  sizeAttenuation: true
});
const atmParticles = new THREE.Points(atmParticleGeo, atmParticleMat);
scene.add(atmParticles);

// Quaternary ultra-dense micro-sparks (100k) near core
const microParticleCount = 100000;
const microPositions = new Float32Array(microParticleCount * 3);
const microColors = new Float32Array(microParticleCount * 3);
const microVelocities = new Float32Array(microParticleCount);

for (let i = 0; i < microParticleCount; i++) {
  const i3 = i * 3;
  const r = Math.random() * 8;
  const a = Math.random() * Math.PI * 2;
  microPositions[i3] = Math.cos(a) * r;
  microPositions[i3 + 1] = Math.random() * 40 - 15;
  microPositions[i3 + 2] = Math.sin(a) * r;

  microColors[i3] = 1.0;
  microColors[i3 + 1] = 0.4 + Math.random() * 0.55;
  microColors[i3 + 2] = 0.05 + Math.random() * 0.35;

  microVelocities[i] = 0.08 + Math.random() * 0.4;
}

const microParticleGeo = new THREE.BufferGeometry();
microParticleGeo.setAttribute('position', new THREE.BufferAttribute(microPositions, 3));
microParticleGeo.setAttribute('color', new THREE.BufferAttribute(microColors, 3));

const microParticleMat = new THREE.PointsMaterial({
  size: 0.12,
  vertexColors: true,
  transparent: true,
  opacity: 0.92,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  sizeAttenuation: true
});
const microParticles = new THREE.Points(microParticleGeo, microParticleMat);
scene.add(microParticles);

// Central ascending structure – determination spine + energy helix with elevated iridescence
const spineGroup = new THREE.Group();
const helixGroup = new THREE.Group();

for (let i = 0; i < 120; i++) {
  const geo = new THREE.CylinderGeometry(0.015 + Math.random()*0.16, 0.6, 1.5, 48);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xff4a00,
    emissive: 0xff2200,
    emissiveIntensity: 3.0,
    metalness: 0.99,
    roughness: 0.015,
    clearcoat: 1.0,
    clearcoatRoughness: 0.005,
    transmission: 0.45,
    thickness: 0.9,
    ior: 1.65,
    iridescence: 0.995,
    iridescenceIOR: 1.48,
    iridescenceThicknessRange: [140, 600]
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = i * 1.05 - 24;
  mesh.rotation.z = Math.sin(i * 0.1) * 0.5;
  mesh.castShadow = true;
  spineGroup.add(mesh);
}

// Helix energy rings with elevated iridescence
for (let i = 0; i < 180; i++) {
  const angle = (i / 180) * Math.PI * 20;
  const y = (i / 180) * 70 - 24;
  const geo = new THREE.TorusGeometry(0.75 + i * 0.032, 0.03, 32, 64);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffee99,
    emissive: 0xffaa00,
    emissiveIntensity: 3.4,
    metalness: 1.0,
    roughness: 0.004,
    clearcoat: 1.0,
    clearcoatRoughness: 0.004,
    iridescence: 0.998,
    iridescenceIOR: 1.4,
    iridescenceThicknessRange: [100, 560]
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(Math.cos(angle) * 3.5, y, Math.sin(angle) * 3.5);
  mesh.rotation.x = Math.PI / 2;
  mesh.rotation.z = angle;
  mesh.castShadow = true;
  helixGroup.add(mesh);
}

spineGroup.add(helixGroup);
scene.add(spineGroup);

// Base core – pulsing determination source with elevated iridescence
const coreGeo = new THREE.SphereGeometry(3.2, 128, 128);
const coreMat = new THREE.MeshPhysicalMaterial({
  color: 0xff1000,
  emissive: 0xff0000,
  emissiveIntensity: 6.0,
  metalness: 0.8,
  roughness: 0.015,
  clearcoat: 1.0,
  clearcoatRoughness: 0.008,
  transmission: 0.38,
  iridescence: 0.97,
  iridescenceIOR: 1.5,
  iridescenceThicknessRange: [160, 680]
});
const core = new THREE.Mesh(coreGeo, coreMat);
core.position.y = -12;
core.castShadow = true;
scene.add(core);

// Additional floating energy orbs
const orbs = [];
for (let i = 0; i < 120; i++) {
  const geo = new THREE.SphereGeometry(0.04 + Math.random() * 0.58, 48, 48);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffdd88,
    emissive: 0xff9900,
    emissiveIntensity: 4.2,
    metalness: 0.97,
    roughness: 0.012,
    iridescence: 0.9,
    iridescenceIOR: 1.42,
    iridescenceThicknessRange: [80, 480]
  });
  const orb = new THREE.Mesh(geo, mat);
  orb.userData = {
    radius: 6 + Math.random() * 34,
    speed: 0.12 + Math.random() * 1.8,
    offset: Math.random() * Math.PI * 2,
    yBase: 1 + Math.random() * 38
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
  "Pt.19: denser multi-layer iridescent streams, multi-octave turbulence, stronger volumetric presence, unbreakable rise.",
  "Hyper-real PBR with elevated iridescence. The architecture refuses to fall.",
  "The quiet engine never stops rewriting the board.",
  "Underestimated determination is the architecture that outlasts every count.",
  "Pt.19 remaster: magnetic attraction, elevated density, multi-octave rise that cannot be counted out."
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
setInterval(updateQuote, 6800);

let time = 0;
let mouseX = 0, mouseY = 0;
let mouseWorld = new THREE.Vector3();
let boost = 1.0;

const raycaster = new THREE.Raycaster();
const mouseNDC = new THREE.Vector2();

function triggerSurge() {
  boost = Math.min(boost + 1.5, 8.0);
  surgeLight.intensity = 55;
  setTimeout(() => {
    boost = Math.max(boost - 1.5, 1.0);
    surgeLight.intensity = 0;
  }, 4800);
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
  const attractStrength = 0.048;
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    pos[i3 + 1] += velocities[i] * boost;
    // Multi-octave turbulence
    pos[i3] += Math.sin(time * 0.5 + i * 0.0018) * 0.035 + Math.sin(time * 1.2 + i * 0.0038) * 0.014 + Math.sin(time * 2.4 + i * 0.007) * 0.006;
    pos[i3 + 2] += Math.cos(time * 0.42 + i * 0.0018) * 0.035 + Math.cos(time * 0.95 + i * 0.0032) * 0.016 + Math.cos(time * 1.9 + i * 0.006) * 0.007;

    const dx = mouseWorld.x - pos[i3];
    const dz = mouseWorld.z - pos[i3 + 2];
    const dist = Math.sqrt(dx * dx + dz * dz) + 0.1;
    if (dist < 70) {
      pos[i3] += (dx / dist) * attractStrength * boost;
      pos[i3 + 2] += (dz / dist) * attractStrength * boost;
    }

    if (pos[i3 + 1] > 90) {
      pos[i3 + 1] = -35;
      pos[i3] = (Math.random() - 0.5) * 260;
      pos[i3 + 2] = (Math.random() - 0.5) * 260;
    }
  }
  particleGeo.attributes.position.needsUpdate = true;

  // Animate core particles
  const cpos = coreParticleGeo.attributes.position.array;
  for (let i = 0; i < coreParticleCount; i++) {
    const i3 = i * 3;
    cpos[i3 + 1] += coreVelocities[i] * boost * 1.8;
    const swirl = time * 1.1 + i * 0.0065;
    cpos[i3] += Math.cos(swirl) * 0.068 + Math.cos(time * 2.2 + i * 0.009) * 0.02;
    cpos[i3 + 2] += Math.sin(swirl) * 0.068 + Math.sin(time * 1.9 + i * 0.008) * 0.018;

    if (cpos[i3 + 1] > 60) {
      const r = Math.random() * 16;
      const a = Math.random() * Math.PI * 2;
      cpos[i3] = Math.cos(a) * r;
      cpos[i3 + 1] = -26;
      cpos[i3 + 2] = Math.sin(a) * r;
    }
  }
  coreParticleGeo.attributes.position.needsUpdate = true;

  // Animate atmospheric particles
  const apos = atmParticleGeo.attributes.position.array;
  for (let i = 0; i < atmParticleCount; i++) {
    const i3 = i * 3;
    apos[i3 + 1] += atmVelocities[i] * boost * 0.9;
    apos[i3] += Math.sin(time * 0.22 + i * 0.0009) * 0.02;
    apos[i3 + 2] += Math.cos(time * 0.2 + i * 0.0011) * 0.02;

    if (apos[i3 + 1] > 120) {
      apos[i3 + 1] = -45;
      apos[i3] = (Math.random() - 0.5) * 360;
      apos[i3 + 2] = (Math.random() - 0.5) * 360;
    }
  }
  atmParticleGeo.attributes.position.needsUpdate = true;

  // Animate micro particles
  const mpos = microParticleGeo.attributes.position.array;
  for (let i = 0; i < microParticleCount; i++) {
    const i3 = i * 3;
    mpos[i3 + 1] += microVelocities[i] * boost * 2.2;
    const microSwirl = time * 1.4 + i * 0.012;
    mpos[i3] += Math.cos(microSwirl) * 0.045;
    mpos[i3 + 2] += Math.sin(microSwirl) * 0.045;

    if (mpos[i3 + 1] > 35) {
      const r = Math.random() * 8;
      const a = Math.random() * Math.PI * 2;
      mpos[i3] = Math.cos(a) * r;
      mpos[i3 + 1] = -15;
      mpos[i3 + 2] = Math.sin(a) * r;
    }
  }
  microParticleGeo.attributes.position.needsUpdate = true;

  // Spine and helix
  spineGroup.rotation.y = time * 0.2;
  spineGroup.position.y = Math.sin(time * 0.42) * 2.2;
  helixGroup.rotation.y = time * 0.52;

  // Core pulse
  const pulse = 1 + Math.sin(time * 2.8) * 0.68;
  core.scale.setScalar(pulse);
  coreMat.emissiveIntensity = 5.2 + Math.sin(time * 3.5) * 2.5;

  // Orbs
  orbs.forEach((orb, idx) => {
    const d = orb.userData;
    const a = time * d.speed + d.offset;
    orb.position.set(
      Math.cos(a) * d.radius,
      d.yBase + Math.sin(time * 1.0 + idx) * 4.5,
      Math.sin(a) * d.radius
    );
    orb.scale.setScalar(1 + Math.sin(time * 2.0 + idx) * 0.52);
  });

  // Camera cinematic drift + mouse influence
  camera.position.x = Math.sin(time * 0.045) * 14 + mouseX * 12.0;
  camera.position.y = 22 + Math.sin(time * 0.12) * 5.0 + mouseY * 6.0;
  camera.position.z = 60 + Math.cos(time * 0.035) * 12;
  camera.lookAt(0, 16, 0);

  // Dynamic lights
  fill.intensity = 19 + Math.sin(time * 2.2) * 5.0;
  accent.intensity = 9.0 + Math.sin(time * 1.8) * 3.2;
  accent.position.x = Math.sin(time * 0.9) * 28;
  accent.position.z = Math.cos(time * 0.9) * 28;
  cool.intensity = 5.5 + Math.sin(time * 1.1) * 2.2;
  surgeLight.intensity *= 0.82;

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
