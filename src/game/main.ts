import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { createScene } from './Scene';
import { createCamera } from './Camera';
import { createRenderer } from './Renderer';
import RAPIER from '@dimforge/rapier3d-compat';

export let scene: ReturnType<typeof createScene>;
export let camera: ReturnType<typeof createCamera>;
export let renderer: ReturnType<typeof createRenderer>;
export let controls: PointerLockControls;

let isGameRunning = false;
let animationId = 0;

// Rapier physics variables
let world: RAPIER.World;
let playerBody: RAPIER.RigidBody;

// Movement state variables
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const onKeyDown = (event: KeyboardEvent) => {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            break;
    }
};

const onKeyUp = (event: KeyboardEvent) => {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            break;
    }
};

// Expose initialize function to connect to UI
export function initGame(container: HTMLElement, onPause: () => void, onResume: () => void) {
    if (isGameRunning) return;

    // Load rapier WASM compat layer
    RAPIER.init().then(() => {
        const gravity = new RAPIER.Vector3(0.0, -9.81, 0.0);
        world = new RAPIER.World(gravity);

        // Build the core elements
        scene = createScene(world, RAPIER);
        camera = createCamera();
        renderer = createRenderer(container);

        // Player physics capsule (half-height 0.5, radius 0.3)
        let playerBodyDesc = RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(0, 5, 5) // drop in from above
            .lockRotations();
        playerBody = world.createRigidBody(playerBodyDesc);
        let playerColliderDesc = RAPIER.ColliderDesc.capsule(0.5, 0.3);
        world.createCollider(playerColliderDesc, playerBody);

        // Initialize pointer lock controls
        controls = new PointerLockControls(camera, document.body);
        scene.add(controls.object);

        controls.addEventListener('lock', () => onResume());
        controls.addEventListener('unlock', () => onPause());

        // Keep the canvas fully responsive
        window.addEventListener('resize', onWindowResize, false);

        // Add movement listeners
        document.addEventListener('keydown', onKeyDown, false);
        document.addEventListener('keyup', onKeyUp, false);

        isGameRunning = true;

        // Disable three.js default animation loop in favor of explicit requestAnimationFrame
        renderer.setAnimationLoop(null);
        gameLoop();

        console.log("3D engine started with Rapier Physics!");
    });
}

function gameLoop() {
    if (!isGameRunning) return;

    // Step simulation
    world.step();

    // Player Movement
    if (controls.isLocked) {
        // Calculate intended movement direction based on camera angle
        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize(); // ensures consistent speed in all directions

        // We want to apply velocity relative to where the player is looking
        const speed = 10.0;

        // Rotate our flat input vector by the camera's horizontal y-rotation
        const euler = new THREE.Euler(0, camera.rotation.y, 0, 'YXZ');
        const movementVector = direction.clone().applyEuler(euler).multiplyScalar(-speed);

        // Preserve current vertical physics velocity (falling / jumping)
        const currentVel = playerBody.linvel();
        playerBody.setLinvel({
            x: movementVector.x,
            y: currentVel.y,
            z: movementVector.z
        }, true);
    } else {
        // Stop sliding if paused 
        const currentVel = playerBody.linvel();
        playerBody.setLinvel({ x: 0, y: currentVel.y, z: 0 }, true);
    }

    // Sync camera to physics body
    const pos = playerBody.translation();
    camera.position.set(pos.x, pos.y + 0.6, pos.z); // offset to "eye level" above capsule center

    renderer.render(scene, camera);
    animationId = requestAnimationFrame(gameLoop);
}

export function stopGame() {
    isGameRunning = false;

    // Cleanup if necessary
    window.removeEventListener('resize', onWindowResize);
    document.removeEventListener('keydown', onKeyDown, false);
    document.removeEventListener('keyup', onKeyUp, false);
    cancelAnimationFrame(animationId);

    if (controls) {
        controls.disconnect();
    }
    if (renderer) {
        renderer.setAnimationLoop(null);
        renderer.domElement.remove();
        renderer.dispose();
    }

    console.log("3D engine stopped!");
}

function onWindowResize() {
    if (!camera || !renderer) return;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}
