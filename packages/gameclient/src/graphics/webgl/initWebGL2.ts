export function initWebGL2(
    canvas: HTMLCanvasElement,
    options?: WebGLContextAttributes
): WebGL2RenderingContext {
    const gl = canvas.getContext("webgl2", options);

    if (!gl) {
        throw new Error("WebGL2 is not supported or could not be initialized.");
    }

    return gl;
}