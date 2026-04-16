import { Rect } from "@jbwg/shared/math";
import { untilServerOpen } from "./Server";
import { initKeyboardInput } from "./KeyboardInput";
import { initGraphics } from "./CanvasRenderingContext2dGraphics";

// interface Loader {

// };

// type Loadable<T> =
//     | (T & Loaded)
//     | Unloaded;

// type Loaded = {
//     loaded: true;
// };

// type Unloaded = {
//     loaded: false;
//     resolve: () => void;
// };


// interface Draw {

// };

interface Scene {
    step(): void;
    render(): void;
    dispose(): void;
};

interface Game {
    canvas: HTMLCanvasElement,
    loading: boolean,
    scene: Scene,
};

const canvas = document.getElementById("canvas-2d") as HTMLCanvasElement;

if (!canvas || canvas.tagName !== "canvas") {
    throw new Error(`Unable to find canvas element with id "canvas-2d".`);
};

initGraphics(canvas);
initKeyboardInput(canvas);
await untilServerOpen();

export async function startGame(startingScene: Scene) {
    const game = {
        canvas: canvas,
        loading: false,
        scene: startingScene,
    };

    function run() {
        step(game);
        requestAnimationFrame(run);
    };
};

function step(game: Game) {
    if (game.loading) {

    }
    else {

    };
};