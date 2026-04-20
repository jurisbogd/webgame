import { getRenderScale, getViewport } from "../CanvasRenderingContext2dGraphics";
import { Game } from "../Game";
import { getYourPlayer } from "../Player";

const playerHighlightsMap = new Map<number, HTMLDivElement>();

const highlightLayer = document.getElementById("highlight-layer") as HTMLDivElement;

function getHighlight(networkId: number) {
    const getHighlight = playerHighlightsMap.get(networkId);

    if (getHighlight) {
        return getHighlight;
    }

    const highlight = document.createElement("div");
    highlight.className = "highlight";
    highlight.style.width = "40px";
    highlight.style.height = "40px";

    highlightLayer.appendChild(highlight);

    playerHighlightsMap.set(networkId, highlight);

    return highlight;
}

export function renderHighlights(game: Game, showHighlights: boolean) {
    const room = getYourPlayer(game)?.room;

    for (const [networkId, player] of game.entities) {
        const highlight = getHighlight(networkId);

        if (!showHighlights) {
            highlight.style.display = "none";
            continue;
        }

        if (player.room !== room) {
            highlight.style.display = "none";
            continue;
        }

        const viewport = getViewport();
        const renderScale = getRenderScale();
        const doorPromptX = (player.latestPosition.x - viewport.left) * renderScale;
        const doorPromptY = (player.latestPosition.y - viewport.top) * renderScale;
        highlight.style.left = doorPromptX + "px";
        highlight.style.top = doorPromptY + "px";
        highlight.style.display = "block";
    }

    for (const [playerId, highlight] of playerHighlightsMap) {
        if (!game.entities.has(playerId)) {
            playerHighlightsMap.delete(playerId);
            highlight.remove();
        }
    }
}