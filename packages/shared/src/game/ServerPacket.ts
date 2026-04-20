import { Room } from "./Room.js";
import { Vec2 } from "../math.js";

type ServerPacketTag =
    | "INIT"
    | "ROOM"
    | "CHAT_MESSAGE"
    | "DELETE_PLAYER"
    | "SNAPSHOT"
    | "NEW_PLAYER";

export type ServerPacket =
    | InitPacket
    | RoomPacket
    | ChatMessagePacket
    | DeletePlayerPacket
    | SnapshotPacket
    | NewPlayerPacket;

interface ServerPacketBase {
    tag: ServerPacketTag;
}

export interface ChatMessagePacket extends ServerPacketBase {
    tag: "CHAT_MESSAGE";
    senderId: number;
    message: string;
    isGlobal?: boolean;
}

export interface InitPacket extends ServerPacketBase {
    tag: "INIT";
    yourNetworkId: number;
    yourName?: string;
    yourIsGuest: boolean;
    initPlayers: PlayerAttributes[];
}

export interface RoomPacket extends ServerPacketBase {
    tag: "ROOM";
    room: Room;
}

export interface DeletePlayerPacket extends ServerPacketBase {
    tag: "DELETE_PLAYER";
    playerId: number;
}

export interface NewPlayerPacket extends ServerPacketBase, PlayerAttributes {
    tag: "NEW_PLAYER";
}

export interface SnapshotPacket extends ServerPacketBase {
    tag: "SNAPSHOT";
    latestClientInputTimestamp: number;
    timestamp: number;
    players: PlayerSnapshot[];
}

export interface PlayerSnapshot extends PlayerState {
    networkId: number;
}

export interface PlayerState {
    room?: string;
    position: Vec2;
    velocity: Vec2;
}

export interface PlayerAttributes {
    networkId: number;
    isGuest: boolean;
    name?: string;
}