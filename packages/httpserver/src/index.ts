import express, { Request } from "express";
import { getClientDist } from "./getClientDist.js";

const app = express();

const dbserverUrl = "http://localhost:9000";

app.use(express.json());

const clientDist = getClientDist();

app.use(express.static(clientDist));
app.use("/assets", express.static("../../assets"))

app.use((err: unknown, req: any, res: any, next: any) => {
    if (err instanceof SyntaxError && "status" in err && (err as any).type === "entity.parse.failed") {
        return res.status(400).json({
            error: "Invalid JSON body"
        });
    }

    console.error("Unhandled error:", err);

    return res.status(500).json({
        error: "Internal server error"
    });
});

type HttpMethod =
    | "POST"
    | "GET";

async function callDbServer(route: string, method: HttpMethod, body: any) {
    return fetch(dbserverUrl + route, {
        method: method,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    });
}

app.post("/register", async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;

        const upstream = await callDbServer("/register", "POST", {
            username: username,
            password: password,
        });

        const data = await upstream.json();
        return res.status(upstream.status).json(data);
    } catch (err) {
        console.error(err);

        return res.status(500).json({
            error: ["Internal server error"]
        });
    }
});

app.post("/login", async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;

        const upstream = await callDbServer("/register", "POST", {
            username: username,
            password: password,
        });

        const data = await upstream.json();
        return res.status(upstream.status).json(data);
    } catch (err) {
        console.error(err);

        return res.status(500).json({
            error: ["Internal server error"]
        });
    }
});

const server = app.listen(8000)