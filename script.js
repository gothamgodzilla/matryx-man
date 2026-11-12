import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const canvas = document.getElementById('webgl');
const loader = document.getElementById('loader');
const quoteEl = document.getElementById('quote');

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.0038);
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 800);
camera.position.set(0, 10, 32);

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
renderer.toneMappingExposure = 1.75;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// Post-processing for hyper-real bloom + output
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.65, // strength
  0.48, // radius
  0.68  // threshold
);
composer.addPass(bloomPass);
const outputPass = new OutputPass();
composer.addPass(outputPass);

// Lighting – hyper-real cinematic
const ambient = new THREE.AmbientLight(0x080812, 0.15);
scene.add(ambient);

const key = new THREE.DirectionalLight(0xffe0b0, 3.4);
key.position.set(16, 28, 18);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 0.5;
key.shadow.camera.far = 120;
key.shadow.bias = -0.0004;
scene.add(key);

const rim = new THREE.DirectionalLight(0x5577ff, 2.1);
rim.position.set(-20, 16, -14);
scene.add(rim);

const fill = new THREE.PointLight(0xff4400, 7.2, 70);
fill.position.set(0, 3, 0);
fill.castShadow = true;
scene.add(fill);

const accent = new THREE.PointLight(0xffdd55, 3.4, 40);
accent.position.set(8, 14, 6);
scene.add(accent);

const cool = new THREE.PointLight(0x44aaff, 2.4, 45);
cool.position.set(-9, 8, -7);
scene.add(cool);

const surgeLight = new THREE.PointLight(0xff6600, 0, 50);
surgeLight.position.set(0, 6, 0);
scene.add(surgeLight);

// Ground – dark PBR
const groundGeo = new THREE.PlaneGeometry(280, 280, 200, 200);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x010106,
  roughness: 0.96,
  metalness: 0.04,
  emissive: 0x050100,
  emissiveIntensity: 0.05
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -16;
ground.receiveShadow = true;
scene.add(ground);

// Particles – denser rising determination streams (96k)
const particleCount = 96000;
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
const sizes = new Float32Array(particleCount);
const velocities = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
  const i3 = i * 3;
  positions[i3] = (Math.random() - 0.5) * 110;
  positions[i3 + 1] = Math.random() * 60 - 18;
  positions[i3 + 2] = (Math.random() - 0.5) * 110;

  const t = Math.random();
  colors[i3] = 1.0;
  colors[i3 + 1] = 0.32 + t * 0.48;
  colors[i3 + 2] = 0.04 + t * 0.28;

  sizes[i] = 0.02 + Math.random() * 0.12;
  velocities[i] = 0.032 + Math.random() * 0.09;
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

const particleMat = new THREE.PointsMaterial({
  size: 0.14,
  vertexColors: true,
  transparent: true,
  opacity: 0.9,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  sizeAttenuation: true
});
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// Central ascending structure – determination spine + energy helix
const spineGroup = new THREE.Group();
const helixGroup = new THREE.Group();

for (let i = 0; i < 38; i++) {
  const geo = new THREE.CylinderGeometry(0.05 + Math.random()*0.045, 0.26, 1.3, 18);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xff4200,
    emissive: 0xff1a00,
    emissiveIntensity: 1.15,
    metalness: 0.85,
    roughness: 0.12,
    clearcoat: 0.8,
    clearcoatRoughness: 0.08,
    transmission: 0.05,
    thickness: 0.25
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = i * 1.15 - 10;
  mesh.rotation.z = Math.sin(i * 0.25) * 0.2;
  mesh.castShadow = true;
  spineGroup.add(mesh);
}

// Helix energy rings
for (let i = 0; i < 56; i++) {
  const angle = (i / 56) * Math.PI * 8;
  const y = (i / 56) * 32 - 10;
  const geo = new THREE.TorusGeometry(0.75 + i * 0.038, 0.045, 12, 28);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffdd88,
    emissive: 0xff9900,
    emissiveIntensity: 1.45,
    metalness: 0.94,
    roughness: 0.06,
    clearcoat: 0.92,
    clearcoatRoughness: 0.05
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(Math.cos(angle) * 1.75, y, Math.sin(angle) * 1.75);
  mesh.rotation.x = Math.PI / 2;
  mesh.rotation.z = angle;
  mesh.castShadow = true;
  helixGroup.add(mesh);
}

spineGroup.add(helixGroup);
scene.add(spineGroup);

// Base core – pulsing determination source
const coreGeo = new THREE.SphereGeometry(1.5, 52, 52);
const coreMat = new THREE.MeshPhysicalMaterial({
  color: 0xff0a00,
  emissive: 0xff0000,
  emissiveIntensity: 2.3,
  metalness: 0.5,
  roughness: 0.15,
  clearcoat: 0.65,
  clearcoatRoughness: 0.1
});
const core = new THREE.Mesh(coreGeo, coreMat);
core.position.y = -4.5;
core.castShadow = true;
scene.add(core);

// Additional floating energy orbs
const orbs = [];
for (let i = 0; i < 20; i++) {
  const geo = new THREE.SphereGeometry(0.14 + Math.random() * 0.2, 18, 18);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffcc77,
    emissive: 0xff8800,
    emissiveIntensity: 1.75,
    metalness: 0.75,
    roughness: 0.1
  });
  const orb = new THREE.Mesh(geo, mat);
  orb.userData = {
    radius: 5 + Math.random() * 11,
    speed: 0.18 + Math.random() * 0.75,
    offset: Math.random() * Math.PI * 2,
    yBase: 1 + Math.random() * 16
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
  "The overlooked become the architecture."
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
let boost = 1.0;

window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

window.addEventListener('click', () => {
  boost = Math.min(boost + 0.45, 3.2);
  surgeLight.intensity = 8;
  setTimeout(() => {
    boost = Math.max(boost - 0.45, 1.0);
    surgeLight.intensity = 0;
  }, 2400);
});

function animate() {
  requestAnimationFrame(animate);
  time += 0.016 * boost;

  // Animate particles upward with turbulence
  const pos = particleGeo.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    pos[i3 + 1] += velocities[i] * boost;
    pos[i3] += Math.sin(time * 0.6 + i * 0.005) * 0.016;
    pos[i3 + 2] += Math.cos(time * 0.45 + i * 0.005) * 0.016;
    if (pos[i3 + 1] > 42) {
      pos[i3 + 1] = -18;
      pos[i3] = (Math.random() - 0.5) * 110;
      pos[i3 + 2] = (Math.random() - 0.5) * 110;
    }
  }
  particleGeo.attributes.position.needsUpdate = true;

  // Spine and helix rotation / breathing
  spineGroup.rotation.y = time * 0.12;
  spineGroup.position.y = Math.sin(time * 0.5) * 0.7;
  helixGroup.rotation.y = time * 0.3;

  // Core pulse
  const pulse = 1 + Math.sin(time * 2.2) * 0.32;
  core.scale.setScalar(pulse);
  coreMat.emissiveIntensity = 1.8 + Math.sin(time * 2.5) * 0.8;

  // Orbs orbit
  orbs.forEach((orb, idx) => {
    const d = orb.userData;
    const a = time * d.speed + d.offset;
    orb.position.set(
      Math.cos(a) * d.radius,
      d.yBase + Math.sin(time * 0.82 + idx) * 2.0,
      Math.sin(a) * d.radius
    );
    orb.scale.setScalar(1 + Math.sin(time * 1.6 + idx) * 0.22);
  });

  // Camera cinematic drift + mouse influence
  camera.position.x = Math.sin(time * 0.08) * 5.2 + mouseX * 3.5;
  camera.position.y = 10 + Math.sin(time * 0.16) * 1.8 + mouseY * 2.0;
  camera.position.z = 32 + Math.cos(time * 0.06) * 4.0;
  camera.lookAt(0, 6, 0);

  // Dynamic lights
  fill.intensity = 6.2 + Math.sin(time * 1.8) * 1.7;
  accent.intensity = 2.6 + Math.sin(time * 1.4) * 1.0;
  accent.position.x = Math.sin(time * 0.7) * 9;
  accent.position.z = Math.cos(time * 0.7) * 9;
  cool.intensity = 1.8 + Math.sin(time * 0.9) * 0.6;
  surgeLight.intensity *= 0.95; // fade

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
