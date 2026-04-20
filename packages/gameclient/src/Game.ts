import { InitPacket, PlayerAttributes, PlayerSnapshot, ClientPacket, Room, roomParser, ServerPacket, SnapshotPacket, ClientInputPacket, movePlayer } from '@jbwg/shared/game';
import { Vec2 } from '@jbwg/shared/math';
import { initServer } from './server';
import { Spritesheet } from './Spritesheet';
import { initGraphics } from './CanvasRenderingContext2dGraphics';
import { KeyboardInput } from './KeyboardInput';
import { loadImage, loadSpritesheet } from './loadImage';
import { Parser, parser } from '@jbwg/shared/parser';
import { newChatBubble } from './renderChatBubbles';

export interface ChatMessage {
    message: string;
    timestamp: number;
}

export interface Player {
    networkId: number;
    isGuest: boolean;
    name: string;
    room?: string;

    animationTime: number;
    lookDirection: string;

    latestPosition: Vec2;
    latestVelocity: Vec2;
    latestRoom?: string;

    position: Vec2;
    velocity: Vec2;
}

export class Player implements Player {
    animationTime = 0;
    lookDirection = "down";

    latestPosition = Vec2.zero;
    latestVelocity = Vec2.zero;
    latestRoom?: string | undefined;

    position = Vec2.zero;
    velocity = Vec2.zero;

    constructor(networkId: number, isGuest: boolean, name?: string) {
        this.networkId = networkId;
        this.isGuest = isGuest;

        if (typeof name !== "string") {
            name = undefined;
        }

        name = name ?? isGuest
            ? `Player ${networkId}`
            : "";

        this.name = name;
    }
}

export interface Game {
    canvas: HTMLCanvasElement;
    ui: HTMLDivElement;
    chatInput: HTMLTextAreaElement;
    chatContent: HTMLDivElement;

    entities: Map<number, Player>;

    ws?: WebSocket;

    player_sprite: HTMLImageElement;
    spritesheets: Record<string, Spritesheet<HTMLImageElement>>;
    tilesets: Record<string, HTMLImageElement>;
    backgrounds: Record<string, HTMLImageElement>;
    latestSnapshotInputTimestamp: number;
    lastFastForward: number;

    room?: Room;

    yourNetworkId?: number;
    cloudPosition: Vec2;
}

export class Game implements Game {
    spritesheets: Record<string, Spritesheet<HTMLImageElement>> = {};
    tilesets: Record<string, HTMLImageElement> = {};
    backgrounds: Record<string, HTMLImageElement> = {};
    cloudPosition = Vec2.zero;
    entities = new Map<number, Player>();
    inputBuffer: ClientInputPacket[] = [];
    latestSnapshotInputTimestamp: number = 0;
    latestSnapshotTimestamp: number = 0;
    lastFastForward: number = 0;
    snapshotBuffer: SnapshotPacket[] = [];
    renderTime: number = 0;

    dtMod = 0;
    firstSnapshot = true;

    constructor() {
        const canvas = document.getElementById('canvas-2d') as HTMLCanvasElement;

        if (canvas === undefined) throw new Error("Unable to find 'canvas-2d'");

        this.canvas = canvas;

        initGraphics(canvas);
        KeyboardInput.init(canvas);

        // init ui div
        const ui = document.getElementById("ui");

        if (!ui || ui.tagName.toLowerCase() !== "div") {
            console.log(ui?.tagName);
            throw new Error("Unable to find ui div");
        }

        this.ui = ui as HTMLDivElement;

        // init chat
        const chatInput = document.getElementById("chatbox-input");

        if (!chatInput || chatInput.tagName.toLowerCase() !== "textarea") {
            throw new Error("Unable to find chat input textarea");
        }

        this.chatInput = chatInput as HTMLTextAreaElement;
        this.chatInput.addEventListener("keydown", (event) => {
            if (event.code === "Enter" && !event.shiftKey) {
                event.preventDefault();
                const message = this.chatInput.value

                this.sendToServer({
                    tag: "CHAT_MESSAGE",
                    message: message,
                    isGlobal: false,
                });
                // clear chat input
                this.chatInput.value = "";
                // refocus game canvas
                this.canvas.focus();
            }
        });

        const chatContent = document.getElementById("chatbox-content");

        if (!chatContent || chatContent.tagName.toLowerCase() !== "div") {
            throw new Error("Unable to find chat content div");
        }

        this.chatContent = chatContent as HTMLDivElement;
    }

    static async init(): Promise<Game> {
        const game = new Game();

        const server = await initServer(`/gameserver`, (msg) => {
            const packet = JSON.parse(msg.data);
            packet.tag = typeof packet.tag === "string"
                ? packet.tag
                : "";

            if (packet.tag) {
                game.onServerPacket(packet);
            }
        });

        if (!server) {
            throw new Error("Unable to connect to server");
        }

        game.ws = server;

        for (const spritesheetName of ["tileset_basic", "player_base", "player_basic_demo", "doors"]) {
            const spritesheet = await loadSpritesheet(spritesheetName);

            if (spritesheet !== undefined) {
                game.spritesheets[spritesheetName] = spritesheet;
            }
        }

        for (const tilesetName of ["greek_features", "greek_floors"]) {
            const tileset = await loadImage(tilesetName);
            if (tileset) {
                game.tilesets[tilesetName] = tileset;
            }
        }

        for (const backgroundName of ["blue_sky", "clouds"]) {
            const background = await loadImage(backgroundName);
            if (background) {
                game.backgrounds[backgroundName] = background;
            }
        }

        return game;
    }

    interpolateSnapshots() {
        if (!this.firstSnapshot) {
            const timeToLatest = this.latestSnapshotTimestamp - this.renderTime;

            if (timeToLatest < 100) {
                this.dtMod = -0.1;
            }
            else if (timeToLatest < 200) {
                this.dtMod = -0.01;
            }
            else if (timeToLatest < 300 && timeToLatest > 250) {
                this.dtMod = 0;
            }
            else if (timeToLatest >= 300) {
                this.dtMod = 0.01;
            }

            const dt = 1000 / 60;

            this.renderTime += dt + (dt * this.dtMod);
            this.renderTime = Math.min(this.renderTime, this.latestSnapshotTimestamp);

            let laterIdx = 0;
            for (; laterIdx < this.snapshotBuffer.length; ++laterIdx) {
                const snapshot = this.snapshotBuffer[laterIdx];
                console.log("Render time:", this.renderTime, "Snapshot time:", snapshot.timestamp);
                if (snapshot.timestamp >= this.renderTime) {
                    break;
                }
            }

            const later = this.snapshotBuffer[laterIdx];

            console.log(later);

            const earlier = laterIdx > 0
                ? this.snapshotBuffer[laterIdx - 1]
                : later;

            this.snapshotBuffer = this.snapshotBuffer.filter(s => s.timestamp >= earlier.timestamp);

            const timeBetweenSnapshots = later.timestamp - earlier.timestamp;
            const timeFromEarlier = this.renderTime - earlier.timestamp;
            const interpolationFactor = timeBetweenSnapshots > 0
                ? timeFromEarlier / timeBetweenSnapshots
                : 0;

            const interpolatedPlayers: PlayerSnapshot[] = [];
            let eidx = 0;
            for (const lp of later.players) {
                let ep = earlier.players[eidx];
                while (ep?.networkId < lp.networkId && eidx < earlier.players.length) {
                    ++eidx;
                    ep = earlier.players[eidx];
                }

                if (ep?.networkId === lp.networkId) {
                    const position = lp.position
                        .subtract(ep.position)
                        .multiply(interpolationFactor)
                        .add(ep.position);
                    const velocity = lp.velocity
                        .subtract(ep.velocity)
                        .multiply(interpolationFactor)
                        .add(ep.velocity);

                    const interpolatedPlayer: PlayerSnapshot = {
                        networkId: lp.networkId,
                        room: lp.room,
                        position,
                        velocity,
                    }
                    interpolatedPlayers.push(interpolatedPlayer)
                }
                else {
                    interpolatedPlayers.push(lp);
                }
            }

            for (const ip of interpolatedPlayers) {
                if (ip.networkId === this.yourNetworkId) {
                    continue;
                }

                const player = this.entities.get(ip.networkId);

                if (!player) {
                    continue;
                }

                player.position = ip.position;
                player.velocity = ip.velocity;
                player.room = ip.room;
            }
        }
    }

    onServerPacket(packet: ServerPacket) {
        const tag = packet.tag;
        console.log(`Received packet with tag ${tag}`);
        switch (tag) {
            case "INIT": {
                const initResult = initPacketParser(packet);

                if (!initResult.success) {
                    return;
                }

                const init = initResult.value;

                const player = new Player(init.yourNetworkId, init.yourIsGuest, init.yourName);
                this.yourNetworkId = init.yourNetworkId;
                this.entities.set(player.networkId, player);

                for (const playerAttributes of init.initPlayers) {
                    const player = new Player(playerAttributes.networkId, playerAttributes.isGuest, playerAttributes.name);
                    this.entities.set(player.networkId, player);
                }

                this.sendToServer({
                    tag: "GOTO_ROOM",
                })

                return;
            }
            case "ROOM": {
                const roomResult = roomParser(packet?.room);

                if (roomResult.success) {
                    this.room = roomResult.value;
                }

                return;
            }
            case "CHAT_MESSAGE": {
                if (typeof packet.message !== "string" || typeof packet.senderId !== "number") {
                    return;
                }
                this.messageInChatbox(packet.message, packet.senderId);
                newChatBubble(this.ui, packet.senderId, packet.message);
                return;
            }
            case "DELETE_PLAYER": {
                if (typeof packet.playerId !== "number") {
                    return;
                }
                this.entities.delete(packet.playerId);
                return;
            }
            case "NEW_PLAYER": {
                if (typeof packet.networkId !== "number") {
                    return;
                }

                const isGuest = !!packet.isGuest;
                const player = new Player(packet.networkId, isGuest, packet.name);
                this.entities.set(player.networkId, player);

                return;
            }
            case "SNAPSHOT": {
                const snapshotResult = snapshotPacketParser(packet);

                if (!snapshotResult.success) {
                    return;
                }

                const snapshot = snapshotResult.value;

                this.latestSnapshotInputTimestamp = snapshot.latestClientInputTimestamp;
                this.latestSnapshotTimestamp = snapshot.timestamp;

                if (this.firstSnapshot) {
                    this.renderTime = snapshot.timestamp;
                    this.firstSnapshot = false;
                }

                this.snapshotBuffer.push(snapshot);

                for (const playerSnapshot of snapshot.players) {
                    const player = this.entities.get(playerSnapshot.networkId);

                    if (!player) {
                        continue;
                    }

                    player.latestPosition = playerSnapshot.position;
                    player.latestVelocity = playerSnapshot.velocity;
                    player.latestRoom = playerSnapshot.room;
                }

                return;
            }
            default: {
                console.warn(`Unknown server packet with tag ${tag}`);
                return;
            }
        }
    }

    sendToServer(packet: ClientPacket) {
        if (this.ws) {
            this.ws.send(JSON.stringify(packet));
        }
    }

    messageInChatbox(message: string, senderId?: number) {
        const messageDiv = document.createElement("div");
        messageDiv.className = "chatbox-message";

        if (senderId) {
            const sender = this.entities.get(senderId);

            if (sender) {
                const nameSpan = document.createElement("span");
                nameSpan.className = "chatbox-sender-name";
                nameSpan.innerText = sender.name;
                messageDiv.appendChild(nameSpan);

                if (sender.isGuest) {
                    const guestTag = document.createElement("span");
                    guestTag.className = "chatbox-guest-tag";
                    guestTag.innerText = "(Guest)";
                    messageDiv.appendChild(document.createTextNode(" "));
                    messageDiv.appendChild(guestTag);
                }

                messageDiv.appendChild(document.createTextNode(": "));
            }
        }

        const messageText = document.createElement("span");
        messageText.className = "chatbox-text";
        messageText.innerText = message;
        messageDiv.appendChild(messageText);
        this.chatContent.appendChild(messageDiv);
    }
}

const playerSnapshotParser = parser.compose({
    networkId: parser.number,
    position: parser.vec2,
    velocity: parser.vec2,
    room: parser.default(parser.string, () => undefined),
}) as Parser<PlayerSnapshot>;

const snapshotPacketParser = parser.compose({
    latestClientInputTimestamp: parser.number,
    timestamp: parser.number,
    players: parser.array(playerSnapshotParser),
}) as Parser<SnapshotPacket>;

const playerAttributesParser = parser.compose({
    networkId: parser.number,
    name: parser.default(parser.string, () => undefined),
    isGuest: parser.boolean,
}) as Parser<PlayerAttributes>;

const initPacketParser = parser.compose({
    yourNetworkId: parser.number,
    yourName: parser.default(parser.string, () => undefined),
    yourIsGuest: parser.boolean,
    initPlayers: parser.array(playerAttributesParser),
}) as Parser<InitPacket>;
