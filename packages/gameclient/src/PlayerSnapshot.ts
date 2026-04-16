import { Vec2 } from "@jbwg/shared/math";

export interface PlayerSnapshot {
    networkId: number;
    position: Vec2;
    velocity: Vec2;
}
