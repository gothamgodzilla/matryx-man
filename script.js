import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const canvas = document.getElementById('webgl');
const loader = document.getElementById('loader');
const quoteEl = document.getElementById('quote');

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.0045);
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 600);
camera.position.set(0, 9, 28);

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
renderer.toneMappingExposure = 1.65;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// Post-processing for hyper-real bloom + output
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.45, // strength
  0.42, // radius
  0.72  // threshold
);
composer.addPass(bloomPass);
const outputPass = new OutputPass();
composer.addPass(outputPass);

// Lighting – hyper-real cinematic
const ambient = new THREE.AmbientLight(0x0a0a18, 0.18);
scene.add(ambient);

const key = new THREE.DirectionalLight(0xffd0a0, 3.1);
key.position.set(14, 24, 16);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 0.5;
key.shadow.camera.far = 100;
key.shadow.bias = -0.0003;
scene.add(key);

const rim = new THREE.DirectionalLight(0x4466ff, 1.8);
rim.position.set(-18, 14, -12);
scene.add(rim);

const fill = new THREE.PointLight(0xff5500, 6.5, 60);
fill.position.set(0, 2.5, 0);
fill.castShadow = true;
scene.add(fill);

const accent = new THREE.PointLight(0xffcc44, 3.0, 35);
accent.position.set(7, 12, 5);
scene.add(accent);

const cool = new THREE.PointLight(0x3388ff, 2.1, 40);
cool.position.set(-8, 7, -6);
scene.add(cool);

// Ground – dark PBR with subtle height
const groundGeo = new THREE.PlaneGeometry(240, 240, 180, 180);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x020208,
  roughness: 0.94,
  metalness: 0.05,
  emissive: 0x060100,
  emissiveIntensity: 0.06
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -14;
ground.receiveShadow = true;
scene.add(ground);

// Particles – denser rising determination streams (72k)
const particleCount = 72000;
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
const sizes = new Float32Array(particleCount);
const velocities = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
  const i3 = i * 3;
  positions[i3] = (Math.random() - 0.5) * 90;
  positions[i3 + 1] = Math.random() * 50 - 15;
  positions[i3 + 2] = (Math.random() - 0.5) * 90;
  
  const t = Math.random();
  colors[i3] = 1.0;
  colors[i3 + 1] = 0.35 + t * 0.45;
  colors[i3 + 2] = 0.05 + t * 0.25;
  
  sizes[i] = 0.025 + Math.random() * 0.11;
  velocities[i] = 0.035 + Math.random() * 0.085;
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

const particleMat = new THREE.PointsMaterial({
  size: 0.125,
  vertexColors: true,
  transparent: true,
  opacity: 0.88,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  sizeAttenuation: true
});
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// Central ascending structure – determination spine + energy helix
const spineGroup = new THREE.Group();
const helixGroup = new THREE.Group();

for (let i = 0; i < 32; i++) {
  const geo = new THREE.CylinderGeometry(0.06 + Math.random()*0.04, 0.24, 1.25, 16);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xff4a00,
    emissive: 0xff2200,
    emissiveIntensity: 1.05,
    metalness: 0.82,
    roughness: 0.15,
    clearcoat: 0.75,
    clearcoatRoughness: 0.1,
    transmission: 0.04,
    thickness: 0.2
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = i * 1.1 - 9;
  mesh.rotation.z = Math.sin(i * 0.28) * 0.18;
  mesh.castShadow = true;
  spineGroup.add(mesh);
}

// Helix energy rings
for (let i = 0; i < 48; i++) {
  const angle = (i / 48) * Math.PI * 7;
  const y = (i / 48) * 28 - 9;
  const geo = new THREE.TorusGeometry(0.7 + i * 0.035, 0.042, 10, 24);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffcc77,
    emissive: 0xff8800,
    emissiveIntensity: 1.35,
    metalness: 0.92,
    roughness: 0.08,
    clearcoat: 0.9,
    clearcoatRoughness: 0.06
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(Math.cos(angle) * 1.6, y, Math.sin(angle) * 1.6);
  mesh.rotation.x = Math.PI / 2;
  mesh.rotation.z = angle;
  mesh.castShadow = true;
  helixGroup.add(mesh);
}

spineGroup.add(helixGroup);
scene.add(spineGroup);

// Base core – pulsing determination source
const coreGeo = new THREE.SphereGeometry(1.35, 48, 48);
const coreMat = new THREE.MeshPhysicalMaterial({
  color: 0xff1100,
  emissive: 0xff0000,
  emissiveIntensity: 2.1,
  metalness: 0.45,
  roughness: 0.18,
  clearcoat: 0.6,
  clearcoatRoughness: 0.12
});
const core = new THREE.Mesh(coreGeo, coreMat);
core.position.y = -4;
core.castShadow = true;
scene.add(core);

// Additional floating energy orbs
const orbs = [];
for (let i = 0; i < 16; i++) {
  const geo = new THREE.SphereGeometry(0.12 + Math.random() * 0.18, 16, 16);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffbb66,
    emissive: 0xff7700,
    emissiveIntensity: 1.6,
    metalness: 0.7,
    roughness: 0.12
  });
  const orb = new THREE.Mesh(geo, mat);
  orb.userData = {
    radius: 4.5 + Math.random() * 9,
    speed: 0.2 + Math.random() * 0.7,
    offset: Math.random() * Math.PI * 2,
    yBase: 0.5 + Math.random() * 14
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
  "Quiet engines rewrite the visible skyline."
];
let quoteIndex = 0;

function updateQuote() {
  quoteEl.style.opacity = 0;
  setTimeout(() => {
    quoteIndex = (quoteIndex + 1) % quotes.length;
    quoteEl.textContent = quotes[quoteIndex];
    quoteEl.style.opacity = 1;
  }, 650);
}
setInterval(updateQuote, 7500);

let time = 0;
let mouseX = 0, mouseY = 0;
let boost = 1.0;

window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

window.addEventListener('click', () => {
  boost = Math.min(boost + 0.35, 2.8);
  setTimeout(() => { boost = Math.max(boost - 0.35, 1.0); }, 2200);
});

function animate() {
  requestAnimationFrame(animate);
  time += 0.016 * boost;

  // Animate particles upward with turbulence
  const pos = particleGeo.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    pos[i3 + 1] += velocities[i] * boost;
    pos[i3] += Math.sin(time * 0.55 + i * 0.006) * 0.014;
    pos[i3 + 2] += Math.cos(time * 0.42 + i * 0.006) * 0.014;
    if (pos[i3 + 1] > 38) {
      pos[i3 + 1] = -16;
      pos[i3] = (Math.random() - 0.5) * 90;
      pos[i3 + 2] = (Math.random() - 0.5) * 90;
    }
  }
  particleGeo.attributes.position.needsUpdate = true;

  // Spine and helix rotation / breathing
  spineGroup.rotation.y = time * 0.11;
  spineGroup.position.y = Math.sin(time * 0.48) * 0.6;
  helixGroup.rotation.y = time * 0.28;

  // Core pulse
  const pulse = 1 + Math.sin(time * 2.1) * 0.28;
  core.scale.setScalar(pulse);
  coreMat.emissiveIntensity = 1.6 + Math.sin(time * 2.4) * 0.7;

  // Orbs orbit
  orbs.forEach((orb, idx) => {
    const d = orb.userData;
    const a = time * d.speed + d.offset;
    orb.position.set(
      Math.cos(a) * d.radius,
      d.yBase + Math.sin(time * 0.78 + idx) * 1.8,
      Math.sin(a) * d.radius
    );
    orb.scale.setScalar(1 + Math.sin(time * 1.5 + idx) * 0.2);
  });

  // Camera cinematic drift + mouse influence
  camera.position.x = Math.sin(time * 0.09) * 4.8 + mouseX * 3.2;
  camera.position.y = 9 + Math.sin(time * 0.18) * 1.5 + mouseY * 1.8;
  camera.position.z = 28 + Math.cos(time * 0.07) * 3.5;
  camera.lookAt(0, 5, 0);

  // Dynamic lights
  fill.intensity = 5.5 + Math.sin(time * 1.7) * 1.5;
  accent.intensity = 2.4 + Math.sin(time * 1.3) * 0.9;
  accent.position.x = Math.sin(time * 0.65) * 8;
  accent.position.z = Math.cos(time * 0.65) * 8;
  cool.intensity = 1.6 + Math.sin(time * 0.88) * 0.55;

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
}, 2600);
