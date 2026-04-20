import { Vec2 } from "@jbwg/shared/math";
import { Parser, parser } from "@jbwg/shared/parser"
import { Room, roomParser } from "@jbwg/shared/game";

export interface SetPositionEvent extends NetworkEventBase {
    tag: "SET_POSITION";
    id: number;
    position: Vec2;
    velocity: Vec2;
};

const setPositionParser: Parser<SetPositionEvent> = parser.compose({
    id: parser.number,
    position: parser.vec2,
    velocity: parser.vec2,
});

export interface SetPlayerIdEvent extends NetworkEventBase {
    tag: "SET_PLAYER_ID";
    id: number;
};

const setPlayerIdParser: Parser<SetPlayerIdEvent> = parser.compose({
    id: parser.number,
});

export interface NewEntityEvent extends NetworkEventBase {
    tag: "NEW_ENTITY";
    id: number;
    room_id: number;
    position: Vec2;
    velocity: Vec2;
};

const newEntityParser: Parser<NewEntityEvent> = parser.compose({
    id: parser.number,
    room_id: parser.number,
    position: parser.vec2,
    velocity: parser.vec2,
});

export interface DeletePlayerEvent extends NetworkEventBase {
    tag: "DELETE_PLAYER";
    id: number;
};

const deletePlayerParser: Parser<DeletePlayerEvent> = parser.compose({
    id: parser.number,
});

export interface ChatMessageEvent extends NetworkEventBase {
    tag: "CHAT_MESSAGE";
    id: number;
    message: string;
};

const chatMessageParser: Parser<ChatMessageEvent> = parser.compose({
    message: parser.string,
    id: parser.number,
});

export interface SetRoomEvent extends NetworkEventBase {
    tag: "SET_ROOM";
    room: Room;
};

const setRoomParser: Parser<SetRoomEvent> = parser.compose({
    room: roomParser,
});

type NetworkEventTag =
    | "SET_PLAYER_ROOM"
    | "SET_POSITION"
    | "SET_PLAYER_ID"
    | "NEW_ENTITY"
    | "DELETE_PLAYER"
    | "CHAT_MESSAGE"
    | "SET_ROOM"

interface NetworkEventBase {
    tag: NetworkEventTag;
};

export interface SetPlayerRoomEvent extends NetworkEventBase {
    tag: "SET_PLAYER_ROOM";
    room_id: number;
    player_id: number;
};

const setPlayerRoomParser: Parser<SetPlayerRoomEvent> = parser.compose({
    room_id: parser.number,
    player_id: parser.number,
});

export type NetworkEvent =
    | SetPlayerIdEvent
    | SetPositionEvent
    | NewEntityEvent
    | DeletePlayerEvent
    | ChatMessageEvent
    | SetRoomEvent
    | SetPlayerRoomEvent

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

const eventPacketParser: Parser<EventPacket> = parser.compose({
    events: parser.array(networkEventParser),
});

type ServerPacketTag =
    | "events"
    | "snapshot";

interface ServerPacketBase {
    tag: ServerPacketTag;
}

export interface EventPacket extends ServerPacketBase {
    tag: "events";
    events: NetworkEvent[];
}

export const networkPacketParser = parser.taggedUnion(
    "tag",
    {
        events: eventPacketParser,
    },
)