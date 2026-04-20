import { Rect, Vec2 } from "@jbwg/shared/math"
import { Room } from "./Room"

const tileSize = 16;

export function axisSeparatedCollisionTrace(
    rect: Rect,
    velocity: Vec2,
    room: Room,
) {
    rect.x = xAxis(rect, velocity.x, room);
    rect.y = yAxis(rect, velocity.y, room);

    return rect.position;
}

function isSolid(room: Room, i: number, j: number) {
    const tileIndex = i + (j * room.width);
    return !room.walkable[tileIndex];
}

function xAxis(entity: Rect, dx: number, room: Room) {
    if (dx === 0) return entity.x;

    entity.x += dx;

    const top = Math.floor(entity.top / tileSize);
    const bottom = Math.floor(entity.bottom / tileSize);

    if (dx > 0) {
        const right = Math.floor(entity.right / tileSize);

        for (let j = top; j <= bottom; j++) {
            if (isSolid(room, right, j)) {
                return right * tileSize - entity.w / 2 - 0.01;
            };
        };
    }
    else {
        const left = Math.floor(entity.left / tileSize);

        for (let j = top; j <= bottom; j++) {
            if (isSolid(room, left, j)) {
                return (left + 1) * tileSize + entity.w / 2;
            };
        };
    };

    return entity.x;
};

function yAxis(entity: Rect, dy: number, room: Room) {
    if (dy === 0) return entity.y;

    entity.y += dy;

    const left = Math.floor(entity.left / tileSize);
    const right = Math.floor(entity.right / tileSize);

    if (dy > 0) {
        const bottom = Math.floor(entity.bottom / tileSize);

        for (let i = left; i <= right; i++) {
            if (isSolid(room, i, bottom)) {
                return bottom * tileSize - entity.h / 2 - 0.01;
            };
        };
    }
    else {
        const top = Math.floor(entity.top / tileSize);

        for (let i = left; i <= right; i++) {
            if (isSolid(room, i, top)) {
                return (top + 1) * tileSize + entity.h / 2;
            };
        };
    };

    return entity.y;
};