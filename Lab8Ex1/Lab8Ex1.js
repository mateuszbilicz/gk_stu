let camera,
    graphics,
    frameNumber = 0,
    cone,
    sliderScale, sliderTranslateX, sliderTranslateY, sliderRotate,
    scale = 1,
    translateX = 0,
    translateY = 0,
    rotate = 0,
    loadingImages = true,
    textureImages = new Array(),
    textureImageURLs = [
        "textures/brick.jpg",
        "textures/clouds.jpg",
        "textures/earth.jpg"
    ];

function draw() {

    scale = sliderScale.value(0);
    rotate = sliderRotate.value(0);
    translateX = sliderTranslateX.value(0);
    translateY = sliderTranslateY.value(0);

    drawTextureCanvas(); // Draws the canvas that displays the texture.

    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    if (loadingImages) {
        return;
    }

    const texnum = Number(document.getElementById("texture").value),
        image = textureImages[texnum];
    glEnable(GL_TEXTURE_2D);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, image.width, image.height, 0, GL_RGBA, GL_UNSIGNED_BYTE, image);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);

    glMatrixMode(GL_TEXTURE);
    glLoadIdentity();
    glTranslatef(translateX, translateY, 0);
    glRotatef(rotate, 0, 0, 1);
    glScalef(scale, scale, 1);
    glMatrixMode(GL_MODELVIEW);

    camera.apply();

    glRotatef(-90, 1, 0, 0);
    glScalef(1.3, 1.3, 1.3);
    drawModel(cone);
}

function drawTextureCanvas() {
    if (loadingImages) {
        graphics.fillStyle = "white";
        graphics.fillRect(0, 0, 300, 300);
        graphics.fillStyle = "black";
        graphics.font = "14px serif";
        graphics.fillText("Waiting for images to load...", 10, 40);
        return;
    }
    graphics.clearRect(0, 0, 300, 300);
    graphics.save();
    graphics.translate(100, 200);
    graphics.scale(1, -1);
    graphics.translate(translateX * 100, translateY * 100);
    graphics.rotate(rotate / 180 * Math.PI);
    graphics.scale(scale, scale);
    graphics.lineWidth = 5 / scale;
    graphics.strokeStyle = "white";
    graphics.strokeRect(-.5, -.5, 100, 100);
    graphics.lineWidth = 1 / scale;
    graphics.strokeStyle = "black";
    graphics.strokeRect(-.5, -.5, 100, 100);
    graphics.restore();
}

function drawModel(model) {
    glEnableClientState(GL_VERTEX_ARRAY);
    glVertexPointer(3, GL_FLOAT, 0, model.vertexPositions);
    glEnableClientState(GL_NORMAL_ARRAY);
    glNormalPointer(GL_FLOAT, 0, model.vertexNormals);
    glEnableClientState(GL_TEXTURE_COORD_ARRAY);
    glTexCoordPointer(2, GL_FLOAT, 0, model.vertexTextureCoords);
    glDrawElements(GL_TRIANGLES, model.indices.length, GL_UNSIGNED_BYTE, model.indices);
    glDisableClientState(GL_VERTEX_ARRAY);
    glDisableClientState(GL_NORMAL_ARRAY);
    glDisableClientState(GL_TEXTURE_COORD_ARRAY);
}

function initGL() {
    glEnable(GL_LIGHTING);
    glEnable(GL_LIGHT0);
    glEnable(GL_NORMALIZE);
    glEnable(GL_DEPTH_TEST);
    glMaterialfv(GL_FRONT_AND_BACK, GL_AMBIENT_AND_DIFFUSE, [1, 1, 1, 1]); // white, for texturing
    glClearColor(0, 0, 0, 1);
}

function loadImages() {
    let loadedCt = 0;
    for (let i = 0; i < textureImageURLs.length; i++) {
        textureImages[i] = new Image();
        textureImages[i].onload = imageLoaded;
        textureImages[i].src = textureImageURLs[i];
    }

    function imageLoaded() {
        loadedCt++;
        if (loadedCt == textureImageURLs.length) {
            loadingImages = false;
            glEnable(GL_TEXTURE_2D);
            const texnum = Number(document.getElementById("texture").value),
                image = textureImages[texnum];
            try {
                glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, image.width, image.height, 0, GL_RGBA, GL_UNSIGNED_BYTE, image);
            } catch (e) {
                document.getElementById("headline").innerHTML = "Can't access texture.<br>Note: Some browsers can't use a file from a local disk."
                return;
            }
            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);  // MUST set this since we don't have mipmaps
            draw();
            document.getElementById("texture").disabled = false;
        }
    }
}

function changeTexture() {
    const texnum = Number(document.getElementById("texture").value);
    document.getElementById("texcanvas").style.backgroundImage = "url('" + textureImageURLs[texnum] + "')";
    const image = textureImages[texnum];
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, image.width, image.height, 0, GL_RGBA, GL_UNSIGNED_BYTE, image);
    draw();
}

function doReset() {
    sliderRotate.setValue(0, 0);
    sliderScale.setValue(0, 1);
    sliderTranslateX.setValue(0, 0);
    sliderTranslateY.setValue(0, 0);
    camera.lookAt(10, 7, 20);
    draw();
}

function init() {
    try {
        glsimUse("maincanvas");
        const texcanvas = document.getElementById("texcanvas");
        graphics = texcanvas.getContext('2d');
    } catch (e) {
        document.getElementById("canvas-holder").innerHTML = "<p><b>Sorry, an error occurred:<br>" +
            e + "</b></p>";
        return;
    }
    document.getElementById("reset").onclick = doReset;
    document.getElementById("texture").value = "0";
    document.getElementById("texture").onchange = changeTexture;
    document.getElementById("texture").disabled = true;
    sliderRotate = new SliderCanvas(document.getElementById("scRotate"));
    sliderRotate.addSlider({label: "rotate", min: -180, max: 180, value: 0});
    sliderScale = new SliderCanvas(document.getElementById("scScale"));
    sliderScale.addSlider({label: "scale", min: 0.5, max: 2, step: 0.01, value: 1, decimals: 2});
    sliderTranslateX = new SliderCanvas(document.getElementById("scTransX"));
    sliderTranslateX.addSlider({label: "x-trans.", min: -0.5, max: 0.5, step: 0.01, value: 0, decimals: 2});
    sliderTranslateY = new SliderCanvas(document.getElementById("scTransY"));
    sliderTranslateY.addSlider({label: "y-trans.", min: -0.5, max: 0.5, step: 0.01, value: 0, decimals: 2});
    sliderRotate.onChange = draw;
    sliderScale.onChange = draw;
    sliderTranslateX.onChange = draw;
    sliderTranslateY.onChange = draw;
    initGL();
    camera = new Camera();
    camera.setScale(1);
    camera.lookAt(10, 7, 20);
    camera.installTrackball(draw);
    cone = uvCone(0.5, 1, 15);
    sliderRotate.draw();
    sliderScale.draw();
    sliderTranslateX.draw();
    sliderTranslateY.draw();
    drawTextureCanvas();
    loadImages();
}

document.addEventListener("DOMContentLoaded", init);