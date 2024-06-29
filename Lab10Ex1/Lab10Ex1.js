"use strict";
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

let canvas, renderer, scene, camera, controls, animating = false, frameNumber = 0, texture;

function render() {
    renderer.render(scene, camera);
}

function createWorld() {
    renderer.setClearColor("black");
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(30, canvas.width / canvas.height, 0.1, 100);
    camera.position.z = 30;
    let light;
    light = new THREE.DirectionalLight('#fff', 1);
    light.position.set(2, 1, 1);
    scene.add(light);
    camera.add(light);
    scene.add(camera);
    light.castShadow = true;
    drawChess1();
}

function drawChess1() {
    let material = new THREE.MeshPhongMaterial({
        color: '#fff',
        matcap: texture,
        reflectivity: 1,
        shininess: 16,
        specular: '#fff'
    });
    cone(1, 5, 0, -2, material);
    cone(1, 1, Math.PI, 0, material);
    cone(1, 1, 0, -0.5, material);
    cone(0.8, 0.4, 0, -0.3, material);
    cone(0.9, 0.6, 0, -0.4, material);
    cone(1, 0.5, Math.PI, -1.25, material);
    cone(1, 0.5, 0, 0.75, material);
    box(0.3, 0.8, Math.PI / 4, 1.2, material);
    box(0.3, 0.8, -Math.PI / 4, 1.2, material);
}

function box(width, height, rotate, translateY, material) {
    const geometry = new THREE.BoxGeometry(width, width, height),
        cube = new THREE.Mesh(geometry, material);
    cube.position.y = translateY;
    cube.rotateY(Math.PI / 2);
    cube.rotateX(rotate);
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);
}

function cone(radius, height, rotate, translateY, material) {
    const geometry = new THREE.ConeGeometry(radius, height, 64),
        cone = new THREE.Mesh(geometry, material);
    cone.rotateZ(rotate);
    cone.position.y = translateY;
    // geometry.translate(0, translateY, 0);
    scene.add(cone);
    cone.castShadow = true;
    cone.receiveShadow = true;
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
        frameNumber += 0.01;
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
    texture = new THREE.TextureLoader().load('matcap-porcelain-white.jpg');
    let imgChecker = setInterval(() => {
        if (texture.source.data) {
            clearInterval(imgChecker);
            render();
        }
    }, 100);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    document.getElementById("animateCheckbox").checked = false;
    document.getElementById("animateCheckbox").onchange = doAnimateCheckbox;
    createWorld();
    installOrbitControls();
    render();
}

document.addEventListener('DOMContentLoaded', init);

