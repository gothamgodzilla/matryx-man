import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const canvas = document.getElementById('webgl');
const loader = document.getElementById('loader');
const quoteEl = document.getElementById('quote');

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.0028);
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 12, 38);

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
renderer.toneMappingExposure = 1.95;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// Post-processing for hyper-real bloom + output
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  2.15, // intensified strength
  0.48, // radius
  0.55  // lower threshold for more glow
);
composer.addPass(bloomPass);
const outputPass = new OutputPass();
composer.addPass(outputPass);

// Lighting – hyper-real cinematic multi-rig
const ambient = new THREE.AmbientLight(0x0a0a18, 0.08);
scene.add(ambient);

const key = new THREE.DirectionalLight(0xffe8c0, 4.2);
key.position.set(18, 32, 20);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 0.5;
key.shadow.camera.far = 140;
key.shadow.bias = -0.0003;
scene.add(key);

const rim = new THREE.DirectionalLight(0x6688ff, 2.8);
rim.position.set(-22, 18, -16);
scene.add(rim);

const fill = new THREE.PointLight(0xff5500, 9.2, 90);
fill.position.set(0, 4, 0);
fill.castShadow = true;
scene.add(fill);

const accent = new THREE.PointLight(0xffee66, 4.5, 50);
accent.position.set(10, 16, 8);
scene.add(accent);

const cool = new THREE.PointLight(0x55bbff, 3.1, 55);
cool.position.set(-10, 10, -8);
scene.add(cool);

const surgeLight = new THREE.PointLight(0xff7700, 0, 70);
surgeLight.position.set(0, 8, 0);
scene.add(surgeLight);

// Ground – dark PBR with subtle emissive
const groundGeo = new THREE.PlaneGeometry(360, 360, 180, 180);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x020208,
  roughness: 0.96,
  metalness: 0.04,
  emissive: 0x080200,
  emissiveIntensity: 0.08
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -18;
ground.receiveShadow = true;
scene.add(ground);

// Particles – denser rising determination streams (192k) with mouse attraction
const particleCount = 192000;
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
const sizes = new Float32Array(particleCount);
const velocities = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
  const i3 = i * 3;
  positions[i3] = (Math.random() - 0.5) * 140;
  positions[i3 + 1] = Math.random() * 80 - 22;
  positions[i3 + 2] = (Math.random() - 0.5) * 140;

  const t = Math.random();
  colors[i3] = 1.0;
  colors[i3 + 1] = 0.22 + t * 0.58;
  colors[i3 + 2] = 0.01 + t * 0.38;

  sizes[i] = 0.012 + Math.random() * 0.16;
  velocities[i] = 0.025 + Math.random() * 0.125;
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

// Central ascending structure – determination spine + energy helix
const spineGroup = new THREE.Group();
const helixGroup = new THREE.Group();

for (let i = 0; i < 48; i++) {
  const geo = new THREE.CylinderGeometry(0.035 + Math.random()*0.06, 0.32, 1.3, 24);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xff4a00,
    emissive: 0xff2200,
    emissiveIntensity: 1.4,
    metalness: 0.92,
    roughness: 0.08,
    clearcoat: 0.92,
    clearcoatRoughness: 0.05,
    transmission: 0.12,
    thickness: 0.4
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = i * 1.15 - 12;
  mesh.rotation.z = Math.sin(i * 0.2) * 0.25;
  mesh.castShadow = true;
  spineGroup.add(mesh);
}

// Helix energy rings
for (let i = 0; i < 72; i++) {
  const angle = (i / 72) * Math.PI * 10;
  const y = (i / 72) * 38 - 12;
  const geo = new THREE.TorusGeometry(0.65 + i * 0.045, 0.038, 16, 36);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffee99,
    emissive: 0xffaa00,
    emissiveIntensity: 1.7,
    metalness: 0.97,
    roughness: 0.04,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(Math.cos(angle) * 2.1, y, Math.sin(angle) * 2.1);
  mesh.rotation.x = Math.PI / 2;
  mesh.rotation.z = angle;
  mesh.castShadow = true;
  helixGroup.add(mesh);
}

spineGroup.add(helixGroup);
scene.add(spineGroup);

// Base core – pulsing determination source
const coreGeo = new THREE.SphereGeometry(1.85, 64, 64);
const coreMat = new THREE.MeshPhysicalMaterial({
  color: 0xff1000,
  emissive: 0xff0000,
  emissiveIntensity: 2.8,
  metalness: 0.6,
  roughness: 0.1,
  clearcoat: 0.8,
  clearcoatRoughness: 0.06
});
const core = new THREE.Mesh(coreGeo, coreMat);
core.position.y = -5.5;
core.castShadow = true;
scene.add(core);

// Additional floating energy orbs
const orbs = [];
for (let i = 0; i < 32; i++) {
  const geo = new THREE.SphereGeometry(0.1 + Math.random() * 0.28, 24, 24);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffdd88,
    emissive: 0xff9900,
    emissiveIntensity: 2.1,
    metalness: 0.82,
    roughness: 0.06
  });
  const orb = new THREE.Mesh(geo, mat);
  orb.userData = {
    radius: 5 + Math.random() * 15,
    speed: 0.12 + Math.random() * 0.95,
    offset: Math.random() * Math.PI * 2,
    yBase: 1 + Math.random() * 20
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
  "Pt.10: denser streams, clearer signal, unbreakable rise."
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
setInterval(updateQuote, 7500);

let time = 0;
let mouseX = 0, mouseY = 0;
let mouseWorld = new THREE.Vector3();
let boost = 1.0;

const raycaster = new THREE.Raycaster();
const mouseNDC = new THREE.Vector2();

function triggerSurge() {
  boost = Math.min(boost + 0.6, 4.0);
  surgeLight.intensity = 14;
  setTimeout(() => {
    boost = Math.max(boost - 0.6, 1.0);
    surgeLight.intensity = 0;
  }, 2800);
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
  const attractStrength = 0.014;
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    pos[i3 + 1] += velocities[i] * boost;
    pos[i3] += Math.sin(time * 0.52 + i * 0.0035) * 0.016;
    pos[i3 + 2] += Math.cos(time * 0.4 + i * 0.0035) * 0.016;

    // Soft mouse attraction in XZ
    const dx = mouseWorld.x - pos[i3];
    const dz = mouseWorld.z - pos[i3 + 2];
    const dist = Math.sqrt(dx * dx + dz * dz) + 0.1;
    if (dist < 28) {
      pos[i3] += (dx / dist) * attractStrength * boost;
      pos[i3 + 2] += (dz / dist) * attractStrength * boost;
    }

    if (pos[i3 + 1] > 52) {
      pos[i3 + 1] = -22;
      pos[i3] = (Math.random() - 0.5) * 140;
      pos[i3 + 2] = (Math.random() - 0.5) * 140;
    }
  }
  particleGeo.attributes.position.needsUpdate = true;

  // Spine and helix rotation / breathing
  spineGroup.rotation.y = time * 0.12;
  spineGroup.position.y = Math.sin(time * 0.45) * 0.9;
  helixGroup.rotation.y = time * 0.3;

  // Core pulse
  const pulse = 1 + Math.sin(time * 2.0) * 0.38;
  core.scale.setScalar(pulse);
  coreMat.emissiveIntensity = 2.2 + Math.sin(time * 2.3) * 1.0;

  // Orbs orbit
  orbs.forEach((orb, idx) => {
    const d = orb.userData;
    const a = time * d.speed + d.offset;
    orb.position.set(
      Math.cos(a) * d.radius,
      d.yBase + Math.sin(time * 0.75 + idx) * 2.4,
      Math.sin(a) * d.radius
    );
    orb.scale.setScalar(1 + Math.sin(time * 1.4 + idx) * 0.28);
  });

  // Camera cinematic drift + mouse influence
  camera.position.x = Math.sin(time * 0.065) * 6.2 + mouseX * 4.5;
  camera.position.y = 12 + Math.sin(time * 0.14) * 2.2 + mouseY * 2.5;
  camera.position.z = 38 + Math.cos(time * 0.05) * 5.0;
  camera.lookAt(0, 7, 0);

  // Dynamic lights
  fill.intensity = 7.8 + Math.sin(time * 1.6) * 2.0;
  accent.intensity = 3.2 + Math.sin(time * 1.25) * 1.3;
  accent.position.x = Math.sin(time * 0.62) * 12;
  accent.position.z = Math.cos(time * 0.62) * 12;
  cool.intensity = 2.2 + Math.sin(time * 0.8) * 0.8;
  surgeLight.intensity *= 0.93;

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
}, 3000);
