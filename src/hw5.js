import {OrbitControls} from './OrbitControls.js'

const EPSILON = 0.105

const goldLineMat = new THREE.LineBasicMaterial( { color: 0xFDB927 } ); 
const purpleLineMat = new THREE.LineBasicMaterial( { color: 0x552583 } );  


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
  const textureLoader = new THREE.TextureLoader();

function degrees_to_radians(degrees) {
  var pi = Math.PI;
  return degrees * (pi/180);
}

function createArc(left) {
  const arc = new THREE.EllipseCurve(
    (left? -15: 15), 0, // x, z
    6.75, 6.75,
    -Math.PI / 2, Math.PI / 2,
    (!left)
  );
  const points = arc.getPoints(64).map(p => new THREE.Vector3(p.x, EPSILON, p.y));
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const arcLine = new THREE.Line(geometry, purpleLineMat);
  scene.add(arcLine);

}

function createThreePointLine(left) {
  const courtHalf = left ? -15 : +15;  
  const lineOffset = 0.914;
  const lineZ = left ? 15/2 - lineOffset : -15/2 + lineOffset;
  const lineLength = 4.26                      
  const lineX   = left ? courtHalf + lineLength : courtHalf - lineLength;
  const radius = 7.24;                
  const y  = EPSILON + 0.01;      

  // 1) Corner segments (baseline ↔ arc intersection)
  const seg1 = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(courtHalf,   y,  lineZ),
    new THREE.Vector3(lineX,   y,  lineZ)
  ]);

  const seg2 = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(courtHalf,   y,  -lineZ),
    new THREE.Vector3(lineX,   y,  -lineZ)
  ]);
  const line1 = new THREE.Line(seg1, purpleLineMat);
  const line2 = new THREE.Line(seg2, purpleLineMat);

  // 2) Arc between those two points, centered on the hoop
  const arc = new THREE.EllipseCurve(
    lineX, 0, // x, z
    5, 15/2-lineOffset,
    -Math.PI / 2, Math.PI / 2,
    (!left)
  );
  const points = arc.getPoints(64).map(p => new THREE.Vector3(p.x, EPSILON, p.y));
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const arcLine = new THREE.Line(geometry, purpleLineMat);
  

  scene.add(line1);
  scene.add(line2);
  scene.add(arcLine);
}


function createCenterCircle() {
  const centerCircleCurve = new THREE.EllipseCurve(
    0, EPSILON+0.05 , // x,y
    1.8, 1.8,
    0, 2 * Math.PI, // full circle
    false
  );
  const centerPoints = centerCircleCurve.getPoints(64).map(p => new THREE.Vector3(p.x, EPSILON, p.y));
  const centerGeometry = new THREE.BufferGeometry().setFromPoints(centerPoints);
  const centerLine = new THREE.Line(centerGeometry, purpleLineMat);
  const logoTex = textureLoader.load('textures/lakers_logo.png');
  const logoSize = 3.3*2; 
  const logoGeo = new THREE.PlaneGeometry(logoSize, logoSize);
  const logoMat = new THREE.MeshBasicMaterial({ map: logoTex, transparent: true });
  const logoMesh = new THREE.Mesh(logoGeo, logoMat);
  logoMesh.rotation.x = -Math.PI / 2; // lay flat on court
  logoMesh.position.set(0.2, EPSILON , 0.2);
  logoMesh.receiveShadow = true;
  scene.add(centerLine);
  scene.add(logoMesh);
}

function createFinalsText(left) {
  const tex = textureLoader.load('textures/finals.png');
  const width = 6; 
  const height = 5;
  const x = left ? -15 + 3 : 15 - 3; 
  const z = left ? 5 : -5; 
  const geo = new THREE.PlaneGeometry(width, height);
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI/2;
  mesh.position.set(x, EPSILON + 0.015, z);
  mesh.receiveShadow = true;
  scene.add(mesh);
}

function createMiddleLine() {
  const middleLineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, EPSILON, -7.5),
    new THREE.Vector3(0, EPSILON, 7.5)
  ]);
  const middleLine = new THREE.Line(middleLineGeometry, purpleLineMat);
  middleLine.receiveShadow = true;
  scene.add(middleLine);
}

function createPaintArea(left) {
  const paintMat = new THREE.MeshPhongMaterial({ color: 0x552583, side: THREE.DoubleSide });
  const paintGeo = new THREE.PlaneGeometry(5.79, 4.8);

  const mesh = new THREE.Mesh(paintGeo, paintMat);
  mesh.rotation.x = -Math.PI/2;
  mesh.position.set(left ? -12.1 : 12.1, 0.11, 0);
  mesh.receiveShadow = true;
  scene.add(mesh);
}

function createPaintLines(left) {
  // Outlines
  const x      = left ? -12.1 : 12.1;
  const width  = 5.79;   
  const depth  = 4.8;       
  const halfW  = width  / 2;
  const halfD  = depth  / 2;
  const y      = 0.12;  
  const radius = 1.8;   

  const outLinespts = [
    new THREE.Vector3(x - halfW, y, -halfD),
    new THREE.Vector3(x + halfW, y, -halfD),
    new THREE.Vector3(x + halfW, y,  halfD),
    new THREE.Vector3(x - halfW, y,  halfD)
  ];

  const paintOutlineGeo = new THREE.BufferGeometry().setFromPoints(outLinespts);
  const paintOutlines = new THREE.LineLoop(paintOutlineGeo, goldLineMat);
  scene.add(paintOutlines);

  // Free throw arc
  const curve = new THREE.EllipseCurve(
    (left? x+halfW: x-halfW), 0,
    radius, radius,
    -Math.PI / 2, Math.PI / 2,
    (!left)  
  );
  // Paint inlines
  const inLinePts = [
    new THREE.Vector3(x - halfW, y, -radius),
    new THREE.Vector3(x + halfW, y, -radius),
    new THREE.Vector3(x + halfW, y,  radius),
    new THREE.Vector3(x - halfW, y,  radius)
  ];

  const paintInlineGeo = new THREE.BufferGeometry().setFromPoints(inLinePts);
  const paintInlines = new THREE.LineLoop(paintInlineGeo, goldLineMat);
  scene.add(paintInlines);

  const arcPts = curve.getPoints(64)
    .map(p => new THREE.Vector3(p.x, y, p.y));
  const arcGeo  = new THREE.BufferGeometry().setFromPoints(arcPts);
  const arcLine = new THREE.Line(arcGeo, goldLineMat);
  arcLine.receiveShadow = true;
  scene.add(arcLine);
}

function createCourtOutline() {
  const halfX = 15;    // court length ÷ 2
  const halfZ = 7.5;   // court width  ÷ 2
  const y     = EPSILON + 0.02;   // sit a bit above the floor/paint (0.12+)

  const pts = [
    new THREE.Vector3(-halfX, y, -halfZ),
    new THREE.Vector3( halfX, y, -halfZ),
    new THREE.Vector3( halfX, y,  halfZ),
    new THREE.Vector3(-halfX, y,  halfZ)
  ];

  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const courtOutlines = new THREE.LineLoop(geo, purpleLineMat);
  scene.add(courtOutlines);
}

function createHoop(left) {
  const hoopGroup = new THREE.Group();
  const xPosition = left ? -15+1.2192 : 15-1.2192

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
  scene.add(hoopGroup);
}

function createBasketball() {
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
  scene.add(basketball);
}





// Create basketball court
function createBasketballCourt() {
  const woodTex = textureLoader.load(
  'textures/wood_floor.png',            // 1. Correct relative path + filename
  (texture) => {                        // 2. onLoad callback
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 2);          // 4× along X, 2× along Z
    texture.needsUpdate = true;         // ensure Three knows it changed
  },
  undefined,                            // onProgress (we don’t need)
  (err) => console.error('Wood load err:', err)
  );
  
  const courtGeometry = new THREE.BoxGeometry(30, 0.2, 15);
  const courtMaterial = new THREE.MeshPhongMaterial({ 
    map: woodTex,  // Brown wood color
    shininess: 50
  });
  const court = new THREE.Mesh(courtGeometry, courtMaterial);
  court.receiveShadow = true;
  scene.add(court);
  createMiddleLine();
  createCenterCircle();
  createThreePointLine(true);
  createThreePointLine(false);
  createHoop(true)//.map(p => scene.add(p))
  createHoop(false)//.map(p => scene.add(p))
  createPaintArea(true);
  createPaintArea(false);
  createPaintLines(true);
  createPaintLines(false);
  createBasketball();
  createCourtOutline();
  createFinalsText(true);
  createFinalsText(false);
  
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