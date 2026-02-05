// ===== SCENE SETUP =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // sky blue

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(0, 1.6, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// ===== LIGHTING =====
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

scene.add(new THREE.AmbientLight(0xffffff, 0.4));

// ===== PLAYER LOAD =====
let player;

// ===== PHYSICS =====
let velocityY = 0;
const gravity = -0.015;
const jumpStrength = 0.35;
const groundY = 0; // ground height
let isOnGround = false;

const loader = new THREE.GLTFLoader();
loader.load(
  'models/player.glb',
  (gltf) => {
    player = gltf.scene;

    player.scale.set(0.5, 0.5, 0.5);
    player.position.set(0, 0, 0);

    player.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    scene.add(player);
    console.log('Player loaded');
  },
  undefined,
  (err) => console.error(err)
);

// ===== SIMPLE GROUND =====
const groundGeo = new THREE.PlaneGeometry(100, 100);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x3a7d44 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
scene.add(ground);

// ===== CONTROLS =====
const keys = {};
document.addEventListener('keydown', (e) => (keys[e.key.toLowerCase()] = true));
document.addEventListener('keyup', (e) => (keys[e.key.toLowerCase()] = false));

// Pointer lock (mouse look)
document.body.addEventListener('click', () => {
  document.body.requestPointerLock();
});

let yaw = 0;
let pitch = 0;

document.addEventListener('mousemove', (e) => {
  if (document.pointerLockElement !== document.body) return;

  yaw -= e.movementX * 0.002;
  pitch -= e.movementY * 0.002;
  pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
});

// ===== ANIMATION LOOP =====
function animate() {
  requestAnimationFrame(animate);

  if (player) {
    // Camera follows player
    camera.position.x = player.position.x;
    camera.position.y = player.position.y + 1.6;
    camera.position.z = player.position.z;

    camera.rotation.set(pitch, yaw, 0);

    const speed = 0.05;
    const forward = new THREE.Vector3(
      Math.sin(yaw),
      0,
      Math.cos(yaw)
    );
    const right = new THREE.Vector3(
      Math.sin(yaw + Math.PI / 2),
      0,
      Math.cos(yaw + Math.PI / 2)
    );

    if (keys['w']) player.position.addScaledVector(forward, speed);
    if (keys['s']) player.position.addScaledVector(forward, -speed);
    if (keys['a']) player.position.addScaledVector(right, -speed);
    if (keys['d']) player.position.addScaledVector(right, speed);

    // Rotate player body to face movement direction
    player.rotation.y = yaw;
  }

  renderer.render(scene, camera);
}

animate();

// ===== RESIZE FIX =====
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
