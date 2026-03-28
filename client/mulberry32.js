export function mulberry32(seed) {
    return function () {
        seed = (seed + 0x9e3779b9) | 0;
        let z = seed;
        z ^= z >>> 16;
        z = Math.imul(z, 0x21f0aaad);
        z ^= z >>> 15;
        z = Math.imul(z, 0x735a2d97);
        z ^= z >>> 15;
        return z;
    }
}