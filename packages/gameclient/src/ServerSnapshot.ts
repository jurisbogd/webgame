import { PlayerSnapshot } from "./PlayerSnapshot";

export interface ServerSnapshot {
    timestamp: number;
    latestClientTime: number;
    players: PlayerSnapshot[];
}
