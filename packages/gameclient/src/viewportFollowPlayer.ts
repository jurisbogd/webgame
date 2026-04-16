import { Vec2 } from "@jbwg/shared/math";
import { getViewport } from "./CanvasRenderingContext2dGraphics";

interface Player {
    position: Vec2;
};

export function viewportFollowPlayer(player: Player) {
    const viewport = getViewport();

    viewport.position = player.position;
};