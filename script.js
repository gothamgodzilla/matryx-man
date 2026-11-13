import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const canvas = document.getElementById('webgl');
const loader = document.getElementById('loader');
const quoteEl = document.getElementById('quote');

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.0032);
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 900);
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
renderer.toneMappingExposure = 1.85;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// Post-processing for hyper-real bloom + output
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.85, // strength
  0.52, // radius
  0.62  // threshold
);
composer.addPass(bloomPass);
const outputPass = new OutputPass();
composer.addPass(outputPass);

// Lighting – hyper-real cinematic
const ambient = new THREE.AmbientLight(0x080812, 0.12);
scene.add(ambient);

const key = new THREE.DirectionalLight(0xffe0b0, 3.6);
key.position.set(16, 28, 18);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 0.5;
key.shadow.camera.far = 120;
key.shadow.bias = -0.0004;
scene.add(key);

const rim = new THREE.DirectionalLight(0x5577ff, 2.3);
rim.position.set(-20, 16, -14);
scene.add(rim);

const fill = new THREE.PointLight(0xff4400, 7.8, 80);
fill.position.set(0, 3, 0);
fill.castShadow = true;
scene.add(fill);

const accent = new THREE.PointLight(0xffdd55, 3.8, 45);
accent.position.set(8, 14, 6);
scene.add(accent);

const cool = new THREE.PointLight(0x44aaff, 2.6, 50);
cool.position.set(-9, 8, -7);
scene.add(cool);

const surgeLight = new THREE.PointLight(0xff6600, 0, 60);
surgeLight.position.set(0, 6, 0);
scene.add(surgeLight);

// Ground – dark PBR
const groundGeo = new THREE.PlaneGeometry(300, 300, 220, 220);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x010106,
  roughness: 0.97,
  metalness: 0.03,
  emissive: 0x050100,
  emissiveIntensity: 0.06
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -16;
ground.receiveShadow = true;
scene.add(ground);

// Particles – denser rising determination streams (128k) with mouse attraction
const particleCount = 128000;
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
const sizes = new Float32Array(particleCount);
const velocities = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
  const i3 = i * 3;
  positions[i3] = (Math.random() - 0.5) * 120;
  positions[i3 + 1] = Math.random() * 70 - 20;
  positions[i3 + 2] = (Math.random() - 0.5) * 120;

  const t = Math.random();
  colors[i3] = 1.0;
  colors[i3 + 1] = 0.28 + t * 0.52;
  colors[i3 + 2] = 0.02 + t * 0.32;

  sizes[i] = 0.015 + Math.random() * 0.14;
  velocities[i] = 0.028 + Math.random() * 0.11;
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

const particleMat = new THREE.PointsMaterial({
  size: 0.12,
  vertexColors: true,
  transparent: true,
  opacity: 0.92,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  sizeAttenuation: true
});
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// Central ascending structure – determination spine + energy helix
const spineGroup = new THREE.Group();
const helixGroup = new THREE.Group();

for (let i = 0; i < 42; i++) {
  const geo = new THREE.CylinderGeometry(0.04 + Math.random()*0.05, 0.28, 1.25, 20);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xff4200,
    emissive: 0xff1a00,
    emissiveIntensity: 1.25,
    metalness: 0.88,
    roughness: 0.1,
    clearcoat: 0.85,
    clearcoatRoughness: 0.07,
    transmission: 0.08,
    thickness: 0.3
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = i * 1.1 - 10;
  mesh.rotation.z = Math.sin(i * 0.22) * 0.22;
  mesh.castShadow = true;
  spineGroup.add(mesh);
}

// Helix energy rings
for (let i = 0; i < 64; i++) {
  const angle = (i / 64) * Math.PI * 9;
  const y = (i / 64) * 34 - 10;
  const geo = new THREE.TorusGeometry(0.7 + i * 0.04, 0.042, 14, 32);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffdd88,
    emissive: 0xff9900,
    emissiveIntensity: 1.55,
    metalness: 0.95,
    roughness: 0.05,
    clearcoat: 0.95,
    clearcoatRoughness: 0.04
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(Math.cos(angle) * 1.85, y, Math.sin(angle) * 1.85);
  mesh.rotation.x = Math.PI / 2;
  mesh.rotation.z = angle;
  mesh.castShadow = true;
  helixGroup.add(mesh);
}

spineGroup.add(helixGroup);
scene.add(spineGroup);

// Base core – pulsing determination source
const coreGeo = new THREE.SphereGeometry(1.65, 56, 56);
const coreMat = new THREE.MeshPhysicalMaterial({
  color: 0xff0a00,
  emissive: 0xff0000,
  emissiveIntensity: 2.5,
  metalness: 0.55,
  roughness: 0.12,
  clearcoat: 0.7,
  clearcoatRoughness: 0.09
});
const core = new THREE.Mesh(coreGeo, coreMat);
core.position.y = -4.5;
core.castShadow = true;
scene.add(core);

// Additional floating energy orbs
const orbs = [];
for (let i = 0; i < 24; i++) {
  const geo = new THREE.SphereGeometry(0.12 + Math.random() * 0.22, 20, 20);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffcc77,
    emissive: 0xff8800,
    emissiveIntensity: 1.9,
    metalness: 0.78,
    roughness: 0.08
  });
  const orb = new THREE.Mesh(geo, mat);
  orb.userData = {
    radius: 4.5 + Math.random() * 13,
    speed: 0.15 + Math.random() * 0.85,
    offset: Math.random() * Math.PI * 2,
    yBase: 0.5 + Math.random() * 18
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
  "The mouse aligns the sparks. The click unleashes the surge."
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
let mouseWorld = new THREE.Vector3();
let boost = 1.0;

const raycaster = new THREE.Raycaster();
const mouseNDC = new THREE.Vector2();

window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  mouseNDC.x = mouseX;
  mouseNDC.y = -mouseY;
  raycaster.setFromCamera(mouseNDC, camera);
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  raycaster.ray.intersectPlane(plane, mouseWorld);
});

window.addEventListener('click', () => {
  boost = Math.min(boost + 0.5, 3.5);
  surgeLight.intensity = 10;
  setTimeout(() => {
    boost = Math.max(boost - 0.5, 1.0);
    surgeLight.intensity = 0;
  }, 2600);
});

function animate() {
  requestAnimationFrame(animate);
  time += 0.016 * boost;

  // Animate particles upward with turbulence + mouse attraction
  const pos = particleGeo.attributes.position.array;
  const attractStrength = 0.012;
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    pos[i3 + 1] += velocities[i] * boost;
    pos[i3] += Math.sin(time * 0.55 + i * 0.004) * 0.018;
    pos[i3 + 2] += Math.cos(time * 0.42 + i * 0.004) * 0.018;

    // Soft mouse attraction in XZ
    const dx = mouseWorld.x - pos[i3];
    const dz = mouseWorld.z - pos[i3 + 2];
    const dist = Math.sqrt(dx * dx + dz * dz) + 0.1;
    if (dist < 25) {
      pos[i3] += (dx / dist) * attractStrength * boost;
      pos[i3 + 2] += (dz / dist) * attractStrength * boost;
    }

    if (pos[i3 + 1] > 48) {
      pos[i3 + 1] = -20;
      pos[i3] = (Math.random() - 0.5) * 120;
      pos[i3 + 2] = (Math.random() - 0.5) * 120;
    }
  }
  particleGeo.attributes.position.needsUpdate = true;

  // Spine and helix rotation / breathing
  spineGroup.rotation.y = time * 0.13;
  spineGroup.position.y = Math.sin(time * 0.48) * 0.8;
  helixGroup.rotation.y = time * 0.32;

  // Core pulse
  const pulse = 1 + Math.sin(time * 2.1) * 0.35;
  core.scale.setScalar(pulse);
  coreMat.emissiveIntensity = 2.0 + Math.sin(time * 2.4) * 0.9;

  // Orbs orbit
  orbs.forEach((orb, idx) => {
    const d = orb.userData;
    const a = time * d.speed + d.offset;
    orb.position.set(
      Math.cos(a) * d.radius,
      d.yBase + Math.sin(time * 0.78 + idx) * 2.2,
      Math.sin(a) * d.radius
    );
    orb.scale.setScalar(1 + Math.sin(time * 1.5 + idx) * 0.25);
  });

  // Camera cinematic drift + mouse influence
  camera.position.x = Math.sin(time * 0.07) * 5.5 + mouseX * 4.0;
  camera.position.y = 10 + Math.sin(time * 0.15) * 2.0 + mouseY * 2.2;
  camera.position.z = 32 + Math.cos(time * 0.055) * 4.5;
  camera.lookAt(0, 6, 0);

  // Dynamic lights
  fill.intensity = 6.5 + Math.sin(time * 1.7) * 1.8;
  accent.intensity = 2.8 + Math.sin(time * 1.3) * 1.1;
  accent.position.x = Math.sin(time * 0.65) * 10;
  accent.position.z = Math.cos(time * 0.65) * 10;
  cool.intensity = 1.9 + Math.sin(time * 0.85) * 0.7;
  surgeLight.intensity *= 0.94;

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
