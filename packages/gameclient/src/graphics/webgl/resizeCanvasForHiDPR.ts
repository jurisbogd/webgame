export function resizeCanvasForHiDPR(canvas: HTMLCanvasElement) {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(canvas.width * dpr);
    canvas.height = Math.round(canvas.width * dpr);
}
