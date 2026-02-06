// ================= BASIC SETUP =================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // sky blue

const canvas = document.getElementById("game");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

const camera = new THREE.PerspectiveCamera(
  75,
  canvas.clientWidth / canvas.clientHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 5);

// ================= MENU =================
const menu = document.getElementById("menu");
const startBtn = document.getElementById("start");
let gameStarted = false;

startBtn.addEventListener("click", () => {
  menu.style.display = "none";
  gameStarted = true;
  document.body.requestPointerLock();
});

// ================= LIGHTING =================
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(10, 20, 10);
scene.add(sun);

// ================= TEXTURES =================
const texLoader = new THREE.TextureLoader();

const grassTop = texLoader.load("textures/grass_top.png");
const grassSide = texLoader.load("textures/grass_side.png");
const dirtTex = texLoader.load("textures/dirt.png");
const sandTex = texLoader.load("textures/sand.png");

[grassTop, grassSide, dirtTex, sandTex].forEach(t => {
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
});

// ================= BLOCK FACTORY =================
function createBlock(type, x, y, z) {
  const geo = new THREE.BoxGeometry(1, 1, 1);
  let mat;

  if (type === "grass") {
    mat = [
      new THREE.MeshStandardMaterial({ map: grassSide }), // right
      new THREE.MeshStandardMaterial({ map: grassSide }), // left
      new THREE.MeshStandardMaterial({ map: grassTop }),  // top
      new THREE.MeshStandardMaterial({ map: dirtTex }),   // bottom
      new THREE.MeshStandardMaterial({ map: grassSide }), // front
      new THREE.MeshStandardMaterial({ map: grassSide })  // back
    ];
  } else if (type === "dirt") {
    mat = new THREE.MeshStandardMaterial({ map: dirtTex });
  } else if (type === "sand") {
    mat = new THREE.MeshStandardMaterial({ map: sandTex });
  }

  const block = new THREE.Mesh(geo, mat);
  block.position.set(x, y, z);
  scene.add(block);
}

// ================= WORLD GENERATION =================
for (let x = -10; x <= 10; x++) {
  for (let z = -10; z <= 10; z++) {
    createBlock("grass", x, 0, z);
  }
}

// ================= PLAYER =================
let player;
const loader = new THREE.GLTFLoader();

loader.load("models/player.glb", gltf => {
  player = gltf.scene;
  player.scale.set(0.5, 0.5, 0.5);
  player.position.set(0, 1, 0);
  scene.add(player);
});

// ================= CHEST =================
loader.load("models/Chest.glb", gltf => {
  const chest = gltf.scene;
  chest.position.set(3, 1, 3);
  chest.scale.set(0.8, 0.8, 0.8);
  scene.add(chest);
});

// ================= CONTROLS =================
const keys = {};

document.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;
  if (e.code === "Space") keys.space = true;
});

document.addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
  if (e.code === "Space") keys.space = false;
});

// ================= MOUSE LOOK =================
let yaw = 0;
let pitch = 0;

document.addEventListener("mousemove", e => {
  if (document.pointerLockElement !== document.body) return;

  yaw -= e.movementX * 0.002;
  pitch -= e.movementY * 0.002;
  pitch = Math.max(-1.5, Math.min(1.5, pitch));
});

// ================= PHYSICS =================
let velocityY = 0;
const gravity = -0.015;
const jumpPower = 0.35;
let onGround = false;

// ================= GAME LOOP =================
function animate() {
  requestAnimationFrame(animate);

  if (!gameStarted) {
    renderer.render(scene, camera);
    return;
  }

  if (player) {
    // Gravity
    velocityY += gravity;
    player.position.y += velocityY;

    if (player.position.y <= 1) {
      player.position.y = 1;
      velocityY = 0;
      onGround = true;
    }

    // Jump
    if (keys.space && onGround) {
      velocityY = jumpPower;
      onGround = false;
    }

    // Movement
    const speed = 0.06;
    const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
    const right = new THREE.Vector3(Math.sin(yaw + Math.PI / 2), 0, Math.cos(yaw + Math.PI / 2));

    if (keys.w) player.position.addScaledVector(forward, speed);
    if (keys.s) player.position.addScaledVector(forward, -speed);
    if (keys.a) player.position.addScaledVector(right, -speed);
    if (keys.d) player.position.addScaledVector(right, speed);

    // Camera follow
    camera.position.set(
      player.position.x,
      player.position.y + 1.6,
      player.position.z
    );
    camera.rotation.set(pitch, yaw, 0);

    player.rotation.y = yaw;
  }

  renderer.render(scene, camera);
}

animate();

// ================= RESIZE =================
window.addEventListener("resize", () => {
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
});
