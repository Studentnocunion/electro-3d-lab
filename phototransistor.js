
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

console.log('Phototransistor Body Created');

/* ======================================
   PHOTOTRANSISTOR MAIN BODY
====================================== */


console.log('Phototransistor Body Created');

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

console.log('Phototransistor 3D Laboratory Initialized');
