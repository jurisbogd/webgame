import { getViewport } from "./CanvasRenderingContext2dGraphics";
import { Player } from "./index"

export function viewportFollowPlayer(player: Player) {
    const viewport = getViewport();

    viewport.position = player.position;
};