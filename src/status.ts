import { StatusDOM } from "./dom/status"

export class Status {
    private __content!: string
    private _dom: StatusDOM

    constructor(mount: HTMLDivElement) {
        this._dom = new StatusDOM(mount)
        this.setIdle()
    }

    setIdle(): void {
        // TODO: Deal with localization
        this.content = "Click on a row to select it"
    }

    get content(): string {
        return this.__content
    }

    set content(text: string) {
        this.__content = text
        this._dom.setText(text)
    }
}
