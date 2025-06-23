import {OrbitControls} from './OrbitControls.js'

const EPSILON = 0.1

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// Set background color
scene.background = new THREE.Color(0x000000);

// Add lights to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 15);
scene.add(directionalLight);

// Enable shadows
renderer.shadowMap.enabled = true;
directionalLight.castShadow = true;

function degrees_to_radians(degrees) {
  var pi = Math.PI;
  return degrees * (pi/180);
}

function createArc(left, mat) {
  const arc = new THREE.EllipseCurve(
    (left? -15: 15), 0, // x, z
    6.75, 6.75,
    -Math.PI / 2, Math.PI / 2,
    (!left)
  );
  const points = arc.getPoints(64).map(p => new THREE.Vector3(p.x, EPSILON, p.y));
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return new THREE.Line(geometry, mat);
}

function createCenterCircle(mat) {
  const centerCircleCurve = new THREE.EllipseCurve(
    0, 0, // x,y
    1.8, 1.8,
    0, 2 * Math.PI, // full circle
    false
  );
  const centerPoints = centerCircleCurve.getPoints(64).map(p => new THREE.Vector3(p.x, EPSILON, p.y));
  const centerGeometry = new THREE.BufferGeometry().setFromPoints(centerPoints);
  return new THREE.Line(centerGeometry, mat);
}

function createMiddleLine(mat) {
  const middleLineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, EPSILON, -7.5),
    new THREE.Vector3(0, EPSILON, 7.5)
  ]);

  return new THREE.Line(middleLineGeometry, mat);
}

function createHoop(left) {
  const hoopGroup = new THREE.Group();
  const xPosition = left ? -15 : 15

  const backboardGeometry = new THREE.BoxGeometry(0.1, 1.05, 1.8);
  const backboardMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
  const backboard = new THREE.Mesh(backboardGeometry, backboardMaterial);
  backboard.position.set(xPosition, 3.05, 0);
  hoopGroup.add(backboard);

  const rimGeometry = new THREE.TorusGeometry(0.225, 0.03, 16, 100);
  const rimMaterial = new THREE.MeshPhongMaterial({ color: 0xff4500 }); // Orange
  const rim = new THREE.Mesh(rimGeometry, rimMaterial);
  rim.rotation.x = Math.PI / 2;
  rim.position.set(xPosition + (xPosition > 0 ? -0.6 : 0.6), 3.05, 0);
  hoopGroup.add(rim);

  const netGeometry = new THREE.CylinderGeometry(0.23, 0.23, 0.5, 12, 1, true);
  const netMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xffffff, 
    wireframe: true,
    transparent: true,
    opacity: 0.8
  });
  const net = new THREE.Mesh(netGeometry, netMaterial);
  net.position.set(rim.position.x, rim.position.y - 0.25, rim.position.z);
  hoopGroup.add(net);

  const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3.05, 16);
  const poleMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
  const pole = new THREE.Mesh(poleGeometry, poleMaterial);
  pole.position.set(xPosition + (xPosition > 0 ? 1 : -1), 1.525, 0);
  hoopGroup.add(pole);

  const armGeometry = new THREE.BoxGeometry(0.1, 0.1, 1.5);
  const arm = new THREE.Mesh(armGeometry, poleMaterial);
  arm.rotation.y = Math.PI / 2;
  arm.position.set(
    xPosition + (xPosition > 0 ? 0.5 : -0.5), 
    3.05, 
    0
  );
  hoopGroup.add(arm);

  return hoopGroup;
}

function createBasketball() {
  const textureLoader = new THREE.TextureLoader();
  const basketballTexture = textureLoader.load('textures/basketball_texture.png');

  const ballRadius = 0.24;
  const ballGeometry = new THREE.SphereGeometry(ballRadius, 64, 64);
  const ballMaterial = new THREE.MeshPhongMaterial({
    map: basketballTexture,
    shininess: 20,
    specular: 0x222222
  });

  const basketball = new THREE.Mesh(ballGeometry, ballMaterial);
  basketball.position.set(0, ballRadius + EPSILON, 0);
  basketball.castShadow = true;
  return basketball;
}

// Create basketball court
function createBasketballCourt() {
  // Court floor - just a simple brown surface
  const courtGeometry = new THREE.BoxGeometry(30, 0.2, 15);
  const courtMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xc68642,  // Brown wood color
    shininess: 50
  });
  const court = new THREE.Mesh(courtGeometry, courtMaterial);
  court.receiveShadow = true;
  scene.add(court);

  const lineMaterial = new THREE.LineBasicMaterial( { color: 0xffffff } );  // White line

  scene.add(createMiddleLine(lineMaterial))
  scene.add(createCenterCircle(lineMaterial))
  scene.add(createArc(true, lineMaterial));
  scene.add(createArc(false, lineMaterial));

  scene.add(createHoop(true))//.map(p => scene.add(p))
  scene.add(createHoop(false))//.map(p => scene.add(p))

  scene.add(createBasketball())
  
  // Note: All court lines, hoops, and other elements have been removed
  // Students will need to implement these features
}

// Create all elements
createBasketballCourt();

// Set camera position for better view
const cameraTranslate = new THREE.Matrix4();
cameraTranslate.makeTranslation(0, 15, 30);
camera.applyMatrix4(cameraTranslate);

// Resize handler
window.addEventListener('resize', onWindowResize);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
let isOrbitEnabled = true;

// Handle key events
function handleKeyDown(e) {
  switch (e.key.toLowerCase()) {
    case 'o':
      isOrbitEnabled = !isOrbitEnabled;
      break;
    case 'f':
      document.body.requestFullscreen();
      break;
    case 'h':
      // toggle help panel
      const help = document.getElementById('controls-container');
      help.style.display = help.style.display === 'none' ? 'block' : 'none';
      break;
    case 'r':
      // reset camera to its original spot
      camera.position.set(0, 15, 30);
      controls.update();
      break;
  }
}

document.addEventListener('keydown', handleKeyDown);

// Animation function
function animate() {
  requestAnimationFrame(animate);
  
  // Update controls
  controls.enabled = isOrbitEnabled;
  controls.update();
  
  renderer.render(scene, camera);
}

animate();