"use strict";

let gl,
    canvas,
    a_coords_loc,
    a_normal_loc,
    u_modelview,
    u_projection,
    u_normalMatrix,
    u_material,
    u_lights,
    projection = mat4.create(),
    modelview = mat4.create(),
    normalMatrix = mat3.create(),
    frameNumber = 0,
    matrixStack = [],
    currentColor = [1, 1, 1],
    rotateX = 0, rotateY = 0,
    animating = false,
    windmillOBJ;

function translateIFS(model, coords) {
    let i = -1;
    model.vertexPositions = model.vertexPositions.map(point => {
        i++;
        if (i == 3) i = 0;
        return point + coords[i];
    });
    return model;
}

function wing() {
    let cone1 = createModel(translateIFS(uvCone(0.2, 1.6), [0, 0, 0])),
        cone2 = createModel(translateIFS(uvCone(0.2, 0.4), [0, 0, 0]));

    const render = () => {
        mat4.translate(modelview, modelview, [0.1, 0, 1.2]);
        mat4.rotateX(modelview, modelview, 0);
        mat4.rotateY(modelview, modelview, 0);
        cone1.render();
        mat4.translate(modelview, modelview, [0, 0, -1]);
        mat4.rotateX(modelview, modelview, Math.PI);
        mat4.rotateY(modelview, modelview, 0);
        cone2.render();
        mat4.translate(modelview, modelview, [-0.1, 0, 0.2]);
    }

    return {
        render
    };
}

function windmill() {
    let base = createModel(translateIFS(uvCylinder(0.1, 4), [0, 0, 0])),
        wing1 = wing(),
        wing2 = wing(),
        wing3 = wing();

    const render = () => {
        currentColor = [1, 0.75, 0];
        mat4.rotateX(modelview, modelview, Math.PI/2);
        mat4.rotateY(modelview, modelview, 0);
        const pm = Math.PI / 180,
            ang = frameNumber * pm;
        base.render();

        currentColor = [0.6, 0.7, 1];
        mat4.translate(modelview, modelview, [0, 0, -1.8])
        mat4.rotateX(modelview, modelview, -Math.PI/3 + ang);
        wing1.render();
        mat4.rotateX(modelview, modelview, -Math.PI/3);
        wing2.render();
        mat4.rotateX(modelview, modelview, -Math.PI/3);
        wing3.render();
    }

    return {
        render
    }
}

function draw() {
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(projection, Math.PI / 4, 1, 1, 50);
    gl.uniformMatrix4fv(u_projection, false, projection);

    mat4.lookAt(modelview, [10, 0, 0], [0, 0, 0], [0, 1, 0]);

    mat4.rotateX(modelview, modelview, rotateX);
    mat4.rotateY(modelview, modelview, rotateY);

    currentColor = [1, 0, 0];
    cube.render();
    windmillOBJ.render();
}

function pushMatrix() {
    matrixStack.push(mat4.clone(modelview));
}

function popMatrix() {
    modelview = matrixStack.pop();
}

function createModel(modelData) {
    var model = {};
    model.coordsBuffer = gl.createBuffer();
    model.normalBuffer = gl.createBuffer();
    model.indexBuffer = gl.createBuffer();
    model.count = modelData.indices.length;
    gl.bindBuffer(gl.ARRAY_BUFFER, model.coordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexPositions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexNormals, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);
    model.render = function () {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer);
        gl.vertexAttribPointer(a_coords_loc, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(a_normal_loc, 3, gl.FLOAT, false, 0, 0);
        gl.uniform3fv(u_material.diffuseColor, currentColor);
        gl.uniformMatrix4fv(u_modelview, false, modelview);
        mat3.normalFromMat4(normalMatrix, modelview);
        gl.uniformMatrix3fv(u_normalMatrix, false, normalMatrix);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
        if (this.xtraTranslate) {
            popMatrix();
        }
    }
    return model;
}

function createProgram(gl, vertexShaderID, fragmentShaderID, attribute0) {
    const getTextContent = (elementID) => {
        let element = document.getElementById(elementID),
            node = element.firstChild,
            str = "";
        while (node) {
            if (node.nodeType == 3) // this is a text node
                str += node.textContent;
            node = node.nextSibling;
        }
        return str;
    }

    let vertexShaderSource,
        fragmentShaderSource;
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
        throw "Error in vertex shader:  " + gl.getShaderInfoLog(vsh);
    }
    let fsh = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fsh, fragmentShaderSource);
    gl.compileShader(fsh);
    if (!gl.getShaderParameter(fsh, gl.COMPILE_STATUS)) {
        throw "Error in fragment shader:  " + gl.getShaderInfoLog(fsh);
    }
    let prog = gl.createProgram();
    gl.attachShader(prog, vsh);
    gl.attachShader(prog, fsh);
    if (attribute0) {
        gl.bindAttribLocation(prog, 0, attribute0);
    }
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw "Link error in program:  " + gl.getProgramInfoLog(prog);
    }
    return prog;
}

function initGL() {
    let prog = createProgram(gl, "vshader-source", "fshader-source", "a_coords");
    gl.useProgram(prog);
    gl.enable(gl.DEPTH_TEST);

    a_coords_loc = gl.getAttribLocation(prog, "a_coords");
    a_normal_loc = gl.getAttribLocation(prog, "a_normal");
    gl.enableVertexAttribArray(a_coords_loc);
    gl.enableVertexAttribArray(a_normal_loc);

    u_modelview = gl.getUniformLocation(prog, "modelview");
    u_projection = gl.getUniformLocation(prog, "projection");
    u_normalMatrix = gl.getUniformLocation(prog, "normalMatrix");
    u_material = {
        diffuseColor: gl.getUniformLocation(prog, "material.diffuseColor"),
        specularColor: gl.getUniformLocation(prog, "material.specularColor"),
        specularExponent: gl.getUniformLocation(prog, "material.specularExponent")
    };
    u_lights = new Array(4);
    for (let i = 0; i < 4; i++) {
        u_lights[i] = {
            enabled: gl.getUniformLocation(prog, "lights[" + i + "].enabled"),
            position: gl.getUniformLocation(prog, "lights[" + i + "].position"),
            color: gl.getUniformLocation(prog, "lights[" + i + "].color")
        };
    }

    gl.uniform3f(u_material.diffuseColor, 1, 1, 1);
    gl.uniform3f(u_material.specularColor, 0.1, 0.1, 0.1);
    gl.uniform1f(u_material.specularExponent, 32);

    for (let i = 1; i < 4; i++) { // set defaults for lights
        gl.uniform1i(u_lights[i].enabled, 0);
        gl.uniform4f(u_lights[i].position, 0, 0, 1, 0);
        gl.uniform3f(u_lights[i].color, 1, 1, 1);
    }

    gl.uniform1i(u_lights[0].enabled, 1);
    gl.uniform4f(u_lights[0].position, 0, 0, 0, 1);
    gl.uniform3f(u_lights[0].color, 0.6, 0.6, 0.6);

    gl.uniform1i(u_lights[1].enabled, 1);
    gl.uniform4f(u_lights[0].position, 0, 1, 0, 0);
    gl.uniform3f(u_lights[0].color, 0.4, 0.4, 0.4);

    gl.uniform1i(u_lights[2].enabled, 0);
}

function mouseDown(evt) {
    let prevX, prevY;
    prevX = evt.clientX;
    prevY = evt.clientY;
    const mouseMove = (evt) => {
        let dx = evt.clientX - prevX,
            dy = evt.clientY - prevY;
        rotateX += dy / 200;
        rotateY += dx / 200;
        prevX = evt.clientX;
        prevY = evt.clientY;
        draw();
    }
    const mouseUp = (evt) => {
        canvas.removeEventListener("mousemove", mouseMove);
        document.removeEventListener("mouseup", mouseUp);
    }
    canvas.addEventListener("mousemove", mouseMove);
    document.addEventListener("mouseup", mouseUp);
}

function frame() {
    if (animating) {
        frameNumber += 1;
        if (frameNumber > 360) frameNumber -= 360;
        draw();
        requestAnimationFrame(frame);
    }
}

function setIsAnimating() {
    let run = document.getElementById("animCheck").checked;
    if (run != animating) {
        animating = run;
        if (animating)
            requestAnimationFrame(frame);
    }
}

function init() {
    try {
        canvas = document.getElementById("webglcanvas");
        gl = canvas.getContext("webgl");
        if (!gl) {
            throw "Browser does not support WebGL";
        }
    } catch (e) {
        document.getElementById("message").innerHTML =
            "<p>Sorry, could not get a WebGL graphics context.</p>";
        return;
    }
    try {
        initGL();
    } catch (e) {
        document.getElementById("message").innerHTML =
            "<p>Sorry, could not initialize the WebGL graphics context:" + e + "</p>";
        return;
    }
    document.getElementById("animCheck").checked = false;
    document.getElementById("animCheck").addEventListener("change", setIsAnimating);
    document.getElementById("reset").addEventListener("click", function () {
        rotateX = rotateY = 0;
        frameNumber = 0;
        draw();
    });
    canvas.addEventListener("mousedown", mouseDown);

    windmillOBJ = windmill();

    cube = createModel(prism(2, 0.4, 2, [0, -2, 0]));

    draw();
}

document.addEventListener("DOMContentLoaded", init);