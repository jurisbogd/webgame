import { InitPacket, PlayerAttributes, PlayerSnapshot, PlayerState, Room, ServerPacket, SnapshotPacket } from '@jbwg/shared/game';
import { Vec2 } from '@jbwg/shared/math';
import { initServer, Server } from './server';
import { Spritesheet } from './Spritesheet';
import { initGraphics } from './CanvasRenderingContext2dGraphics';
import { KeyboardInput } from './KeyboardInput';
import { load_image, load_spritesheet } from './load_image';
import { Parser, parser } from '@jbwg/shared/parser';

export interface ChatMessage {
    message: string;
    timestamp: number;
}

type PlayerType =
    | "other"
    | "main";

export interface Player {
    networkId: number;
    isGuest: boolean;
    name: string;

    animationTime: number;
    lookDirection: string;

    interpolatedPosition: Vec2;
    interpolatedVelocity: Vec2;

    latestPosition: Vec2;
    latestVelocity: Vec2;
    latestRoom?: string;

    position: Vec2;
    velocity: Vec2;
}

export class Player implements Player {
    animationTime = 0;
    lookDirection = "down";

    interpolatedPosition = Vec2.zero;
    interpolatedVelocity = Vec2.zero;

    latestPosition = Vec2.zero;
    latestVelocity = Vec2.zero;
    latestRoom?: string | undefined;

    position = Vec2.zero;
    velocity = Vec2.zero;

    constructor(networkId: number, isGuest: boolean, name?: string) {
        this.networkId = networkId;
        this.isGuest = isGuest;

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

    server?: Server;

    player_sprite: HTMLImageElement;
    spritesheets: Record<string, Spritesheet<HTMLImageElement>>;
    tilesets: Record<string, HTMLImageElement>;
    backgrounds: Record<string, HTMLImageElement>;

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

        game.server = server;

        for (const spritesheetName of ["tileset_basic", "player_base", "player_basic_demo", "doors"]) {
            const spritesheet = await load_spritesheet(spritesheetName);

            if (spritesheet !== undefined) {
                game.spritesheets[spritesheetName] = spritesheet;
            }
        }

        for (const tilesetName of ["greek_features", "greek_floors"]) {
            const tileset = await load_image(tilesetName);
            if (tileset) {
                game.tilesets[tilesetName] = tileset;
            }
        }

        for (const backgroundName of ["blue_sky", "clouds"]) {
            const background = await load_image(backgroundName);
            if (background) {
                game.backgrounds[backgroundName] = background;
            }
        }

        return game;
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

                return;
            }
            case "ROOM": {
                return;
            }
            case "CHAT_MESSAGE": {
                if (typeof packet.message !== "string" || typeof packet.senderId !== "number") {
                    return;
                }
                this.messageInChatbox(packet.message, packet.senderId);
                return;
            }
            case "DELETE_PLAYER": {
                return;
            }
            case "NEW_PLAYER": {
                return;
            }
            case "SNAPSHOT": {
                const snapshotResult = snapshotPacketParser(packet);

                if (!snapshotResult.success) {
                    return;
                }

                const snapshot = snapshotResult.value;

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
        if (this.server) {
            this.server.ws.send(JSON.stringify(packet));
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

type ClientPacket =
    | ClientInputPacket
    | ClientMessagePacket;

type ClientPacketTag =
    | "CHAT_MESSAGE"
    | "INPUT";

interface ClientPacketBase {
    tag: ClientPacketTag;
}

interface ClientMessagePacket {
    tag: "CHAT_MESSAGE";
    message: string;
    isGlobal: boolean;
}

interface ClientInputPacket {
    tag: "INPUT";
    movementDirection: Vec2;
}
