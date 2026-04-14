export abstract class ControlBase {
    abstract top: HTMLElement;
    abstract bottom: HTMLElement;
    abstract clickable: HTMLElement;

    append(child: ControlBase) {
        this.bottom.appendChild(child.top);
    };

    addClickListener(action: () => void) {
        this.clickable.addEventListener("click", action);
    };
};