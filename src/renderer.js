"use strict";

// --- CICLO DI RENDERING ---
function render(time) {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Posizioni delle uniform nello shader
    var u_matrixLoc = gl.getUniformLocation(program, "u_matrix");
    var u_worldLoc = gl.getUniformLocation(program, "u_worldMatrix");
    var u_lightDirLoc = gl.getUniformLocation(program, "u_lightDirection");
    var u_textureLoc = gl.getUniformLocation(program, "u_texture");

    gl.uniform3f(u_lightDirLoc, settings.luceX, settings.luceY, settings.luceZ);

    // Matrice viewProjection
    var viewProjectionMatrix = getViewProjectionMatrix(gl);

    // Matrice modello comune (cric)
    var carrozzeriaMatrix = m4.identity();
    carrozzeriaMatrix = m4.translate(carrozzeriaMatrix, 0, settings.sollevaCric, 0);

    var matrix = m4.multiply(viewProjectionMatrix, carrozzeriaMatrix);
    gl.uniformMatrix4fv(u_matrixLoc, false, matrix);
    gl.uniformMatrix4fv(u_worldLoc, false, carrozzeriaMatrix);

    // --- 1. CARROZZERIA ---
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureCarrozzeria);
    gl.uniform1i(u_textureLoc, 0);
    glm.drawMesh(gl, meshCarrozzeria, program);

    // --- 2. FONDO ---
    gl.uniformMatrix4fv(u_matrixLoc, false, matrix);
    gl.uniformMatrix4fv(u_worldLoc, false, carrozzeriaMatrix);
    gl.bindTexture(gl.TEXTURE_2D, textureFondo);
    glm.drawMesh(gl, meshFondo, program);

    // --- 3. RUOTE ---
    var rotazioneRadianti = settings.ruotaGomme * Math.PI / 180;
    gl.bindTexture(gl.TEXTURE_2D, textureRuota);

    var ruote = [
        { x: 1.2, z: 2.0 },  // anteriore sinistra
        { x: -1.2, z: 2.0 },  // anteriore destra
        { x: 1.2, z: -2.0 },  // posteriore sinistra
        { x: -1.2, z: -2.0 }   // posteriore destra
    ];

    for (var i = 0; i < ruote.length; i++) {
        var rMat = m4.identity();
        rMat = m4.translate(rMat, 0, settings.sollevaCric, 0);
        rMat = m4.translate(rMat, ruote[i].x, 0.4, ruote[i].z);
        rMat = m4.xRotate(rMat, rotazioneRadianti);

        matrix = m4.multiply(viewProjectionMatrix, rMat);
        gl.uniformMatrix4fv(u_matrixLoc, false, matrix);
        gl.uniformMatrix4fv(u_worldLoc, false, rMat);
        glm.drawMesh(gl, meshRuota, program);
    }

    requestAnimationFrame(render);
}
