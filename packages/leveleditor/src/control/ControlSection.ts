import { ControlBase } from "./ControlBase";

export class ControlSection extends ControlBase {
    details: HTMLDetailsElement;
    content: HTMLDivElement;

    constructor(title: string) {
        super();
        this.details = document.createElement("details");
        this.details.classList.add("control-section");
        this.details.open = true;

        const summary = document.createElement("summary");
        summary.classList.add("control");
        summary.classList.add("control-section-header");
        summary.textContent = title;
        this.details.append(summary);

        this.content = document.createElement("div");
        this.details.appendChild(this.content);
    };

    get top() {
        return this.details;
    };

    get bottom() {
        return this.content;
    };

    get clickable() {
        return this.details;
    };
};