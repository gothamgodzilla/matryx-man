import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const canvas = document.getElementById('webgl');
const loader = document.getElementById('loader');
const quoteEl = document.getElementById('quote');

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.0058);

const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(0, 8, 26);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.55;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// Post-processing for hyper-real bloom
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.35, // strength
  0.48, // radius
  0.78  // threshold
);
composer.addPass(bloomPass);

// Lighting – hyper-real cinematic
const ambient = new THREE.AmbientLight(0x080812, 0.22);
scene.add(ambient);

const key = new THREE.DirectionalLight(0xffc896, 2.8);
key.position.set(12, 22, 14);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 0.5;
key.shadow.camera.far = 80;
key.shadow.bias = -0.0004;
scene.add(key);

const rim = new THREE.DirectionalLight(0x3a6bff, 1.6);
rim.position.set(-16, 12, -10);
scene.add(rim);

const fill = new THREE.PointLight(0xff4400, 5.2, 55);
fill.position.set(0, 3, 0);
fill.castShadow = true;
scene.add(fill);

const accent = new THREE.PointLight(0xffaa33, 2.6, 32);
accent.position.set(6, 11, 4);
scene.add(accent);

const cool = new THREE.PointLight(0x2266ff, 1.8, 36);
cool.position.set(-7, 6, -5);
scene.add(cool);

// Ground – dark PBR
const groundGeo = new THREE.PlaneGeometry(200, 200, 200, 200);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x03030a,
  roughness: 0.92,
  metalness: 0.08,
  emissive: 0x080200,
  emissiveIntensity: 0.08
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -4;
ground.receiveShadow = true;
scene.add(ground);

// Determination particles – denser rising streams with stronger turbulence
const particleCount = 58000;
const positions = new Float32Array(particleCount * 3);
const velocities = new Float32Array(particleCount);
const colors = new Float32Array(particleCount * 3);
const sizes = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
  const i3 = i * 3;
  positions[i3] = (Math.random() - 0.5) * 80;
  positions[i3 + 1] = Math.random() * 42 - 12;
  positions[i3 + 2] = (Math.random() - 0.5) * 80;
  velocities[i] = 0.022 + Math.random() * 0.085;
  const hue = 0.02 + Math.random() * 0.16;
  const c = new THREE.Color().setHSL(hue, 0.99, 0.38 + Math.random() * 0.42);
  colors[i3] = c.r;
  colors[i3 + 1] = c.g;
  colors[i3 + 2] = c.b;
  sizes[i] = 0.028 + Math.random() * 0.09;
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

const particleMat = new THREE.PointsMaterial({
  size: 0.11,
  vertexColors: true,
  transparent: true,
  opacity: 0.92,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  sizeAttenuation: true
});
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// Central ascending structure – determination spine + energy helix + rings
const spineGroup = new THREE.Group();
const helixGroup = new THREE.Group();

for (let i = 0; i < 28; i++) {
  const geo = new THREE.CylinderGeometry(0.08, 0.22, 1.3, 20);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xff5a00,
    emissive: 0xff3300,
    emissiveIntensity: 0.95,
    metalness: 0.78,
    roughness: 0.18,
    clearcoat: 0.7,
    clearcoatRoughness: 0.12,
    transmission: 0.05
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = i * 1.15 - 8;
  mesh.rotation.z = Math.sin(i * 0.32) * 0.16;
  mesh.castShadow = true;
  spineGroup.add(mesh);
}

// Helix energy rings
for (let i = 0; i < 40; i++) {
  const angle = (i / 40) * Math.PI * 6;
  const y = (i / 40) * 26 - 8;
  const geo = new THREE.TorusGeometry(0.65 + i * 0.04, 0.048, 12, 28);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffbb66,
    emissive: 0xff7700,
    emissiveIntensity: 1.2,
    metalness: 0.9,
    roughness: 0.1,
    clearcoat: 0.85,
    clearcoatRoughness: 0.08
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(Math.cos(angle) * 1.5, y, Math.sin(angle) * 1.5);
  mesh.rotation.x = Math.PI / 2;
  mesh.rotation.z = angle;
  mesh.castShadow = true;
  helixGroup.add(mesh);
}

spineGroup.add(helixGroup);
scene.add(spineGroup);

// Base core – pulsing determination source
const coreGeo = new THREE.SphereGeometry(1.2, 64, 64);
const coreMat = new THREE.MeshPhysicalMaterial({
  color: 0xff2200,
  emissive: 0xff1100,
  emissiveIntensity: 1.8,
  metalness: 0.5,
  roughness: 0.2,
  clearcoat: 0.5,
  clearcoatRoughness: 0.15
});
const core = new THREE.Mesh(coreGeo, coreMat);
core.position.y = -3;
core.castShadow = true;
scene.add(core);

// Additional floating energy orbs
const orbs = [];
for (let i = 0; i < 12; i++) {
  const geo = new THREE.SphereGeometry(0.15 + Math.random() * 0.15, 20, 20);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffaa55,
    emissive: 0xff6600,
    emissiveIntensity: 1.4,
    metalness: 0.65,
    roughness: 0.15
  });
  const orb = new THREE.Mesh(geo, mat);
  orb.userData = {
    radius: 5 + Math.random() * 8,
    speed: 0.25 + Math.random() * 0.6,
    offset: Math.random() * Math.PI * 2,
    yBase: 1 + Math.random() * 12
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
  "Every dismissed spark is fuel for the next elevation."
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

  // Animate particles upward with turbulence
  const pos = particleGeo.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    pos[i3 + 1] += velocities[i];
    pos[i3] += Math.sin(time * 0.6 + i * 0.007) * 0.012;
    pos[i3 + 2] += Math.cos(time * 0.45 + i * 0.007) * 0.012;
    if (pos[i3 + 1] > 32) {
      pos[i3 + 1] = -12;
      pos[i3] = (Math.random() - 0.5) * 80;
      pos[i3 + 2] = (Math.random() - 0.5) * 80;
    }
  }
  particleGeo.attributes.position.needsUpdate = true;

  // Spine and helix rotation / breathing
  spineGroup.rotation.y = time * 0.13;
  spineGroup.position.y = Math.sin(time * 0.5) * 0.5;
  helixGroup.rotation.y = time * 0.32;

  // Core pulse
  const pulse = 1 + Math.sin(time * 2.2) * 0.25;
  core.scale.setScalar(pulse);
  coreMat.emissiveIntensity = 1.5 + Math.sin(time * 2.5) * 0.6;

  // Orbs orbit
  orbs.forEach((orb, idx) => {
    const d = orb.userData;
    const a = time * d.speed + d.offset;
    orb.position.set(
      Math.cos(a) * d.radius,
      d.yBase + Math.sin(time * 0.85 + idx) * 1.5,
      Math.sin(a) * d.radius
    );
    orb.scale.setScalar(1 + Math.sin(time * 1.6 + idx) * 0.18);
  });

  // Camera cinematic drift + mouse influence
  camera.position.x = Math.sin(time * 0.11) * 4.2 + mouseX * 2.8;
  camera.position.y = 8 + Math.sin(time * 0.2) * 1.3 + mouseY * 1.6;
  camera.position.z = 26 + Math.cos(time * 0.08) * 3;
  camera.lookAt(0, 4, 0);

  // Dynamic lights
  fill.intensity = 4.2 + Math.sin(time * 1.8) * 1.3;
  accent.intensity = 2.1 + Math.sin(time * 1.4) * 0.8;
  accent.position.x = Math.sin(time * 0.7) * 7;
  accent.position.z = Math.cos(time * 0.7) * 7;
  cool.intensity = 1.4 + Math.sin(time * 0.95) * 0.5;

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
}, 2400);