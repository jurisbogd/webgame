import { Vec2 } from "../math.js";
import { isDefined } from "../utils.js";

// export type Room = {
//     name: string;
//     chunks: SpatialMap<Chunk>;
// }

export class SpatialMap<T> {
    xMap = new Map<number, Map<number, T>>();

    has(coord: Vec2) {
        return isDefined(this.get(coord));
    };

    get(coord: Vec2) {
        const yMap = this.xMap.get(coord.x);

        if (isDefined(yMap)) {
            const value = yMap.get(coord.y);
            return value;
        }
        else {
            return undefined;
        };
    };

    set(coord: Vec2, value: T) {
        const yMap = this.xMap.get(coord.x);

        if (isDefined(yMap)) {
            yMap.set(coord.y, value);
        }
        else {
            const newMap = new Map();
            this.xMap.set(coord.x, newMap);
            newMap.set(coord.y, value);
        };
    };
}

// export type Chunk = {
//     position: Vec2;
//     tileLayers: TileLayer<Tile>[];
//     featureLayers: TileLayer<Feature>[];
// }

// export type Tile = {
//     id: number;
//     tileset: string;
// }

// export type Feature = {
//     id: number;
//     tileset: string;
//     z: number;
// }

// export type TileType = Tile | Feature;

// export type TileLayer<T extends TileType> = {
//     offset: Vec2;
//     tiles: T[][];
// }

export function init2dArray<T>(width: number, height: number, defaultGenerator: () => T) {
    const array = Array(width).map(
        () => Array(height).map(defaultGenerator)
    );

    return array;
}