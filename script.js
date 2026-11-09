import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const canvas = document.getElementById('webgl');
const loader = document.getElementById('loader');
const quoteEl = document.getElementById('quote');

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.0065);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 400);
camera.position.set(0, 7, 24);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.45;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// Post-processing for hyper-real bloom
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.15, // strength
  0.42, // radius
  0.85  // threshold
);
composer.addPass(bloomPass);

// Lighting – hyper-real cinematic
const ambient = new THREE.AmbientLight(0x080812, 0.28);
scene.add(ambient);

const key = new THREE.DirectionalLight(0xffc896, 2.4);
key.position.set(10, 18, 12);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 0.5;
key.shadow.camera.far = 60;
key.shadow.bias = -0.0005;
scene.add(key);

const rim = new THREE.DirectionalLight(0x3a6bff, 1.3);
rim.position.set(-14, 10, -8);
scene.add(rim);

const fill = new THREE.PointLight(0xff4400, 4.2, 45);
fill.position.set(0, 2, 0);
fill.castShadow = true;
scene.add(fill);

const accent = new THREE.PointLight(0xffaa33, 2.1, 28);
accent.position.set(5, 9, 3);
scene.add(accent);

const cool = new THREE.PointLight(0x2266ff, 1.4, 30);
cool.position.set(-6, 5, -4);
scene.add(cool);

// Ground – dark PBR with subtle emissive and better geometry
const groundGeo = new THREE.PlaneGeometry(160, 160, 160, 160);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x04040a,
  roughness: 0.88,
  metalness: 0.12,
  emissive: 0x0a0400,
  emissiveIntensity: 0.12
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -3.2;
ground.receiveShadow = true;
scene.add(ground);

// Determination particles – denser rising streams with turbulence and varied speeds
const particleCount = 42000;
const positions = new Float32Array(particleCount * 3);
const velocities = new Float32Array(particleCount);
const colors = new Float32Array(particleCount * 3);
const sizes = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
  const i3 = i * 3;
  positions[i3] = (Math.random() - 0.5) * 62;
  positions[i3 + 1] = Math.random() * 34 - 8;
  positions[i3 + 2] = (Math.random() - 0.5) * 62;
  velocities[i] = 0.018 + Math.random() * 0.072;
  const hue = 0.03 + Math.random() * 0.14;
  const c = new THREE.Color().setHSL(hue, 0.98, 0.42 + Math.random() * 0.38);
  colors[i3] = c.r;
  colors[i3 + 1] = c.g;
  colors[i3 + 2] = c.b;
  sizes[i] = 0.035 + Math.random() * 0.075;
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

const particleMat = new THREE.PointsMaterial({
  size: 0.085,
  vertexColors: true,
  transparent: true,
  opacity: 0.88,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  sizeAttenuation: true
});
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// Central ascending structure – determination spine + energy helix + rings
const spineGroup = new THREE.Group();
const helixGroup = new THREE.Group();

for (let i = 0; i < 22; i++) {
  const geo = new THREE.CylinderGeometry(0.10, 0.26, 1.45, 16);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xff5a00,
    emissive: 0xff3300,
    emissiveIntensity: 0.85,
    metalness: 0.72,
    roughness: 0.22,
    clearcoat: 0.6,
    clearcoatRoughness: 0.18
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = i * 1.25 - 7;
  mesh.rotation.z = Math.sin(i * 0.35) * 0.14;
  mesh.castShadow = true;
  spineGroup.add(mesh);
}

// Helix energy rings
for (let i = 0; i < 32; i++) {
  const angle = (i / 32) * Math.PI * 5.2;
  const y = (i / 32) * 22 - 7;
  const geo = new THREE.TorusGeometry(0.7 + i * 0.035, 0.055, 10, 24);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffbb66,
    emissive: 0xff7700,
    emissiveIntensity: 1.05,
    metalness: 0.85,
    roughness: 0.15,
    clearcoat: 0.8
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(Math.cos(angle) * 1.35, y, Math.sin(angle) * 1.35);
  mesh.rotation.x = Math.PI / 2;
  mesh.rotation.z = angle;
  mesh.castShadow = true;
  helixGroup.add(mesh);
}

spineGroup.add(helixGroup);
scene.add(spineGroup);

// Base core – pulsing determination source
const coreGeo = new THREE.SphereGeometry(1.05, 48, 48);
const coreMat = new THREE.MeshPhysicalMaterial({
  color: 0xff2200,
  emissive: 0xff1100,
  emissiveIntensity: 1.6,
  metalness: 0.45,
  roughness: 0.25,
  clearcoat: 0.4
});
const core = new THREE.Mesh(coreGeo, coreMat);
core.position.y = -2.4;
core.castShadow = true;
scene.add(core);

// Additional floating energy orbs
const orbs = [];
for (let i = 0; i < 8; i++) {
  const geo = new THREE.SphereGeometry(0.18 + Math.random() * 0.12, 16, 16);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffaa55,
    emissive: 0xff6600,
    emissiveIntensity: 1.2,
    metalness: 0.6,
    roughness: 0.2
  });
  const orb = new THREE.Mesh(geo, mat);
  orb.userData = {
    radius: 4 + Math.random() * 6,
    speed: 0.3 + Math.random() * 0.5,
    offset: Math.random() * Math.PI * 2,
    yBase: 2 + Math.random() * 8
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
  "Refuse the narrative. Build the ascent."
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
setInterval(updateQuote, 7500);

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
    pos[i3] += Math.sin(time * 0.55 + i * 0.008) * 0.009;
    pos[i3 + 2] += Math.cos(time * 0.42 + i * 0.008) * 0.009;
    if (pos[i3 + 1] > 28) {
      pos[i3 + 1] = -9;
      pos[i3] = (Math.random() - 0.5) * 62;
      pos[i3 + 2] = (Math.random() - 0.5) * 62;
    }
  }
  particleGeo.attributes.position.needsUpdate = true;

  // Spine and helix rotation / breathing
  spineGroup.rotation.y = time * 0.11;
  spineGroup.position.y = Math.sin(time * 0.55) * 0.42;
  helixGroup.rotation.y = time * 0.28;

  // Core pulse
  const pulse = 1 + Math.sin(time * 2.1) * 0.22;
  core.scale.setScalar(pulse);
  coreMat.emissiveIntensity = 1.35 + Math.sin(time * 2.4) * 0.55;

  // Orbs orbit
  orbs.forEach((orb, idx) => {
    const d = orb.userData;
    const a = time * d.speed + d.offset;
    orb.position.set(
      Math.cos(a) * d.radius,
      d.yBase + Math.sin(time * 0.8 + idx) * 1.2,
      Math.sin(a) * d.radius
    );
    orb.scale.setScalar(1 + Math.sin(time * 1.5 + idx) * 0.15);
  });

  // Camera cinematic drift + mouse influence
  camera.position.x = Math.sin(time * 0.13) * 3.5 + mouseX * 2.4;
  camera.position.y = 7 + Math.sin(time * 0.22) * 1.1 + mouseY * 1.4;
  camera.position.z = 24 + Math.cos(time * 0.09) * 2.5;
  camera.lookAt(0, 3.5, 0);

  // Dynamic lights
  fill.intensity = 3.4 + Math.sin(time * 1.7) * 1.1;
  accent.intensity = 1.7 + Math.sin(time * 1.3) * 0.7;
  accent.position.x = Math.sin(time * 0.65) * 6;
  accent.position.z = Math.cos(time * 0.65) * 6;
  cool.intensity = 1.1 + Math.sin(time * 0.9) * 0.4;

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
}, 2200);