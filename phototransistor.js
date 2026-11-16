
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ======================================
// PHOTOTRANSISTOR VIEWER INITIALIZATION
// ======================================

const container = document.getElementById('phototransistor-viewer');

if (!container) {
    throw new Error('Phototransistor viewer not found!');
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

camera.position.set(0, 0, 6.5);

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

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.setClearColor(0x000000, 0);

container.appendChild(renderer.domElement);

// ======================================
// ORBIT CONTROLS
// ======================================

const controls = new OrbitControls(
    camera,
    renderer.domElement
);

controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.2;
controls.target.set(0, 0, 0);

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

directionalLight.position.set(3, 4, 5);
scene.add(directionalLight);

// ======================================
// PHOTOTRANSISTOR GROUP
// ======================================

const phototransistor = new THREE.Group();

scene.add(phototransistor);

/* ======================================
   PHOTOTRANSISTOR MAIN BODY
====================================== */

// Main semiconductor body
const bodyGeometry = new THREE.CylinderGeometry(
    0.65, 0.65, 1.2, 64
);

const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x123c75,
    metalness: 0.35,
    roughness: 0.4
});

const body = new THREE.Mesh(
    bodyGeometry,
    bodyMaterial
);

body.rotation.z = Math.PI / 2;

phototransistor.add(body);

// Light receiving window
const windowGeometry = new THREE.SphereGeometry(
    0.48, 48, 32,
    0, Math.PI * 2,
    0, Math.PI / 2
);

const windowMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.55,
    roughness: 0.15,
    metalness: 0.1,
    side: THREE.DoubleSide
});

const lightWindow = new THREE.Mesh(
    windowGeometry,
    windowMaterial
);

lightWindow.position.x = 0.58;
lightWindow.rotation.z = -Math.PI / 2;

phototransistor.add(lightWindow);


/* ======================================
   PHOTOTRANSISTOR TERMINALS
====================================== */

// Metallic terminal material
const terminalMaterial = new THREE.MeshStandardMaterial({
    color: 0xc0c8d5,
    metalness: 0.95,
    roughness: 0.2
});

// Create a terminal and its colored marker
function createPTTerminal(x, z, color, label) {

    // Long metallic pin
    const pinGeometry = new THREE.CylinderGeometry(
        0.065, 0.065, 1.1, 24
    );

    const pin = new THREE.Mesh(
        pinGeometry,
        terminalMaterial
    );

    // Pins extend downward from the body
    pin.position.set(x, -0.85, z);

    phototransistor.add(pin);

    // Colored marker at pin end
    const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 20, 20),
        new THREE.MeshStandardMaterial({ color: color })
    );

    marker.position.set(x, -1.4, z);
    phototransistor.add(marker);

    // Terminal label
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;

    const context = canvas.getContext('2d');

    context.fillStyle = '#ffffff';
    context.font = 'bold 48px Arial';
    context.textAlign = 'center';
    context.fillText(label, 256, 80);

    const texture = new THREE.CanvasTexture(canvas);

    const labelSprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
            map: texture,
            transparent: true
        })
    );

    labelSprite.position.set(x, -1.65, z);
    labelSprite.scale.set(0.9, 0.25, 1);

    phototransistor.add(labelSprite);
}

// Three terminals
createPTTerminal(-0.4, 0, 0xff4444, 'COLLECTOR');
createPTTerminal(0, 0, 0x3399ff, 'BASE');
createPTTerminal(0.4, 0, 0x33dd77, 'EMITTER');
/* Centre the complete model in the viewer */
phototransistor.position.y = 0.6;
controls.target.set(0, 0.6, 0);


console.log('Three Phototransistor Terminals Created');

/* ======================================
   ROTATION AND RESET CONTROLS
====================================== */

const rotateButton = document.getElementById(
    'phototransistor-rotate'
);

const resetButton = document.getElementById(
    'phototransistor-reset'
);

// Pause and resume rotation
rotateButton.addEventListener('click', () => {

    controls.autoRotate = !controls.autoRotate;

    rotateButton.textContent = controls.autoRotate
        ? 'Pause Rotation'
        : 'Resume Rotation';

});

// Reset model and camera
resetButton.addEventListener('click', () => {

    phototransistor.rotation.set(0, 0, 0);

    camera.position.set(0, 0.6, 6.5);

    controls.target.set(0, 0.6, 0);

    controls.autoRotate = true;

    rotateButton.textContent = 'Pause Rotation';

    controls.update();

});


/* ======================================
   PHOTOTRANSISTOR WEBCAM
====================================== */

const phototransistorVideo = document.getElementById(
    'phototransistor-camera-background'
);

const phototransistorStartCamera = document.getElementById(
    'phototransistor-start-camera'
);

const phototransistorResetCamera = document.getElementById(
    'phototransistor-reset-camera'
);

const phototransistorCameraStatus = document.getElementById(
    'phototransistor-camera-status'
);

let phototransistorCameraStream = null;

/* ======================================
   MEDIAPIPE HAND TRACKING INITIALIZATION
====================================== */

const phototransistorHands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});

phototransistorHands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
});


/* ======================================
   HAND CONTROL - MODEL ROTATION
====================================== */

let previousHandX = null;
let previousHandY = null;
let previousPinchDistance = null;
phototransistorHands.onResults((results) => {

    if (results.multiHandLandmarks &&
        results.multiHandLandmarks.length > 0) {

        phototransistorCameraStatus.textContent =
            'Hand Detected - Move Your Hand';

        const landmarks = results.multiHandLandmarks[0];

/* ======================================
   FIST GESTURE - RESET VIEW
====================================== */

// Check whether fingertips are folded
const fingerTips = [8, 12, 16, 20];
const fingerBases = [6, 10, 14, 18];

let foldedFingers = 0;

for (let i = 0; i < 4; i++) {

    if (
        landmarks[fingerTips[i]].y >
        landmarks[fingerBases[i]].y
    ) {
        foldedFingers++;
    }

}

// Four folded fingers indicate a fist
if (foldedFingers === 4) {

    phototransistor.rotation.set(0, 0, 0);

    camera.position.set(0, 0.6, 6.5);

    controls.target.set(0, 0.6, 0);

    controls.update();

    previousHandX = null;
    previousHandY = null;
    previousPinchDistance = null;

    phototransistorCameraStatus.textContent =
        'Fist Detected - View Reset';

    return;
}

// ======================================
// PINCH GESTURE - CAMERA ZOOM
// ======================================

// Thumb tip and index finger tip
const thumb = landmarks[4];
const indexFinger = landmarks[8];

// Calculate distance between fingertips
const pinchDistance = Math.hypot(
    thumb.x - indexFinger.x,
    thumb.y - indexFinger.y
);

// Apply zoom when fingers move
if (previousPinchDistance !== null) {

    const pinchMovement =
        pinchDistance - previousPinchDistance;

    camera.position.z -= pinchMovement * 8;

    // Limit zoom range
    camera.position.z = THREE.MathUtils.clamp(
        camera.position.z,
        3,
        9
    );

}

previousPinchDistance = pinchDistance;

        // Use landmark 9 (middle finger base)
        const handX = landmarks[9].x;
        const handY = landmarks[9].y;

        if (previousHandX !== null &&
            previousHandY !== null) {

            const movementX = handX - previousHandX;
            const movementY = handY - previousHandY;

            // Disable automatic rotation during hand control
            controls.autoRotate = false;

            // Rotate the 3D model
            phototransistor.rotation.y += movementX * 5;
            phototransistor.rotation.x += movementY * 5;
        }

        previousHandX = handX;
        previousHandY = handY;

    } else {

        phototransistorCameraStatus.textContent =
            'Camera Active - Show Your Hand';

        previousHandX = null;
        previousHandY = null;
    }

});


let phototransistorDetectionActive = false;


// Start webcam
phototransistorStartCamera.addEventListener('click', async () => {

    try {

        phototransistorCameraStream =
            await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });

        phototransistorVideo.srcObject =
            phototransistorCameraStream;

        await phototransistorVideo.play();

        // Start continuous AI hand detection
        phototransistorDetectionActive = true;

        async function detectPhototransistorHands() {

            if (!phototransistorDetectionActive) return;

            if (phototransistorVideo.readyState >= 2) {

                await phototransistorHands.send({
                    image: phototransistorVideo
                });

            }

            if (phototransistorDetectionActive) {
                requestAnimationFrame(detectPhototransistorHands);
            }

        }

        detectPhototransistorHands();

        phototransistorCameraStatus.textContent =
            'Camera Active';

    } catch (error) {

        console.error('Camera Error:', error);

        phototransistorCameraStatus.textContent =
            'Camera Access Failed';

    }

});

// Stop webcam
phototransistorResetCamera.addEventListener('click', () => {
phototransistorDetectionActive = false;
    if (phototransistorCameraStream) {

        phototransistorCameraStream
            .getTracks()
            .forEach(track => track.stop());

        phototransistorCameraStream = null;

    }

    phototransistorVideo.srcObject = null;

    phototransistorCameraStatus.textContent =
        'Camera Stopped';

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
// RESPONSIVE RESIZE
// ======================================

window.addEventListener('resize', () => {

    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);

});

// ======================================
// PHOTOTRANSISTOR KNOWLEDGE TEST
// ======================================

window.checkPhototransistorQuiz = function () {

    const answers = {
        ptq1: "b",
        ptq2: "c",
        ptq3: "a",
        ptq4: "b",
        ptq5: "c"
    };

    let score = 0;
    let attempted = 0;

    for (let question in answers) {

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

    const result = document.getElementById("pt-quiz-result");

    result.textContent =
        `Your Score: ${score}/5 | Attempted: ${attempted}/5`;

};

window.resetPhototransistorQuiz = function () {

    document.getElementById("pt-quiz").reset();

    document.getElementById("pt-quiz-result").textContent =
        "Your score will appear here.";

};

console.log('Phototransistor 3D Laboratory Initialized');
