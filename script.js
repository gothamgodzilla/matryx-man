const canvas = document.getElementById('webgl');
const loader = document.getElementById('loader');
const quoteEl = document.getElementById('quote');

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.012);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 4, 18);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// Lighting – hyper-real cinematic
const ambient = new THREE.AmbientLight(0x111122, 0.4);
scene.add(ambient);
const key = new THREE.DirectionalLight(0xffaa66, 1.8);
key.position.set(5, 12, 8);
key.castShadow = true;
scene.add(key);
const rim = new THREE.DirectionalLight(0x66aaff, 0.9);
rim.position.set(-8, 6, -4);
scene.add(rim);
const fill = new THREE.PointLight(0xff4400, 2.2, 30);
fill.position.set(0, 2, 0);
scene.add(fill);

// Ground plane with subtle displacement feel
const groundGeo = new THREE.PlaneGeometry(80, 80, 64, 64);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x0a0a12,
  roughness: 0.85,
  metalness: 0.15,
  emissive: 0x110800,
  emissiveIntensity: 0.05
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -2;
ground.receiveShadow = true;
scene.add(ground);

// Determination particles – rising streams
const particleCount = 18000;
const positions = new Float32Array(particleCount * 3);
const velocities = new Float32Array(particleCount);
const colors = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  const i3 = i * 3;
  positions[i3] = (Math.random() - 0.5) * 40;
  positions[i3 + 1] = Math.random() * 20 - 4;
  positions[i3 + 2] = (Math.random() - 0.5) * 40;
  velocities[i] = 0.015 + Math.random() * 0.04;
  const c = new THREE.Color().setHSL(0.05 + Math.random() * 0.08, 0.9, 0.45 + Math.random() * 0.3);
  colors[i3] = c.r;
  colors[i3 + 1] = c.g;
  colors[i3 + 2] = c.b;
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particleMat = new THREE.PointsMaterial({
  size: 0.08,
  vertexColors: true,
  transparent: true,
  opacity: 0.75,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// Central ascending structure – abstract "determination spine"
const spineGroup = new THREE.Group();
for (let i = 0; i < 12; i++) {
  const geo = new THREE.CylinderGeometry(0.15, 0.35, 2.2, 8);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xff6b00,
    emissive: 0xff3300,
    emissiveIntensity: 0.6,
    metalness: 0.7,
    roughness: 0.3
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = i * 1.8 - 4;
  mesh.rotation.z = Math.sin(i) * 0.15;
  spineGroup.add(mesh);
}
scene.add(spineGroup);

const quotes = [
  "The ones who were counted out write the rules that outlast the counters.",
  "Underestimated is not a verdict. It is fuel.",
  "Determination is the quiet refusal to become the story others wrote.",
  "They measured the odds. You measured the work.",
  "MatryxX: the architecture of becoming undeniable."
];
let quoteIndex = 0;

function updateQuote() {
  quoteEl.style.opacity = 0;
  setTimeout(() => {
    quoteIndex = (quoteIndex + 1) % quotes.length;
    quoteEl.textContent = quotes[quoteIndex];
    quoteEl.style.opacity = 1;
  }, 600);
}
setInterval(updateQuote, 7000);

let time = 0;
function animate() {
  requestAnimationFrame(animate);
  time += 0.016;

  // Animate particles upward
  const pos = particleGeo.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    pos[i3 + 1] += velocities[i];
    if (pos[i3 + 1] > 22) {
      pos[i3 + 1] = -6;
      pos[i3] = (Math.random() - 0.5) * 40;
      pos[i3 + 2] = (Math.random() - 0.5) * 40;
    }
  }
  particleGeo.attributes.position.needsUpdate = true;

  // Spine rotation and breathing
  spineGroup.rotation.y = time * 0.15;
  spineGroup.position.y = Math.sin(time * 0.8) * 0.4;

  // Camera subtle drift
  camera.position.x = Math.sin(time * 0.2) * 2;
  camera.position.y = 4 + Math.sin(time * 0.3) * 0.5;
  camera.lookAt(0, 2, 0);

  // Dynamic light
  fill.intensity = 1.8 + Math.sin(time * 2) * 0.6;

  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Hide loader after brief cinematic pause
setTimeout(() => {
  loader.classList.add('hidden');
  animate();
}, 1800);