
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js';

// ========================================
// ELECTRO-3D LAB
// ========================================

console.log("ELECTRO-3D LAB started!");

// HTML ELEMENTS
const container = document.getElementById("three-container");
const webcam = document.getElementById("webcam");
const cameraButton = document.getElementById("start-camera");
const trackingStatus = document.getElementById("tracking-status");

if (!container || !webcam || !cameraButton || !trackingStatus) {
    throw new Error("Required HTML elements are missing!");
}

// ========================================
// THREE.JS SCENE
// ========================================

const scene = new THREE.Scene();

// Transparent scene so webcam video is visible behind the model
scene.background = null;

// CAMERA
const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
);

camera.position.set(0, 0, 5);

// RENDERER
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});

renderer.setClearColor(0x000000, 0);
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// IMPORTANT: Do not use container.innerHTML = "" here.
// It would delete the webcam video.
renderer.domElement.id = "three-canvas";
container.appendChild(renderer.domElement);

// MOUSE CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;

// ========================================
// FULLSCREEN
// ========================================

const fullscreenButton = document.getElementById("fullscreen-btn");

fullscreenButton.addEventListener("click", async function () {
    try {
        if (!document.fullscreenElement) {
            await container.requestFullscreen();
        } else {
            await document.exitFullscreen();
        }
    } catch (error) {
        console.error("Fullscreen error:", error);
    }
});

// ========================================
// RESET VIEW
// ========================================

let resetAnimation = false;

document.getElementById("reset-view").addEventListener("click", function () {
    resetAnimation = true;
});

// ========================================
// LIGHTING
// ========================================
const directionalLight = new THREE.DirectionalLight(0xffffff, 4);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);


const fillLight = new THREE.DirectionalLight(0xffffff, 2);
fillLight.position.set(-5, 2, 3);
scene.add(fillLight);

scene.add(new THREE.AmbientLight(0xffffff, 1.5));
// HAND CONTROL STATE
let handIsControlling = false;
let smoothedCameraZ = 5;
// ========================================
// COMPONENT GROUP AND MATERIALS
// ========================================

let currentComponent = new THREE.Group();
scene.add(currentComponent);

const metalMaterial = new THREE.MeshStandardMaterial({
    color: 0xb8c5d1,
    metalness: 0.8,
    roughness: 0.25
});

// ========================================
// CREATE RESISTOR
// ========================================

function createResistor() {
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 2.2, 64),
        new THREE.MeshStandardMaterial({
            color: 0x2563eb,
            metalness: 0.25,
            roughness: 0.35
        })
    );

    body.rotation.z = Math.PI / 2;
    currentComponent.add(body);

    // Metal leads
    [-1.75, 1.75].forEach(x => {
        const wire = new THREE.Mesh(
            new THREE.CylinderGeometry(0.045, 0.045, 1.5, 24),
            metalMaterial
        );

        wire.rotation.z = Math.PI / 2;
        wire.position.x = x;
        currentComponent.add(wire);
    });

    // Colour bands
    [0x000000, 0xff0000, 0xffd700, 0x8b4513].forEach((color, index) => {
        const band = new THREE.Mesh(
            new THREE.CylinderGeometry(0.356, 0.356, 0.13, 64),
            new THREE.MeshStandardMaterial({ color })
        );

        band.rotation.z = Math.PI / 2;
        band.position.x = -0.65 + index * 0.43;
        currentComponent.add(band);
    });
}

// ========================================
// CREATE CAPACITOR
// ========================================

function createCapacitor() {
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.45, 1.1, 64),
        new THREE.MeshStandardMaterial({
            color: 0x123b63,
            metalness: 0.25,
            roughness: 0.4
        })
    );

    currentComponent.add(body);

    // Metallic top
    const top = new THREE.Mesh(
        new THREE.CylinderGeometry(0.39, 0.39, 0.06, 64),
        new THREE.MeshStandardMaterial({
            color: 0xb8c8d8,
            metalness: 0.7,
            roughness: 0.3
        })
    );

    top.position.y = 0.53;
    currentComponent.add(top);

    // Terminals
    [-0.18, 0.18].forEach(x => {
        const lead = new THREE.Mesh(
            new THREE.CylinderGeometry(0.035, 0.035, 0.9, 24),
            metalMaterial
        );

        lead.position.set(x, -0.95, 0);
        currentComponent.add(lead);
    });
}

// ========================================
// CREATE LED
// ========================================

function createLED() {
    const ledMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xff2020,
        roughness: 0.18,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.1
    });

    // LED base
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.32, 0.45, 64),
        ledMaterial
    );

    base.position.y = 0.05;
    currentComponent.add(base);

    // LED dome
    const dome = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.32, 64, 48, 0, Math.PI * 2, 0, Math.PI / 2
        ),
        ledMaterial
    );

    dome.position.y = 0.275;
    currentComponent.add(dome);

    // Metal legs
    [-0.15, 0.15].forEach(x => {
        const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.035, 0.035, 1, 24),
            metalMaterial
        );

        leg.position.set(x, -0.70, 0);
        currentComponent.add(leg);
    });
}

// ========================================
// CREATE DIODE
// ========================================

function createDiode() {
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 1.2, 64),
        new THREE.MeshStandardMaterial({
            color: 0x242424,
            roughness: 0.35
        })
    );

    body.rotation.z = Math.PI / 2;
    currentComponent.add(body);

    // Polarity band
    const band = new THREE.Mesh(
        new THREE.CylinderGeometry(0.305, 0.305, 0.12, 64),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
    );

    band.rotation.z = Math.PI / 2;
    band.position.x = 0.4;
    currentComponent.add(band);

    // Metal leads
    [-1.3, 1.3].forEach(x => {
        const lead = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 1.5, 24),
            metalMaterial
        );

        lead.rotation.z = Math.PI / 2;
        lead.position.x = x;
        currentComponent.add(lead);
    });
}

// ========================================
// COMPONENT EDUCATIONAL INFORMATION
// ========================================

const componentInformation = {
    resistor: {
        name: "Resistor",
        symbol: "─/\\/\\─",
        function: "Controls or limits the flow of electric current.",
        working: "Uses electrical resistance to create a voltage drop.",
        applications: "Current limiting, voltage division and circuit protection.",
        specOne: "Resistance: 220 Ω",
        specTwo: "Power Rating: 0.25 W"
    },

    capacitor: {
        name: "Capacitor",
        symbol: "─| |─",
        function: "Stores electrical energy temporarily.",
        working: "Stores energy in an electric field between two conductive plates.",
        applications: "Filtering, smoothing, timing and energy storage.",
        specOne: "Capacitance: 100 µF",
        specTwo: "Voltage Rating: 25 V"
    },

    led: {
        name: "LED (Light Emitting Diode)",
        symbol: "─|>|─ ↗ ↗",
        function: "Converts electrical energy into light.",
        working: "Emits light when current flows through it in the forward direction.",
        applications: "Indicators, displays, lighting and optical communication.",
        specOne: "Forward Voltage: 2 V",
        specTwo: "Forward Current: 20 mA"
    },

    diode: {
        name: "PN Junction Diode",
        symbol: "─|>|─",
        function: "Allows current mainly in one direction.",
        working: "Its PN junction conducts in forward bias and blocks current in reverse bias.",
        applications: "Rectifiers, protection circuits and signal processing.",
        specOne: "Forward Voltage: 0.7 V",
        specTwo: "Maximum Current: 1 A"
    }
};

// ========================================
// LOAD SELECTED COMPONENT
// ========================================

function loadComponent(type) {
    currentComponent.clear();

    if (type === "resistor") {
        createResistor();
    } else if (type === "capacitor") {
        createCapacitor();
    } else if (type === "led") {
        createLED();
    } else if (type === "diode") {
        createDiode();
    }

    // Reset camera and component orientation
    camera.position.set(0, 0, 5);
    controls.target.set(0, 0, 0);
    currentComponent.rotation.set(0, 0, 0);
    controls.update();

    // Update educational information
    const info = componentInformation[type];

    document.getElementById("info-name").textContent = info.name;
    document.getElementById("info-symbol").textContent = info.symbol;
    document.getElementById("info-function").textContent = info.function;
    document.getElementById("info-working").textContent = info.working;
    document.getElementById("info-applications").textContent = info.applications;
    document.getElementById("spec-one").textContent = info.specOne;
    document.getElementById("spec-two").textContent = info.specTwo;

    console.log("Selected component:", type);
}

// Component dropdown
const componentSelect = document.getElementById("component-select");

componentSelect.addEventListener("change", function () {
    loadComponent(this.value);
});

// Initial component
loadComponent("resistor");

// ========================================
// ROTATION SPEED AND PAUSE CONTROL
// ========================================

let rotationSpeed = 0.005;
let isRotationPaused = false;

const rotationToggle = document.getElementById("rotation-toggle");

rotationToggle.addEventListener("click", function () {
    isRotationPaused = !isRotationPaused;

    rotationToggle.textContent = isRotationPaused
        ? "▶ Resume Rotation"
        : "⏸ Pause Rotation";
});

const rotationSlider = document.getElementById("rotation-speed");
const speedValue = document.getElementById("speed-value");

rotationSlider.addEventListener("input", function () {
    rotationSpeed = Number(this.value);
    speedValue.textContent = rotationSpeed.toFixed(3);
});

// ========================================
// ANIMATION
// ========================================

const resetPosition = new THREE.Vector3(0, 0, 5);
const resetTarget = new THREE.Vector3(0, 0, 0);

function animate() {
    requestAnimationFrame(animate);

    // Smooth camera reset
    if (resetAnimation) {
        camera.position.lerp(resetPosition, 0.08);
        controls.target.lerp(resetTarget, 0.08);

        if (camera.position.distanceTo(resetPosition) < 0.01) {
            camera.position.copy(resetPosition);
            controls.target.copy(resetTarget);
            resetAnimation = false;
        }
    }

    // Automatic rotation
    if (!isRotationPaused && !handIsControlling) {
        currentComponent.rotation.y += rotationSpeed;
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();

// ========================================
// RESPONSIVE RESIZING
// ========================================

function resizeViewer() {
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (width === 0 || height === 0) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
}

window.addEventListener("resize", resizeViewer);

// ========================================
// MEDIAPIPE HAND DETECTION
// ========================================

if (typeof Hands === "undefined") {
    throw new Error("MediaPipe Hands library did not load!");
}

const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});

hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
});



// ========================================
// HAND GESTURE CONTROL
// ========================================

hands.onResults(function (results) {
    if (
        results.multiHandLandmarks &&
        results.multiHandLandmarks.length > 0
    ) {
        const landmarks = results.multiHandLandmarks[0];

        // Palm position
        const handX = landmarks[9].x;
        const handY = landmarks[9].y;

        // Rotate 3D component with hand position
        currentComponent.rotation.y = (0.5 - handX) * 4;
        currentComponent.rotation.x = (0.5 - handY) * 2;

        // Pinch detection: thumb tip and index finger tip
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];

        const pinchDistance = Math.sqrt(
            Math.pow(thumbTip.x - indexTip.x, 2) +
            Math.pow(thumbTip.y - indexTip.y, 2)
        );

        // Convert pinch distance into zoom level
        const targetZoom = THREE.MathUtils.mapLinear(
            THREE.MathUtils.clamp(pinchDistance, 0.025, 0.20),
            0.025,
            0.20,
            2.5,
            8
        );

        smoothedCameraZ += (targetZoom - smoothedCameraZ) * 0.12;
        camera.position.z = smoothedCameraZ;

        handIsControlling = true;

        trackingStatus.textContent =
            "Hand detected – 3D gesture control active!";

    } else {
        handIsControlling = false;

        trackingStatus.textContent =
            "Camera active – Show your hand.";
    }
});

// ========================================
// WEBCAM ACTIVATION
// ========================================

let webcamStream = null;
let detectionRunning = false;

cameraButton.addEventListener("click", async function () {
    if (webcamStream) return;

    try {
        trackingStatus.textContent = "Requesting camera permission...";
        cameraButton.disabled = true;

        webcamStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "user"
            },
            audio: false
        });

        // Keep the existing webcam video element
        webcam.srcObject = webcamStream;

        await webcam.play();

        // Show webcam behind the 3D model
        container.classList.add("camera-active");

        trackingStatus.textContent = "Camera connected. Detecting hands...";

        cameraButton.textContent = "Camera Started";

        // Start MediaPipe frame processing only once
        if (!detectionRunning) {
            detectionRunning = true;
            detectHands();
        }

        console.log("Webcam activated successfully!");

    } catch (error) {
        webcamStream = null;
        cameraButton.disabled = false;
        cameraButton.textContent = "Start Camera";

        trackingStatus.textContent =
            "Camera failed. Check permission and try again.";

        console.error("Webcam error:", error);
    }
});

// Process webcam frames
async function detectHands() {
    if (!webcamStream || webcam.paused || webcam.readyState < 2) {
        requestAnimationFrame(detectHands);
        return;
    }

    try {
        await hands.send({ image: webcam });
    } catch (error) {
        console.error("Hand detection error:", error);
    }

    requestAnimationFrame(detectHands);
}

console.log("Three.js engine loaded successfully!");
