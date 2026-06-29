"use strict";

// --- STATO DELLA SCENA ---
var meshCarrozzeria = null, textureCarrozzeria = null;
var meshFondo = null, textureFondo = null;

// Componenti della ruota sdoppiate + Bullone singolo
var meshRuotaGomma = null, textureRuotaGomma = null;
var meshRuotaCerchio = null, textureRuotaCerchio = null;
var meshBullone = null, textureBullone = null;

// Contatore aggiornato a 5 asset totali
var _assetsLoaded = 0;

var settings = {
    sollevaCric: 0.0,
    ruotaGomme: 0.0,
    luceX: 1.0,
    luceY: 2.0,
    luceZ: 1.5
};

// --- STRUTTURA DATI INTERATTIVA PER I BULLONI ---
// Gestiamo le 4 ruote in modo indipendente. Ognuna ha 5 bulloni con il proprio stato.
// Indici ruote: 0 = Ant_Sx, 1 = Ant_Dx, 2 = Post_Sx, 3 = Post_Dx (stesso ordine del renderer)
var statoBulloni = [
    // 0. Anteriore Sinistra
    [
        { angolo: 0, estrazione: 0.0, hover: false },
        { angolo: 72, estrazione: 0.0, hover: false },
        { angolo: 144, estrazione: 0.0, hover: false },
        { angolo: 216, estrazione: 0.0, hover: false },
        { angolo: 288, estrazione: 0.0, hover: false }
    ],
    // 1. Anteriore Destra
    [
        { angolo: 0, estrazione: 0.0, hover: false },
        { angolo: 72, estrazione: 0.0, hover: false },
        { angolo: 144, estrazione: 0.0, hover: false },
        { angolo: 216, estrazione: 0.0, hover: false },
        { angolo: 288, estrazione: 0.0, hover: false }
    ],
    // 2. Posteriore Sinistra
    [
        { angolo: 0, estrazione: 0.0, hover: false },
        { angolo: 72, estrazione: 0.0, hover: false },
        { angolo: 144, estrazione: 0.0, hover: false },
        { angolo: 216, estrazione: 0.0, hover: false },
        { angolo: 288, estrazione: 0.0, hover: false }
    ],
    // 3. Posteriore Destra
    [
        { angolo: 0, estrazione: 0.0, hover: false },
        { angolo: 72, estrazione: 0.0, hover: false },
        { angolo: 144, estrazione: 0.0, hover: false },
        { angolo: 216, estrazione: 0.0, hover: false },
        { angolo: 288, estrazione: 0.0, hover: false }
    ]
];

// --- CARICAMENTO ASSET ---
function loadObjAndTexture(objUrl, imgUrl, callback) {
    glm.loadOBJ(objUrl, function (mesh) {
        glm.initMeshBuffers(gl, mesh);

        var texture = gl.createTexture();
        var image = new Image();
        image.src = imgUrl;
        image.onload = function () {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            callback(mesh, texture);
        };
    });
}

function checkIfReady() {
    _assetsLoaded++;
    if (_assetsLoaded >= 5) { // Ora attende tutti e 5 i file OBJ
        document.getElementById("loading").style.display = "none";
        requestAnimationFrame(render);
    }
}

function loadScene() {
    // 1. Scocca
    loadObjAndTexture(
        'blender/source/scocca.obj',
        'blender/textures/Mainbodycoloras1.png',
        function (mesh, tex) {
            meshCarrozzeria = mesh;
            textureCarrozzeria = tex;
            checkIfReady();
        }
    );

    // 2. Fondo
    loadObjAndTexture(
        'blender/source/fondo.obj',
        'blender/textures/Maintyrepaint.png',
        function (mesh, tex) {
            meshFondo = mesh;
            textureFondo = tex;
            checkIfReady();
        }
    );

    // 3. Pneumatico (Gomma)
    loadObjAndTexture(
        'blender/source/pneumatico.obj',
        'blender/textures/mcqueentyrelycolor.png',
        function (mesh, tex) {
            meshRuotaGomma = mesh;
            textureRuotaGomma = tex;
            checkIfReady();
        }
    );

    // 4. Cerchione (Base metallica senza bulloni)
    loadObjAndTexture(
        'blender/source/cerchione.obj',
        'blender/textures/Maintyrepaint.png',
        function (mesh, tex) {
            meshRuotaCerchio = mesh;
            textureRuotaCerchio = tex;
            checkIfReady();
        }
    );

    // 5. Bullone Singolo (Condivide la stessa texture del cerchione)
    loadObjAndTexture(
        'blender/source/bullone.obj',
        'blender/textures/Maintyrepaint.png',
        function (mesh, tex) {
            meshBullone = mesh;
            textureBullone = tex;
            checkIfReady();
        }
    );
}

function setupGUI() {
    var gui = new dat.GUI();
    gui.add(settings, 'sollevaCric', 0, 5).name('Solleva Auto');
    gui.add(settings, 'ruotaGomme', 0, 360).name('Gira Ruote');

    var folderLuce = gui.addFolder('Posizione Luce');
    folderLuce.add(settings, 'luceX', -5, 5);
    folderLuce.add(settings, 'luceY', -5, 5);
    folderLuce.add(settings, 'luceZ', -5, 5);
    folderLuce.open();
}