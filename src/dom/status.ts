export class StatusDOM {
    private _container: HTMLSpanElement

    constructor(mount: HTMLDivElement) {
        const span = document.createElement("span")
        mount.appendChild(span)
        this._container = span
    }

    set(text: string) {
        this._container.textContent = text
    }
}
