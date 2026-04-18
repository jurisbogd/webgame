import express from "express";
import { getClientDist } from "./getClientDist.js";
import { getLevelEditorDist } from "./getLevelEditorDist.js";
import Database from "better-sqlite3";

const app = express();

app.use(express.json());

const db = new Database("game.db");

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )
`);

const dbInsertNewUser = db.prepare(`
    INSERT INTO users (username, password)
    VALUES (?, ?)
`);

const dbGetUserLogin = db.prepare(`
    SELECT id, username
    FROM users
    WHERE username = ? AND password = ?
`);

app.post("/signup", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "username and password required" });
    }

    try {
        const result = dbInsertNewUser.run(username, password);

        res.status(201).json({
            message: "user created",
            user: {
                id: result.lastInsertRowid,
                username
            }
        });
    } catch (err: any) {
        if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({ error: "user already exists" });
        }

        res.status(500).json({ error: "database error" });
    }
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const user = dbGetUserLogin.get(username, password);

    if (!user) {
        return res.status(401).json({ error: "invalid credentials" });
    }

    res.json({
        message: "login successful",
        user
    });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});

const clientDist = getClientDist();
const levelEditorDist = getLevelEditorDist();

app.use(express.static(clientDist));
app.use("/leveleditor", express.static(levelEditorDist));
app.use("/assets", express.static("../../assets"))

const server = app.listen(8000)