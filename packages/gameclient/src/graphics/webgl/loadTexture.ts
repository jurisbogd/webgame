import { createWebGLTextureFromImage } from "./createWebGLTextureFromImage";

interface Texture {
    texture: WebGLTexture;
    width: number;
    height: number;
}

export async function loadTexture(
    gl: WebGL2RenderingContext,
    url: string
): Promise<Texture> {
    const image = new Image();

    image.src = url;
    await image.decode();

    const texture = createWebGLTextureFromImage(gl, image);
    const width = image.width;
    const height = image.height;

    return {
        texture,
        width,
        height,
    }
}