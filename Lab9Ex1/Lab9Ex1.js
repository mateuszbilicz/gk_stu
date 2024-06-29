"use strict";
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {HorseModel} from './resources/horse.js';

let canvas, renderer, scene, camera, controls, animating = false, frameNumber = 0;

function render() {
    renderer.render(scene, camera);
}

function createWorld() {
    renderer.setClearColor("black");
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(30, canvas.width / canvas.height, 0.1, 100);
    camera.position.z = 30;
    let light;
    light = new THREE.DirectionalLight();
    light.position.set(0, 0, 1);
    camera.add(light);
    scene.add(camera);

    let baseGeometry = new THREE.CylinderGeometry(5, 5, 0.5, 15);
    let baseMaterial = new THREE.MeshPhongMaterial({
        color: 0x66BBFF,
        specular: 0x222222,
        shininess: 16,
        shading: THREE.FlatShading
    });
    baseGeometry.translate(0, -2, 0);
    let base = new THREE.Mesh(baseGeometry, baseMaterial);
    scene.add(base);

    let topBGeometry = new THREE.CylinderGeometry(5, 5, 0.5, 15);
    let topBMaterial = new THREE.MeshPhongMaterial({
        color: 0x66BBFF,
        specular: 0x222222,
        shininess: 16,
        shading: THREE.FlatShading
    });
    topBGeometry.translate(0, 1, 0);
    let topB = new THREE.Mesh(topBGeometry, topBMaterial);
    scene.add(topB);

    let topGeometry = new THREE.ConeGeometry(5, 1, 15, 1);
    let topMaterial = new THREE.MeshPhongMaterial({
        color: 0x66BBFF,
        specular: 0x222222,
        shininess: 16,
        shading: THREE.FlatShading
    });
    let top = new THREE.Mesh(topGeometry, topMaterial);
    topGeometry.translate(0, 1.75, 0);
    scene.add(top);

    // Kula w środku karuzeli
    let sphereGeometry = new THREE.SphereGeometry(1.25, 32, 32);
    let sphereMaterial = new THREE.MeshPhongMaterial({
        color: 0xFF0000,
        specular: 0x222222,
        shininess: 16,
        shading: THREE.FlatShading
    });
    sphereGeometry.translate(0, -0.5, 0);
    let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);

    let cylinderGeometry = new THREE.CylinderGeometry(0.05, 0.05, 3, 15);
    let cylinderMaterial = new THREE.MeshPhongMaterial({
        color: 0x66BBFF,
        specular: 0x222222,
        shininess: 16,
        shading: THREE.FlatShading
    });
    let cylinder;

    for (let i = 0; i < 15; i++) {
        cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        cylinder.position.set(4 * Math.cos(2 * Math.PI * i / 15), -0.5, 4 * Math.sin(2 * Math.PI * i / 15));
        scene.add(cylinder);
    }

    let horseGeometry = new THREE.PolyhedronGeometry(
        HorseModel.vertices,
        HorseModel.faces
    );

    let colors = ['#ffffff', '#00ff00', '#ff0000', '#0000ff', '#ffaa00'];

    for (let i = 0; i < 15; i++) {
        const horseMaterial = new THREE.MeshPhongMaterial({
            color: colors[Math.floor(i % colors.length)],
            specular: 0x222222,
            shininess: 16,
            shading: THREE.FlatShading
        });
        let horse = new THREE.Mesh(horseGeometry, horseMaterial);
        horse.position.set(4 * Math.cos(2 * Math.PI * i / 15), -0.75 - Math.sin(i) / 5, 4 * Math.sin(2 * Math.PI * i / 15));
        horse.rotateY(-Math.PI*2/15 * i + 0.7);
        horse.scale.set(1, 1, 1);
        scene.add(horse);
    }
}

function updateForFrame() {
    let loopFrame = frameNumber % 360;
    if (loopFrame > 360) {
        loopFrame = 360 - loopFrame;
    }
    camera.position.x = Math.sin(loopFrame) * 30;
    camera.position.z = Math.cos(loopFrame) * 30;
    camera.lookAt(new THREE.Vector3(0, -0.5, 0));
}

function installOrbitControls() {
    controls = new OrbitControls(camera, canvas);
    controls.noPan = true;
    controls.noZoom = true;
    controls.staticMoving = true;
    const move = () => {
        controls.update();
        if (!animating) {
            render();
        }
    }
    const down = () => {
        document.addEventListener("mousemove", move, false);
    }
    const up = () => {
        document.removeEventListener("mousemove", move, false);
    }

    function touch(event) {
        if (event.touches.length == 1) {
            move();
        }
    }

    canvas.addEventListener("mousedown", down, false);
    canvas.addEventListener("touchmove", touch, false);
}

function doAnimateCheckbox() {
    const run = document.getElementById("animateCheckbox").checked;
    if (run != animating) {
        animating = run;
        if (animating) {
            requestAnimationFrame(doFrame);
        }
    }
}

function doFrame() {
    if (animating) {
        frameNumber+=0.01;
        updateForFrame();
        render();
        requestAnimationFrame(doFrame);
    }
}

function init() {
    try {
        canvas = document.getElementById("glcanvas");
        renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, alpha: false});
    } catch (e) {
        document.getElementById("message").innerHTML = "<b>Sorry, an error occurred:<br>" + e + "</b>";
        return;
    }
    document.getElementById("animateCheckbox").checked = false;
    document.getElementById("animateCheckbox").onchange = doAnimateCheckbox;
    createWorld();
    installOrbitControls();
    render();
}

document.addEventListener('DOMContentLoaded', init);
