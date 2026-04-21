import { Pool } from "pg";

// export const pool = new Pool({
//     connectionString: process.env.DATABASE_URL,
//     max: Number(process.env.PGPOOL_MAX || 5),
//     idleTimeoutMillis: 30000,
//     connectionTimeoutMillis: 10000,
// });

export const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
    max: Number(process.env.PGPOOL_MAX || 5),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

export async function connectWithRetry(retries = 10) {
    for (let i = 0; i < retries; i++) {
        try {
            await pool.query("SELECT 1");
            console.log("Database connected");
            return;
        } catch (err) {
            console.error(`DB not ready, retry ${i + 1}/${retries}`);
            await new Promise((r) => setTimeout(r, 3000));
        }
    }
    throw new Error("Database connection failed after retries");
}

await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    );
`);

type Result<T> =
    | Success<T>
    | Failure;

type Success<T> = {
    success: true;
    value: T;
}

type Failure = {
    success: false;
    error: string[];
}

export interface Session {
    token: string;
    expiresAt: Date;
}

export interface User {
    username: string,
    password: string,
}

export async function loginUser(username: string, password: string): Promise<Result<Session>> {
    username = username.trim();

    if (
        !username ||
        username.length > 64 ||
        !/^[a-zA-Z0-9]+$/.test(username) ||
        !password
    ) {
        return {
            success: false,
            error: ["Invalid username or password"],
        }
    }

    const userResult = await getUser(username);

    if (userResult.success) {
        const user = userResult.value;

        if (user.password === password) {
            const sessionResult = await createSession(username);

            if (sessionResult.success) {
                return {
                    success: true,
                    value: sessionResult.value,
                }
            }

            return {
                success: false,
                error: ["Internal server error"],
            }
        }
        else {
            return {
                success: false,
                error: ["Invalid username or password"],
            }
        }
    }

    if (userResult.error === "NOT_FOUND") {
        return {
            success: false,
            error: ["Invalid username or password"],
        }
    }

    return {
        success: false,
        error: ["Internal server error"],
    }
}

export async function registerUser(username: string, password: string): Promise<Result<Session>> {
    username = username.trim();

    const error: string[] = [];

    if (!username) {
        error.push("Must provide username");
    }

    if (username.length > 64) {
        error.push("Username is too long");
    }

    if (!/^[a-zA-Z0-9]+$/.test(username)) {
        // error.error ??= [];
        error.push("Username can only contain letters and numbers");
    }

    if (!password) {
        // error.error ??= [];
        error.push("Must provide password");
    }

    if (Object.keys(error).length > 0) {
        return {
            success: false,
            error,
        }
    }

    const insertUserResult = await insertUser(username, password);

    if (insertUserResult.success) {
        const sessionResult = await createSession(username);

        if (sessionResult.success) {
            return {
                success: true,
                value: sessionResult.value,
            }
        }

        return {
            success: false,
            error: ["Internal server error"],
        }
    }
    else {
        if (insertUserResult.error === "CONSTRAINT_UNIQUE") {
            return {
                success: false,
                error: ["Username is already taken"],
            }
        }
        else {
            return {
                success: false,
                error: ["Internal server error"],
            }
        }
    }
}

const sessionExpiresInSeconds = 60 * 60 * 24; // 1 day

async function createSession(username: string): Promise<{ success: false, error: string } | { success: true, value: Session }> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + sessionExpiresInSeconds);

    return {
        success: true,
        value: { token: username, expiresAt },
    }
}

export async function checkSession(token: string) {
    const userResult = await getUser(token);

    if (userResult.success) {
        return {
            valid: true,
            token: token,
            user: userResult.value,
        }
    }
    else {
        return {
            valid: false,
        }
    }
}

async function insertUser(username: string, password: string) {
    try {
        await pool.query(
            "INSERT INTO users(username, password) VALUES($1, $2)",
            [username, password],
        );

        return {
            success: true,
        }
    } catch (e: unknown) {
        if (e instanceof Error) {
            const err = e as Error & { code?: string };

            if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
                return {
                    success: false,
                    error: "CONSTRAINT_UNIQUE",
                }
            }

            console.error("User insert failed:", e);
        }
    }

    return {
        success: false,
    }
}

async function getUser(username: string): Promise<{ success: false, error: string } | { success: true, value: User }> {
    try {
        const { rows } = await pool.query(
            'select * from users where username = $1',
            [username]
        );

        const user = rows[0];

        if (!user) {
            return {
                success: false,
                error: "NOT_FOUND",
            }
        }
        else {
            return {
                success: true,
                value: user,
            }
        }
    }
    catch (e) {
        console.error("User get failed:", e);
    }

    return {
        success: false,
        error: "INTERNAL_SERVER",
    }
}

export async function getTokenSessionId(token: string) {
    return token;
}

export async function getSessionUser(sessionId: string) {
    const getUserResult = await getUser(sessionId);

    if (getUserResult.success) {
        const user = getUserResult.value;

        return {
            username: user.username,
        }
    }
    else {
        return undefined;
    }
}

export async function deleteSession(token: string) {
    // do nothing for now  
}