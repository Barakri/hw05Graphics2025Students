import {OrbitControls} from './OrbitControls.js'

const EPSILON = 0.105

const goldLineMat = new THREE.LineBasicMaterial( { color: 0xFDB927 } ); 
const purpleLineMat = new THREE.LineBasicMaterial( { color: 0x552583 } );  


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
// append canvas into our webgl-container instead of document.body
const container = document.getElementById('webgl-container');
container.appendChild(renderer.domElement);
// make sure it fills the container
renderer.domElement.style.position = 'absolute';
renderer.domElement.style.top = '0';
renderer.domElement.style.left = '0';

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

// Global basketball mesh reference
let basketball;
// Global shot power (0-100)
let shotPower = 50;
// --- Shooting physics state ---
let ballVelocity = new THREE.Vector3(0, 0, 0);
let ballInFlight = false;
const GRAVITY = -9.8; // m/s^2 (scaled)
let lastTime = performance.now();
// --- Scoring system state ---
let teamAScore = 0;
let teamBScore = 0;
let shotAttempts = 0;
let shotsMade = 0;
let threePA = 0;
let threePM = 0;
// --- Store shot power and sweetspot at launch ---
let lastShotPower = 50;
let lastSweetStart = 0;
let lastSweetEnd = 100;
let shotPending = false;
let passedArcPeak = false;
// Add global to store last shot position
let lastShotPos = null;
let lastShotRim = null;
function updateScoreHUD() {
  // --- Stats HUD (top left) ---
  let statsHud = document.getElementById('stats-hud');
  if (!statsHud) {
    statsHud = document.createElement('div');
    statsHud.id = 'stats-hud';
    document.body.appendChild(statsHud);
  }
  const pct = shotAttempts > 0 ? Math.round((shotsMade / shotAttempts) * 100) : 0;
  const threePct = threePA > 0 ? Math.round((threePM / threePA) * 100) : 0;
  statsHud.innerHTML = `
    <b>FGA:</b> ${shotAttempts}<br>
    <b>FGM:</b> ${shotsMade}<br>
    <b>FG%:</b> ${pct}%<br>
    <b>3PA:</b> ${threePA}<br>
    <b>3PM:</b> ${threePM}<br>
    <b>3P%:</b> ${threePct}%
  `;

  // --- Scoreboard (top center, already in HTML) ---
  const teamA = document.getElementById('team-a-score');
  const teamB = document.getElementById('team-b-score');
  const scoreboard = document.getElementById('scoreboard-container');
  if (teamA && teamB && scoreboard) {
    // Check if score changed for flash
    if (parseInt(teamA.textContent) !== teamAScore || parseInt(teamB.textContent) !== teamBScore) {
      scoreboard.classList.remove('score-flash');
      void scoreboard.offsetWidth; // force reflow for animation
      scoreboard.classList.add('score-flash');
    }
    teamA.textContent = teamAScore;
    teamB.textContent = teamBScore;
  }
}
function showMissedShotMessage() {
  let msg = document.getElementById('missed-shot-message');
  if (!msg) {
    msg = document.createElement('div');
    msg.id = 'missed-shot-message';
    document.body.appendChild(msg);
  }
  msg.textContent = 'MISSED SHOT';
  msg.style.display = 'block';
  msg.style.opacity = '1';
  msg.animate([
    { transform: 'translate(-50%, 0) scale(1)' },
    { transform: 'translate(-50%, 0) scale(1.25)' },
    { transform: 'translate(-50%, 0) scale(1)' }
  ], { duration: 1200, easing: 'cubic-bezier(.5,2,.5,1)' });
  setTimeout(() => {
    msg.style.transition = 'opacity 0.7s';
    msg.style.opacity = '0';
    setTimeout(() => { msg.style.display = 'none'; msg.style.transition = ''; }, 700);
  }, 1200);
}
// --- Shot made state ---
let shotMade = false;
let shotMadeTimeout = null;
let prevBallY = null;
function showShotMadeMessage() {
  let msg = document.getElementById('shot-made-message');
  if (!msg) {
    msg = document.createElement('div');
    msg.id = 'shot-made-message';
    document.body.appendChild(msg);
  }
  msg.textContent = 'SHOT MADE!';
  msg.style.display = 'block';
  msg.animate([
    { transform: 'translate(-50%, 0) scale(1)' },
    { transform: 'translate(-50%, 0) scale(1.25)' },
    { transform: 'translate(-50%, 0) scale(1)' }
  ], { duration: 1200, easing: 'cubic-bezier(.5,2,.5,1)' });
  clearTimeout(shotMadeTimeout);
  shotMadeTimeout = setTimeout(() => { msg.style.display = 'none'; }, 1200);
  triggerParticleEffect();
}

function getNearestHoopPos() {
  // Returns THREE.Vector3 of the nearest hoop rim center
  const leftHoopX = -15 + 1.2192 + 0.6;
  const rightHoopX = 15 - 1.2192 - 0.6;
  const hoopY = 3.05;
  const hoopZ = 0;
  const left = new THREE.Vector3(leftHoopX, hoopY, hoopZ);
  const right = new THREE.Vector3(rightHoopX, hoopY, hoopZ);
  const distLeft = basketball.position.distanceTo(left);
  const distRight = basketball.position.distanceTo(right);
  return distLeft < distRight ? left : right;
}

function updatePowerIndicator() {
  // NBA2K-style HUD shot meter
  const canvas = document.getElementById('shot-meter');
  if (!canvas || !basketball) {
    if (canvas) canvas.style.display = 'none';
    return;
  }
  const ctx = canvas.getContext('2d');
  // Project basketball position to screen
  const vector = basketball.position.clone();
  vector.project(camera);
  const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;
  // Position canvas centered above the ball
  const offsetY = 35; // px above ball (smaller gauge)
  canvas.style.left = `${x - canvas.width / 2}px`;
  canvas.style.top = `${y - offsetY - canvas.height / 2}px`;
  canvas.style.display = 'block';
  // --- Dynamic sweetspot calculation ---
  const leftHoopX = -15 + 1.2192 + 0.6;
  const rightHoopX = 15 - 1.2192 - 0.6;
  const hoopZ = 0;
  const distLeft = Math.hypot(basketball.position.x - leftHoopX, basketball.position.z - hoopZ);
  const distRight = Math.hypot(basketball.position.x - rightHoopX, basketball.position.z - hoopZ);
  const dist = Math.min(distLeft, distRight);
  const minDist = 0, maxDist = 15;
  const minPower = 30, maxPower = 100;
  let idealPower = minPower + (maxPower - minPower) * ((dist - minDist) / (maxDist - minDist));
  idealPower = Math.max(minPower, Math.min(maxPower, idealPower));
  const sweetWidth = 7;
  const sweetStart = Math.max(0, idealPower - sweetWidth);
  const sweetEnd = Math.min(100, idealPower + sweetWidth);
  // --- Draw shot meter ---
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = 30;
  const startAngle = Math.PI * 0.8;
  const endAngle = Math.PI * 2.2;
  // Draw background arc
  ctx.beginPath();
  ctx.arc(cx, cy, radius, startAngle, endAngle, false);
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#444';
  ctx.stroke();
  // Draw fill arc (shot power)
  const fillAngle = startAngle + (endAngle - startAngle) * (shotPower / 100);
  // Check if in sweetspot
  const inSweetspot = shotPower >= sweetStart && shotPower <= sweetEnd;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, startAngle, fillAngle, false);
  ctx.lineWidth = 10;
  ctx.strokeStyle = inSweetspot ? '#FFD700' : '#00bfff'; // gold if perfect
  if (inSweetspot) {
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 16;
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
  // Draw green zone (dynamic sweetspot)
  const greenStart = startAngle + (endAngle - startAngle) * (sweetStart / 100);
  const greenEnd = startAngle + (endAngle - startAngle) * (sweetEnd / 100);
  ctx.beginPath();
  ctx.arc(cx, cy, radius, greenStart, greenEnd, false);
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#00ff00';
  ctx.shadowColor = '#00ff00';
  ctx.shadowBlur = 8;
  ctx.stroke();
  ctx.shadowBlur = 0;
  // Draw shot power text
  ctx.font = 'bold 14px Arial';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${shotPower}%`, cx, cy);
  // Draw 'Perfect!' label if in sweetspot
  if (inSweetspot) {
    ctx.font = 'bold 13px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 10;
    ctx.fillText('Perfect!', cx, cy - radius - 10);
    ctx.shadowBlur = 0;
  }
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

  basketball = new THREE.Mesh(ballGeometry, ballMaterial);
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

// --- Ball rotation state ---
let ballRotationAxis = new THREE.Vector3(0, 0, 0);
let ballRotationSpeed = 0;
const FLIGHT_SPIN_FACTOR = 0.3; // Reduce spin in air

// Handle key events
function handleKeyDown(e) {
  // Movement step size
  const moveStep = 0.3;
  // Court boundaries (court is 30x15, so halfX=15, halfZ=7.5, but keep ball inside)
  const minX = -15 + 0.24; // ball radius
  const maxX =  15 - 0.24;
  const minZ = -7.5 + 0.24;
  const maxZ =  7.5 - 0.24;

  let moved = false;
  if (basketball && !ballInFlight) {
    let moveVec = new THREE.Vector3(0, 0, 0);
    switch (e.key) {
      case 'ArrowLeft':
        basketball.position.x = Math.max(minX, basketball.position.x - moveStep);
        moveVec.set(-moveStep, 0, 0);
        moved = true;
        break;
      case 'ArrowRight':
        basketball.position.x = Math.min(maxX, basketball.position.x + moveStep);
        moveVec.set(moveStep, 0, 0);
        moved = true;
        break;
      case 'ArrowUp':
        basketball.position.z = Math.max(minZ, basketball.position.z - moveStep);
        moveVec.set(0, 0, -moveStep);
        moved = true;
        break;
      case 'ArrowDown':
        basketball.position.z = Math.min(maxZ, basketball.position.z + moveStep);
        moveVec.set(0, 0, moveStep);
        moved = true;
        break;
      case 'w':
      case 'W':
        shotPower = Math.min(100, shotPower + 5);
        updatePowerIndicator();
        moved = true;
        break;
      case 's':
      case 'S':
        shotPower = Math.max(0, shotPower - 5);
        updatePowerIndicator();
        moved = true;
        break;
      case ' ': // Spacebar to shoot
        if (!ballInFlight) {
          shotAttempts++;
          updateScoreHUD();
          shotPending = true;
          passedArcPeak = false;
          // Calculate direction to nearest hoop
          const hoopPos = getNearestHoopPos();
          const ballPos = basketball.position.clone();
          lastShotPos = ballPos.clone(); // Store shot position for 3-point logic
          lastShotRim = new THREE.Vector3(hoopPos.x, 0, hoopPos.z);

          const shotPos = lastShotPos.clone(); 
          shotPos.y = 0;
          const distToRim = shotPos.distanceTo(lastShotRim);
          const isThree = distToRim > 6.75;
          if (isThree) {
            threePA++;
          }
          // --- Realistic arc calculation ---
          // Set arc peak 2.5m above rim (higher arc)
          const rimY = hoopPos.y;
          const arcPeakY = rimY + 2.5;
          // Horizontal distance and direction
          const dx = hoopPos.x - ballPos.x;
          const dz = hoopPos.z - ballPos.z;
          const horizDist = Math.sqrt(dx*dx + dz*dz);
          const horizDir = new THREE.Vector3(dx, 0, dz).normalize();
          // Vertical distances
          const y0 = ballPos.y;
          const y1 = rimY;
          // 1. Time to reach arc peak
          const g = -GRAVITY;
          const vy_up = Math.sqrt(2 * g * (arcPeakY - y0));
          const t_up = vy_up / g;
          // 2. Time to descend from peak to rim
          const vy_down = Math.sqrt(2 * g * (arcPeakY - y1));
          const t_down = vy_down / g;
          const totalTime = t_up + t_down;
          // 3. Horizontal velocity needed
          const vxz = horizDist / totalTime;
          // 4. Initial vertical velocity
          const vy = vy_up;
          // 5. Use shotPower to scale velocity if not in sweetspot
          // --- Dynamic sweetspot calculation (same as in updatePowerIndicator) ---
          const leftHoopX = -15 + 1.2192 + 0.6;
          const rightHoopX = 15 - 1.2192 - 0.6;
          const hoopZ = 0;
          const distLeft = Math.hypot(ballPos.x - leftHoopX, ballPos.z - hoopZ);
          const distRight = Math.hypot(ballPos.x - rightHoopX, ballPos.z - hoopZ);
          const dist = Math.min(distLeft, distRight);
          const minDist = 0, maxDist = 15;
          const minPower = 30, maxPower = 100;
          let idealPower = minPower + (maxPower - minPower) * ((dist - minDist) / (maxDist - minDist));
          idealPower = Math.max(minPower, Math.min(maxPower, idealPower));
          const sweetWidth = 7;
          const sweetStart = Math.max(0, idealPower - sweetWidth);
          const sweetEnd = Math.min(100, idealPower + sweetWidth);
          let scale = 1;
          if (shotPower < sweetStart) {
            // Undershoot: scale down
            scale = 0.85 + 0.15 * (shotPower / sweetStart);
          } else if (shotPower > sweetEnd) {
            // Overshoot: scale up
            scale = 1 + 0.5 * ((shotPower - sweetEnd) / (100 - sweetEnd));
          }
          // Store shot power and sweetspot for this attempt
          lastShotPower = shotPower;
          lastSweetStart = sweetStart;
          lastSweetEnd = sweetEnd;
          // Set velocity
          ballVelocity = new THREE.Vector3(
            horizDir.x * vxz * scale,
            vy * scale,
            horizDir.z * vxz * scale
          );
          ballInFlight = true;
        }
        moved = true;
    }
    // Apply rotation for ground movement
    if (moved && moveVec.length() > 0) {
      const up = new THREE.Vector3(0, 1, 0);
      const axis = new THREE.Vector3().crossVectors(moveVec, up).normalize();
      const ballRadius = 0.24;
      const angle = moveVec.length() / ballRadius;
      basketball.rotateOnAxis(axis, angle);
    }
  }

  if (!moved) {
    switch (e.key.toLowerCase()) {
      case 'o':
      case 'O':
        isOrbitEnabled = !isOrbitEnabled;
        break;
      case 'f':
      case 'F':
        document.body.requestFullscreen();
        break;
      case 'h':
      case 'H':
        // toggle help panel
        const help = document.getElementById('controls-container');
        help.style.display = help.style.display === 'none' ? 'block' : 'none';
        break;
      case 'c':
      case 'C':
        // reset camera to its original spot
        camera.position.set(0, 15, 30);
        controls.update();
        break;
      case 'r':
      case 'R':
        // reset basketball to original position
        basketball.position.set(0, 0.24 + EPSILON, 0);
        ballInFlight = false;
        ballVelocity.set(0, 0, 0);
        break;
    }
  }
}

document.addEventListener('keydown', handleKeyDown);

// Animation function
function animate() {
  requestAnimationFrame(animate);
  
  // Update controls
  controls.enabled = isOrbitEnabled;
  controls.update();

  // --- Ball physics ---
  const now = performance.now();
  const dt = (now - lastTime) / 1000; // seconds
  lastTime = now;
  // Track previous Y velocity before updating
  let prevVy = ballVelocity.y;
  if (ballInFlight && basketball) {
    // Apply gravity
    ballVelocity.y += GRAVITY * dt;
    // Update position
    basketball.position.x += ballVelocity.x * dt;
    basketball.position.y += ballVelocity.y * dt;
    basketball.position.z += ballVelocity.z * dt;
    // Clamp to court boundaries
    const ballRadius = 0.24;
    const minX = -15 + ballRadius;
    const maxX =  15 - ballRadius;
    const minZ = -7.5 + ballRadius;
    const maxZ =  7.5 - ballRadius;
    basketball.position.x = Math.max(minX, Math.min(maxX, basketball.position.x));
    basketball.position.z = Math.max(minZ, Math.min(maxZ, basketball.position.z));
    // Stop at ground or bounce
    const groundY = ballRadius + EPSILON;
    if (basketball.position.y <= groundY) {
      basketball.position.y = groundY;
      if (Math.abs(ballVelocity.y) > 0.8) {
        ballVelocity.y = -ballVelocity.y * 0.7;
        ballVelocity.x *= 0.95;
        ballVelocity.z *= 0.95;
      } else {
        ballInFlight = false;
        ballVelocity.set(0, 0, 0);
      }
    }
    // Track if ball has passed arc peak (starts descending)
    if (!passedArcPeak && prevVy > 0 && ballVelocity.y <= 0) {
      passedArcPeak = true;
    }
  }

  // --- Ball rotation animation (Phase 5) ---
  if (basketball && ballInFlight) {
    // Compute velocity vector (direction and speed)
    const velocity = ballVelocity.clone();
    const speed = velocity.length();
    if (speed > 0.01) {
      // Axis: perpendicular to velocity and up (Y) axis
      const up = new THREE.Vector3(0, 1, 0);
      const axis = new THREE.Vector3().crossVectors(velocity, up).normalize();
      // Angle: arc length = radius * angle => angle = distance / radius
      const ballRadius = 0.24;
      const angle = speed * dt / ballRadius * FLIGHT_SPIN_FACTOR;
      // Apply rotation (local axis)
      basketball.rotateOnAxis(axis, angle);
      // Store for smoothness (optional)
      ballRotationAxis.copy(axis);
      ballRotationSpeed = angle / dt;
    }
  }

  // --- Shot made detection (crosses rim from above) ---
  if (ballInFlight && basketball) {
    if (prevBallY === null) prevBallY = basketball.position.y;
    const leftHoopX = -15 + 1.2192 + 0.6;
    const rightHoopX = 15 - 1.2192 - 0.6;
    const rimY = 3.05;
    const rimZ = 0;
    const rimRadius = 0.225;
    const ballXZ = new THREE.Vector2(basketball.position.x, basketball.position.z);
    const leftRim = new THREE.Vector2(leftHoopX, rimZ);
    const rightRim = new THREE.Vector2(rightHoopX, rimZ);
    const rimCenter = ballXZ.distanceTo(leftRim) < ballXZ.distanceTo(rightRim) ? leftRim : rightRim;
    const rimDistNow = ballXZ.distanceTo(rimCenter);
    // Loosened tolerance for made shot
    const madeThreshold = rimRadius * 1.1;

    // Use the ball position at shot time (ballPos) and rim center
    const shotPos = lastShotPos ? lastShotPos.clone() : basketball.position.clone();
    shotPos.y = 0;
    const rim3D = new THREE.Vector3(rimCenter.x, 0, rimCenter.y || rimCenter.z || 0);
    const distToRim = shotPos.distanceTo(rim3D);
    const isThree = distToRim > 6.75;


    if (!shotMade && prevBallY > rimY && basketball.position.y <= rimY) {
      console.log('[SHOT CHECK] rimDistNow:', rimDistNow, 'threshold:', madeThreshold, 'ballY:', basketball.position.y, 'prevY:', prevBallY, 'shotPower:', lastShotPower, 'sweet:', lastSweetStart, lastSweetEnd);
      if (rimDistNow < madeThreshold && lastShotPower >= lastSweetStart && lastShotPower <= lastSweetEnd) {
        shotMade = true;
        shotsMade++;
        // Determine which team gets the point
        const points = isThree ? 3 : 2;

        // Update 3PM
        threePM = isThree ? threePM + 1 : threePM;

        if (rimCenter.x < 0) {
          teamBScore += points;
        } else {
          teamAScore += points;
        }
        updateScoreHUD();
        showShotMadeMessage();
      }
    }
    if (basketball.position.y > rimY + 0.5) {
      shotMade = false;
    }
    prevBallY = basketball.position.y;
  }

  // --- Missed shot check: ball below rim after arc peak, not made ---
  const rimY = 3.05;
  if (shotPending && passedArcPeak && basketball.position.y < rimY && !shotMade) {
    showMissedShotMessage();
    shotPending = false;
    passedArcPeak = false;
    prevBallY = null;
  }

  // Update power gauge position/scale
  updatePowerIndicator();
  renderer.render(scene, camera);
}

animate();

// --- Particle effect for made shot ---
function triggerParticleEffect() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  // Set canvas size to window
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d');
  // Find rim position in 3D, project to screen
  const hoopPos = getNearestHoopPos();
  const rimWorld = hoopPos.clone();
  // Offset slightly downward for visual effect
  rimWorld.y -= 0.1;
  const rimScreen = rimWorld.project(camera);
  const x = (rimScreen.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-rimScreen.y * 0.5 + 0.5) * window.innerHeight;
  // Particle parameters
  const N = 36;
  const particles = [];
  for (let i = 0; i < N; ++i) {
    const angle = (2 * Math.PI * i) / N + Math.random() * 0.2;
    const speed = 180 + Math.random() * 80;
    const color = `hsl(${Math.floor(Math.random()*360)},90%,60%)`;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      alpha: 1
    });
  }
  let start = null;
  function animateParticles(ts) {
    if (!start) start = ts;
    const elapsed = (ts - start) / 1000;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      // Gravity and fade
      p.x += p.vx * 0.016;
      p.y += p.vy * 0.016;
      p.vy += 220 * 0.016;
      p.alpha = Math.max(0, 1 - elapsed * 1.2);
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 7, 0, 2 * Math.PI);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
    if (elapsed < 1) {
      requestAnimationFrame(animateParticles);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.display = 'none';
    }
  }
  requestAnimationFrame(animateParticles);
}