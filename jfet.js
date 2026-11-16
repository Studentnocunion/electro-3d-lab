
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ======================================
// JFET VIEWER INITIALIZATION
// ======================================

const container = document.getElementById('jfet-viewer');

const scene = new THREE.Scene();
scene.background = null;

const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    100
);

camera.position.set(0, 0, 6);

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

const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.5;

// ======================================
// LIGHTING
// ======================================

scene.add(new THREE.AmbientLight(0xffffff, 1.5));

const mainLight = new THREE.DirectionalLight(0xffffff, 2);
mainLight.position.set(4, 5, 6);
scene.add(mainLight);

// ======================================
// JFET GROUP
// ======================================

const jfet = new THREE.Group();
scene.add(jfet);

// ======================================
// SEMICONDUCTOR CHANNEL
// ======================================

const channelGeometry = new THREE.CylinderGeometry(
    0.45,
    0.45,
    2,
    48
);

const channelMaterial = new THREE.MeshStandardMaterial({
    color: 0x168cff,
    metalness: 0.2,
    roughness: 0.35
});

const channel = new THREE.Mesh(
    channelGeometry,
    channelMaterial
);

jfet.add(channel);

// ======================================
// SOURCE TERMINAL
// ======================================

const terminalMaterial = new THREE.MeshStandardMaterial({
    color: 0xc0c0c0,
    metalness: 0.9,
    roughness: 0.2
});


function createTerminal(x, y, z, label, color) {

    const pinGeometry = new THREE.CylinderGeometry(
        0.065, 0.065, 0.8, 24
    );

    const pin = new THREE.Mesh(
        pinGeometry,
        terminalMaterial
    );

    pin.position.set(x, y, z);
    jfet.add(pin);

    const markerGeometry = new THREE.SphereGeometry(
        0.1, 24, 24
    );

    const markerMaterial = new THREE.MeshStandardMaterial({
        color: color
    });

    const marker = new THREE.Mesh(
        markerGeometry,
        markerMaterial
    );

    marker.position.set(x, y - 0.45, z);
    jfet.add(marker);

    // TERMINAL LABEL

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;

    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(label, 256, 80);

    const texture = new THREE.CanvasTexture(canvas);

    const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
    });

    const sprite = new THREE.Sprite(spriteMaterial);

   if (label === 'DRAIN') {
    sprite.position.set(x + 0.65, y - 0.15, z);
} else {
    sprite.position.set(x + 0.65, y - 0.65, z);
}
    sprite.scale.set(1.0, 0.25, 1);

    jfet.add(sprite);
}


createTerminal(0, 1.35, 0, 'DRAIN', 0xff4444);
createTerminal(0, -1.35, 0, 'SOURCE', 0x33dd77);

// ======================================
// GATE TERMINALS
// ======================================

function createGate(x, z, color) {

    const gateGeometry = new THREE.TorusGeometry(
        0.5,
        0.09,
        16,
        64
    );

    const gateMaterial = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.5,
        roughness: 0.3
    });

    const gate = new THREE.Mesh(
        gateGeometry,
        gateMaterial
    );

    gate.position.set(x, 0, z);
    gate.rotation.x = Math.PI / 2;

    jfet.add(gate);
}

createGate(0, 0, 0xffaa22);

// ======================================
// GATE TERMINAL CONNECTION
// ======================================

const gatePinGeometry = new THREE.CylinderGeometry(
    0.065, 0.065, 0.9, 24
);

const gatePin = new THREE.Mesh(
    gatePinGeometry,
    terminalMaterial
);

gatePin.rotation.z = Math.PI / 2;
gatePin.position.set(0.85, 0, 0);

jfet.add(gatePin);

// Gate marker

const gateMarker = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 24, 24),
    new THREE.MeshStandardMaterial({
        color: 0xffaa22
    })
);

gateMarker.position.set(1.35, 0, 0);
jfet.add(gateMarker);

// Gate label

const gateCanvas = document.createElement('canvas');
gateCanvas.width = 512;
gateCanvas.height = 128;

const gateContext = gateCanvas.getContext('2d');

gateContext.fillStyle = '#ffffff';
gateContext.font = 'bold 48px Arial';
gateContext.textAlign = 'center';
gateContext.fillText('GATE', 256, 80);

const gateTexture = new THREE.CanvasTexture(gateCanvas);

const gateLabel = new THREE.Sprite(
    new THREE.SpriteMaterial({
        map: gateTexture,
        transparent: true
    })
);

gateLabel.position.set(1.65, 0.25, 0);
gateLabel.scale.set(0.9, 0.25, 1);

jfet.add(gateLabel);

// ======================================
// VIEW CONTROLS
// ======================================

const rotateButton = document.getElementById('jfet-rotate');
const resetButton = document.getElementById('jfet-reset');

rotateButton.addEventListener('click', () => {

    controls.autoRotate = !controls.autoRotate;

    rotateButton.textContent = controls.autoRotate
        ? 'Pause Rotation'
        : 'Resume Rotation';

});

resetButton.addEventListener('click', () => {

    jfet.rotation.set(0, 0, 0);

    camera.position.set(0, 0, 6);

    controls.target.set(0, 0, 0);
    controls.update();

    controls.autoRotate = true;
    rotateButton.textContent = 'Pause Rotation';

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

    camera.aspect =
        container.clientWidth / container.clientHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        container.clientWidth,
        container.clientHeight
    );

});

 // ======================================
 // JFET AI HAND GESTURE CONTROL
 // ======================================

const jfetVideo = document.getElementById(
    'jfet-camera-background'
);

const jfetStartCamera = document.getElementById(
    'jfet-start-camera'
);

const jfetResetCamera = document.getElementById(
    'jfet-reset-camera'
);

const jfetCameraStatus = document.getElementById(
    'jfet-camera-status'
);

let jfetCameraStream = null;
let jfetDetectionActive = false;

let previousHandX = null;
let previousHandY = null;
let previousPinchDistance = null;

// ======================================
// MEDIAPIPE HAND DETECTOR
// ======================================

const jfetHands = new Hands({
 locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`;
}
});

jfetHands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
});

// ======================================
// HAND DETECTION RESULTS
// ======================================

jfetHands.onResults((results) => {

    if (
        results.multiHandLandmarks &&
        results.multiHandLandmarks.length > 0
    ) {

        const landmarks = results.multiHandLandmarks[0];

        jfetCameraStatus.textContent =
            'Hand Detected - Move Your Hand';

        const handX = landmarks[9].x;
        const handY = landmarks[9].y;

        // ROTATION

        if (
            previousHandX !== null &&
            previousHandY !== null
        ) {

            const deltaX = handX - previousHandX;
            const deltaY = handY - previousHandY;

            jfet.rotation.y += deltaX * 5;
            jfet.rotation.x += deltaY * 5;

            controls.autoRotate = false;

            rotateButton.textContent = 'Resume Rotation';
        }

        previousHandX = handX;
        previousHandY = handY;

        // PINCH ZOOM

        const thumb = landmarks[4];
        const index = landmarks[8];

        const pinchDistance = Math.hypot(
            thumb.x - index.x,
            thumb.y - index.y
        );

        if (previousPinchDistance !== null) {

            const movement =
                pinchDistance - previousPinchDistance;

            camera.position.z -= movement * 8;

            camera.position.z = THREE.MathUtils.clamp(
                camera.position.z,
                3,
                9
            );
        }

        previousPinchDistance = pinchDistance;

        // FIST RESET

        const tips = [8, 12, 16, 20];
        const bases = [6, 10, 14, 18];

        let foldedFingers = 0;

        for (let i = 0; i < tips.length; i++) {

            if (
                landmarks[tips[i]].y >
                landmarks[bases[i]].y
            ) {
                foldedFingers++;
            }
        }

        if (foldedFingers === 4) {

            jfet.rotation.set(0, 0, 0);

            camera.position.set(0, 0, 6);

            controls.target.set(0, 0, 0);
            controls.update();

            previousHandX = null;
            previousHandY = null;
            previousPinchDistance = null;

            return;
        }

    } else {

        jfetCameraStatus.textContent =
            'Camera Active - Show Your Hand';

        previousHandX = null;
        previousHandY = null;
        previousPinchDistance = null;

    }

});

// ======================================
// START CAMERA
// ======================================

jfetStartCamera.addEventListener('click', async () => {

    try {

        jfetCameraStream =
            await navigator.mediaDevices.getUserMedia({
                video: true
            });

        jfetVideo.srcObject = jfetCameraStream;

        await jfetVideo.play();

        jfetVideo.style.opacity = '1';

        jfetDetectionActive = true;

        jfetCameraStatus.textContent =
            'Camera Active - Show Your Hand';

        async function detectJFETHands() {

            if (!jfetDetectionActive) return;

            if (jfetVideo.readyState >= 2) {

                await jfetHands.send({
                    image: jfetVideo
                });

            }

            if (jfetDetectionActive) {
                requestAnimationFrame(detectJFETHands);
            }

        }

        detectJFETHands();

    } catch (error) {

        console.error(error);

        jfetCameraStatus.textContent =
            'Camera Access Failed';

    }

});

// ======================================
// STOP CAMERA
// ======================================

jfetResetCamera.addEventListener('click', () => {

    jfetDetectionActive = false;

    if (jfetCameraStream) {

        jfetCameraStream.getTracks().forEach(track => {
            track.stop();
        });

        jfetCameraStream = null;
    }

    jfetVideo.srcObject = null;
    jfetVideo.style.opacity = '0';

    jfetCameraStatus.textContent = 'Camera Stopped';

    previousHandX = null;
    previousHandY = null;
    previousPinchDistance = null;

});

// ======================================
// JFET KNOWLEDGE TEST
// ======================================

window.checkJFETQuiz = function () {

    const answers = {
        jq1: "a",
        jq2: "b",
        jq3: "c",
        jq4: "a",
        jq5: "b"
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

    document.getElementById("jfet-quiz-result").textContent =
        `You scored ${score}/5. Attempted: ${attempted}/5.`;
};

window.resetJFETQuiz = function () {

    document.getElementById("jfet-quiz-result").textContent =
        "Your result will appear here.";

};
