import * as THREE from 'three';

export function createCamera(): THREE.PerspectiveCamera {
    const aspect = window.innerWidth / window.innerHeight;
    const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);

    // Set typical eye level for a player (around 1.6 to 1.7 meters high)
    camera.position.set(0, 1.7, 5);

    // Default looking forward
    camera.lookAt(0, 1.7, -10);

    return camera;
}
