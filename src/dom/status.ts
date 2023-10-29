export class StatusDOM {
    private _container: HTMLSpanElement

    constructor() {
        this._container = document.createElement("span")
    }

    set(text: string): void {
        this._container.textContent = text
    }

    get container(): HTMLSpanElement {
        return this._container
    }
}
