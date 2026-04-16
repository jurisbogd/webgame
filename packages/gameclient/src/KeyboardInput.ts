import { Vec2 } from "@jbwg/shared/math";

const inputs = [
    "up",
    "down",
    "left",
    "right",
    "enter",
];

export enum InputState {
    Up = 0,
    Down = 0x0001,
    PreviousDown = 0x0002,
    Pressed = Down,
    Released = PreviousDown,
};

type Input = typeof inputs[number];

const keyBindings: Record<string, Input> = {
    "KeyW": "up",
    "KeyA": "left",
    "KeyS": "down",
    "KeyD": "right",
    "ArrowUp": "up",
    "ArrowDown": "down",
    "ArrowLeft": "left",
    "ArrowRight": "right",
    "Enter": "enter",
};

const previous: Record<Input, boolean> =
    Object.fromEntries(inputs.map((i) => [i, false]));
const current: Record<Input, boolean> =
    Object.fromEntries(inputs.map((i) => [i, false]));

interface KeyboardInput {
    init(element: HTMLElement): void;
    update(): void;
    isDown(input: Input): boolean;
    isPressed(input: Input): boolean;
    movementDirection(): Vec2;
};

export const KeyboardInput: KeyboardInput = {
    init: (element: HTMLElement) => {
        element.addEventListener('keydown', (event) => {
            if (event.code in keyBindings) {
                current[keyBindings[event.code]] = true;
                event.preventDefault();
            };
        });

        element.addEventListener('keyup', (event) => {
            if (event.code in keyBindings) {
                current[keyBindings[event.code]] = false;
                event.preventDefault();
            };
        });

        element.addEventListener('blur', () => {
            for (const key of inputs) {
                current[key] = false;
            };
        });
    },

    update: () => {
        for (const key of inputs) {
            previous[key] = current[key];
        };
    },

    isDown: (input: Input) => {
        return current[input];
    },

    isPressed: (input: Input) => {
        return current[input] && !previous[input];
    },

    movementDirection: () => {
        return inputMovementDirection(current);
    },
};

export function inputMovementDirection(inputs: Record<Input, boolean>) {
    const direction = Vec2.zero;

    if (inputs["up"]) {
        direction.y -= 1;
    };
    if (inputs["down"]) {
        direction.y += 1;
    };
    if (inputs["left"]) {
        direction.x -= 1;
    };
    if (inputs["right"]) {
        direction.x += 1;
    };

    return direction;
};