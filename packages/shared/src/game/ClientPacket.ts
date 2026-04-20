import { Vec2 } from "../math.js";

type ClientPacketTag =
    | "INPUT"
    | "GOTO_ROOM"
    | "CHAT_MESSAGE";

export type ClientPacket =
    | ClientInputPacket
    | ClientMessagePacket
    | GotoRoomPacket;

interface ClientPacketBase {
    tag: ClientPacketTag;
}

export interface ClientInputPacket extends ClientPacketBase {
    tag: "INPUT";
    movementDirection: Vec2;
    timestamp: number;
}

export interface ClientMessagePacket extends ClientPacketBase {
    tag: "CHAT_MESSAGE";
    message: string;
    isGlobal?: boolean;
}

export interface GotoRoomPacket extends ClientPacketBase {
    tag: "GOTO_ROOM";
    room?: string;
    door?: string;
}
