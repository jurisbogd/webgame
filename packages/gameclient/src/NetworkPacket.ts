import { Vec2 } from "@jbwg/shared/math";
import { Parser, parser } from "@jbwg/shared/parser"

type SetPositionEvent = {
    id: number,
    x: number,
    y: number,
};

const setPositionParser: Parser<SetPositionEvent> = parser.compose({
    id: parser.number,
    x: parser.number,
    y: parser.number,
});

type SetPlayerIdEvent = {
    id: number,
};

const setPlayerIdParser: Parser<SetPlayerIdEvent> = parser.compose({
    id: parser.number,
});

type NewEntityEvent = {
    id: number,
    room_id: number,
    x: number,
    y: number,
};

const newEntityParser: Parser<NewEntityEvent> = parser.compose({
    id: parser.number,
    room_id: parser.number,
    x: parser.number,
    y: parser.number,
});

type DeletePlayerEvent = {
    id: number,
};

const deletePlayerParser: Parser<DeletePlayerEvent> = parser.compose({
    id: parser.number,
});

type ChatMessageEvent = {
    id: number,
    message: string,
};

const chatMessageParser: Parser<ChatMessageEvent> = parser.compose({
    message: parser.string,
    id: parser.number,
});

type DSRERoom = {
    id: number;
    width: number;
    height: number;
    floor: {
        tileset: string;
        id: string;
    }[][];
    features: {
        tileset: string;
        id: string;
        depth_mod: number;
    }[][];
    objects: {
        type: string;
        tileset: string;
        id: string;
        x: number;
        y: number;
        dest_ord: {
            i: number;
            j: number;
        };
    }[];
};

type SetRoomEvent = {
    room: DSRERoom;
};

const setRoomParser: Parser<SetRoomEvent> = parser.compose({
    room: parser.compose({
        id: parser.number,
        width: parser.number,
        height: parser.number,
        floor: parser.array2d(
            parser.compose({
                tileset: parser.string,
                id: parser.string,
            }),
        ),
        features: parser.array2d(
            parser.default(
                parser.compose({
                    tileset: parser.string,
                    id: parser.string,
                    depth_mod: parser.number,
                }),
                () => { return { tileset: "", id: "", depth_mod: 0 } },
            ),
        ),
        objects: parser.array(
            parser.compose({
                type: parser.stringLiteral("door"),
                tileset: parser.string,
                id: parser.string,
                x: parser.number,
                y: parser.number,
                dest_ord: parser.compose({
                    i: parser.number,
                    j: parser.number,
                }),
            }),
        ),
    }),
});

type SetPlayerRoomEvent = {
    room_id: number;
    player_id: number;
};

const setPlayerRoomParser: Parser<SetPlayerRoomEvent> = parser.compose({
    room_id: parser.number,
    player_id: parser.number,
});

type PlayerSnapshot = {
    position: Vec2;
    velocity: Vec2;
};

type SnapshotPacket = {
    timestamp: number;
    players: PlayerSnapshot[];
};

const snapshotParser: Parser<SnapshotPacket> = parser.compose({
    timestamp: parser.number,
    players: parser.array(
        parser.compose({
            position: parser.vec2,
            velocity: parser.vec2,
        }),
    ),
});

type NetworkEvent =
    | SetPlayerIdEvent
    | SetPositionEvent
    | NewEntityEvent
    | DeletePlayerEvent
    | ChatMessageEvent
    | SetRoomEvent
    | SetPlayerRoomEvent

type EventPacket = {
    events: NetworkEvent[];
}

export type NetworkPacket =
    | EventPacket
    | SnapshotPacket

const networkEventParser: Parser<NetworkEvent> = parser.taggedUnion(
    "tag",
    {
        SET_PLAYER_ID: setPlayerIdParser,
        SET_POSITION: setPositionParser,
        NEW_ENTITY: newEntityParser,
        DELETE_PLAYER: deletePlayerParser,
        CHAT_MESSAGE: chatMessageParser,
        SET_ROOM: setRoomParser,
        SET_PLAYER_ROOM: setPlayerRoomParser,
    },
);

// export const networkEventsParser = parser.compose({
//     events: parser.array(networkPacketParser),
// });

export const eventPacketParser: Parser<EventPacket> = parser.compose({
    events: parser.array(networkEventParser),
});