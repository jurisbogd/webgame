// import { Vec2 } from "../math.js";
// import { isDefined, parse } from "../utils.js";

// export type Room = {
//     name: string;
//     chunks: SpatialMap<Chunk>;
// }

// export class SpatialMap<T> {
//     xMap = new Map<number, Map<number, T>>();

//     has(coord: Vec2) {
//         return isDefined(this.get(coord));
//     };

//     get(coord: Vec2) {
//         const yMap = this.xMap.get(coord.x);

//         if (isDefined(yMap)) {
//             const value = yMap.get(coord.y);
//             return value;
//         }
//         else {
//             return undefined;
//         };
//     };

//     set(coord: Vec2, value: T) {
//         const yMap = this.xMap.get(coord.x);

//         if (isDefined(yMap)) {
//             yMap.set(coord.y, value);
//         }
//         else {
//             const newMap = new Map();
//             this.xMap.set(coord.x, newMap);
//             newMap.set(coord.y, value);
//         };
//     };
// }

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

// export function init2dArray<T>(width: number, height: number, defaultGenerator: () => T) {
//     // const array = new Array<T[]>(width);

//     // for (let i = 0; i < width; ++i) {
//     //     array[i] = new Array<T>(height);
//     //     for (let j = 0; j < height; ++j) {
//     //         array[i][j] = defaultGenerator();
//     //     }
//     // }

//     const array = Array(width).map(
//         () => Array(height).map(defaultGenerator)
//     );

//     return array;
// }

// export function parseRoom(o: any) {
//     if (!isDefined(o)) return undefined;

//     const name = parse.string(o.name);

//     if (!isDefined(name)) return undefined;

//     const chunks = parse.array(
//         o.chunks,
//         parseChunk
//     );

//     if (!isDefined(chunks)) return undefined;

//     const chunkMap = new SpatialMap<Chunk>();

//     for (const chunk of chunks) {
//         chunkMap.set(chunk.position, chunk);
//     }
// }

// // export function parseTileLayer() {

// // }

// export function parseChunk(x: any): Chunk | undefined {
//     if (!isDefined(x)) {
//         return undefined;
//     };

//     const position = parse.vec2(x.position);

//     if (!isDefined(position)) {
//         return undefined;
//     };

//     const tileLayers = parse.array(
//         x.tileLayers,
//         tileLayer => parseTileLayer(
//             tileLayer,
//             parseTile,
//             () => { return { id: -1, tileset: "" } }
//         )
//     );

//     const featureLayers = parse.array(
//         x.featureLayers,
//         featureLayer => parseTileLayer(
//             featureLayer,
//             parseFeature,
//             () => { return { id: -1, tileset: "", z: 0 } }
//         )
//     );

//     if (!isDefined(tileLayers) || !isDefined(featureLayers)) {
//         return undefined;
//     };

//     return {
//         position,
//         tileLayers,
//         featureLayers
//     }
// }

// function parseTileLayer<T extends TileType>(x: any, parseTile: (x: any) => T | undefined, defaultTile: () => T): TileLayer<T> | undefined {
//     const offset = parse.vec2(x);
//     const tiles = parse.array2d(
//         x.tiles,
//         parseTile,
//         defaultTile
//     );

//     if (isDefined(offset) && isDefined(tiles)) {
//         return { offset, tiles }
//     }
//     else {
//         return undefined;
//     }
// }

// function parseTile(x: any): Tile | undefined {
//     const id = parse.number(x.id);
//     const tileset = parse.string(x.id);

//     if (isDefined(id) && isDefined(tileset)) {
//         return { id, tileset }
//     }
//     else {
//         return undefined;
//     }
// }

// function parseFeature(x: any): Feature | undefined {
//     const id = parse.number(x.id);
//     const tileset = parse.string(x.id);
//     const z = parse.number(x.z) ?? 0;

//     if (isDefined(id) && isDefined(tileset)) {
//         return { id, tileset, z }
//     }
//     else {
//         return undefined;
//     }
// }

// // type Parser<T> = (x: any) => T | undefined

// // function parserCompose(parsers: any) {
// //     return (x: any) => {
// //         const ts = {};

// //         for (const key in parsers) {
// //             const t = parsers[key](x[key])

// //             if (!isDefined(t)) {
// //                 return undefined
// //             };

// //             ts[key] = t;
// //         }

// //         return ts;
// //     }
// // }

// // const tileLayerParser = parserCompose({
// //     offset: vec2Parser,
// //     tiles: array2dParser(tileParser),
// // });