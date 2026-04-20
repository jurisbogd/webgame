import { Vec2 } from "@jbwg/shared/math";
import { Game } from "../Game";
import { getYourPlayer } from "../Player";
import { getRenderScale, getViewport } from "../CanvasRenderingContext2dGraphics";
import { RoomDoor } from "@jbwg/shared/game";

const uiLayer = document.getElementById("door-prompt");

if (!uiLayer || uiLayer.tagName.toLowerCase() !== "div") {
    console.log(uiLayer?.tagName);
    throw new Error("Unable to find doorPromptsUiLayer div");
}

const doorPrompt = uiLayer as HTMLDivElement;

export function renderDoorPrompts(game: Game, closestDoor: { door: RoomDoor, distance: number } | undefined) {
    if (!closestDoor) {
        doorPrompt.style.display = "none";
        return;
    }

    if (closestDoor.distance > 20) {
        doorPrompt.style.display = "none";
        return;
    }

    const player = getYourPlayer(game);

    if (!player) {
        doorPrompt.style.display = "none";
        return;
    }

    const viewport = getViewport();
    const renderScale = getRenderScale();
    const doorPromptX = (player.position.x - viewport.left) * renderScale + 20;
    const doorPromptY = (player.position.y - viewport.top) * renderScale;
    doorPrompt.style.left = doorPromptX + "px";
    doorPrompt.style.top = doorPromptY + "px";
    doorPrompt.style.display = "block";
}

export function findClosestDoor(game: Game) {
    const room = game.room;
    const player = getYourPlayer(game);

    if (!room || !player) {
        return undefined;
    }

    let closest = undefined;
    let closestDistance = Infinity;

    for (const o of room.objects) {
        if (o.type !== "door") {
            continue;
        }

        const diff = o.position.subtract(player.position);
        const distance = Math.sqrt(diff.x * diff.x + diff.y * diff.y);

        if (distance < closestDistance) {
            closestDistance = distance;
            closest = o;
        }
    }

    if (closest) {
        return {
            door: closest,
            distance: closestDistance,
        }
    }
    else {
        return undefined;
    }
}