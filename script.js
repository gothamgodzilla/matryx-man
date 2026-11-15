import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const canvas = document.getElementById('webgl');
const loader = document.getElementById('loader');
const quoteEl = document.getElementById('quote');

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.0022);
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.1, 1200);
camera.position.set(0, 14, 42);

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
renderer.toneMappingExposure = 2.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// Post-processing for hyper-real bloom + output
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  2.35,
  0.52,
  0.48
);
composer.addPass(bloomPass);
const outputPass = new OutputPass();
composer.addPass(outputPass);

// Lighting – hyper-real cinematic multi-rig
const ambient = new THREE.AmbientLight(0x0a0a18, 0.06);
scene.add(ambient);

const key = new THREE.DirectionalLight(0xffe8c0, 4.6);
key.position.set(20, 36, 22);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 0.5;
key.shadow.camera.far = 160;
key.shadow.bias = -0.00025;
scene.add(key);

const rim = new THREE.DirectionalLight(0x6688ff, 3.1);
rim.position.set(-24, 20, -18);
scene.add(rim);

const fill = new THREE.PointLight(0xff5500, 10.5, 100);
fill.position.set(0, 5, 0);
fill.castShadow = true;
scene.add(fill);

const accent = new THREE.PointLight(0xffee66, 5.2, 55);
accent.position.set(12, 18, 10);
scene.add(accent);

const cool = new THREE.PointLight(0x55bbff, 3.6, 60);
cool.position.set(-12, 12, -10);
scene.add(cool);

const surgeLight = new THREE.PointLight(0xff7700, 0, 80);
surgeLight.position.set(0, 10, 0);
scene.add(surgeLight);

// Ground – dark PBR with subtle emissive
const groundGeo = new THREE.PlaneGeometry(420, 420, 200, 200);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x020208,
  roughness: 0.97,
  metalness: 0.03,
  emissive: 0x080200,
  emissiveIntensity: 0.06
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -20;
ground.receiveShadow = true;
scene.add(ground);

// Particles – denser rising determination streams (256k) with mouse attraction + multi-layer
const particleCount = 256000;
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
const sizes = new Float32Array(particleCount);
const velocities = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
  const i3 = i * 3;
  positions[i3] = (Math.random() - 0.5) * 160;
  positions[i3 + 1] = Math.random() * 90 - 24;
  positions[i3 + 2] = (Math.random() - 0.5) * 160;

  const t = Math.random();
  colors[i3] = 1.0;
  colors[i3 + 1] = 0.18 + t * 0.62;
  colors[i3 + 2] = 0.005 + t * 0.42;

  sizes[i] = 0.01 + Math.random() * 0.18;
  velocities[i] = 0.028 + Math.random() * 0.14;
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

const particleMat = new THREE.PointsMaterial({
  size: 0.105,
  vertexColors: true,
  transparent: true,
  opacity: 0.96,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  sizeAttenuation: true
});
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// Central ascending structure – determination spine + energy helix
const spineGroup = new THREE.Group();
const helixGroup = new THREE.Group();

for (let i = 0; i < 56; i++) {
  const geo = new THREE.CylinderGeometry(0.028 + Math.random()*0.07, 0.36, 1.25, 28);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xff4a00,
    emissive: 0xff2200,
    emissiveIntensity: 1.55,
    metalness: 0.94,
    roughness: 0.06,
    clearcoat: 0.95,
    clearcoatRoughness: 0.04,
    transmission: 0.15,
    thickness: 0.45
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = i * 1.08 - 14;
  mesh.rotation.z = Math.sin(i * 0.18) * 0.28;
  mesh.castShadow = true;
  spineGroup.add(mesh);
}

// Helix energy rings
for (let i = 0; i < 84; i++) {
  const angle = (i / 84) * Math.PI * 11;
  const y = (i / 84) * 42 - 14;
  const geo = new THREE.TorusGeometry(0.58 + i * 0.042, 0.034, 18, 40);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffee99,
    emissive: 0xffaa00,
    emissiveIntensity: 1.85,
    metalness: 0.98,
    roughness: 0.03,
    clearcoat: 1.0,
    clearcoatRoughness: 0.025
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(Math.cos(angle) * 2.25, y, Math.sin(angle) * 2.25);
  mesh.rotation.x = Math.PI / 2;
  mesh.rotation.z = angle;
  mesh.castShadow = true;
  helixGroup.add(mesh);
}

spineGroup.add(helixGroup);
scene.add(spineGroup);

// Base core – pulsing determination source
const coreGeo = new THREE.SphereGeometry(2.05, 72, 72);
const coreMat = new THREE.MeshPhysicalMaterial({
  color: 0xff1000,
  emissive: 0xff0000,
  emissiveIntensity: 3.1,
  metalness: 0.55,
  roughness: 0.08,
  clearcoat: 0.85,
  clearcoatRoughness: 0.05
});
const core = new THREE.Mesh(coreGeo, coreMat);
core.position.y = -6.2;
core.castShadow = true;
scene.add(core);

// Additional floating energy orbs
const orbs = [];
for (let i = 0; i < 40; i++) {
  const geo = new THREE.SphereGeometry(0.09 + Math.random() * 0.32, 28, 28);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffdd88,
    emissive: 0xff9900,
    emissiveIntensity: 2.35,
    metalness: 0.85,
    roughness: 0.05
  });
  const orb = new THREE.Mesh(geo, mat);
  orb.userData = {
    radius: 4.5 + Math.random() * 18,
    speed: 0.1 + Math.random() * 1.05,
    offset: Math.random() * Math.PI * 2,
    yBase: 0.5 + Math.random() * 22
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
  "Pt.11: denser streams, clearer signal, unbreakable rise."
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
setInterval(updateQuote, 7200);

let time = 0;
let mouseX = 0, mouseY = 0;
let mouseWorld = new THREE.Vector3();
let boost = 1.0;

const raycaster = new THREE.Raycaster();
const mouseNDC = new THREE.Vector2();

function triggerSurge() {
  boost = Math.min(boost + 0.75, 4.5);
  surgeLight.intensity = 16;
  setTimeout(() => {
    boost = Math.max(boost - 0.75, 1.0);
    surgeLight.intensity = 0;
  }, 3200);
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

// Touch support
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

  // Animate particles upward with turbulence + mouse attraction
  const pos = particleGeo.attributes.position.array;
  const attractStrength = 0.018;
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    pos[i3 + 1] += velocities[i] * boost;
    pos[i3] += Math.sin(time * 0.48 + i * 0.003) * 0.018;
    pos[i3 + 2] += Math.cos(time * 0.38 + i * 0.003) * 0.018;

    // Soft mouse attraction in XZ
    const dx = mouseWorld.x - pos[i3];
    const dz = mouseWorld.z - pos[i3 + 2];
    const dist = Math.sqrt(dx * dx + dz * dz) + 0.1;
    if (dist < 32) {
      pos[i3] += (dx / dist) * attractStrength * boost;
      pos[i3 + 2] += (dz / dist) * attractStrength * boost;
    }

    if (pos[i3 + 1] > 58) {
      pos[i3 + 1] = -24;
      pos[i3] = (Math.random() - 0.5) * 160;
      pos[i3 + 2] = (Math.random() - 0.5) * 160;
    }
  }
  particleGeo.attributes.position.needsUpdate = true;

  // Spine and helix rotation / breathing
  spineGroup.rotation.y = time * 0.11;
  spineGroup.position.y = Math.sin(time * 0.42) * 1.05;
  helixGroup.rotation.y = time * 0.28;

  // Core pulse
  const pulse = 1 + Math.sin(time * 1.9) * 0.42;
  core.scale.setScalar(pulse);
  coreMat.emissiveIntensity = 2.4 + Math.sin(time * 2.2) * 1.15;

  // Orbs orbit
  orbs.forEach((orb, idx) => {
    const d = orb.userData;
    const a = time * d.speed + d.offset;
    orb.position.set(
      Math.cos(a) * d.radius,
      d.yBase + Math.sin(time * 0.72 + idx) * 2.6,
      Math.sin(a) * d.radius
    );
    orb.scale.setScalar(1 + Math.sin(time * 1.35 + idx) * 0.32);
  });

  // Camera cinematic drift + mouse influence
  camera.position.x = Math.sin(time * 0.058) * 7.0 + mouseX * 5.2;
  camera.position.y = 14 + Math.sin(time * 0.12) * 2.5 + mouseY * 2.8;
  camera.position.z = 42 + Math.cos(time * 0.045) * 5.5;
  camera.lookAt(0, 8, 0);

  // Dynamic lights
  fill.intensity = 8.5 + Math.sin(time * 1.5) * 2.2;
  accent.intensity = 3.6 + Math.sin(time * 1.15) * 1.45;
  accent.position.x = Math.sin(time * 0.58) * 14;
  accent.position.z = Math.cos(time * 0.58) * 14;
  cool.intensity = 2.4 + Math.sin(time * 0.75) * 0.9;
  surgeLight.intensity *= 0.92;

  composer.render();
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  bloomPass.setSize(window.innerWidth, window.innerHeight);
});

// Hide loader after cinematic pause
setTimeout(() => {
  loader.classList.add('hidden');
  animate();
}, 2800);
