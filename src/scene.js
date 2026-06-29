"use strict";

// --- STATO DELLA SCENA ---
// Mesh e texture caricate
var meshCarrozzeria = null, textureCarrozzeria = null;
var meshFondo = null, textureFondo = null;
var meshRuota = null, textureRuota = null;

// Contatore asset caricati (su 3)
var _assetsLoaded = 0;

// Impostazioni controllabili dalla GUI
var settings = {
    sollevaCric: 0.0,
    ruotaGomme: 0.0,
    luceX: 1.0,
    luceY: 2.0,
    luceZ: 1.5
};

// --- CARICAMENTO ASSET ---
// Carica un file .obj e la sua texture, poi chiama il callback
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

// Controlla se tutti gli asset sono stati caricati, poi avvia il rendering
function checkIfReady() {
    _assetsLoaded++;
    if (_assetsLoaded >= 3) {
        document.getElementById("loading").style.display = "none";
        requestAnimationFrame(render);
    }
}

// Carica tutti gli asset della scena
function loadScene() {
    loadObjAndTexture(
        'blender/source/scocca.obj',
        'blender/textures/Mainbodycoloras1.png',
        function (mesh, tex) {
            meshCarrozzeria = mesh;
            textureCarrozzeria = tex;
            checkIfReady();
        }
    );

    loadObjAndTexture(
        'blender/source/fondo.obj',
        'blender/textures/Maintyrepaint.png',
        function (mesh, tex) {
            meshFondo = mesh;
            textureFondo = tex;
            checkIfReady();
        }
    );

    loadObjAndTexture(
        'blender/source/ruota.obj',
        'blender/textures/Maintyrepaint.png',
        function (mesh, tex) {
            meshRuota = mesh;
            textureRuota = tex;
            checkIfReady();
        }
    );
}

// --- INTERFACCIA GUI ---
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
