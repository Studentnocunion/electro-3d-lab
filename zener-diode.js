
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ======================================
// ZENER DIODE VIEWER INITIALIZATION
// ======================================

const container = document.getElementById('zener-viewer');

if (!container) {
    throw new Error('Zener viewer not found!');
}

// ======================================
// SCENE
// ======================================

const scene = new THREE.Scene();
scene.background = null;

// ======================================
// CAMERA
// ======================================

const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
);

camera.position.set(0, 0, 5);

// ======================================
// RENDERER
// ======================================

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});

renderer.setSize(
    container.clientWidth,
    container.clientHeight
);

renderer.setPixelRatio(window.devicePixelRatio);

renderer.setClearColor(0x000000, 0);

container.appendChild(renderer.domElement);

// ======================================
// ORBIT CONTROLS
// ======================================

const controls = new OrbitControls(
    camera,
    renderer.domElement
);
controls.target.set(0, 0, 0);
controls.update();
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.2;

// ======================================
// LIGHTING
// ======================================

const ambientLight = new THREE.AmbientLight(
    0xffffff,
    1.5
);

scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(
    0xffffff,
    2
);

directionalLight.position.set(5, 5, 5);

scene.add(directionalLight);

// ======================================
// ZENER DIODE 3D MODEL
// ======================================

const zener = new THREE.Group();

scene.add(zener);

// DIODE BODY

const bodyGeometry = new THREE.CylinderGeometry(
    0.38,
    0.38,
    1.5,
    48
);

const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x263b59,
    metalness: 0.45,
    roughness: 0.3
});

const diodeBody = new THREE.Mesh(
    bodyGeometry,
    bodyMaterial
);

// Rotate body horizontally

diodeBody.rotation.z = Math.PI / 2;

zener.add(diodeBody);

// BODY HIGHLIGHT

const highlightGeometry = new THREE.CylinderGeometry(
    0.385,
    0.385,
    0.08,
    48
);

const highlightMaterial = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    metalness: 0.5,
    roughness: 0.25
});

const highlight = new THREE.Mesh(
    highlightGeometry,
    highlightMaterial
);

highlight.rotation.z = Math.PI / 2;
highlight.position.x = 0.35;

zener.add(highlight);

// ======================================
// ZENER DIODE METALLIC TERMINALS
// ======================================

const terminalGeometry = new THREE.CylinderGeometry(
    0.09,
    0.09,
    1.1,
    24
);

const terminalMaterial = new THREE.MeshStandardMaterial({
    color: 0xd1d5db,
    metalness: 0.85,
    roughness: 0.2
});

// ANODE TERMINAL

const anode = new THREE.Mesh(
    terminalGeometry,
    terminalMaterial
);

anode.rotation.z = Math.PI / 2;
anode.position.x = -1.25;

zener.add(anode);

// CATHODE TERMINAL

const cathode = new THREE.Mesh(
    terminalGeometry,
    terminalMaterial
);

cathode.rotation.z = Math.PI / 2;
cathode.position.x = 1.25;

zener.add(cathode);

// ======================================
// ZENER DIODE TERMINAL LABELS
// ======================================

function createZenerLabel(text, color) {

    const canvas = document.createElement('canvas');

    canvas.width = 512;
    canvas.height = 128;

    const context = canvas.getContext('2d');

    context.fillStyle = color;
    context.font = 'bold 65px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    context.fillText(text, 256, 64);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
    });

    const sprite = new THREE.Sprite(material);

    sprite.scale.set(1.3, 0.35, 1);

    return sprite;
}

// ANODE LABEL

const anodeLabel = createZenerLabel(
    'ANODE (+)',
    '#38bdf8'
);

anodeLabel.position.set(-1.3, 0.55, 0);

zener.add(anodeLabel);

// CATHODE LABEL

const cathodeLabel = createZenerLabel(
    'CATHODE (-)',
    '#facc15'
);

cathodeLabel.position.set(1.3, 0.55, 0);

zener.add(cathodeLabel);

// ======================================
// ZENER DIODE VIEW CONTROLS
// ======================================

// PAUSE / RESUME ROTATION

const rotateButton = document.getElementById('zener-rotate');

rotateButton.addEventListener('click', () => {

    controls.autoRotate = !controls.autoRotate;

    rotateButton.textContent = controls.autoRotate
        ? 'Pause Rotation'
        : 'Resume Rotation';

});

// RESET 3D VIEW

const resetButton = document.getElementById('zener-reset');

resetButton.addEventListener('click', () => {

    zener.rotation.set(0, 0, 0);

    camera.position.set(0, 0, 5);

    controls.target.set(0, 0, 0);

    controls.update();

    controls.autoRotate = true;

    rotateButton.textContent = 'Pause Rotation';

});

// ======================================
// ZENER DIODE CAMERA INITIALIZATION
// ======================================

const cameraVideo = document.getElementById(
    'zener-camera-background'
);

const startCameraButton = document.getElementById(
    'zener-start-camera'
);

const resetCameraButton = document.getElementById(
    'zener-reset-camera'
);

const cameraStatus = document.getElementById(
    'zener-camera-status'
);

let cameraStream = null;
let zenerCamera = null;

// ======================================
// CAMERA AND 3D VIEWER LAYOUT
// ======================================

container.style.position = 'relative';
container.style.overflow = 'hidden';

cameraVideo.style.position = 'absolute';
cameraVideo.style.top = '0';
cameraVideo.style.left = '0';
cameraVideo.style.width = '100%';
cameraVideo.style.height = '100%';
cameraVideo.style.objectFit = 'cover';
cameraVideo.style.opacity = '0';
cameraVideo.style.zIndex = '0';

renderer.domElement.style.position = 'relative';
renderer.domElement.style.zIndex = '1';

// ======================================
// MEDIAPIPE HAND DETECTOR
// ======================================

const zenerHands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});

zenerHands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
});



zenerHands.onResults((results) => {

    if (
        results.multiHandLandmarks &&
        results.multiHandLandmarks.length > 0
    ) {

        const landmarks = results.multiHandLandmarks[0];

        const handX = landmarks[9].x;
        const handY = landmarks[9].y;

        // HAND CONTROLLED ROTATION

        zener.rotation.y = (0.5 - handX) * Math.PI * 2;

        zener.rotation.x = (handY - 0.5) * Math.PI;

        // PINCH ZOOM

        const thumb = landmarks[4];
        const indexFinger = landmarks[8];

        const pinchDistance = Math.sqrt(
            Math.pow(thumb.x - indexFinger.x, 2) +
            Math.pow(thumb.y - indexFinger.y, 2)
        );

        camera.position.z = THREE.MathUtils.clamp(
            3 + pinchDistance * 12,
            3,
            8
        );

        // FIST RESET

        const middleFingerFolded =
            landmarks[12].y > landmarks[9].y;

        const indexFolded =
            landmarks[8].y > landmarks[5].y;

        const ringFolded =
            landmarks[16].y > landmarks[13].y;

        const pinkyFolded =
            landmarks[20].y > landmarks[17].y;

        if (
            middleFingerFolded &&
            indexFolded &&
            ringFolded &&
            pinkyFolded
        ) {

            zener.rotation.set(0, 0, 0);

          camera.position.set(0, 0, 5);

            controls.target.set(0, 0, 0);

            controls.update();

        }

        cameraStatus.textContent = 'AI: Hand detected';

    } else {

        cameraStatus.textContent = 'AI: Searching for hand...';

    }

});


// ======================================
// START CAMERA
// ======================================

startCameraButton.addEventListener('click', async () => {

    try {

        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        cameraVideo.srcObject = cameraStream;

        await cameraVideo.play();

        cameraVideo.style.opacity = '0.65';

        zenerCamera = new Camera(cameraVideo, {
            onFrame: async () => {
                await zenerHands.send({
                    image: cameraVideo
                });
            },
            width: 640,
            height: 480
        });

        zenerCamera.start();

        cameraStatus.textContent = 'Camera is running';

        startCameraButton.textContent = 'Camera Started';

    } catch (error) {

        console.error('Zener Camera Error:', error);

        cameraStatus.textContent = 'Camera access failed';

    }

});

// ======================================
// RESET CAMERA
// ======================================

resetCameraButton.addEventListener('click', () => {

    if (zenerCamera) {
        zenerCamera.stop();
        zenerCamera = null;
    }

    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }

    cameraVideo.srcObject = null;

    cameraVideo.style.opacity = '0';

    cameraStatus.textContent = 'Camera is not started';

    startCameraButton.textContent = 'Start Camera';

});

// ======================================
// ANIMATION
// ======================================

function animate() {

    requestAnimationFrame(animate);

    controls.update();

    renderer.render(scene, camera);

}

animate();

// ======================================
// RESPONSIVE VIEWER
// ======================================

window.addEventListener('resize', () => {

    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;

    camera.updateProjectionMatrix();

    renderer.setSize(width, height);

});

// ======================================
// ZENER VOLTAGE REGULATOR CALCULATOR
// ======================================

window.calculateZener = function() {

    const Vin = Number(
        document.getElementById('zener-vin').value
    );

    const Vz = Number(
        document.getElementById('zener-vz').value
    );

    const Rs = Number(
        document.getElementById('zener-rs').value
    );

    const RL = Number(
        document.getElementById('zener-rl').value
    );

    const result = document.getElementById(
        'zener-calculator-result'
    );

    if (
        !Number.isFinite(Vin) ||
        !Number.isFinite(Vz) ||
        !Number.isFinite(Rs) ||
        !Number.isFinite(RL) ||
        Vin <= 0 || Vz <= 0 ||
        Rs <= 0 || RL <= 0
    ) {
        result.innerHTML = '<p>Please enter valid positive values.</p>';
        return;
    }

    if (Vin <= Vz) {
        result.innerHTML =
            '<p>Input voltage must be greater than Zener voltage for this regulator calculation.</p>';
        return;
    }

    const seriesCurrent = (Vin - Vz) / Rs * 1000;

    const loadCurrent = Vz / RL * 1000;

    const zenerCurrent = seriesCurrent - loadCurrent;

    if (zenerCurrent <= 0) {
        result.innerHTML =
            '<p>The Zener is not in breakdown under these ideal assumptions. Increase input voltage or reduce load current.</p>';
        return;
    }

    const zenerPower = Vz * zenerCurrent / 1000;

    result.innerHTML = `
        <h3>Calculation Results</h3>

        <p>Series Current: ${seriesCurrent.toFixed(2)} mA</p>

        <p>Load Current: ${loadCurrent.toFixed(2)} mA</p>

        <p>Zener Current: ${zenerCurrent.toFixed(2)} mA</p>

        <p>Zener Power: ${zenerPower.toFixed(3)} W</p>

        <p>Output Voltage: ${Vz.toFixed(2)} V</p>

        <p>Ideal calculation assumes the Zener is regulating.
        Check its current and power ratings before using a real circuit.</p>
    `;

};

// ======================================
// ZENER DIODE KNOWLEDGE TEST
// ======================================

window.checkZenerQuiz = function() {

    const answers = {
        zq1: 'b',
        zq2: 'a',
        zq3: 'c',
        zq4: 'a',
        zq5: 'b'
    };

    let score = 0;
    let attempted = 0;

    for (const question in answers) {

        const selected = document.querySelector(
            `input[name="${question}"]:checked`
        );

        if (selected) {
            attempted++;

            if (selected.value === answers[question]) {
                score++;
            }
        }
    }

    const result = document.getElementById(
        'zener-quiz-result'
    );

    result.innerHTML = `
        <h3>Test Result</h3>
        <p>Questions Attempted: ${attempted}/5</p>
        <p>Correct Answers: ${score}/5</p>
        <p>Incorrect Answers: ${attempted - score}</p>
        <h2>Your Score: ${score * 2}/10</h2>
        <p>${score === 5 ? 'Excellent! Perfect score!' :
             score >= 3 ? 'Good work! Keep practising.' :
             'Revise the topic and try again.'}</p>
    `;

};

window.resetZenerQuiz = function() {

    document.getElementById('zener-quiz').reset();

    document.getElementById(
        'zener-quiz-result'
    ).innerHTML = '';

};

console.log('Zener Diode 3D viewer initialized!');
