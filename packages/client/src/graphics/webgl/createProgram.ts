export type ShaderSource = string;
export interface WebGLCreateProgramOptions {
    gl: WebGLRenderingContext | WebGL2RenderingContext;
    vertexSource: ShaderSource;
    fragmentSource: ShaderSource;
    attribLocations?: Record<string, number>;
    transformFeedbackVaryings?: string[];
    transformFeedbackBufferMode?: number;
}

function compileShader(
    gl: WebGLRenderingContext | WebGL2RenderingContext,
    type: number,
    source: string
): WebGLShader {
    const shader = gl.createShader(type);
    if (!shader) {
        throw new Error("Failed to create shader.");
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    const ok = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (ok) {
        return shader;
    }

    const info = gl.getShaderInfoLog(shader) ?? "WebGL: Unknown shader compile error.";
    gl.deleteShader(shader);
    throw new Error(info);
}

export function createProgram({
    gl,
    vertexSource,
    fragmentSource,
    attribLocations,
    transformFeedbackVaryings,
    transformFeedbackBufferMode,
}: WebGLCreateProgramOptions): WebGLProgram {
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

    const program = gl.createProgram();
    if (!program) {
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        throw new Error("WebGL: Failed to create program.");
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    if (attribLocations) {
        for (const [name, location] of Object.entries(attribLocations)) {
            gl.bindAttribLocation(program, location, name);
        }
    }

    if (
        transformFeedbackVaryings &&
        "transformFeedbackVaryings" in gl
    ) {
        gl.transformFeedbackVaryings(
            program,
            transformFeedbackVaryings,
            transformFeedbackBufferMode ?? gl.SEPARATE_ATTRIBS
        );
    }

    gl.linkProgram(program);

    const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
        const info = gl.getProgramInfoLog(program) ?? "WebGL: Unknown program link error.";
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        throw new Error(info);
    }

    gl.detachShader(program, vertexShader);
    gl.detachShader(program, fragmentShader);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    return program;
}