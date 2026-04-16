import { Parser, parser } from "@jbwg/shared/parser";
import { ServerSnapshot } from "./ServerSnapshot";
import { PlayerSnapshot } from "./PlayerSnapshot";

type PacketType =
    | "snapshot"
    | "playerEvent";

type PlayerEventReason =
    | "room"
    | "connection";

type PlayerEventAction =
    | "create"
    | "delete";

interface ServerSnapshotPacket extends BaseServerPacket, ServerSnapshot {
    type: "snapshot";
};

interface PlayerEvent extends BaseServerPacket {
    type: "playerEvent";
    reason: PlayerEventReason;
    action: PlayerEventAction;
};

interface BaseServerPacket {
    type: PacketType;
};

export type ServerPacket =
    | ServerSnapshotPacket
    | PlayerEvent;

const serverSnapshotParser = parser.compose({
    timestamp: parser.number,
    latestClientTime: parser.number,
    players: parser.array(
        parser.compose({
            position: parser.vec2,
            velocity: parser.vec2,
            networkId: parser.number,
        }) as Parser<PlayerSnapshot>,
    ),
}) as Parser<ServerSnapshotPacket>;

const playerEventParser = parser.compose({
    playerId: parser.number,
    reason: parser.string,
}) as Parser<PlayerEvent>;

export const serverPacketParser = parser.taggedUnion(
    "type",
    {
        "snapshot": serverSnapshotParser,
        "playerDisconnected": playerEventParser,
    },
) as Parser<ServerPacket>;