import express from "express";
import { getClientDist } from "./getClientDist.js";
import http from "http";
import { WebSocketServer } from "ws";
import { GameServer } from "./GameServer.js";
import { connectWithRetry, deleteSession, getSessionUser, getTokenSessionId, loginUser, registerUser } from "./DbAdapter.js";
import type { Request, Response } from "express";
import cookieParser from "cookie-parser";

if (!process.env.DATABASE_URL) {
    throw new Error("Must provide database url");
}

const SESSION_COOKIE_NAME = "session";
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server: server });
const gameServer = new GameServer();

wss.on("connection", async (ws, req) => {
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
        const sessionId = await getTokenSessionId(token);
        const user = await getSessionUser(sessionId);

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

app.post("/register", async (req, res) => {
    const username = typeof req.body.username === "string"
        ? req.body.username.trim()
        : "";

    const password = typeof req.body.password === "string"
        ? req.body.password
        : "";

    const registerResult = await registerUser(username, password);

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

app.post("/login", async (req, res) => {
    const username = typeof req.body.username === "string"
        ? req.body.username.trim()
        : "";

    const password = typeof req.body.password === "string"
        ? req.body.password
        : "";

    const loginResult = await loginUser(username, password);

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

app.post("/logout", async (req, res) => {
    const token = getSessionToken(req);

    if (!token) {
        return res.status(200).json({
            message: "Already logged out",
        });
    }

    const sessionId = await getTokenSessionId(token);
    deleteSession(sessionId);

    deleteSessionCookie(res);
    return res.status(200).json({
        message: "Logged out successfully",
    });
});

app.get("/status", async (req, res) => {
    const token = getSessionToken(req);

    if (!token) {
        return res.status(200).json({
            loggedIn: false,
        });
    }

    const sessionId = await getTokenSessionId(token);
    const user = await getSessionUser(sessionId);

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

const port = Number(process.env.PORT) ?? 8080;
server.listen(port, "0.0.0.0", async () => {
    console.log(`Site and server listening on ${port}`);
    await connectWithRetry();
});