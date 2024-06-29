"use strict";
let canvas, gl, u_width_loc, u_height_loc, u_pointSize_loc, a_coords_loc, a_coords_buffer, a_color_loc, a_color_buffer,
    POINT_COUNT = 30, POINT_SIZE = 64, positions = new Float32Array(2 * POINT_COUNT),
    velocities = new Float32Array(2 * POINT_COUNT), colors = new Float32Array(3 * POINT_COUNT), isRunning = true,
    u_style_loc, useCustomColor = false, customColor = [1, 1, 1], u_alpha_loc,
    useColors = true, style = 0;

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER, a_coords_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STREAM_DRAW);
    gl.vertexAttribPointer(a_coords_loc, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, a_color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_color_loc, 3, gl.FLOAT, false, 0, 0);
    if (useColors) {
        gl.enableVertexAttribArray(a_color_loc);
    } else {
        gl.disableVertexAttribArray(a_color_loc);
        gl.vertexAttrib3f(a_color_loc, 1, 0, 0);
    }
    gl.drawArrays(gl.POINTS, 0, POINT_COUNT);
    if (gl.getError() != gl.NO_ERROR) {
        console.log("During render, a GL error has been detected.");
    }
}

function createData() {
    for (let i = 0; i < POINT_COUNT; i++) {
        positions[2 * i] = canvas.width / 2;
        positions[2 * i + 1] = canvas.height / 2;
        const speed = 2 + 4 * Math.random(), angle = 2 * Math.PI * Math.random();
        velocities[2 * i] = speed * Math.sin(angle);
        velocities[2 * i + 1] = speed * Math.cos(angle);
        if (useCustomColor) {
            colors[3 * i] = customColor[0];
            colors[3 * i + 1] = customColor[1];
            colors[3 * i + 2] = customColor[2];
        } else {
            colors[3 * i] = Math.random();
            colors[3 * i + 1] = Math.random();
            colors[3 * i + 2] = Math.random();
        }
    }
}

function dynamicColorChange() {
    if (!useCustomColor) return;
    for (let i = 0; i < POINT_COUNT; i++) {
        colors[3 * i] = customColor[0];
        colors[3 * i + 1] = customColor[1];
        colors[3 * i + 2] = customColor[2];
    }
}

function updateData() {
    for (let i = 0; i < POINT_COUNT; i++) {
        positions[2 * i] += velocities[2 * i];
        if (positions[2 * i] < POINT_SIZE / 2 && velocities[2 * i] < 0) {
            positions[2 * i] += 2 * (POINT_SIZE / 2 - positions[2 * i]);
            velocities[2 * i] = Math.abs(velocities[2 * i]);
        } else if (positions[2 * i] > canvas.width - POINT_SIZE / 2 && velocities[2 * i] > 0) {
            positions[2 * i] -= 2 * (positions[2 * i] - canvas.width + POINT_SIZE / 2);
            velocities[2 * i] = -Math.abs(velocities[2 * i]);
        }
        positions[2 * i + 1] += velocities[2 * i + 1];
        if (positions[2 * i + 1] < POINT_SIZE / 2 && velocities[2 * i + 1] < 0) {
            positions[2 * i + 1] += 2 * (POINT_SIZE / 2 - positions[2 * i + 1]);
            velocities[2 * i + 1] = Math.abs(velocities[2 * i + 1]);
        } else if (positions[2 * i + 1] > canvas.height - POINT_SIZE / 2 && velocities[2 * i + 1] > 0) {
            positions[2 * i + 1] -= 2 * (positions[2 * i + 1] - canvas.height + POINT_SIZE / 2);
            velocities[2 * i + 1] = -Math.abs(velocities[2 * i + 1]);
        }
    }
}

function doKey(evt) {
    const key = evt.keyCode;
    if (key == 86) {
        useCustomColor = !useCustomColor;
        if (!useColors) return;
        document.getElementById("customColorEnabled").innerText = useCustomColor ? "ENABLED" : "DISABLED";
        createData();
        return;
    }
    if (key == 32) {
        isRunning = !isRunning;
        if (isRunning) {
            requestAnimationFrame(frame);
        }
        return;
    }
    if (key == 67) {
        useColors = !useColors;
        return;
    }
    if (key >= 48 && key <= 57) {
        style = key - 48;
        gl.uniform1i(u_style_loc, style);
    }
}

function initGL() {
    let prog = createProgram(gl, "vshader-source", "fshader-source", "a_coords", "a_color");
    gl.useProgram(prog);
    u_width_loc = gl.getUniformLocation(prog, "u_width");
    u_height_loc = gl.getUniformLocation(prog, "u_height");
    u_pointSize_loc = gl.getUniformLocation(prog, "u_pointSize");
    a_coords_loc = gl.getAttribLocation(prog, "a_coords");
    a_color_loc = gl.getAttribLocation(prog, "a_color");
    u_alpha_loc = gl.getUniformLocation(prog, "u_alpha");
    gl.uniform1f(u_width_loc, canvas.width);
    gl.uniform1f(u_height_loc, canvas.height);
    gl.uniform1f(u_pointSize_loc, POINT_SIZE);
    gl.uniform1f(u_alpha_loc, 1);
    a_coords_buffer = gl.createBuffer();
    a_color_buffer = gl.createBuffer();
    gl.enableVertexAttribArray(a_coords_loc);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 1);
    u_style_loc = gl.getUniformLocation(prog, "u_style");
    if (gl.getError() != gl.NO_ERROR) {
        console.log("During initialization, a GL error has been detected.");
    }
}

function createProgram(gl, vertexShaderID, fragmentShaderID, attribute0, attribute1) {
    function getTextContent(elementID) {
        let element = document.getElementById(elementID), node = element.firstChild, str = "";
        while (node) {
            if (node.nodeType == 3) str += node.textContent;
            node = node.nextSibling;
        }
        return str;
    }

    let vertexShaderSource, fragmentShaderSource;
    try {
        vertexShaderSource = getTextContent(vertexShaderID);
        fragmentShaderSource = getTextContent(fragmentShaderID);
    } catch (e) {
        throw "Error: Could not get shader source code from script elements.";
    }
    let vsh = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vsh, vertexShaderSource);
    gl.compileShader(vsh);
    if (!gl.getShaderParameter(vsh, gl.COMPILE_STATUS)) {
        throw "Error in vertex shader: " + gl.getShaderInfoLog(vsh);
    }
    let fsh = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fsh, fragmentShaderSource);
    gl.compileShader(fsh);
    if (!gl.getShaderParameter(fsh, gl.COMPILE_STATUS)) {
        throw "Error in fragment shader: " + gl.getShaderInfoLog(fsh);
    }
    let prog = gl.createProgram();
    gl.attachShader(prog, vsh);
    gl.attachShader(prog, fsh);
    if (attribute0) {
        gl.bindAttribLocation(prog, 0, attribute0);
    }
    if (attribute1) {
        gl.bindAttribLocation(prog, 1, attribute1);
    }
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw "Link error in program: " + gl.getProgramInfoLog(prog);
    }
    return prog;
}

function frame() {
    if (isRunning) {
        updateData();
        render();
        requestAnimationFrame(frame);
    }
}

function doResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform1f(u_width_loc, canvas.width);
    gl.uniform1f(u_height_loc, canvas.height);
    if (!isRunning) {
        render();
    }
}

function doMouse(evt) {
    function headTowards(x, y) {
        for (let i = 0; i < POINT_COUNT; i++) {
            let dx = x - positions[2 * i], dy = y - positions[2 * i + 1], dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0.1) {
                const speed = Math.sqrt(velocities[2 * i] * velocities[2 * i] + velocities[2 * i + 1] * velocities[2 * i + 1]);
                velocities[2 * i] = dx / dist * speed;
                velocities[2 * i + 1] = dy / dist * speed;
            }
        }
    }

    const move = (evt) => {
        headTowards(evt.clientX, evt.clientY);
    }
    const up = () => {
        canvas.removeEventListener("mousemove", move, false);
        document.removeEventListener("mouseup", up, false);
    }
    if (evt.which != 1) {
        return;
    }
    if (evt.shiftKey) {
        createData();
        return;
    }
    headTowards(evt.clientX, evt.clientY);
    canvas.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
}

function init() {
    try {
        canvas = document.createElement("canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const options = {alpha: true, depth: false, stencil: false};
        gl = canvas.getContext("webgl", options);
        if (!gl) {
            throw "Browser does not support WebGL";
        }
    } catch (e) {
        let message = document.createElement("p");
        message.innerHTML = "Sorry, could not get a WebGL graphics context. Error: " + e;
        document.body.appendChild(message);
        return;
    }
    try {
        createData();
        initGL();
    } catch (e) {
        let message = document.createElement("p");
        message.innerHTML = "<pre>Sorry, could not initialize graphics context. Error:\n\n" + e + "</pre>";
        document.body.appendChild(message);
        return;
    }
    document.body.appendChild(canvas);
    window.addEventListener("resize", doResize);
    canvas.addEventListener("mousedown", doMouse);
    document.addEventListener("keydown", doKey);
    document.getElementById('colorChoice').addEventListener("input", ev => {
        const base = 1 / 255,
            rgb = hexToRgb(ev.target.value);
        customColor = [base * rgb.r, base * rgb.g, base * rgb.b];
        if (useCustomColor && useColors) {
            dynamicColorChange();
        }
    });
    document.getElementById('alphaInput').addEventListener("input", ev => {
        gl.uniform1f(u_alpha_loc, ev.target.value);
    });
    requestAnimationFrame(frame);
}

function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}