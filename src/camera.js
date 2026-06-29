"use strict";

// --- TELECAMERA (stile Blender) ---
// Coordinate sferiche attorno a un target
var cameraTheta = 0.5;      // angolo orizzontale (radians)
var cameraPhi = 0.8;        // angolo verticale (radians)
var cameraRadius = 15;      // distanza dal target
var cameraTarget = [0, 0, 0]; // punto guardato

// Stato interno per il dragging del mouse
var _camState = null;       // 'orbit', 'pan' o null
var _camLastX = 0, _camLastY = 0;

// Restituisce la posizione della telecamera nello spazio 3D
function getCameraPosition() {
    return [
        cameraTarget[0] + Math.sin(cameraTheta) * Math.sin(cameraPhi) * cameraRadius,
        cameraTarget[1] + Math.cos(cameraPhi) * cameraRadius,
        cameraTarget[2] + Math.cos(cameraTheta) * Math.sin(cameraPhi) * cameraRadius
    ];
}

// Calcola la viewProjectionMatrix (proiezione * vista)
function getViewProjectionMatrix(gl) {
    var fov = 60 * Math.PI / 180;
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var projectionMatrix = m4.perspective(fov, aspect, 1, 2000);

    var cameraPosition = getCameraPosition();
    var cameraMatrix = m4.lookAt(cameraPosition, cameraTarget, [0, 1, 0]);
    var viewMatrix = m4.inverse(cameraMatrix);

    return m4.multiply(projectionMatrix, viewMatrix);
}

// Inizializza gli event listener del mouse sulla canvas
function setupCameraInput(canvas) {
    canvas.addEventListener('mousedown', function (e) {
        if (e.button === 1) { // middle click
            e.preventDefault();
            _camState = e.shiftKey ? 'pan' : 'orbit';
            _camLastX = e.clientX;
            _camLastY = e.clientY;
        }
    });

    canvas.addEventListener('mouseup', function (e) {
        if (e.button === 1) { _camState = null; }
    });

    canvas.addEventListener('mousemove', function (e) {
        var deltaX = e.clientX - _camLastX;
        var deltaY = e.clientY - _camLastY;
        _camLastX = e.clientX;
        _camLastY = e.clientY;

        if (_camState === 'orbit') {
            cameraTheta -= deltaX * 0.005;
            cameraPhi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraPhi - deltaY * 0.005));
        } else if (_camState === 'pan') {
            var factor = cameraRadius * 0.002;
            var forward = [
                Math.sin(cameraTheta) * Math.sin(cameraPhi),
                Math.cos(cameraPhi),
                Math.cos(cameraTheta) * Math.sin(cameraPhi)
            ];
            var right = Normalize(Cross(forward, [0, 1, 0]));
            var up = Cross(right, forward);
            cameraTarget[0] += (right[0] * deltaX + up[0] * deltaY) * factor;
            cameraTarget[1] += (right[1] * deltaX + up[1] * deltaY) * factor;
            cameraTarget[2] += (right[2] * deltaX + up[2] * deltaY) * factor;
        }
    });

    canvas.addEventListener('wheel', function (e) {
        e.preventDefault();
        cameraRadius *= (1 + e.deltaY * 0.001);
        cameraRadius = Math.max(1, Math.min(100, cameraRadius));
    });

    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
}
