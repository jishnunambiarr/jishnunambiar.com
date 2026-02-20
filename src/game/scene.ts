import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';

export function createScene(world: RAPIER.World, RAPIER: any): THREE.Scene {
    const scene = new THREE.Scene();

    // Counter-Strike 1.6 inspired sky color (dusty blue)
    scene.background = new THREE.Color(0xa0b0c0);

    // Add ambient light for general visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Add a sun-like directional light to cast shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create a simple ground plane (dust style)
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0xc2b280 }); // Sand/dust color
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2; // Make it flat
    ground.receiveShadow = true;
    scene.add(ground);

    // Ground physics
    let groundBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(0, 0, 0);
    let groundBody = world.createRigidBody(groundBodyDesc);
    // Cuboid takes half-extents (width, height, depth)
    let groundColliderDesc = RAPIER.ColliderDesc.cuboid(100.0, 0.1, 100.0);
    world.createCollider(groundColliderDesc, groundBody);

    // Add a test crate (iconic CS prop)
    const crateSize = 2;
    const crateGeometry = new THREE.BoxGeometry(crateSize, crateSize, crateSize);
    const crateMaterial = new THREE.MeshLambertMaterial({ color: 0x8b5a2b }); // Wood color
    const crate = new THREE.Mesh(crateGeometry, crateMaterial);
    crate.position.set(0, crateSize / 2, -10); // Placed slightly in front of spawn
    crate.castShadow = true;
    crate.receiveShadow = true;
    scene.add(crate);

    // Crate physics
    let crateBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(0, crateSize / 2, -10);
    let crateBody = world.createRigidBody(crateBodyDesc);
    let crateColliderDesc = RAPIER.ColliderDesc.cuboid(crateSize / 2, crateSize / 2, crateSize / 2);
    world.createCollider(crateColliderDesc, crateBody);

    // Add some simple walls to form a basic arena
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xa9a9a9 }); // Concrete color

    // Helper to create visual wall + physical wall simultaneously
    const createWall = (x: number, y: number, z: number, w: number, h: number, d: number) => {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMaterial);
        wall.position.set(x, y, z);
        scene.add(wall);

        let bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, z);
        let body = world.createRigidBody(bodyDesc);
        let colliderDesc = RAPIER.ColliderDesc.cuboid(w / 2, h / 2, d / 2);
        world.createCollider(colliderDesc, body);
    };

    createWall(0, 5, -25, 50, 10, 1);
    createWall(0, 5, 25, 50, 10, 1);
    createWall(-25, 5, 0, 1, 10, 50);
    createWall(25, 5, 0, 1, 10, 50);

    return scene;
}