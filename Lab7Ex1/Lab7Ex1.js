let camera,
    optionSliders,
    coneModel15 = uvCone(0.5, 1.2, 15),
    lightRotation = 0,
    lightRotationAdd = 1;

function uvSphere(radius, slices, stacks) {
    let i, j;
    for (j = 0; j < stacks; j++) {
        const latitude1 = (Math.PI / stacks) * j - Math.PI / 2,
            latitude2 = (Math.PI / stacks) * (j + 1) - Math.PI / 2,
            sinLat1 = Math.sin(latitude1),
            cosLat1 = Math.cos(latitude1),
            sinLat2 = Math.sin(latitude2),
            cosLat2 = Math.cos(latitude2);
        glBegin(GL_TRIANGLE_STRIP);
        for (i = 0; i <= slices; i++) {
            const longitude = (2 * Math.PI / slices) * i,
                sinLong = Math.sin(longitude),
                cosLong = Math.cos(longitude),
                x1 = cosLong * cosLat1,
                y1 = sinLong * cosLat1,
                z1 = sinLat1,
                x2 = cosLong * cosLat2,
                y2 = sinLong * cosLat2,
                z2 = sinLat2;
            glNormal3d(x2, y2, z2);
            glVertex3d(radius * x2, radius * y2, radius * z2);
            glNormal3d(x1, y1, z1);
            glVertex3d(radius * x1, radius * y1, radius * z1);
        }
        glEnd();
    }
}

function colorArrayForHue(h, s, v) {
    let r, g, b,
        c, x;
    h = h * 359;
    c = v * s;
    x = (h < 120) ? h / 60 : (h < 240) ? (h - 120) / 60 : (h - 240) / 60;
    x = c * (1 - Math.abs(x - 1));
    x += (v - c);
    switch (Math.floor(h / 60)) {
        case 0:
            r = v;
            g = x;
            b = v - c;
            break;
        case 1:
            r = x;
            g = v;
            b = v - c;
            break;
        case 2:
            r = v - c;
            g = v;
            b = x;
            break;
        case 3:
            r = v - c;
            g = x;
            b = v;
            break;
        case 4:
            r = x;
            g = v - c;
            b = v;
            break;
        case 5:
            r = v;
            g = v - c;
            b = x;
            break;
    }
    let array = new Array(4);
    array[0] = r;
    array[1] = g;
    array[2] = b;
    array[3] = 1;
    return array;
}

function drawCylinder() {
    let i, rgba;
    glBegin(GL_TRIANGLE_STRIP);
    for (i = 0; i <= 64; i++) {
        const angle = 2 * Math.PI / 64 * i,
            x = Math.cos(angle),
            y = Math.sin(angle);
        rgba = colorArrayForHue(i / 64.0, 1, 0.6);
        glColor3dv(rgba);
        glNormal3d(x, y, 0);
        glVertex3d(x, y, 1);
        glVertex3d(x, y, -1);
    }
    glEnd();
    glNormal3d(0, 0, 1);
    glBegin(GL_TRIANGLE_FAN);
    glColor3d(1, 1, 1);
    glVertex3d(0, 0, 1);
    for (i = 0; i <= 64; i++) {
        const angle = 2 * Math.PI / 64 * i,
            x = Math.cos(angle),
            y = Math.sin(angle);
        rgba = colorArrayForHue(i / 64.0, 1, 0.6);
        glColor3dv(rgba);
        glVertex3d(x, y, 1);
    }
    glEnd();
    glNormal3f(0, 0, -1);
    glBegin(GL_TRIANGLE_FAN);
    glColor3d(1, 1, 1);
    glVertex3d(0, 0, -1);
    for (i = 64; i >= 0; i--) {
        const angle = 2 * Math.PI / 64 * i,
            x = Math.cos(angle),
            y = Math.sin(angle);
        rgba = colorArrayForHue(i / 64.0, 1, 0.6);
        glColor3dv(rgba);
        glVertex3d(x, y, -1);
    }
    glEnd();
}

function lights() {
    glColor3d(0.5, 0.5, 0.5);
    const zero = [0, 0, 0, 1];
    glMaterialfv(GL_FRONT_AND_BACK, GL_SPECULAR, zero);
    glEnable(GL_LIGHT0);

    const tdist = Math.sin(lightRotation / 60) * 0.2;

    glMaterialfv(GL_FRONT_AND_BACK, GL_EMISSION, [1, 0, 0, 1]);
    glEnable(GL_LIGHT1);
    glPushMatrix();
    glRotated(-lightRotation, 0, 0, 1);
    glTranslated(0.75 + tdist, 1 + tdist,  Math.sin(lightRotation / 100) * 0.3);
    glLightfv(GL_LIGHT1, GL_POSITION, zero);
    uvSphere(0.1, 16, 8);
    glPopMatrix();

    glMaterialfv(GL_FRONT_AND_BACK, GL_EMISSION, [0, 1, 0, 1]);
    glEnable(GL_LIGHT2);
    glPushMatrix();
    const lp100 = lightRotation + 100;
    glRotated(lp100 * 0.8743, 0, 0, 1);
    glTranslated(0.5 + tdist, 1.25 + tdist, Math.cos(lp100 / 100) * 0.3);
    glLightfv(GL_LIGHT2, GL_POSITION, zero);
    uvSphere(0.1, 16, 8);
    glPopMatrix();


    glMaterialfv(GL_FRONT_AND_BACK, GL_EMISSION, [0, 0, 1, 1]);
    glEnable(GL_LIGHT3);
    glPushMatrix();
    const lm100 = lightRotation - 100;
    glRotated(lm100 * 1.3057, 0, 0, 1);
    glTranslated(1 + tdist, 0.75 + tdist, Math.sin(lm100 / 100) * 0.3);
    glLightfv(GL_LIGHT3, GL_POSITION, zero);
    uvSphere(0.1, 16, 8);
    glPopMatrix();

    glMaterialfv(GL_FRONT_AND_BACK, GL_EMISSION, zero);
}

function drawModelIFS(model) {
    glRotatef(-90, 1, 0, 0);
    glEnableClientState(GL_VERTEX_ARRAY);
    glVertexPointer(3, GL_FLOAT, 0, model.vertexPositions);
    glEnableClientState(GL_NORMAL_ARRAY);
    glNormalPointer(GL_FLOAT, 0, model.vertexNormals);
    glDrawElements(GL_TRIANGLES, model.indices.length, GL_UNSIGNED_BYTE, model.indices);
    glDisableClientState(GL_VERTEX_ARRAY);
    glDisableClientState(GL_NORMAL_ARRAY);
}

function drawBase() {
    glMaterialfv(GL_FRONT_AND_BACK, GL_SPECULAR, [0, 0, 0, 1]);

    glPushMatrix();
    glTranslated(0, -0.5, 0);
    glRotated(-90, 1, 0, 0);
    glScaled(1, 1, 0.1);
    drawCylinder();
    glPopMatrix();
}

function draw() {
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    camera.apply();
    glRotatef(optionSliders.value(0), 0, 1, 0);

    const rgb = [0.75164, 0.60648, 0.22648];
    glMaterialfv(GL_FRONT_AND_BACK, GL_AMBIENT_AND_DIFFUSE, [...rgb, 1]);
    glMaterialfv(GL_FRONT_AND_BACK, GL_SPECULAR, [...rgb, 1]);
    glMateriali(GL_FRONT_AND_BACK, GL_SHININESS, Math.round(0.4 * 128));

    drawBase();

    glColor3d(0.7, 0.7, 0.7);

    drawModelIFS(coneModel15);

    glLightModelfv(GL_LIGHT_MODEL_AMBIENT, [0.15, 0.15, 0.15, 1]);

    lights();
}

function initGL() {
    glEnable(GL_LIGHTING);
    glEnable(GL_LIGHT0);
    glLightfv(GL_LIGHT0, GL_SPECULAR, [0.4, 0.4, 0.4, 1]);
    glLightfv(GL_LIGHT0, GL_DIFFUSE, [1, 1, 1, 1]);
    glEnable(GL_NORMALIZE);
    glEnable(GL_DEPTH_TEST);
    glClearColor(1, 1, 1, 1);

    const dim = [0.5, 0.5, 0.5, 1];
    glLightfv(GL_LIGHT0, GL_DIFFUSE, dim);
    glLightfv(GL_LIGHT0, GL_SPECULAR, dim);

    const red = [1, 0, 0, 1],
        reda = [0.25, 0, 0, 1];
    glLightfv(GL_LIGHT1, GL_AMBIENT, reda);
    glLightfv(GL_LIGHT1, GL_DIFFUSE, red);
    glLightfv(GL_LIGHT1, GL_SPECULAR, red);

    const gr = [0, 1, 0, 1],
        gra = [0, 0.25, 0, 1];
    glLightfv(GL_LIGHT2, GL_AMBIENT, gra);
    glLightfv(GL_LIGHT2, GL_DIFFUSE, gr);
    glLightfv(GL_LIGHT2, GL_SPECULAR, gr);

    const bl = [0, 0, 1, 1],
        bla = [0, 0, 1, 1];
    glLightfv(GL_LIGHT3, GL_AMBIENT, bla);
    glLightfv(GL_LIGHT3, GL_DIFFUSE, bl);
    glLightfv(GL_LIGHT3, GL_SPECULAR, bl);
}

function init() {
    try {
        glsimUse("maincanvas");
    } catch (e) {
        document.getElementById("canvas-holder").innerHTML = `<p><b>Sorry, an error occurred:<br>${e}</b></p>`;
        return;
    }
    optionSliders = new SliderCanvas(document.getElementById("option-sliders"));
    optionSliders.addSlider({label: "Rotation", max: 360, step: 1, value: 0, decimals: 0});
    optionSliders.addSlider({label: "Scale", min: 1, max: 5, step: 0.1, value: 1, decimals: 1});
    optionSliders.draw();
    initGL();
    camera = new Camera();
    camera.setScale(0.8);
    camera.lookAt(2, 2, 5, 0, 0, 0, 0, 1, 0);
    optionSliders.onChange = () => {
        camera.setScale(optionSliders.value(1));
    }
    draw();
    setInterval(() => {
        lightRotation += lightRotationAdd;
        if (lightRotation == 360 || lightRotation == -360) lightRotationAdd = -lightRotationAdd;
        draw();
    }, 30);
}
