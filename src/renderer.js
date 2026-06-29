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

    // Matrice viewProjection della Camera
    var viewProjectionMatrix = getViewProjectionMatrix(gl);

    // Matrice modello comune condizionata dal cric
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

    // --- 3. RUOTE E BULLONI ---
    var rotazioneRadianti = settings.ruotaGomme * Math.PI / 180;

    var ruote = [
        { x: 1.2, z: 2.0 },   // 0: anteriore sinistra
        { x: -1.2, z: 2.0 },  // 1: anteriore destra
        { x: 1.2, z: -2.0 },  // 2: posteriore sinistra
        { x: -1.2, z: -2.0 }  // 3: posteriore destra
    ];

    for (var i = 0; i < ruote.length; i++) {
        // Calcola la matrice di base per la ruota corrente (posizione + rotazione del rotolamento)
        var rMat = m4.identity();
        rMat = m4.translate(rMat, 0, settings.sollevaCric, 0);
        rMat = m4.translate(rMat, ruote[i].x, 0.4, ruote[i].z);
        rMat = m4.xRotate(rMat, rotazioneRadianti);

        // Combina con la camera per ottenere la matrice finale di proiezione
        matrix = m4.multiply(viewProjectionMatrix, rMat);
        gl.uniformMatrix4fv(u_matrixLoc, false, matrix);
        gl.uniformMatrix4fv(u_worldLoc, false, rMat);

        // --- A. Disegna lo Pneumatico (Gomma esterna) ---
        gl.bindTexture(gl.TEXTURE_2D, textureRuotaGomma);
        glm.drawMesh(gl, meshRuotaGomma, program);

        // --- B. Disegna il Cerchione (Base metallica) ---
        gl.bindTexture(gl.TEXTURE_2D, textureRuotaCerchio);
        glm.drawMesh(gl, meshRuotaCerchio, program);

        // --- C. Sotto-ciclo per i 5 Bulloni della ruota corrente ---
        gl.bindTexture(gl.TEXTURE_2D, textureBullone);

        for (var j = 0; j < 5; j++) {
            var bMat = m4.copy(rMat); // Copia la matrice della ruota per far girare i bulloni insieme ad essa

            // 1. Ruota attorno all'asse X di 72° moltiplicati per l'indice del bullone (stella del cerchione)
            var alpha = statoBulloni[i][j].angolo * Math.PI / 180;
            bMat = m4.xRotate(bMat, alpha);

            // 2. Sposta il bullone dal centro verso il raggio dei fori (offset provvisorio a 0.2)
            bMat = m4.translate(bMat, 0, 0.2, 0);

            // 3. Gestione interazione individuale (Hover del Mouse)
            // Se il mouse passa sopra questo specifico bullone, diamo un feedback visivo immediato
            if (statoBulloni[i][j].hover) {
                bMat = m4.translate(bMat, 0.08, 0, 0); // Lo facciamo sporgere leggermente in fuori (asse X)
                bMat = m4.xRotate(bMat, time * 0.005);  // Lo facciamo ruotare velocemente su se stesso
            }

            // 4. Gestione animazione svitamento (Estrazione progressiva)
            if (statoBulloni[i][j].estrazione > 0) {
                bMat = m4.translate(bMat, statoBulloni[i][j].estrazione, 0, 0);
                bMat = m4.xRotate(bMat, statoBulloni[i][j].estrazione * 8); // Gira mentre si sfila
            }

            // Calcola le matrici finali per lo shader del bullone
            var bMatrix = m4.multiply(viewProjectionMatrix, bMat);
            gl.uniformMatrix4fv(u_matrixLoc, false, bMatrix);
            gl.uniformMatrix4fv(u_worldLoc, false, bMat);

            glm.drawMesh(gl, meshBullone, program);
        }
    }

    requestAnimationFrame(render);
}