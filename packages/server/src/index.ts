import express from "express";
import { getClientDist } from "./getClientDist.js";
import http from "http";
import { WebSocketServer } from "ws";
import { GameServer } from "./GameServer.js";
import { deleteSession, getSessionUser, getTokenSessionId, loginUser, registerUser } from "./DbAdapter.js";
import type { Request, Response } from "express";
import cookieParser from "cookie-parser";

const SESSION_COOKIE_NAME = "session";
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server: server });
const gameServer = new GameServer();

wss.on("connection", (ws, req) => {
    if (req.url !== "/gameserver") {
        ws.close();
        return;
    }

    let isGuest = true;
    let username;

    const cookieHeader = req.headers.cookie;


    if (cookieHeader) {
        const token = parseCookies(cookieHeader);
        console.log(token);
        const sessionId = getTokenSessionId(token);
        const user = getSessionUser(sessionId);

        if (user) {
            username = user.username;
            isGuest = false;
        }
    }

    gameServer.onConnection(ws, isGuest, username);
});

const clientDist = getClientDist();
app.use(express.static(clientDist));
app.use("/assets", express.static("../../assets"));

app.use(express.json());
app.use(cookieParser());

export function setSessionCookie(
    res: Response,
    token: string,
    expiresAt: Date
): void {
    const isProd = process.env.NODE_ENV === "production";

    res.cookie(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax", // or "strict" for more sensitive apps
        secure: isProd,
        path: "/",
        expires: expiresAt
    });
}

function parseCookies(cookieHeader: string) {
    const cookies = Object.fromEntries(
        cookieHeader.split(";").map(c => {
            const [k, v] = c.trim().split("=");
            return [k, decodeURIComponent(v)];
        })
    );

    return cookies.session ?? null;
}

function getSessionToken(req: Request) {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return null;
    return parseCookies(cookieHeader);
}

export function deleteSessionCookie(res: Response): void {
    const isProd = process.env.NODE_ENV === "production";

    res.cookie(SESSION_COOKIE_NAME, "", {
        httpOnly: true,
        sameSite: "lax",
        secure: isProd,
        path: "/",
        maxAge: 0
    });
}

app.post("/register", (req, res) => {
    const username = typeof req.body.username === "string"
        ? req.body.username.trim()
        : "";

    const password = typeof req.body.password === "string"
        ? req.body.password
        : "";

    const registerResult = registerUser(username, password);

    if (registerResult.success) {
        const session = registerResult.value;

        setSessionCookie(res, session.token, session.expiresAt);
        return res.status(200).json({
            message: "Registered successfully",
        });
    }
    else {
        return res.status(400).json({
            error: registerResult.error,
        });
    }
});

app.post("/login", (req, res) => {
    const username = typeof req.body.username === "string"
        ? req.body.username.trim()
        : "";

    const password = typeof req.body.password === "string"
        ? req.body.password
        : "";

    const loginResult = loginUser(username, password);

    if (loginResult.success) {
        const session = loginResult.value;

        setSessionCookie(res, session.token, session.expiresAt);
        return res.status(200).json({
            message: "Logged in",
        });
    }
    else {
        return res.status(400).json({
            error: loginResult.error,
        });
    }
});

app.post("/logout", (req, res) => {
    const token = getSessionToken(req);

    if (!token) {
        return res.status(200).json({
            message: "Already logged out",
        });
    }

    const sessionId = getTokenSessionId(token);
    deleteSession(sessionId);

    deleteSessionCookie(res);
    return res.status(200).json({
        message: "Logged out successfully",
    });
});

app.get("/status", (req, res) => {
    const token = getSessionToken(req);

    if (!token) {
        return res.status(200).json({
            loggedIn: false,
        });
    }

    const sessionId = getTokenSessionId(token);
    const user = getSessionUser(sessionId);

    if (user) {
        return res.status(200).json({
            loggedIn: true,
            user: user,
        });
    }
    else {
        deleteSessionCookie(res);

        return res.status(200).json({
            loggedIn: false,
        });
    }
});

gameServer.start();
server.listen(Number(process.env.PORT && 8080), "0.0.0.0", () => {
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