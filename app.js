"use strict";

// --- VARIABILI GLOBALI ---
var gl, program;

// --- ENTRY POINT ---
function main() {
    var canvas = document.getElementById("glcanvas");
    gl = canvas.getContext("webgl");
    if (!gl) { alert("WebGL non supportato"); return }

    // Compila gli shader
    program = webglUtils.createProgramFromScripts(gl, ["vertex-shader", "fragment-shader"]);
    gl.useProgram(program);

    // Abilita il test di profondita
    gl.enable(gl.DEPTH_TEST);

    // Setup interfaccia e controlli
    setupGUI();

    // Setup telecamera (input mouse stile Blender)
    setupCameraInput(canvas);

    // Carica tutti gli asset della scena
    loadScene();
}

window.onload = main;
