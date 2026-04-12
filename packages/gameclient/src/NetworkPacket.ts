import { Vec2 } from "./math/Vec2.js";
import { isDefined, isNumber, parse } from "@jbwg/shared/utils"

export type NetworkPacket =
    SnapshotPacket |
    SetPositionPacket

export type SnapshotPacket = {
    type: "SNAPSHOT";
}

export type SetPositionPacket = {
    type: "SET_POSITION";
    position: Vec2;
}

export function parseNetworkPacket(jsonObject: any): NetworkPacket | undefined {
    if (!isDefined(jsonObject)) return;

    const type = parse.string(jsonObject.type);

    if (!isDefined(type)) return;

    switch (type) {
        case "SNAPSHOT": return parseSnapshotPacket(jsonObject);
        case "SET_POSITION": return parseSetPositionPacket(jsonObject);
    }
}

function parseSnapshotPacket(jsonObject: any): SnapshotPacket | undefined {
    return;
}

function parseSetPositionPacket(jsonObject: any): SetPositionPacket | undefined {
    // const position = parse.vec2(jsonObject.position);
    const position = parseVec2(jsonObject.position);

    if (!isDefined(position)) return;

    return {
        type: "SET_POSITION",
        position,
    }
}

function parseVec2(jsonObject: any): Vec2 | undefined {
    const x = parse.number(jsonObject.x);
    const y = parse.number(jsonObject.y);

    if (isDefined(x) && isDefined(y)) {
        return new Vec2(x, y);
    }
    else {
        return undefined;
    }
}