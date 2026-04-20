import { getRenderScale, getViewport } from '../CanvasRenderingContext2dGraphics'
import { Game, Player } from '../Game';
import { getYourPlayer } from '../Player'

interface ChatBubble {
    timestamp: number,
    element: HTMLDivElement,
}

interface PlayerOverhead {
    element: HTMLDivElement,
    chatLocation: HTMLDivElement,
}

const playerOverheads = new Map<number, PlayerOverhead>();
const chatBubbles: ChatBubble[] = [];
const chatBubbleExpireTimeMs = 8000;

export function getOverhead(
    ui: HTMLDivElement,
    player: Player,
) {

    const existingOverhead = playerOverheads.get(player.networkId);

    if (existingOverhead) {
        return existingOverhead;
    }

    console.log(`Creating new overhead ui element for player ${player.networkId}`);

    const overheadElement = document.createElement("div");
    overheadElement.className = "overhead";
    ui.appendChild(overheadElement);

    const chatLocation = document.createElement("div");
    chatLocation.className = "chat-location";
    overheadElement.appendChild(chatLocation);

    const playerNameTag = document.createElement("div");
    playerNameTag.className = "overhead-nametag";
    playerNameTag.textContent = player.name;
    overheadElement.appendChild(playerNameTag);

    if (player.isGuest) {
        const guestTag = document.createElement("span")
        guestTag.className = "overhead-nametag-guest";
        guestTag.textContent = "(Guest)";
        playerNameTag.appendChild(document.createTextNode(" "));
        playerNameTag.appendChild(guestTag);
    }

    const overhead: PlayerOverhead = {
        element: overheadElement,
        chatLocation: chatLocation,
    }

    playerOverheads.set(player.networkId, overhead);

    return overhead;
}

function clearOrphanedOverheads(players: Map<number, Player>) {
    for (const [playerId, overhead] of playerOverheads) {
        if (!players.has(playerId)) {
            overhead.element.remove();
            playerOverheads.delete(playerId);
        }
    }
}

export function renderPlayerOverheads(
    game: Game
) {
    clearOrphanedOverheads(game.entities);
    clearExpiredChatBubbles();

    const yourRoom = getYourPlayer(game)?.room;

    for (const [_, player] of game.entities) {
        const overhead = getOverhead(game.ui, player);

        if (!yourRoom || yourRoom !== player.room) {
            overhead.element.style.display = "none";
            continue;
        }

        const viewport = getViewport();
        const renderScale = getRenderScale();
        const overheadY = (player.position.x - viewport.left) * renderScale;
        const overheadX = (player.position.y - viewport.top - 30) * renderScale;

        overhead.element.style.display = "flex";
        overhead.element.style.top = overheadX + "px";
        overhead.element.style.left = overheadY + "px";
    }
}

export function newChatBubble(
    ui: HTMLDivElement,
    player: Player,
    message: string,
) {
    console.log(`creating new chat bubble for player ${player.networkId}`);

    const overhead = playerOverheads.get(player.networkId)
        ?? getOverhead(ui, player);

    const chatLocation = overhead.chatLocation;

    const chatBubbleElement = document.createElement("div");
    chatBubbleElement.className = "chat-bubble";
    chatBubbleElement.innerText = message;
    chatLocation.appendChild(chatBubbleElement);

    const chatBubble = {
        timestamp: performance.now(),
        element: chatBubbleElement,
    };

    chatBubbles.push(chatBubble);
}

function clearExpiredChatBubbles() {
    const currentTime = performance.now();

    while (chatBubbles.length > 0 && chatBubbles[0].timestamp + chatBubbleExpireTimeMs < currentTime) {
        console.log(`removing chat bubble`);

        const chatBubble = chatBubbles.shift();

        if (!chatBubble) {
            continue;
        }

        chatBubble.element.remove();
    }
}