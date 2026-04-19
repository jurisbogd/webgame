const timeStep = 1000 / 60; // 60 fps

type PlayerId = number;

interface Vector2 {
    x: number;
    y: number;
}

interface Player {
    id: PlayerId;
    room: RoomName;
    position: Vector2;
    velocity: Vector2;
}

type RoomName = string;

class Room {
    name: RoomName;
    players = new Set<Player>();

    constructor(name: RoomName) {
        this.name = name;
    }
}





export class GameServer {
    rooms = new Map<RoomName, Room>();
    players = new Map<PlayerId, Player>();
}









function step() {

}

export function start() {
    setInterval(step, timeStep);
}