import { getViewport } from "../CanvasRenderingContext2dGraphics";
import { Player } from "../Game"

export function viewportFollowPlayer(player: Player) {
    const viewport = getViewport();

    viewport.position = player.position;
};