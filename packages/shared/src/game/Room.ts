import { Vec2 } from "../math.js";
import { Parser, parser, ParserResult } from "../parser.js";

export interface Room extends RoomHeader, RoomData { };

interface RoomHeader {
    width: number;
    height: number;
};

interface RoomData {
    floors: TileLayer[];
    features: TileLayer;
    zs: number[];
    walkable: boolean[];
    objects: RoomObject[];
};

export function roomParser(x: any): ParserResult<Room> {
    const roomHeaderResult = roomHeaderParser(x);

    if (!roomHeaderResult.success) {
        return parser.refail(roomHeaderResult, "Unable to parse room header");
    };

    const roomDataResult = roomDataParser(x);

    if (!roomDataResult.success) {
        return parser.refail(roomDataResult, "Unable to parse room data");
    };

    const room: Room = {
        ...roomHeaderResult.value,
        ...roomDataResult.value,
    };

    let i = 0;
    for (const layer of room.floors) {
        if (layer.length !== room.width * room.height) {
            return parser.fail("Floor layer #${i} size doesn't match room size");
        };
        ++i;
    };

    if (room.features.length !== room.width * room.height) {
        return parser.fail("Features layer size doesn't match room size");
    };

    if (room.zs.length !== room.width * room.height) {
        return parser.fail("Zs layer size doesn't match room size");
    };

    if (room.walkable.length !== room.width * room.height) {
        return parser.fail("Walkable layer size doesn't match room size");
    };

    return parser.success(room);
};

type RoomObjectType =
    | "door"
    | "spawn";

interface RoomObjectBase {
    id: string;
    type: RoomObjectType;
    position: Vec2;
}

export type RoomObject =
    | RoomDoor
    | RoomSpawn;

export interface RoomDoor extends RoomObjectBase {
    type: "door";
    destinationDoor: string;
    destinationRoom: string;
}

export interface RoomSpawn extends RoomObjectBase {
    type: "spawn";
}

const roomObjectParser = parser.taggedUnion(
    "type",
    {
        door: parser.compose({
            id: parser.string,
            position: parser.vec2,
            destinationDoor: parser.string,
            destinationRoom: parser.string,
        }) as Parser<RoomDoor>,
        spawn: parser.compose({
            id: parser.string,
            position: parser.vec2,
        }) as Parser<RoomSpawn>,
    }
) as Parser<RoomObject>;

const tileLayerParser = parser.array(
    parser.compose({
        tileset: parser.default(
            parser.string,
            () => undefined,
        ),
        id: parser.number,
    }) as Parser<Tile>,
) as Parser<TileLayer>;

const roomDataParser = parser.compose({
    floors: parser.array(tileLayerParser),
    features: tileLayerParser,
    zs: parser.array(parser.number),
    walkable: parser.array(parser.boolean),
    objects: parser.array(roomObjectParser),
}) as Parser<RoomData>;

const roomHeaderParser = parser.compose({
    width: parser.number,
    height: parser.number,
}) as Parser<RoomHeader>;

interface RoomUtils {
    tileAt: (room: Room, i: number, j: number) => number;
};

export type TileLayer = Tile[];

export interface Tile {
    tileset?: string;
    id: number;
};

export const Room: RoomUtils = {
    tileAt: (room: Room, i: number, j: number) => {
        const tileIndex = i + (j * room.width);

        if (tileIndex > room.width * room.height || tileIndex < 0) {
            return -1;
        };

        return tileIndex;
    },
};