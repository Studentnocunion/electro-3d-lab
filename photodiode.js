
// ======================================
// PHOTODIODE 3D LABORATORY
// ======================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ======================================
// PHOTODIODE VIEWER
// ======================================

const container = document.getElementById('photodiode-viewer');

if (!container) {
    throw new Error('Photodiode viewer not found!');
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
controls.autoRotate = true;
controls.autoRotateSpeed = 1.2;

controls.target.set(0, 0, 0);
controls.update();

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
// PHOTODIODE MAIN BODY
// ======================================

const photodiode = new THREE.Group();

scene.add(photodiode);

// Main semiconductor body
const bodyGeometry = new THREE.CylinderGeometry(
    0.65,
    0.65,
    1.2,
    64
);

const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x263c63,
    metalness: 0.35,
    roughness: 0.3
});

const body = new THREE.Mesh(
    bodyGeometry,
    bodyMaterial
);

body.rotation.z = Math.PI / 2;

photodiode.add(body);

// ======================================
// PHOTODIODE LIGHT RECEIVING WINDOW
// ======================================

const windowGeometry = new THREE.CylinderGeometry(
    0.42,
    0.42,
    0.04,
    64
);

const windowMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x38c8ff,
    metalness: 0.1,
    roughness: 0.15,
    transparent: true,
    opacity: 0.8,
    transmission: 0.15
});

const lightWindow = new THREE.Mesh(
    windowGeometry,
    windowMaterial
);

lightWindow.rotation.z = Math.PI / 2;
lightWindow.position.x = 0.62;

photodiode.add(lightWindow);

// ======================================
// PHOTODIODE METALLIC TERMINALS
// ======================================

const terminalGeometry = new THREE.CylinderGeometry(
    0.09,
    0.09,
    0.9,
    32
);

const terminalMaterial = new THREE.MeshStandardMaterial({
    color: 0xc0c0c0,
    metalness: 0.9,
    roughness: 0.2
});

// Anode terminal
const anode = new THREE.Mesh(
    terminalGeometry,
    terminalMaterial
);

anode.rotation.z = Math.PI / 2;
anode.position.x = -1.0;

photodiode.add(anode);

// Cathode terminal
const cathode = new THREE.Mesh(
    terminalGeometry,
    terminalMaterial
);

cathode.rotation.z = Math.PI / 2;
cathode.position.x = 1.0;

photodiode.add(cathode);

// ======================================
// PHOTODIODE TERMINAL LABELS
// ======================================

function createPhotodiodeLabel(text, color) {

    const canvas = document.createElement('canvas');

    canvas.width = 512;
    canvas.height = 128;

    const context = canvas.getContext('2d');

    context.clearRect(0, 0, 512, 128);

    context.font = 'bold 65px Arial';
    context.fillStyle = color;
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

// Anode label
const anodeLabel = createPhotodiodeLabel(
    'ANODE (+)',
    '#ff5555'
);

anodeLabel.position.set(-1.3, 0.55, 0);

photodiode.add(anodeLabel);

// Cathode label
const cathodeLabel = createPhotodiodeLabel(
    'CATHODE (-)',
    '#55aaff'
);

cathodeLabel.position.set(1.3, 0.55, 0);

photodiode.add(cathodeLabel);

// ======================================
// PHOTODIODE 3D CONTROLS
// ======================================

const rotateButton = document.getElementById(
    'photodiode-rotate'
);

rotateButton.addEventListener('click', () => {

    controls.autoRotate = !controls.autoRotate;

    rotateButton.textContent = controls.autoRotate
        ? 'Pause Rotation'
        : 'Resume Rotation';

});

const resetButton = document.getElementById(
    'photodiode-reset'
);

resetButton.addEventListener('click', () => {

    photodiode.rotation.set(0, 0, 0);

    camera.position.set(0, 0, 5);

    controls.target.set(0, 0, 0);

    controls.update();

    controls.autoRotate = true;

    rotateButton.textContent = 'Pause Rotation';

});
[{
	"resource": "/c:/Users/Lenovo/Desktop/ELECTRO-3D-LAB/zener-diode.js",
	"owner": "typescript",
	"code": "2451",
	"severity": 8,
	"message": "Cannot redeclare block-scoped variable 'startCameraButton'.",
	"source": "ts",
	"startLineNumber": 291,
	"startColumn": 7,
	"endLineNumber": 291,
	"endColumn": 24,
	"modelVersionId": 2,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/Lenovo/Desktop/ELECTRO-3D-LAB/zener-diode.js",
	"owner": "typescript",
	"code": "2451",
	"severity": 8,
	"message": "Cannot redeclare block-scoped variable 'resetCameraButton'.",
	"source": "ts",
	"startLineNumber": 295,
	"startColumn": 7,
	"endLineNumber": 295,
	"endColumn": 24,
	"modelVersionId": 2,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/Lenovo/Desktop/ELECTRO-3D-LAB/zener-diode.js",
	"owner": "typescript",
	"code": "2451",
	"severity": 8,
	"message": "Cannot redeclare block-scoped variable 'cameraStatus'.",
	"source": "ts",
	"startLineNumber": 299,
	"startColumn": 7,
	"endLineNumber": 299,
	"endColumn": 19,
	"modelVersionId": 2,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/Lenovo/Desktop/ELECTRO-3D-LAB/zener-diode.js",
	"owner": "typescript",
	"code": "2451",
	"severity": 8,
	"message": "Cannot redeclare block-scoped variable 'cameraStream'.",
	"source": "ts",
	"startLineNumber": 303,
	"startColumn": 5,
	"endLineNumber": 303,
	"endColumn": 17,
	"modelVersionId": 2,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/Lenovo/Desktop/ELECTRO-3D-LAB/zener-diode.js",
	"owner": "typescript",
	"code": "2451",
	"severity": 8,
	"message": "Cannot redeclare block-scoped variable 'startCameraButton'.",
	"source": "ts",
	"startLineNumber": 499,
	"startColumn": 7,
	"endLineNumber": 499,
	"endColumn": 24,
	"modelVersionId": 2,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/Lenovo/Desktop/ELECTRO-3D-LAB/zener-diode.js",
	"owner": "typescript",
	"code": "2451",
	"severity": 8,
	"message": "Cannot redeclare block-scoped variable 'resetCameraButton'.",
	"source": "ts",
	"startLineNumber": 503,
	"startColumn": 7,
	"endLineNumber": 503,
	"endColumn": 24,
	"modelVersionId": 2,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/Lenovo/Desktop/ELECTRO-3D-LAB/zener-diode.js",
	"owner": "typescript",
	"code": "2451",
	"severity": 8,
	"message": "Cannot redeclare block-scoped variable 'cameraStatus'.",
	"source": "ts",
	"startLineNumber": 507,
	"startColumn": 7,
	"endLineNumber": 507,
	"endColumn": 19,
	"modelVersionId": 2,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/Lenovo/Desktop/ELECTRO-3D-LAB/zener-diode.js",
	"owner": "typescript",
	"code": "2451",
	"severity": 8,
	"message": "Cannot redeclare block-scoped variable 'cameraStream'.",
	"source": "ts",
	"startLineNumber": 511,
	"startColumn": 5,
	"endLineNumber": 511,
	"endColumn": 17,
	"modelVersionId": 2,
	"origin": "extHost1"
}]
// ======================================
// PHOTODIODE CAMERA AND AI HAND TRACKING
// ======================================

const cameraVideo = document.getElementById(
    'photodiode-camera-background'
);

const startCameraButton = document.getElementById(
    'photodiode-start-camera'
);

const resetCameraButton = document.getElementById(
    'photodiode-reset-camera'
);

const cameraStatus = document.getElementById(
    'photodiode-camera-status'
);

let cameraStream = null;
let photodiodeCamera = null;
// Camera background styling
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

const photodiodeHands = new Hands({
    locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

photodiodeHands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
});

// ======================================
// HAND GESTURE CONTROLS
// ======================================

photodiodeHands.onResults((results) => {

    if (
        results.multiHandLandmarks &&
        results.multiHandLandmarks.length > 0
    ) {

        const landmarks = results.multiHandLandmarks[0];

        // Hand position controls rotation
        const handX = landmarks[9].x;
        const handY = landmarks[9].y;

        photodiode.rotation.y = (0.5 - handX) * Math.PI * 2;
        photodiode.rotation.x = (handY - 0.5) * Math.PI;

        // Pinch controls zoom
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

        // Fist gesture resets the model
        const middleFolded = landmarks[12].y > landmarks[9].y;
        const indexFolded = landmarks[8].y > landmarks[5].y;
        const ringFolded = landmarks[16].y > landmarks[13].y;
        const pinkyFolded = landmarks[20].y > landmarks[17].y;

        if (
            middleFolded &&
            indexFolded &&
            ringFolded &&
            pinkyFolded
        ) {

            photodiode.rotation.set(0, 0, 0);

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

        photodiodeCamera = new Camera(cameraVideo, {

            onFrame: async () => {
                await photodiodeHands.send({
                    image: cameraVideo
                });
            },

            width: 640,
            height: 480

        });

        photodiodeCamera.start();

        cameraStatus.textContent = 'Camera is running';

        startCameraButton.textContent = 'Camera Started';

    } catch (error) {

        console.error('Photodiode Camera Error:', error);

        cameraStatus.textContent = 'Camera access failed';

    }

});

// ======================================
// RESET CAMERA
// ======================================

resetCameraButton.addEventListener('click', () => {

    if (photodiodeCamera) {
        photodiodeCamera.stop();
        photodiodeCamera = null;
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

/* PHOTODIODE QUIZ LOGIC */

const photodiodeQuiz = document.getElementById('photodiode-quiz-form');

if (photodiodeQuiz) {

    const photodiodeAnswers = {
        pq1: 'b',
        pq2: 'c',
        pq3: 'a',
        pq4: 'b',
        pq5: 'c'
    };

    const quizResult = document.getElementById('photodiode-quiz-result');

    photodiodeQuiz.addEventListener('submit', function(event) {
        event.preventDefault();

        let score = 0;
        let attempted = 0;

        for (const question in photodiodeAnswers) {
            const selected = photodiodeQuiz.querySelector(
                `input[name="${question}"]:checked`
            );

            if (selected) {
                attempted++;

                if (selected.value === photodiodeAnswers[question]) {
                    score++;
                }
            }
        }

        quizResult.textContent =
            `Your Score: ${score}/5 | Attempted: ${attempted}/5`;
    });

    photodiodeQuiz.addEventListener('reset', function() {
        quizResult.textContent = '';
    });
}

console.log('Photodiode 3D Laboratory Initialized');
