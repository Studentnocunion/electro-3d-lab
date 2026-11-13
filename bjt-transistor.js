
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// ========================================
// BJT CAMERA AND GESTURE ELEMENTS
// ========================================

const bjtCameraButton = document.getElementById('start-camera');
const bjtResetCameraButton = document.getElementById('reset-camera');
const bjtCameraStatus = document.getElementById('camera-status');
const bjtCameraVideo = document.getElementById('bjt-camera-background');

let bjtWebcamStream = null;
let bjtDetectionRunning = false;
let bjtHandIsControlling = false;

// ========================================
// MEDIAPIPE HAND DETECTION
// ========================================

const bjtHands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});

bjtHands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
});

// ========================================
// BJT HAND GESTURE CONTROL
// ========================================

bjtHands.onResults(function (results) {

    if (
        results.multiHandLandmarks &&
        results.multiHandLandmarks.length > 0
    ) {

        const landmarks = results.multiHandLandmarks[0];

// Detect a closed fist
const fingerTips = [8, 12, 16, 20];
const fingerPips = [6, 10, 14, 18];

let foldedFingers = 0;

for (let i = 0; i < fingerTips.length; i++) {
    if (landmarks[fingerTips[i]].y > landmarks[fingerPips[i]].y) {
        foldedFingers++;
    }
}

const isFist = foldedFingers === 4;

// Reset the BJT model when a fist is detected
if (isFist) {

    transistor.rotation.set(0, 0, 0);

    camera.position.set(4, 3, 5);
    controls.target.set(0, 0.3, 0);

    controls.update();

    bjtHandIsControlling = false;

    bjtCameraStatus.textContent =
        "Fist detected – BJT view reset!";

    return;
}

        const handX = landmarks[9].x;
        const handY = landmarks[9].y;

        // Rotate the BJT model
       transistor.rotation.y = (0.5 - handX) * 4;
transistor.rotation.x = (0.5 - handY) * 2;

        // Pinch detection
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];

        const pinchDistance = Math.sqrt(
            Math.pow(thumbTip.x - indexTip.x, 2) +
            Math.pow(thumbTip.y - indexTip.y, 2)
        );

        // Control camera zoom
        const targetZoom = THREE.MathUtils.mapLinear(
            THREE.MathUtils.clamp(pinchDistance, 0.025, 0.20),
            0.025,
            0.20,
            3,
            8
        );

        camera.position.z +=
    (targetZoom - camera.position.z) * 0.12;
        bjtHandIsControlling = true;

        bjtCameraStatus.textContent =
            "Hand detected – BJT gesture control active!";

    } else {

        bjtHandIsControlling = false;

        bjtCameraStatus.textContent =
            "Camera active – Show your hand.";

    }

});

// ========================================
// BJT WEBCAM ACTIVATION
// ========================================

bjtCameraButton.addEventListener('click', async function () {

    if (bjtWebcamStream) return;

    try {

        bjtCameraStatus.textContent =
            'Requesting camera permission...';

        bjtCameraButton.disabled = true;

        bjtWebcamStream =
            await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: false
            });

        bjtCameraVideo.srcObject = bjtWebcamStream;

        await bjtCameraVideo.play();

        bjtCameraVideo.style.opacity = '0.65';

        bjtCameraStatus.textContent =
            'Camera connected. Detecting hands...';

        bjtCameraButton.textContent = 'Camera Started';

        if (!bjtDetectionRunning) {
            bjtDetectionRunning = true;
            detectBjtHands();
        }

        console.log('BJT webcam activated successfully!');

    } catch (error) {

        bjtWebcamStream = null;

        bjtCameraButton.disabled = false;
        bjtCameraButton.textContent = 'Start Camera';

        bjtCameraStatus.textContent =
            'Camera failed. Check permission and try again.';

        console.error('BJT webcam error:', error);

    }

});

// ========================================
// RESET CAMERA
// ========================================

bjtResetCameraButton.addEventListener('click', function () {

    // Stop webcam tracks
    if (bjtWebcamStream) {
        bjtWebcamStream.getTracks().forEach(track => track.stop());
        bjtWebcamStream = null;
    }

    // Clear video
    bjtCameraVideo.srcObject = null;
    bjtCameraVideo.style.opacity = '0';

    // Reset camera controls
    bjtDetectionRunning = false;
    bjtHandIsControlling = false;

    // Reset buttons and status
    bjtCameraButton.disabled = false;
    bjtCameraButton.textContent = 'Start Camera';

    bjtCameraStatus.textContent = 'Camera is not started';

    console.log('BJT camera reset successfully!');

});

// Process webcam frames
async function detectBjtHands() {

    if (
        !bjtWebcamStream ||
        bjtCameraVideo.paused ||
        bjtCameraVideo.readyState < 2
    ) {
        requestAnimationFrame(detectBjtHands);
        return;
    }

    try {
        await bjtHands.send({
            image: bjtCameraVideo
        });
    } catch (error) {
        console.error('BJT hand detection error:', error);
    }

    requestAnimationFrame(detectBjtHands);
}

// ELECTRO-3D LAB - NPN BJT TRANSISTOR

const container = document.getElementById('bjt-viewer');

if (!container) {
    throw new Error('3D viewer container not found!');
}

// Scene
const scene = new THREE.Scene();
scene.background = null;

// Camera
const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    100
);

camera.position.set(4, 3, 5);
camera.lookAt(0, 0.3, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});

renderer.setClearColor(0x000000, 0);

renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

container.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(4, 6, 5);
scene.add(directionalLight);

// Transistor group
const transistor = new THREE.Group();
scene.add(transistor);

// Materials
const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x17191f,
    roughness: 0.3,
    metalness: 0.15
});

const metalMaterial = new THREE.MeshStandardMaterial({
    color: 0xbfc7d5,
    metalness: 0.85,
    roughness: 0.25
});

// Rounded transistor body
const bodyPoints = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.45, 0),
    new THREE.Vector2(0.62, 0.08),
    new THREE.Vector2(0.68, 0.22),
    new THREE.Vector2(0.68, 1.05),
    new THREE.Vector2(0.62, 1.25),
    new THREE.Vector2(0.45, 1.42),
    new THREE.Vector2(0, 1.45)
];

const bodyGeometry = new THREE.LatheGeometry(bodyPoints, 48);

const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
body.position.y = 0.35;
body.castShadow = true;
body.receiveShadow = true;

transistor.add(body);

// Small flat front marker
const markerGeometry = new THREE.BoxGeometry(0.12, 0.7, 0.035);

const markerMaterial = new THREE.MeshStandardMaterial({
    color: 0x333943
});

const marker = new THREE.Mesh(markerGeometry, markerMaterial);
marker.position.set(0, 0.95, 0.665);

transistor.add(marker);

// Transistor terminal pins
function createPin(x, color) {

    const pinMaterial = new THREE.MeshStandardMaterial({
        color: 0xbfc7d5,
        metalness: 0.9,
        roughness: 0.2
    });

    const pinGeometry = new THREE.CylinderGeometry(
        0.045,
        0.045,
        1.15,
        16
    );

    const pin = new THREE.Mesh(pinGeometry, pinMaterial);

    pin.position.set(x, -0.42, 0);
    pin.castShadow = true;

    transistor.add(pin);

    // Colored terminal marker
    const markerGeometry = new THREE.SphereGeometry(0.085, 20, 20);

    const terminalMarker = new THREE.Mesh(
        markerGeometry,
        new THREE.MeshStandardMaterial({ color })
    );

    terminalMarker.position.set(x, -1.02, 0);

    transistor.add(terminalMarker);
}

// Three pins
createPin(-0.45, 0xff4545); // Collector
createPin(0, 0x42a5ff);     // Base
createPin(0.45, 0x43e28b);  // Emitter
// Terminal labels
function createLabel(text, color, x) {

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;

    const context = canvas.getContext('2d');

    context.fillStyle = color;
    context.font = 'bold 54px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    context.fillText(text, 128, 64);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
    });

    const label = new THREE.Sprite(material);

    label.position.set(x, -1.35, 0.2);
    label.scale.set(0.65, 0.32, 1);

    transistor.add(label);
}

createLabel('C - Collector', '#ff4545', -0.65);
createLabel('B - Base', '#42a5ff', 0);
createLabel('E - Emitter', '#43e28b', 0.65);

// Ground platform
const platformGeometry = new THREE.CylinderGeometry(
    1.2,
    1.2,
    0.08,
    48
);

const platformMaterial = new THREE.MeshStandardMaterial({
    color: 0x26354b,
    metalness: 0.4,
    roughness: 0.6
});

const platform = new THREE.Mesh(
    platformGeometry,
    platformMaterial
);

platform.position.y = -1.15;
transistor.add(platform);

// Position the complete model
transistor.position.y = 0.1;

// Mouse controls
const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 2.5;
controls.maxDistance = 10;

// Rotation control
let autoRotate = true;

const rotateButton = document.getElementById('rotate-btn');
const resetButton = document.getElementById('reset-btn');

rotateButton.addEventListener('click', () => {

    autoRotate = !autoRotate;

    rotateButton.textContent = autoRotate
        ? 'Pause Rotation'
        : 'Resume Rotation';
});

// Reset camera and model
resetButton.addEventListener('click', () => {

    camera.position.set(4, 3, 5);
    controls.target.set(0, 0.3, 0);

    transistor.rotation.set(0, 0, 0);

    controls.update();
});


// ========================================
// BJT ANIMATION WITH HAND GESTURE SUPPORT
// ========================================

function animate() {

    requestAnimationFrame(animate);

    // Automatic rotation only when hand is not controlling
    if (autoRotate && !bjtHandIsControlling) {
        transistor.rotation.y += 0.005;
    }

    // Update mouse controls
    controls.update();

    // Render the transistor
    renderer.render(scene, camera);
}

animate();

    
  
    // Electron movement controls

    const electronStartButton =
        document.getElementById('electron-start');

    const electronPauseButton =
        document.getElementById('electron-pause');

    const electronResetButton =
        document.getElementById('electron-reset');

    electronStartButton?.addEventListener('click', () => {
        window.electronRunning = true;
    electronPauseButton.textContent = 'Pause Electrons';
    });

   electronPauseButton?.addEventListener('click', () => {

    window.electronRunning = !window.electronRunning;

    electronPauseButton.textContent =
        window.electronRunning
            ? 'Pause Electrons'
            : 'Resume Electrons';

});

electronResetButton?.addEventListener('click', () => {

    window.electronRunning = false;
    window.electronProgress = 0;

});

// Responsive viewer
window.addEventListener('resize', () => {

    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
});

// Interactive terminal information

const terminalInfo = document.getElementById('terminal-info');

const terminalDetails = {
    collector: {
        title: 'Collector (C)',
        description: 'The collector collects charge carriers and allows conventional current to flow out of the transistor in normal NPN active operation.'
    },

    base: {
        title: 'Base (B)',
        description: 'The base is a thin, lightly doped middle region. A small base current controls a much larger collector current.'
    },

    emitter: {
        title: 'Emitter (E)',
        description: 'The emitter is heavily doped and injects electrons into the base region of an NPN transistor.'
    }
};

document.querySelectorAll('[data-terminal]').forEach(button => {

    button.addEventListener('click', () => {

        const selectedTerminal = button.dataset.terminal;
        const details = terminalDetails[selectedTerminal];

        terminalInfo.innerHTML = `
            <h3>${details.title}</h3>
            <p>${details.description}</p>
        `;

    });

});

// Transistor operating modes

const modeInfo = document.getElementById('mode-info');

const operatingModes = {

    cutoff: {
        title: 'Cut-off Mode — Transistor OFF',
        description: 'The base-emitter junction is not sufficiently forward biased. Collector current is approximately zero. Both junctions are reverse biased in the ideal cut-off condition.'
    },

    active: {
        title: 'Forward-Active Mode — Amplifier',
        description: 'The base-emitter junction is forward biased and the base-collector junction is reverse biased. A small base current controls a larger collector current.'
    },

    saturation: {
        title: 'Saturation Mode — Transistor ON',
        description: 'Both base-emitter and base-collector junctions are forward biased. The transistor conducts strongly and the collector-emitter voltage becomes low.'
    }

};

document.querySelectorAll('.mode-btn').forEach(button => {

    button.addEventListener('click', () => {

        const selectedMode = button.dataset.mode;
        const details = operatingModes[selectedMode];

        modeInfo.innerHTML = `
            <h3>${details.title}</h3>
            <p>${details.description}</p>
        `;

    });

});

// Current flow simulation controls

const flowParticles = document.querySelectorAll('.flow-particle');

const flowStart = document.getElementById('flow-start');
const flowPause = document.getElementById('flow-pause');
const flowReset = document.getElementById('flow-reset');
const flowStatus = document.getElementById('flow-status');

// Start simulation
flowStart.addEventListener('click', () => {

    flowParticles.forEach(particle => {
        particle.style.animationPlayState = 'running';
    });

    flowStatus.textContent = 'Simulation running: Current flow is active.';

});

// Pause simulation
flowPause.addEventListener('click', () => {

    flowParticles.forEach(particle => {
        particle.style.animationPlayState = 'paused';
    });

    flowStatus.textContent = 'Simulation paused.';

});

// Reset simulation
flowReset.addEventListener('click', () => {

    flowParticles.forEach(particle => {

        particle.style.animationPlayState = 'paused';
        particle.style.animation = 'none';

        // Restart animation from its initial position
        void particle.offsetWidth;

        particle.style.animation = '';

    });

    flowStatus.textContent = 'Simulation reset. Press Start to begin again.';

});

// BJT Current Calculator

const baseCurrent = document.getElementById('base-current');
const currentGain = document.getElementById('current-gain');

const ibValue = document.getElementById('ib-value');
const betaValue = document.getElementById('beta-value');
const icResult = document.getElementById('ic-result');

function calculateCollectorCurrent() {

    const ib = Number(baseCurrent.value);
    const beta = Number(currentGain.value);

    // IC = beta × IB
    // IB is in microamperes; convert IC to milliamperes.
    const ic = (ib * beta) / 1000;

    ibValue.textContent = ib + ' µA';
    betaValue.textContent = beta;

    icResult.textContent = ic.toFixed(2) + ' mA';
}

// Update when base current changes
baseCurrent.addEventListener('input', calculateCollectorCurrent);

// Update when current gain changes
currentGain.addEventListener('input', calculateCollectorCurrent);

// Initial calculation
calculateCollectorCurrent();

// Common Emitter Voltage Simulator

const vccSlider = document.getElementById('vcc-slider');
const rcSlider = document.getElementById('rc-slider');

const vccValue = document.getElementById('vcc-value');
const rcValue = document.getElementById('rc-value');

const vceResult = document.getElementById('vce-result');
const operatingState = document.getElementById('operating-state');
const voltageExplanation = document.getElementById('voltage-explanation');

function calculateTransistorVoltage() {

    const vcc = Number(vccSlider.value);
    const rc = Number(rcSlider.value);

    const ib = Number(baseCurrent.value);
    const beta = Number(currentGain.value);

    // Ideal collector current in mA
    const idealIc = (ib * beta) / 1000;

    // Maximum load current at approximately 0.2 V saturation
    const maximumIc = (vcc - 0.2) / rc;

    let vce;
    let state;
    let explanation;

    if (ib === 0) {

        vce = vcc;
        state = 'Cut-off';
        explanation = 'Base current is zero. The transistor is OFF and collector current is approximately zero.';

    } else if (idealIc >= maximumIc) {

        vce = 0.2;
        state = 'Saturation';
        explanation = 'The transistor is fully ON. The collector current is limited by the external supply and collector resistance.';

    } else {

        vce = vcc - (idealIc * rc);
        state = 'Forward Active';
        explanation = 'The transistor operates as an amplifier. Base current controls collector current.';

    }

    vccValue.textContent = vcc + ' V';
    rcValue.textContent = rc + ' kΩ';

    vceResult.textContent = vce.toFixed(2) + ' V';
    operatingState.textContent = state;
    voltageExplanation.textContent = explanation;
}

// Update when any simulator input changes
vccSlider.addEventListener('input', calculateTransistorVoltage);
rcSlider.addEventListener('input', calculateTransistorVoltage);

baseCurrent.addEventListener('input', calculateTransistorVoltage);
currentGain.addEventListener('input', calculateTransistorVoltage);

// Initial calculation
calculateTransistorVoltage();

// NPN BJT Knowledge Quiz

const correctAnswers = {
    q1: 'b',
    q2: 'a',
    q3: 'c',
    q4: 'a',
    q5: 'b'
};

const submitQuiz = document.getElementById('submit-quiz');
const resetQuiz = document.getElementById('reset-quiz');
const quizResult = document.getElementById('quiz-result');

submitQuiz.addEventListener('click', () => {

    let score = 0;
    let attempted = 0;

    for (const question in correctAnswers) {

        const selected = document.querySelector(
            `input[name="${question}"]:checked`
        );

        if (selected) {
            attempted++;

            if (selected.value === correctAnswers[question]) {
                score++;
            }
        }
    }

    quizResult.innerHTML = `
        <h3>Quiz Result</h3>
        <h2>${score} / 5</h2>
        <p>Correct answers: ${score}</p>
        <p>Attempted questions: ${attempted} / 5</p>
        <p>${score >= 4
            ? 'Excellent work! You understand NPN BJT fundamentals.'
            : 'Good attempt! Review the concepts and try again.'}
        </p>
    `;

});

resetQuiz.addEventListener('click', () => {

    document.querySelectorAll(
        '#bjt-quiz input[type="radio"]'
    ).forEach(input => {
        input.checked = false;
    });

    quizResult.innerHTML = `
        <h3>Your result will appear here.</h3>
    `;

});

// ======================================
// INTERNAL NPN SEMICONDUCTOR STRUCTURE
// ======================================

(function createInternalBjtViewer() {

    const container = document.getElementById('internal-bjt-viewer');
// Internal BJT camera elements
const internalStartCameraButton =
    document.getElementById('internal-start-camera');

const internalResetCameraButton =
    document.getElementById('internal-reset-camera');

const internalCameraStatus =
    document.getElementById('internal-camera-status');

const internalCameraVideo =
    document.getElementById('internal-camera-background');

let internalWebcamStream = null;
let internalDetectionRunning = false;
let internalHandIsControlling = false;
// Separate MediaPipe detector for internal viewer
const internalHands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});

internalHands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
});

// Internal viewer gesture controls
internalHands.onResults(function (results) {

    if (
        results.multiHandLandmarks &&
        results.multiHandLandmarks.length > 0
    ) {

        const landmarks = results.multiHandLandmarks[0];

        // Detect fist
        const tips = [8, 12, 16, 20];
        const pips = [6, 10, 14, 18];

        let folded = 0;

        for (let i = 0; i < tips.length; i++) {
            if (landmarks[tips[i]].y > landmarks[pips[i]].y) {
                folded++;
            }
        }

        if (folded === 4) {
            internalScene.rotation.set(0, 0, 0);
            internalCamera.position.set(3.5, 2.8, 4.5);
            internalControls.target.set(0, 0, 0);
            internalControls.update();

            internalHandIsControlling = false;
            internalCameraStatus.textContent =
                'Fist detected – Internal view reset!';
            return;
        }

        // Hand movement controls rotation
        internalScene.rotation.y =
            (0.5 - landmarks[9].x) * 4;

        internalScene.rotation.x =
            (0.5 - landmarks[9].y) * 2;

        // Pinch controls zoom
        const thumb = landmarks[4];
        const index = landmarks[8];

        const distance = Math.sqrt(
            Math.pow(thumb.x - index.x, 2) +
            Math.pow(thumb.y - index.y, 2)
        );

        const targetZoom = THREE.MathUtils.mapLinear(
            THREE.MathUtils.clamp(distance, 0.025, 0.20),
            0.025,
            0.20,
            3,
            8
        );

        internalCamera.position.z +=
            (targetZoom - internalCamera.position.z) * 0.12;

        internalHandIsControlling = true;

        internalCameraStatus.textContent =
            'Hand detected – Internal gesture control active!';

    } else {

        internalHandIsControlling = false;

        internalCameraStatus.textContent =
            'Camera active – Show your hand.';

    }

});
    if (!container) return;

  const internalScene = new THREE.Scene();
internalScene.background = null;
    const internalCamera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        100
    );

    internalCamera.position.set(3.5, 2.8, 4.5);

   const internalRenderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});

internalRenderer.setClearColor(0x000000, 0);
    internalRenderer.setSize(
        container.clientWidth,
        container.clientHeight
    );

    internalRenderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    container.appendChild(internalRenderer.domElement);

    const internalControls = new OrbitControls(
        internalCamera,
        internalRenderer.domElement
    );

    internalControls.enableDamping = true;
    internalControls.autoRotate = true;
    internalControls.autoRotateSpeed = 1.2;
    let internalAutoRotate = true;
// ======================================
// INTERNAL VIEWER CAMERA ACTIVATION
// ======================================

internalStartCameraButton.addEventListener('click', async function () {

    if (internalWebcamStream) return;

    try {

        internalCameraStatus.textContent =
            'Requesting camera permission...';

        internalStartCameraButton.disabled = true;

        internalWebcamStream =
            await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: false
            });

        internalCameraVideo.srcObject = internalWebcamStream;

        await internalCameraVideo.play();

        internalCameraVideo.style.opacity = '0.65';

        internalCameraStatus.textContent =
            'Camera connected. Detecting hands...';

        internalStartCameraButton.textContent = 'Camera Started';

        internalDetectionRunning = true;
        detectInternalHands();

    } catch (error) {

        internalWebcamStream = null;

        internalStartCameraButton.disabled = false;
        internalStartCameraButton.textContent = 'Start Camera';

        internalCameraStatus.textContent =
            'Camera failed. Check permission and try again.';

        console.error('Internal camera error:', error);

    }

});

// ======================================
// INTERNAL VIEWER CAMERA RESET
// ======================================

internalResetCameraButton.addEventListener('click', function () {

    internalDetectionRunning = false;

    if (internalWebcamStream) {
        internalWebcamStream.getTracks().forEach(track => track.stop());
        internalWebcamStream = null;
    }

    internalCameraVideo.srcObject = null;
    internalCameraVideo.style.opacity = '0';

    internalHandIsControlling = false;

    internalStartCameraButton.disabled = false;
    internalStartCameraButton.textContent = 'Start Camera';

    internalCameraStatus.textContent = 'Camera is not started';

});

// Process internal viewer webcam frames
async function detectInternalHands() {

    if (!internalWebcamStream || !internalDetectionRunning) {
        return;
    }

    if (
        !internalCameraVideo.paused &&
        internalCameraVideo.readyState >= 2
    ) {
        try {
            await internalHands.send({
                image: internalCameraVideo
            });
        } catch (error) {
            console.error('Internal hand detection error:', error);
        }
    }

    if (internalWebcamStream && internalDetectionRunning) {
        requestAnimationFrame(detectInternalHands);
    }

}
    internalScene.add(
        new THREE.AmbientLight(0xffffff, 1.5)
    );

    const internalLight = new THREE.DirectionalLight(
        0xffffff,
        2
    );

    internalLight.position.set(4, 5, 5);
    internalScene.add(internalLight);

    function addLayer(color, y, height) {

        const geometry = new THREE.BoxGeometry(
            1.8,
            height,
            1.3
        );

        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.35,
            metalness: 0.1
        });

        const layer = new THREE.Mesh(
            geometry,
            material
        );

        layer.position.y = y;

        internalScene.add(layer);
    }

    // N-Type Emitter
    addLayer(0x2588ff, -0.65, 0.7);

    // P-Type Base
    addLayer(0xe4ae35, 0.0, 0.18);

    // N-Type Collector
    addLayer(0x36bd77, 0.65, 0.7);

    // Depletion regions
    function addDepletionRegion(y) {

        const geometry = new THREE.BoxGeometry(
            1.82,
            0.06,
            1.32
        );

        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.35
        });

        const region = new THREE.Mesh(
            geometry,
            material
        );

        region.position.y = y;

        internalScene.add(region);
    }

    addDepletionRegion(-0.25);
    addDepletionRegion(0.25);

    // 3D labels for semiconductor layers

    function addInternalLabel(message, color, y) {

        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 100;

        const context = canvas.getContext('2d');

        context.fillStyle = color;
        context.font = 'bold 38px Arial';
        context.textAlign = 'center';
        context.fillText(message, 256, 65);

        const texture = new THREE.CanvasTexture(canvas);

        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true
        });

        const label = new THREE.Sprite(material);

        label.position.set(0, y, 0.85);
        label.scale.set(2.2, 0.43, 1);

        internalScene.add(label);
    }

    addInternalLabel('N-TYPE EMITTER', '#72b5ff', -0.65);
    addInternalLabel('P-TYPE BASE', '#ffda70', 0);
    addInternalLabel('N-TYPE COLLECTOR', '#72efa9', 0.65);

    // Ground reference platform
    const platform = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.08, 1.7),
        new THREE.MeshStandardMaterial({
            color: 0x34445c
        })
    );

    platform.position.y = -1.05;
    internalScene.add(platform);

    // Electron particles
    const electrons = [];

    const electronGeometry = new THREE.SphereGeometry(
        0.055,
        16,
        16
    );

    const electronMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x2588ff,
        emissiveIntensity: 1.5
    });

    for (let i = 0; i < 5; i++) {

        const electron = new THREE.Mesh(
            electronGeometry,
            electronMaterial
        );

        electron.position.set(
            -0.45 + i * 0.2,
            -0.95 - i * 0.08,
            0.15
        );

        internalScene.add(electron);
        electrons.push(electron);
    }
// Electron animation state
   window.electronProgress = 0;
window.electronRunning = true;

    function animateInternal() {

        requestAnimationFrame(animateInternal);

     if (window.electronRunning) {
    window.electronProgress += 0.008;
}

        electrons.forEach((electron, index) => {

            const progress =
                (window.electronProgress + index * 0.2) % 1;

            electron.position.y =
                -0.95 + progress * 1.9;

        });

       internalControls.autoRotate =
    internalAutoRotate && !internalHandIsControlling;

internalControls.update();
        internalRenderer.render(
            internalScene,
            internalCamera
        );
    }

    animateInternal();

    // Pause / Resume rotation
    const rotateButton =
        document.getElementById('internal-rotate');

    rotateButton.addEventListener('click', () => {

      internalAutoRotate = !internalAutoRotate;

internalControls.autoRotate =
    internalAutoRotate && !internalHandIsControlling;

rotateButton.textContent =
    internalAutoRotate
        ? 'Pause Rotation'
        : 'Resume Rotation';

    });

    // Reset camera
    document.getElementById('internal-reset')
        .addEventListener('click', () => {

            internalCamera.position.set(3.5, 2.8, 4.5);

            internalControls.target.set(0, 0, 0);

            internalControls.update();

          internalAutoRotate = true;

internalControls.autoRotate =
    !internalHandIsControlling;

internalHandIsControlling = false;

rotateButton.textContent = 'Pause Rotation';

        });

    // Responsive viewer
    window.addEventListener('resize', () => {

        const width = container.clientWidth;
        const height = container.clientHeight;

        internalCamera.aspect = width / height;
        internalCamera.updateProjectionMatrix();

        internalRenderer.setSize(width, height);

    });

    console.log('Internal NPN structure initialized!');

})();

console.log('NPN BJT 3D Laboratory started successfully!');
