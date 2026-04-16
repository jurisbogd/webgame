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

function xAxisCollisionTrace(
    rect: Rect,
    dx: number,
    room: Room,
) {
    if (dx === 0) return 0;

    const dir = Math.sign(dx);
    let remaining = dx;

    // Vertical span of the rect in tile coordinates
    const yStart = Math.floor(rect.y / tileSize);
    const yEnd = Math.floor((rect.y + rect.h - 1) / tileSize);

    while (remaining !== 0) {
        const step = dir; // move 1px at a time (can optimize later)

        // Leading edge depending on direction
        const nextX = rect.x + step;
        const edgeX = dir > 0
            ? nextX + rect.w - 1
            : nextX;

        const tileX = Math.floor(edgeX / tileSize);

        // Check all tiles along vertical span
        let blocked = false;
        for (let ty = yStart; ty <= yEnd; ty++) {
            if (
                tileX < 0 ||
                tileX >= room.width ||
                ty < 0 ||
                ty >= room.height ||
                !room.walkable[tileX + ty * room.width]
            ) {
                blocked = true;
                break;
            }
        }

        if (blocked) break;

        rect.x += step;
        remaining -= step;
    }

    return rect.x;
}

function yAxisCollisionTrace(
    rect: Rect,
    dy: number,
    room: Room,
) {
    if (dy === 0) return 0;

    const dir = Math.sign(dy);
    let remaining = dy;

    // Vertical span of the rect in tile coordinates
    const xStart = Math.floor(rect.x / tileSize);
    const xEnd = Math.floor((rect.x + rect.w - 1) / tileSize);

    while (remaining !== 0) {
        const step = dir; // move 1px at a time (can optimize later)

        // Leading edge depending on direction
        const nextY = rect.y + step;
        const edgeY = dir > 0
            ? nextY + rect.h - 1
            : nextY;

        const tileY = Math.floor(edgeY / tileSize);

        // Check all tiles along vertical span
        let blocked = false;
        for (let tx = xStart; tx <= xEnd; tx++) {
            if (
                tileY < 0 ||
                tileY >= room.height ||
                tx < 0 ||
                tx >= room.width ||
                !room.walkable[tx + tileY * room.width]
            ) {
                blocked = true;
                break;
            }
        }

        if (blocked) break;

        rect.y += step;
        remaining -= step;
    }

    return rect.y;
}