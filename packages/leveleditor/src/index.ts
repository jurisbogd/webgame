let Room = {};

type ButtonType =
    | "button"
    | "submit"
    | "reset";

function createButton(content: string, type: ButtonType = "button") {
    const button = document.createElement("button");

    button.classList.add("control");
    button.type = type;
    button.textContent = content;

    return button;
};

function createCheckbox(...classes: string[]) {
    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";

    for (const c of classes) {
        checkbox.classList.add(c);
    }

    return checkbox;
}

type InputType =
    | "checkbox";

function createInput(type: InputType, ...classes: string[]) {
    const input = document.createElement("input");

    input.type = "checkbox";

    for (const c of classes) {
        input.classList.add(c);
    }

    return input;
}

function createLabel(...classes: string[]) {
    const label = document.createElement("label");

    for (const c of classes) {
        label.classList.add(c);
    }

    return label;
}

function createHTMLElement(name: string, ...classes: string[]) {
    const element = document.createElement(name);

    for (const c of classes) {
        element.classList.add(c);
    }

    return element;
}

function createDiv(...classes: string[]) {
    const div = document.createElement("div");

    for (const c of classes) {
        div.classList.add(c);
    }

    return div;
}

interface UIElement {
    top: HTMLElement;
    bottom: HTMLElement;
};

class DropdownSection implements UIElement {
    details: HTMLDetailsElement;
    content: HTMLDivElement;

    constructor(title: string) {
        this.details = document.createElement("details");
        this.details.open = true;

        const summary = document.createElement("summary");
        summary.classList.add("control");
        summary.classList.add("control-section-header");
        summary.textContent = title;
        this.details.append(summary);

        this.content = createDiv();
        this.details.appendChild(this.content);
    };

    get top() {
        return this.details;
    };

    get bottom() {
        return this.content;
    };
};

function appendUIElement(parent: UIElement, child: UIElement) {
    parent.bottom.appendChild(child.top);
};

function getControlPanel() {
    return document.getElementById("control-panel");
};

const controlPanel = getControlPanel();

// const roomSection = createControlSection("Room", "room");

const roomDropdown = new DropdownSection("Room");

controlPanel?.appendChild(roomDropdown.details);

const newRoomButton = createButton("New");

roomDropdown.content.appendChild(newRoomButton);

const openRoomButton = createButton("Open");

roomDropdown.content.appendChild(openRoomButton);