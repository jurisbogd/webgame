import { readFileSync } from "fs";

export async function loadRoom(name: string, game: any) {
    const data = readFileSync(`../../assets/rooms/${name}.json`, { encoding: "utf8" });
    const room = JSON.parse(data);
    // return JSON.parse(data);
    // console.log("loading room")
    // console.log(room);
    game.rooms.set(name, room);
}