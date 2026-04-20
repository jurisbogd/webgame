import express from "express";
import { getClientDist } from "./getClientDist.js";
import http from "http";
import { WebSocketServer } from "ws";
import { GameServer } from "./GameServer.js";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server: server });
const gameServer = new GameServer();

wss.on("connection", (ws, req) => {
    // accept only connections via /gameserver route
    if (req.url !== "/gameserver") {
        ws.close();
        return;
    }

    gameServer.onConnection(ws);
});

const clientDist = getClientDist();
app.use(express.static(clientDist));
app.use("/assets", express.static("../../assets"));

// app.post("/signup", (req, res) => { });
// app.post("/signin", (req, res) => { });
// app.post("/signout", (req, res) => { });
// app.get("/userdata", (req, res) => { });

gameServer.start();
server.listen(8000, () => {
    console.log("Site and server listening on port 8000");
});

// app.use(express.json());

// const clientDist = getClientDist();

// app.use(express.static(clientDist));
// app.use("/assets", express.static("../../assets"))

// app.use((err: unknown, req: any, res: any, next: any) => {
//     if (err instanceof SyntaxError && "status" in err && (err as any).type === "entity.parse.failed") {
//         return res.status(400).json({
//             error: "Invalid JSON body"
//         });
//     }

//     console.error("Unhandled error:", err);

//     return res.status(500).json({
//         error: "Internal server error"
//     });
// });

// type HttpMethod =
//     | "POST"
//     | "GET";

// async function callDbServer(route: string, method: HttpMethod, body: any) {
//     return fetch(dbserverUrl + route, {
//         method: method,
//         headers: {
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify(body)
//     });
// }

// app.post("/register", async (req, res) => {
//     try {
//         const username = req.body.username;
//         const password = req.body.password;

//         const upstream = await callDbServer("/register", "POST", {
//             username: username,
//             password: password,
//         });

//         const data = await upstream.json();
//         return res.status(upstream.status).json(data);
//     } catch (err) {
//         console.error(err);

//         return res.status(500).json({
//             error: ["Internal server error"]
//         });
//     }
// });

// app.post("/login", async (req, res) => {
//     try {
//         const username = req.body.username;
//         const password = req.body.password;

//         const upstream = await callDbServer("/register", "POST", {
//             username: username,
//             password: password,
//         });

//         const data = await upstream.json();
//         return res.status(upstream.status).json(data);
//     } catch (err) {
//         console.error(err);

//         return res.status(500).json({
//             error: ["Internal server error"]
//         });
//     }
// });

// const server = app.listen(8000)