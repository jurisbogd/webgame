import { Rect, Vec2 } from "@jbwg/shared/math";
import { roomParser, Room, Tile, TileLayer, movePlayer, ClientPacket } from "@jbwg/shared/game";
import { WebSocket } from "ws";
import { readFileSync } from "fs";
import { parser } from "@jbwg/shared/parser";
import { PlayerAttributes, PlayerSnapshot, PlayerState, ServerPacket, SnapshotPacket } from "@jbwg/shared/game";

const timeStep = 1000 / 60; // 60 fps

interface Player extends PlayerAttributes, PlayerState {
    ws: WebSocket;
    latestInputTimestamp: number;
    realRoom?: Room;
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

function sendToWs(ws: WebSocket, packet: ServerPacket) {
    ws.send(JSON.stringify(packet));
}

type ClientPacketWithSender = ClientPacket & { sender: number };

export class GameServer {
    rooms = new Map<string, Room>();
    players = new Map<number, Player>();

    onConnection(ws: WebSocket, isGuest: boolean, username?: string) {
        const player: Player = {
            ws: ws,
            latestInputTimestamp: 0,
            isGuest: isGuest,
            name: username,
            networkId: this.nextPlayerId(),
            position: Vec2.zero,
            velocity: Vec2.zero,
        }

        this.newPlayer(player);

        console.log(`Client ${player.networkId}${username ? ", with username " + username : ""} connected`);

        ws.addEventListener("close", (event) => {
            console.log(`Client ${player.networkId} disconnected`);
            this.deletePlayer(player);
        });

        ws.addEventListener("message", (event) => {
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
        switch (tag) {
            case "GOTO_ROOM": {
                const senderId = packet.sender;
                const sender = this.players.get(senderId);
                const defaultRoom: string = "bigMap";
                let roomName = packet.room ?? defaultRoom
                roomName = typeof roomName === "string"
                    ? roomName
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
                    sender.realRoom = room;
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
                const senderId = packet.sender;
                const isGlobal = !!packet.isGlobal;
                const message = typeof packet.message === "string"
                    ? packet.message
                    : "";

                if (message) {
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
                    const movementDirection = movementDirectionResult.value;
                    const sender = this.players.get(packet.sender);
                    const room = sender?.realRoom;

                    if (sender && room) {
                        const { position, velocity } = movePlayer(sender.position, movementDirection, room);
                        sender.position = position;
                        sender.velocity = velocity;

                        const inputTimestamp = typeof packet.timestamp === "number"
                            ? packet.timestamp
                            : 0;

                        if (inputTimestamp > sender.latestInputTimestamp) {
                            sender.latestInputTimestamp = inputTimestamp;
                        }
                    }
                }
                else {
                    console.error("Failed to parse movement direction:", movementDirectionResult.reason);
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