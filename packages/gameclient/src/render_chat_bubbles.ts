import { getRenderScale, getViewport } from './CanvasRenderingContext2dGraphics'
import { Game } from './index'
import { get_player } from './Player'

interface ChatBubble {
    timestamp: number,
    element: HTMLDivElement,
}

const playerIdChatLocationMap = new Map<number, HTMLDivElement>();
const chatBubbles: ChatBubble[] = [];
const chatBubbleExpireTimeMs = 5000;
// const chatBubbleDisplayDistance = 100;

export function newChatLocation(
    ui: HTMLDivElement,
    playerId: number,
) {
    console.log(`creating new chat location for player ${playerId}`);

    const chatLocation = document.createElement("div");
    chatLocation.className = "chat-location";
    playerIdChatLocationMap.set(playerId, chatLocation);
    ui.appendChild(chatLocation);

    return chatLocation;
}

export function newChatBubble(
    ui: HTMLDivElement,
    playerId: number,
    message: string,
) {
    console.log(`creating new chat bubble for player ${playerId}`);

    const chatLocation = playerIdChatLocationMap.get(playerId)
        ?? newChatLocation(ui, playerId);

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

export function renderChatBubbles(game: Game) {
    clearExpiredChatBubbles();

    // const playerPosition = get_player(game)?.position;

    for (const [playerId, chatLocation] of playerIdChatLocationMap) {
        const otherPosition = game.entities.get(playerId)?.position;

        if (!otherPosition) {
            chatLocation.remove();
            playerIdChatLocationMap.delete(playerId);
            continue;
        }

        // if (!playerPosition) {
        //     chatLocation.style.display = "none";
        //     continue;
        // }

        // const diff = playerPosition.subtract(otherPosition);
        // const distance = diff.x !== 0 && diff.y !== 0
        //     ? Math.sqrt(diff.x * diff.x + diff.y * diff.y)
        //     : 0;

        // if (distance > chatBubbleDisplayDistance) {
        //     chatLocation.style.display = "none";
        //     continue;
        // }

        const viewport = getViewport();
        const renderScale = getRenderScale();
        const chatLocationY = (otherPosition.x - viewport.left) * renderScale;
        const chatLocationX = (otherPosition.y - viewport.top - 40) * renderScale;

        chatLocation.style.display = "flex";
        chatLocation.style.top = chatLocationX + "px";
        chatLocation.style.left = chatLocationY + "px";
    }
}