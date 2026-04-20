import { Rect, Vec2 } from "@jbwg/shared/math";
import { roomParser, Room, Tile, TileLayer, axisSeparatedCollisionTrace } from "@jbwg/shared/game";
import { WebSocket } from "ws";
import { readFileSync } from "fs";
import { parser } from "@jbwg/shared/parser";
import { PlayerAttributes, PlayerSnapshot, PlayerState, ServerPacket, SnapshotPacket } from "@jbwg/shared/game";

const timeStep = 1000 / 60; // 60 fps

interface Player extends PlayerAttributes, PlayerState {
    ws: WebSocket;
    latestInputTimestamp: number;
}

function loadRoom(name: string): Result<Room> {
    const data = readFileSync(`../../assets/rooms/${name}.json`, { encoding: "utf8" });
    const json = JSON.parse(data);
    const result = roomParser(json);
    return result;
}

type Result<T> =
    | Success<T>
    | Failure;

type Success<T> = {
    success: true;
    value: T;
}

type Failure = {
    success: false;
    reason?: string[];
}

type ClientPacketTag =
    | "INPUT"
    | "GOTO_ROOM"
    | "CHAT_MESSAGE";

type ClientPacket =
    | ClientInputPacket
    | ClientMessagePacket
    | GotoRoomPacket;

type ClientPacketWithSender = ClientPacket & { sender: number };

interface ClientInputPacket extends ClientPacketBase {
    tag: "INPUT";
    movementDirection: Vec2;
    timestamp: number;
}

interface ClientMessagePacket extends ClientPacketBase {
    tag: "CHAT_MESSAGE";
    message: string;
    isGlobal?: boolean;
}

interface ClientPacketBase {
    tag: ClientPacketTag;
}

interface GotoRoomPacket extends ClientPacketBase {
    tag: "GOTO_ROOM";
    room?: string;
    door?: string;
}

function sendToWs(ws: WebSocket, packet: ServerPacket) {
    ws.send(JSON.stringify(packet));
}

export class GameServer {
    rooms = new Map<string, Room>();
    players = new Map<number, Player>();

    onConnection(ws: WebSocket) {
        const player: Player = {
            ws: ws,
            latestInputTimestamp: 0,
            isGuest: true,
            networkId: this.nextPlayerId(),
            position: Vec2.zero,
            velocity: Vec2.zero,
        }

        this.newPlayer(player);

        console.log(`Client ${player.networkId} connected`);

        ws.addEventListener("close", (event) => {
            console.log(`Client ${player.networkId} disconnected`);
            this.deletePlayer(player);
        });

        ws.addEventListener("message", (event) => {
            console.log("Received message from client", event.data);
            const packet = JSON.parse(event.data as string);
            packet.tag = typeof packet.tag === "string"
                ? packet.tag
                : "";
            packet.sender = player.networkId;

            if (packet.tag) {
                this.handlePacket(packet);
            }
        });

        ws.addEventListener("error", (event) => {
            console.log(`Client ${player.networkId} disconnected`);
            console.warn(event);
            this.deletePlayer(player);
        });
    }

    currentPlayerId = 0;
    nextPlayerId(): number {
        return this.currentPlayerId++;
    }

    handlePacket(packet: ClientPacketWithSender) {
        const tag = packet.tag;
        console.log(`Received packet with tag ${tag}:`, packet)
        switch (tag) {
            case "GOTO_ROOM": {
                const senderId = packet.sender;
                const sender = this.players.get(senderId);
                const defaultRoom = "bigMap";
                const roomName = typeof packet.room === "string"
                    ? packet.room ?? defaultRoom
                    : "";
                const doorId = typeof packet.door === "string"
                    ? packet.door
                    : "";

                const roomResult = this.getOrLoadRoom(roomName);

                if (!roomResult.success) {
                    break;
                }

                const room = roomResult.value;

                if (sender) {
                    sendToWs(sender.ws, {
                        tag: "ROOM",
                        room: room,
                    });

                    sender.room = roomName;
                    sender.velocity = Vec2.zero;

                    if (doorId) {
                        const object = room.objects.find(o => o.id === doorId);

                        if (object?.type === "door") {
                            sender.position = Vec2.copy(object.position);

                            break;
                        }
                    }

                    const spawn = room.objects.find(o => o.type === "spawn");

                    if (spawn) {
                        sender.position = Vec2.copy(spawn.position);
                    }
                }

                break;
            }
            case "CHAT_MESSAGE": {
                console.log("Handling chat message");
                const senderId = packet.sender;
                const isGlobal = !!packet.isGlobal;
                const message = typeof packet.message === "string"
                    ? packet.message
                    : "";

                if (message) {
                    console.log("Sending chat message to all clients");
                    this.sendToAll({
                        tag: "CHAT_MESSAGE",
                        senderId: senderId,
                        message: message,
                        isGlobal: isGlobal,
                    });
                }

                break;
            }
            case "INPUT": {
                const movementDirectionResult = parser.vec2(packet.movementDirection);

                if (movementDirectionResult.success) {
                    const sender = this.players.get(packet.sender);
                    const roomResult = this.getRoom(sender?.room ?? "");

                    if (sender && roomResult.success) {
                        playerMovementProcess(sender, movementDirectionResult.value, roomResult.value);

                        const inputTimestamp = typeof packet.timestamp === "number"
                            ? packet.timestamp
                            : 0;

                        if (inputTimestamp > sender.latestInputTimestamp) {
                            sender.latestInputTimestamp = inputTimestamp;
                        }
                    }
                }

                break;
            }
            default: {
                console.warn(`Packet with unknown tag ${tag} received.`);
                break;
            }
        }
    }

    start() {
        const timeStep = 1000 / 15; // 15 fps
        setInterval(() => this.step(), timeStep);
    }

    step() {
        this.sendSnapshotToAllPlayers();
    }

    sendToAll(packet: ServerPacket) {
        for (const [networkId, player] of this.players) {
            sendToWs(player.ws, packet);
        }
    }

    sendSnapshotToAllPlayers() {
        const playerSnapshots: PlayerSnapshot[] = [];

        for (const [networkId, player] of this.players) {
            const playerSnapshot: PlayerSnapshot = {
                networkId: networkId,
                room: player.room,
                position: player.position,
                velocity: player.velocity
            };

            playerSnapshots.push(playerSnapshot);
        }

        const snapshot: SnapshotPacket = {
            tag: "SNAPSHOT",
            latestClientInputTimestamp: 0,
            timestamp: performance.now(),
            players: playerSnapshots,
        }

        for (const [networkId, player] of this.players) {
            snapshot.latestClientInputTimestamp = player.latestInputTimestamp;
            sendToWs(player.ws, snapshot);
        }
    }

    newPlayer(player: Player) {
        this.sendToAll({
            tag: "NEW_PLAYER",
            networkId: player.networkId,
            name: player.name,
            isGuest: player.isGuest
        });

        const initPlayers: PlayerAttributes[] = [];

        for (const [networkId, player] of this.players) {
            initPlayers.push({
                networkId: networkId,
                isGuest: player.isGuest,
                name: player.name,
            });
        }

        sendToWs(player.ws, {
            tag: "INIT",
            yourNetworkId: player.networkId,
            yourName: player.name,
            yourIsGuest: player.isGuest,
            initPlayers: initPlayers,
        });

        this.players.set(player.networkId, player);
    }

    deletePlayer(player: Player) {
        this.players.delete(player.networkId);

        this.sendToAll({
            tag: "DELETE_PLAYER",
            playerId: player.networkId,
        });
    }

    getRoom(name: string): Result<Room> {
        let room = this.rooms.get(name);

        if (room) {
            return {
                success: true,
                value: room,
            }
        }

        return {
            success: false,
        }
    }

    getOrLoadRoom(name: string): Result<Room> {
        const getRoomResult = this.getRoom(name);

        if (getRoomResult.success) {
            return getRoomResult;
        }

        const loadRoomResult = loadRoom(name);

        if (loadRoomResult.success) {
            return loadRoomResult;
        }
        else {
            console.error(loadRoomResult.reason);

            return {
                success: false,
                reason: ["Unable to load room"],
            }
        }
    }
}

function playerMovementProcess(player: Player, movementDirection: Vec2, room: Room) {
    // normalize movement direction
    const mag = Math.sqrt(movementDirection.x * movementDirection.x + movementDirection.y * movementDirection.y)
    movementDirection = movementDirection.divide(mag);

    const playerRect = new Rect(
        player.position.x,
        player.position.y,
        14,
        14,
    );
    const velocity = movementDirection.multiply(1.5);
    player.position = axisSeparatedCollisionTrace(playerRect, velocity, room);
}
