import { Vec2 } from "@jbwg/shared/math";
import { drawTile } from "../Draw";
import { Room, TileLayer } from "../Room";
import { render } from "../CanvasRenderingContext2dGraphics";

type Tilesets = Record<string, HTMLImageElement>;

export function renderTileLayer(tilesets: Tilesets, room: Room, tileLayer: TileLayer, zs?: number[]) {
    for (let i = 0; i < tileLayer.length; ++i) {
        const tile = tileLayer[i];

        if (!tile.tileset || tile.id === -1) {
            continue;
        };

        const tileSize = 16;

        const row = i % room.width;
        const column = Math.floor(i / room.width);

        // const x = row * tileSize;
        // const y = column * tileSize;
        // const position = new Vec2(x, y);
        const position = new Vec2(row, column).multiply(tileSize);

        const tileset = tilesets[tile.tileset];

        if (!tileset) {
            console.warn(`Unknown tileset ${tile.tileset}`);
            continue;
        };

        const draw = drawTile(tileset, tile.id, position);

        if (!draw) {
            continue;
        };

        if (zs) {
            draw.depth = draw.bottom + zs[i];
        };

        render(draw, !!zs);
    };
};