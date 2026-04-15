import { ControlBase } from "./ControlBase";
import { ViewModel } from "../ViewModel";

export class ControlText extends ControlBase {
    row: HTMLDivElement;
    input: HTMLInputElement;
    label: HTMLLabelElement;

    constructor(name: string, viewModel: ViewModel<string>) {
        super();

        this.input = document.createElement("input");
        this.input.type = "text";
        this.input.classList.add("control");
        this.input.classList.add("control-input");
        this.input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                this.input.blur();
            };
        });
        this.input.addEventListener("change", () => {
            viewModel.property = this.input.value;
        });
        viewModel.addChangeListener((value: string) => {
            this.input.value = value;
        });
        this.input.value = viewModel.property;

        this.label = document.createElement("label");
        this.label.classList.add("control");
        this.label.textContent = name;

        this.row = document.createElement("div");
        this.row.classList.add("control-row");
        this.row.appendChild(this.label);
        this.row.appendChild(this.input);
    }

    get top() {
        return this.row;
    };

    get bottom() {
        return this.row;
    };

    get clickable() {
        return this.input;
    };
};