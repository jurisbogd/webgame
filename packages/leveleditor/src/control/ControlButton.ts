import { ControlBase } from "./ControlBase";

type ButtonType =
    | "button"
    | "submit"
    | "reset";

export class ControlButton extends ControlBase {
    row: HTMLDivElement;
    button: HTMLButtonElement;

    constructor(content: string, type: ButtonType = "button") {
        super();
        this.button = document.createElement("button");

        this.button.classList.add("control");
        this.button.classList.add("control-button")
        this.button.type = type;
        this.button.textContent = content;

        this.row = document.createElement("div");
        this.row.classList.add("control-row");
        this.row.appendChild(this.button);
    };

    get top() {
        return this.row;
    };

    get bottom() {
        return this.row;
    };

    get clickable() {
        return this.button;
    };

    setDisable(disable: boolean) {
        if (disable) {
            this.button.classList.add("disabled");
        }
        else {
            this.button.classList.remove("disabled");
        };
    };
};