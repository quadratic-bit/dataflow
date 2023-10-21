export class StatusDOM {
    private _span: HTMLSpanElement

    constructor(container: HTMLDivElement) {
        const span = document.createElement("span")
        container.appendChild(span)
        this._span = span
    }

    setText(text: string) {
        this._span.textContent = text
    }
}
