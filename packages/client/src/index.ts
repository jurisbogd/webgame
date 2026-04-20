import { renderPlayerOverheads } from './render/renderChatBubbles';
import { gameUpdatePlayer, getYourPlayer } from './Player';
import { render_players } from './render/render_player';
import { clear, flushDrawBuffer, getViewport, render } from './CanvasRenderingContext2dGraphics';
import { KeyboardInput } from './KeyboardInput';
import { viewportFollowPlayer } from './render/viewportFollowPlayer';
import { renderTileLayer } from './render/renderTileLayer';
import { Draw } from "./Draw";
import { Vec2 } from '@jbwg/shared/math';
import { renderTiled } from './render/renderTiled';
import { Game } from './Game';
import { ClientInputPacket } from '@jbwg/shared/game';
import { findClosestDoor, renderDoorPrompts } from './render/renderDoorPrompts';
import { renderHighlights } from './render/renderHighlights';

function step(game: Game) {
    if (KeyboardInput.isPressed("enter")) {
        game.chatInput.focus();
    };


    if (KeyboardInput.isPressed("highlight")) {
        game.showHighlights = !game.showHighlights;
    }

    if (KeyboardInput.isPressed("noclip")) {
        game.noclip = !game.noclip;
    }

    // gameUpdatePlayer(game);

    // {
    //     const player = getYourPlayer(game);
    //     if (player !== undefined) {
    //         // queue_event({ tag: "SET_POSITION", position: player.position, velocity: player.velocity });
    //     };
    // };
    gameUpdatePlayer(game);

    const movementDirection = KeyboardInput.movementDirection();
    const inputPacket: ClientInputPacket = {
        tag: "INPUT",
        movementDirection: movementDirection,
        timestamp: performance.now(),
    }
    game.sendToServer(inputPacket);
    game.inputBuffer.push(inputPacket);

    game.interpolateSnapshots();

    {
        const player = getYourPlayer(game)

        if (player) {
            viewportFollowPlayer(player);
        };
    };

    const closestDoor = findClosestDoor(game);

    if (closestDoor && closestDoor.distance < 20 && KeyboardInput.isPressed("interact")) {
        game.sendToServer({
            tag: "GOTO_ROOM",
            room: closestDoor.door.destinationRoom,
            door: closestDoor.door.destinationDoor,
        });
    }

    renderHighlights(game, game.showHighlights);
    renderDoorPrompts(game, closestDoor);

    clear();

    if (game.backgrounds.blue_sky && game.backgrounds.clouds) {
        const viewport = getViewport();
        const blueSkyDraw = Draw.image(game.backgrounds.blue_sky, viewport.left, viewport.top);
        render(blueSkyDraw);

        const clouds = game.backgrounds.clouds;
        game.cloudPosition = game.cloudPosition
            .add(new Vec2(0.2, 0.1))
            .remainder(clouds.width);

        renderTiled(clouds, game.cloudPosition);
    };

    if (game.room) {
        for (const layer of game.room.floors) {
            renderTileLayer(game.tilesets, game.room, layer);
        };
        renderTileLayer(
            game.tilesets,
            game.room,
            game.room.features,
            game.room.zs
        );
    };
    render_players(game)
    renderPlayerOverheads(game)

    flushDrawBuffer(true);

    KeyboardInput.update();
}

const loginFormPanel = document.getElementById("login-form-panel") as HTMLDivElement;
const loginForm = document.getElementById('login-form') as HTMLFormElement;
const loginFormErrors = document.getElementById('login-form-errors') as HTMLDivElement;

const registerFormPanel = document.getElementById("register-form-panel") as HTMLDivElement;
const registerForm = document.getElementById('register-form') as HTMLFormElement;
const registerFormErrors = document.getElementById('register-form-errors') as HTMLDivElement;

const authPanelOverlayDiv = document.getElementById("auth-panel-overlay") as HTMLDivElement;

const topbarLoggedIn = document.getElementById("topbar-logged-in") as HTMLDivElement;
const topbarLoggedOut = document.getElementById("topbar-logged-out") as HTMLDivElement;
const usernameDiv = document.getElementById("username") as HTMLDivElement;
const loginButton = document.getElementById("login-button") as HTMLButtonElement;
const registerButton = document.getElementById("register-button") as HTMLButtonElement;
const logoutButton = document.getElementById("logout-button") as HTMLButtonElement;
const cancelLogin = document.getElementById("cancel-login") as HTMLButtonElement;
const cancelRegister = document.getElementById("cancel-register") as HTMLButtonElement;

loginButton.addEventListener("click", () => {
    authPanelOverlayDiv.classList.remove("hidden");
    loginFormPanel.classList.remove("hidden");
});

registerButton.addEventListener("click", () => {
    authPanelOverlayDiv.classList.remove("hidden");
    registerFormPanel.classList.remove("hidden");
});

cancelLogin.addEventListener("click", () => {
    authPanelOverlayDiv.classList.add("hidden");
    loginFormPanel.classList.add("hidden")
});

cancelRegister.addEventListener("click", () => {
    authPanelOverlayDiv.classList.add("hidden");
    registerFormPanel.classList.add("hidden")
});

logoutButton.addEventListener("click", async () => {
    try {
        const response = await fetch('/logout', {
            method: 'POST',
        });

        window.location.reload();
    } catch (err) {
        console.error(err);
    }
});

try {
    const response = await fetch('/status', {
        method: 'GET'
    });

    if (response.status === 200) {
        const data = await response.json();

        if (data.loggedIn) {
            topbarLoggedIn.classList.remove("hidden");
            usernameDiv.textContent = data.user.username;
        }
        else {
            topbarLoggedOut.classList.remove("hidden");
        }
    }
} catch (err) {
    console.error(err);
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = (document.getElementById("login-username") as HTMLInputElement).value;
    const password = (document.getElementById("login-password") as HTMLInputElement).value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.status === 200) {
            window.location.reload();
        }
        else {
            const data = await response.json();
            const errors = data.error ?? [];
            loginFormErrors.innerHTML = errors.join("<br>");
        }
    } catch (err) {
        console.error(err);
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = (document.getElementById("register-username") as HTMLInputElement).value;
    const password = (document.getElementById("register-password") as HTMLInputElement).value;

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.status === 200) {
            window.location.reload();
        }
        else {
            const data = await response.json();
            const errors = data.error ?? [];
            registerFormErrors.innerHTML = errors.join("<br>");
        }
    } catch (err) {
        console.error(err);
    }
});

const overlay = document.getElementById("overlay") as HTMLDivElement;
const startGameButton = document.getElementById("start-game-button") as HTMLButtonElement;
const loading = document.getElementById("loading");

if (!loading || !overlay || !startGameButton) {
    throw new Error("Missing components");
}

startGameButton.addEventListener('click', async () => {
    overlay.classList.add("hidden");

    const game = await Game.init();

    loading.classList.add("hidden");

    game.chatInput.disabled = false;

    const run = () => {
        step(game)
        requestAnimationFrame(run)
    }

    run()
});
