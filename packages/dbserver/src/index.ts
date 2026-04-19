import express from "express";
import Database, { Statement } from "better-sqlite3";
import { } from "bcrypt";
import e from "express";

const db = new Database("game.db");

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    ) STRICT;
`);

// db.exec(`
//     CREATE TABLE sessions (
//         id TEXT NOT NULL PRIMARY KEY,
//         username TEXT NOT NULL,
//         secret_hash BLOB NOT NULL,
//         expires_at INTEGER NOT NULL,

//         FOREIGN KEY (username)
//             REFERENCES users(username)
//             ON DELETE CASCADE
//     ) STRICT;
// `);

const app = express();

app.use(express.json());

const insertUserQuery = "INSERT INTO users(username, password) VALUES(?, ?)";
const insertUserStatement: Statement<[string, string], void> = db.prepare(insertUserQuery);
const usernameAllowedChars = /^[a-zA-Z0-9]+$/;

interface Session {
    token: string;
}

function createSession(username: string): Session {
    return { token: username };
};

type CheckUsername = {
    valid: false,
    problems: string[],
} | {
    valid: true,
}

function checkUsername(username: string): CheckUsername {
    if (!username) {
        return { valid: false, problems: ["Username missing"] };
    }

    const problem = [];

    if (!usernameAllowedChars.test(username)) {
        problem.push("Invalid character in username");
    }
    if (username.length > 64) {
        problem.push("Username is too long");
    }

    if (problem.length > 0) {
        return { valid: false, problems: problem };
    }

    return { valid: true };
}

app.post("/register", (req, res) => {
    const username = typeof req.body.username === "string"
        ? req.body.username.trim()
        : "";

    const password = typeof req.body.password === "string"
        ? req.body.password
        : "";

    const errors: Record<string, string[]> = {};

    const usernameCheckStatus = checkUsername(username);

    if (!usernameCheckStatus.valid) {
        errors.username = usernameCheckStatus.problems;
    }

    if (!password) {
        errors.password ??= [];
        errors.password.push("Password missing");
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json(errors);
    }

    try {
        insertUserStatement.run(username, password);

        const session = createSession(username);

        return res.status(201).json({
            token: session.token,
        });
    } catch (e: unknown) {
        if (e instanceof Error) {
            const err = e as Error & { code?: string };

            if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
                return res.status(409).json({
                    username: ["Username is taken"],
                });
            }

            console.error("User insert failed:", e);
            return res.status(500).json({
                error: ["Internal server error"],
            });
        }
    }
});

interface User {
    username: string,
    password: string,
}

const getUserQuery = "SELECT username, password FROM users WHERE username = ?";
const getUserStatement: Statement<[string], User> = db.prepare(getUserQuery);

app.get("/user", (req, res) => {
    const username = typeof req.body.username === "string"
        ? req.body.username.trim()
        : "";

    const usernameCheckStatus = checkUsername(username);

    if (!usernameCheckStatus.valid) {
        return res.status(400).json({
            error: ["Must provide valid username"],
        });
    }

    try {
        const user = getUserStatement.get(username);

        if (!user) {
            return res.status(404).json({
                error: ["Unable to find user"],
            });
        }
        else {
            return res.status(200).json({
                username: user.username,
                password: user.password
            });
        }
    }
    catch (e) {
        console.error("User insert failed:", e);
        return res.status(500).json({
            error: ["Internal server error"],
        });
    }
});

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

app.post("/login", (req, res) => {
    const username = typeof req.body.username === "string"
        ? req.body.username.trim()
        : "";

    const password = typeof req.body.password === "string"
        ? req.body.password
        : "";

    const usernameCheckStatus = checkUsername(username);

    if (
        !password ||
        !usernameCheckStatus.valid
    ) {
        return res.status(400).json({
            login: ["Incorrect username or password"],
        });
    }

    try {
        const user = getUserStatement.get(username);

        if (!user || user.password !== password) {
            return res.status(400).json({
                login: ["Incorrect username or password"],
            });
        }
        else {
            const session = createSession(username);

            return res.status(200).json({
                token: session.token,
            });
        }
    }
    catch (e) {
        console.error("User insert failed:", e);
        return res.status(500).json({
            default: ["Internal server error"],
        });
    }
});

app.post("/checksession", (req, res) => {
    const token = req.body.token;

    if (!token || typeof token !== "string") {
        return res.status(200).json({
            valid: false,
        });
    }

    try {
        const user = getUserStatement.get(token);

        if (!user) {
            return res.status(200).json({
                valid: false,
            });
        }
        else {
            return res.status(200).json({
                valid: true,
                token: token,
                user: user.username,
            });
        }
    }
    catch (e) {
        console.error("User insert failed:", e);
        return res.status(500).json({
            default: ["Internal server error"],
        });
    }
});

const server = app.listen(9000);

// const dbInsertNewUser = db.prepare(`
//     INSERT INTO users (username, password)
//     VALUES (?, ?)
// `);

// const dbGetUserLogin = db.prepare(`
//     SELECT id, username
//     FROM users
//     WHERE username = ? AND password = ?
// `);

// app.post("/signup", (req, res) => {
//     const { username, password } = req.body;

//     if (!username || !password) {
//         return res.status(400).json({ error: "username and password required" });
//     }

//     try {
//         const result = dbInsertNewUser.run(username, password);

//         res.status(201).json({
//             message: "user created",
//             user: {
//                 id: result.lastInsertRowid,
//                 username
//             }
//         });
//     } catch (err: any) {
//         if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
//             return res.status(409).json({ error: "user already exists" });
//         }

//         res.status(500).json({ error: "database error" });
//     }
// });

// app.post("/login", (req, res) => {
//     const { username, password } = req.body;

//     const user = dbGetUserLogin.get(username, password);

//     if (!user) {
//         return res.status(401).json({ error: "invalid credentials" });
//     }

//     res.json({
//         message: "login successful",
//         user
//     });
// });

// app.listen(3000, () => {
//     console.log("Server running on http://localhost:3000");
// });

// const clientDist = getClientDist();
// const levelEditorDist = getLevelEditorDist();

// app.use(express.static(clientDist));
// app.use("/leveleditor", express.static(levelEditorDist));
// app.use("/assets", express.static("../../assets"))

// const server = app.listen(8000)