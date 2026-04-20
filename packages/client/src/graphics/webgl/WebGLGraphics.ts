import { initWebGL2 } from "./initWebGL2";

const canvas = document.getElementById("canvas-2d") as HTMLCanvasElement;

if (!canvas) {
    throw new Error("Unable to initialize canvas");
}

const gl = initWebGL2(canvas);

gl.viewport(0, 0, canvas.width, canvas.height);

function initWebGLQuadBuffer(gl: WebGL2RenderingContext,) {

}

const quadCoords = new Float32Array([
    0, 0,
    1, 0,
    0, 1,
    0, 1,
    1, 0,
    1, 1,
]);

const quadBuffer = gl.createBuffer();

// Push quad to buffer
gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
gl.bufferData(gl.ARRAY_BUFFER, quadCoords, gl.STATIC_DRAW)