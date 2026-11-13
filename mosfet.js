
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ======================================
// MOSFET VIEWER INITIALIZATION
// ======================================

const container = document.getElementById('mosfet-viewer');
// ======================================
// MOSFET CAMERA ELEMENTS
// ======================================

const cameraVideo = document.getElementById('mosfet-camera-background');

const startCameraButton = document.getElementById('mosfet-start-camera');

const resetCameraButton = document.getElementById('mosfet-reset-camera');

const cameraStatus = document.getElementById('mosfet-camera-status');

let cameraStream = null;

// ======================================
// MEDIAPIPE HAND TRACKING INITIALIZATION
// ======================================

const mosfetHands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});

mosfetHands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
});


mosfetHands.onResults((results) => {

    if (
        results.multiHandLandmarks &&
        results.multiHandLandmarks.length > 0
    ) {

        const landmarks = results.multiHandLandmarks[0];

        const handX = landmarks[9].x;
        const handY = landmarks[9].y;

// ======================================
// PINCH ZOOM CONTROL
// ======================================

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

// ======================================
// FIST GESTURE RESET
// ======================================

const wrist = landmarks[0];
const middleFingerTip = landmarks[12];

const middleFingerFolded =
    middleFingerTip.y > landmarks[9].y;

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

    mosfet.rotation.set(0, 0, 0);

    camera.position.set(4, 3, 5);

    controls.target.set(0, 0, 0);
    controls.update();

}

// ======================================
// HAND CONTROLLED NMOS ROTATION
// ======================================

mosfet.rotation.y = (0.5 - handX) * Math.PI * 2;

mosfet.rotation.x = (handY - 0.5) * Math.PI;

        cameraStatus.textContent =
            'AI: Hand detected | X: ' +
            handX.toFixed(2) +
            ' Y: ' +
            handY.toFixed(2);

    } else {

        cameraStatus.textContent = 'AI: Searching for hand...';

    }

});


// ======================================
// START MOSFET CAMERA
// ======================================

startCameraButton.addEventListener('click', async () => {

    try {

        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        cameraVideo.srcObject = cameraStream;

// Start sending webcam frames to MediaPipe
const mosfetCamera = new Camera(cameraVideo, {
    onFrame: async () => {
        await mosfetHands.send({
            image: cameraVideo
        });
    },
    width: 640,
    height: 480
});

mosfetCamera.start();

        cameraVideo.style.opacity = '0.65';

        cameraStatus.textContent = 'Camera is running';

        startCameraButton.textContent = 'Camera Started';

    } catch (error) {

        console.error('Camera Error:', error);

        cameraStatus.textContent = 'Camera access failed';

    }

});
// ======================================
// RESET MOSFET CAMERA
// ======================================

resetCameraButton.addEventListener('click', () => {

    if (cameraStream) {

        cameraStream.getTracks().forEach(track => {
            track.stop();
        });

        cameraStream = null;
    }

    cameraVideo.srcObject = null;
    cameraVideo.style.opacity = '0';

    cameraStatus.textContent = 'Camera is not started';

    startCameraButton.textContent = 'Start Camera';

});
if (!container) {
    throw new Error('MOSFET viewer not found.');
}

const scene = new THREE.Scene();
scene.background = null;

const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    100
);

camera.position.set(4, 3, 5);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});

renderer.setClearColor(0x000000, 0);

renderer.setSize(
    container.clientWidth,
    container.clientHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

container.appendChild(renderer.domElement);

// ======================================
// MOUSE CONTROLS
// ======================================

const controls = new OrbitControls(
    camera,
    renderer.domElement
);

controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.2;
// ======================================
// RESET 3D VIEW
// ======================================

const resetButton = document.getElementById('mosfet-reset');

resetButton.addEventListener('click', () => {

    controls.reset();

    camera.position.set(4, 3, 5);

    controls.target.set(0, 0, 0);

    controls.update();

});
// ======================================
// PAUSE / RESUME ROTATION
// ======================================

const rotateButton = document.getElementById('mosfet-rotate');

rotateButton.addEventListener('click', () => {

    controls.autoRotate = !controls.autoRotate;

    rotateButton.textContent = controls.autoRotate
        ? 'Pause Rotation'
        : 'Resume Rotation';

});
// ======================================
// LIGHTING
// ======================================

scene.add(
    new THREE.AmbientLight(0xffffff, 1.5)
);

const light = new THREE.DirectionalLight(
    0xffffff,
    2
);

light.position.set(4, 5, 5);
scene.add(light);
// ======================================
// MOSFET MODEL GROUP
// ======================================

const mosfet = new THREE.Group();
scene.add(mosfet);
// ======================================
// MOSFET MODEL GROUP
// ======================================

// ======================================
// SILICON SUBSTRATE
// ======================================

const substrateGeometry = new THREE.BoxGeometry(
    2.8,
    0.35,
    1.8
);

const substrateMaterial = new THREE.MeshStandardMaterial({
    color: 0x2588ff,
    roughness: 0.4,
    metalness: 0.1
});

const substrate = new THREE.Mesh(
    substrateGeometry,
    substrateMaterial
);

substrate.position.y = -0.65;
mosfet.add(substrate);
// ======================================
// N+ SOURCE AND DRAIN REGIONS
// ======================================

const regionGeometry = new THREE.BoxGeometry(
    0.65,
    0.22,
    1.2
);

const regionMaterial = new THREE.MeshStandardMaterial({
    color: 0xff4444,
    roughness: 0.45
});

// SOURCE
const source = new THREE.Mesh(
    regionGeometry,
    regionMaterial
);

source.position.set(-0.85, -0.35, 0);
mosfet.add(source);

// DRAIN
const drain = new THREE.Mesh(
    regionGeometry,
    regionMaterial
);

drain.position.set(0.85, -0.35, 0);
mosfet.add(drain);
// ======================================
// GATE OXIDE LAYER
// ======================================

const oxideGeometry = new THREE.BoxGeometry(
    1.1,
    0.12,
    1.3
);

const oxideMaterial = new THREE.MeshStandardMaterial({
    color: 0x66ffff,
    transparent: true,
    opacity: 0.65,
    roughness: 0.3
});

const gateOxide = new THREE.Mesh(
    oxideGeometry,
    oxideMaterial
);

gateOxide.position.set(0, -0.18, 0);
mosfet.add(gateOxide);
// ======================================
// METAL GATE ELECTRODE
// ======================================

const gateGeometry = new THREE.BoxGeometry(
    0.9,
    0.22,
    1.1
);

const gateMaterial = new THREE.MeshStandardMaterial({
    color: 0xffcc33,
    metalness: 0.75,
    roughness: 0.25
});

const gate = new THREE.Mesh(
    gateGeometry,
    gateMaterial
);

gate.position.set(0, 0.0, 0);
mosfet.add(gate);
// ======================================
// SOURCE AND DRAIN METAL CONTACTS
// ======================================

const contactGeometry = new THREE.BoxGeometry(
    0.35,
    0.18,
    0.8
);

const contactMaterial = new THREE.MeshStandardMaterial({
    color: 0xe6e6e6,
    metalness: 0.2,
    roughness: 0.35,
    emissive: 0x444444
});

// SOURCE CONTACT
const sourceContact = new THREE.Mesh(
    contactGeometry,
    contactMaterial
);

sourceContact.position.set(-0.85, -0.18, 0);
mosfet.add(sourceContact);

// DRAIN CONTACT
const drainContact = new THREE.Mesh(
    contactGeometry,
    contactMaterial
);

drainContact.position.set(0.85, -0.18, 0);
mosfet.add(drainContact);
// ======================================
// NMOS TERMINAL LABELS
// ======================================

function createMosfetLabel(text, color) {

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

    const label = new THREE.Sprite(material);

    label.scale.set(1.1, 0.28, 1);

    return label;
}

// GATE LABEL
const gateLabel = createMosfetLabel('GATE', '#ffcc33');
gateLabel.position.set(0, 0.55, 0);
mosfet.add(gateLabel);

// SOURCE LABEL
const sourceLabel = createMosfetLabel('SOURCE', '#42a5ff');
sourceLabel.position.set(-0.85, 0.15, 0);
mosfet.add(sourceLabel);

// DRAIN LABEL
const drainLabel = createMosfetLabel('DRAIN', '#ff6666');
drainLabel.position.set(0.85, 0.15, 0);
mosfet.add(drainLabel);
// ======================================
// BODY CONTACT
// ======================================

const bodyContactGeometry = new THREE.BoxGeometry(
    0.4,
    0.2,
    0.5
);

const bodyContactMaterial = new THREE.MeshStandardMaterial({
    color: 0x22cc88,
    metalness: 0.2,
    roughness: 0.4,
    emissive: 0x063322
});

const bodyContact = new THREE.Mesh(
    bodyContactGeometry,
    bodyContactMaterial
);

bodyContact.position.set(0, -0.9, 0.75);
mosfet.add(bodyContact);

const bodyLabel = createMosfetLabel('BODY', '#22cc88');
bodyLabel.position.set(0, -0.55, 1.0);
mosfet.add(bodyLabel);
// ======================================
// NMOS SEMICONDUCTOR CHANNEL
// ======================================

const channelGeometry = new THREE.BoxGeometry(
    0.8,
    0.06,
    0.9
);

const channelMaterial = new THREE.MeshStandardMaterial({
    color: 0x00e5ff,
    emissive: 0x004455,
    roughness: 0.35
});

const channel = new THREE.Mesh(
    channelGeometry,
    channelMaterial
);

channel.position.set(0, -0.39, 0);
mosfet.add(channel);
// ======================================
// CHANNEL ELECTRON PARTICLES
// ======================================

const electrons = [];

const electronGeometry = new THREE.SphereGeometry(0.045, 16, 16);

const electronMaterial = new THREE.MeshStandardMaterial({
    color: 0xffff00,
    emissive: 0x887700
});

for (let i = 0; i < 8; i++) {

    const electron = new THREE.Mesh(
        electronGeometry,
        electronMaterial
    );

    electron.position.set(
        -0.35 + i * 0.1,
        -0.30,
        0
    );

    mosfet.add(electron);
    electrons.push(electron);

}
// ======================================
// ANIMATION
// ======================================

function animate() {

    requestAnimationFrame(animate);

    controls.update();

    // Animate electrons through the NMOS channel
    electrons.forEach((electron) => {

        electron.position.x += 0.003;

        if (electron.position.x > 0.4) {
            electron.position.x = -0.4;
        }

    });

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
// NMOS OPERATING MODE SIMULATOR
// ======================================

window.showMosfetMode = function(mode) {

    const info = document.getElementById('mosfet-mode-info');

    if (mode === 'cutoff') {

        info.innerHTML = `
            <h3>Cut-off Region — OFF</h3>
            <p>Condition: VGS <= VTH</p>
            <p>The inversion channel is not formed.</p>
            <p>Drain current is approximately zero
            in the ideal model.</p>
        `;

    }

    else if (mode === 'linear') {

        info.innerHTML = `
            <h3>Linear Region — ON</h3>
            <p>Conditions: VGS > VTH and
            0 <= VDS < VGS - VTH</p>
            <p>A conducting channel is formed.</p>
            <p>The MOSFET behaves approximately
            like a voltage-controlled resistance.</p>
        `;

    }

    else if (mode === 'saturation') {

        info.innerHTML = `
            <h3>Saturation Region — ON</h3>
            <p>Conditions: VGS > VTH and
            VDS >= VGS - VTH</p>
            <p>The channel is pinched off near the drain.</p>
            <p>In the ideal long-channel model,
            drain current is mainly controlled by VGS.</p>
        `;

    }

};

// ======================================
// NMOS DRAIN CURRENT CALCULATOR
// ======================================

window.calculateMosfetCurrent = function() {

    const VGS = Number(
        document.getElementById('mosfet-vgs').value
    );

    const VTH = Number(
        document.getElementById('mosfet-vth').value
    );

    const VDS = Number(
        document.getElementById('mosfet-vds').value
    );

    const K = Number(
        document.getElementById('mosfet-k').value
    );

    const result = document.getElementById(
        'mosfet-current-result'
    );

    if (
        !Number.isFinite(VGS) ||
        !Number.isFinite(VTH) ||
        !Number.isFinite(VDS) ||
        !Number.isFinite(K) ||
        VGS < 0 || VTH < 0 || VDS < 0 || K <= 0
    ) {

        result.innerHTML = `
            <h3>Invalid Input</h3>
            <p>Enter valid non-negative voltages
            and a positive K value.</p>
        `;

        return;
    }

    const VOV = VGS - VTH;

    let ID = 0;
    let mode = '';

    if (VOV <= 0) {

        mode = 'Cut-off Region';
        ID = 0;

    }

    else if (VDS < VOV) {

        mode = 'Linear Region';

        ID = K * (
            2 * VOV * VDS -
            VDS * VDS
        );

    }

    else {

        mode = 'Saturation Region';

        ID = K * VOV * VOV;

    }

    result.innerHTML = `
        <h3>${mode}</h3>
        <p>Overdrive Voltage = ${VOV.toFixed(2)} V</p>
        <p>Drain Current = ${ID.toFixed(3)} mA</p>
        <p>Calculation uses the ideal long-channel
        square-law model without channel-length modulation.</p>
    `;

};

// ======================================
// NMOS KNOWLEDGE TEST SCORING
// ======================================

window.checkMosfetQuiz = function() {

    const answers = {
        mq1: 'b',
        mq2: 'c',
        mq3: 'a',
        mq4: 'a',
        mq5: 'b'
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
        'mosfet-quiz-result'
    );

    result.innerHTML = `
        <h3>Quiz Result</h3>
        <p>Score: ${score} / 5</p>
        <p>Attempted: ${attempted} / 5</p>
        <p>Correct: ${score}</p>
        <p>Incorrect: ${attempted - score}</p>
        <p>Unattempted: ${5 - attempted}</p>
        <h3>${score === 5 ? 'Excellent!' :
        score >= 3 ? 'Good Work!' : 'Keep Practicing!'}</h3>
    `;

};

window.resetMosfetQuiz = function() {

    document.getElementById(
        'mosfet-quiz-result'
    ).innerHTML = '';

};

console.log('MOSFET 3D viewer initialized!');
