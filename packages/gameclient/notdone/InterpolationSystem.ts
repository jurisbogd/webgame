import { Vec2 } from "@jbwg/shared/math";
import { PlayerSnapshot } from "./PlayerSnapshot";
import { ServerSnapshot } from "./ServerSnapshot";

let resolveInterpSystem: (() => void) | undefined;
const snapshots: ServerSnapshot[] = [];
const bufferTimeMs = 100;
const dtMultiplierAmount = 0.1;
let renderTime = 0;

export function pushServerSnapshot(packet: ServerSnapshot) {
    snapshots.push(packet);

    if (hasEnoughTimeBuffered() && resolveInterpSystem) {
        renderTime = snapshots[0].timestamp;
        resolveInterpSystem();
    };
};

export function initInterpolationSystem() {
    return new Promise<void>(
        (resolve) => {
            resolveInterpSystem = resolve;
        },
    );
};

export function processSnapshots(
    dt: number,
) {
    // do not interpolate if no snapshots
    if (snapshots.length < 0) {
        throw new Error("Cannot process snapshots, no snapshots available")
    };

    const latest = snapshots[snapshots.length - 1];

    const latestTime = latest.timestamp;
    renderTime = stepRenderTime(latestTime, dt);

    const [earlier, later] = getInterpSnaps();

    while (snapshots[0].timestamp < earlier.timestamp) {
        snapshots.shift();
    };

    const interpolated = interpolate(earlier, later);

    return { latest, interpolated };
};

function hasEnoughTimeBuffered() {
    if (snapshots.length === 0) {
        return false;
    };

    const first = snapshots[0];
    const latest = snapshots[snapshots.length - 1];
    const timeBetween = latest.timestamp - first.timestamp;
    const timeBetweenMs = gameTimeToMs(timeBetween);

    return timeBetweenMs > bufferTimeMs;
};

function getInterpSnaps() {
    // expect snapshot buffer to have snapshots
    if (snapshots.length === 0) {
        throw new Error("Cannot find snapshots for interpolation, snapshot buffer is empty");
    };

    // find later, then take one before for earlier
    for (let i = 0; i < snapshots.length; ++i) {
        const snapshot = snapshots[i];

        if (snapshot.timestamp > renderTime) {
            // if one before does not exist, use later for both
            const earlier = i > 0
                ? snapshots[i - 1]
                : snapshot;

            return [earlier, snapshot]
        };
    };

    // if later was not found, use latest for both
    const snapshot = snapshots[snapshots.length - 1];

    return [snapshot, snapshot];
};

function stepRenderTime(
    latestSnapshotTime: number,
    dt: number,
): number {
    const delayMs = gameTimeToMs(latestSnapshotTime - renderTime);

    // Run slower if ahead of server, faster if behind server
    const dtMultiplier = delayMs > bufferTimeMs
        ? dtMultiplierAmount
        : -dtMultiplierAmount;

    return renderTime + (dt * dtMultiplier);
};

function gameTimeToMs(gameTime: number) {
    return gameTime * 1000;
};

function interpolate(
    earlier: ServerSnapshot,
    later: ServerSnapshot,
) {
    const interpolatedSnapshot: ServerSnapshot = {
        timestamp: 0,
        latestClientTime: 0,
        players: [],
    };

    const dtFromEarlier = renderTime - earlier.timestamp;
    const timeBetween = later.timestamp - earlier.timestamp;
    const interpolationAmount = clampNumber(dtFromEarlier / timeBetween, 0, 1);

    let earlierPlayerIndex = 0;
    for (const laterPlayer of later.players) {
        let earlierPlayer = earlier.players[earlierPlayerIndex];
        while (earlierPlayer.networkId < laterPlayer.networkId) {
            earlierPlayer = earlier.players[++earlierPlayerIndex];
        };

        if (earlierPlayer.networkId === laterPlayer.networkId) {
            const interpolatedPlayer = interpolatePlayerSnapshot(
                earlierPlayer,
                laterPlayer,
                interpolationAmount,
            );

            interpolatedSnapshot.players.push(interpolatedPlayer);
        }
        else {
            interpolatedSnapshot.players.push(laterPlayer);
        };
    };

    return interpolatedSnapshot;
};

function interpolatePlayerSnapshot(
    earlier: PlayerSnapshot,
    later: PlayerSnapshot,
    t: number,
): PlayerSnapshot {
    const position = lerpVec2(earlier.position, later.position, t);
    const velocity = lerpVec2(earlier.velocity, later.velocity, t);

    return {
        position,
        velocity,
        networkId: later.networkId,
    };
};

function clampNumber(
    number: number,
    min: number,
    max: number
) {
    return Math.min(max, Math.max(min, number));
};

function lerpNumber(
    a: number,
    b: number,
    t: number
) {
    return ((b - a) * t) + a;
};

function lerpVec2(
    a: Vec2,
    b: Vec2,
    t: number
) {
    return new Vec2(
        lerpNumber(a.x, b.x, t),
        lerpNumber(a.y, b.y, t),
    );
};