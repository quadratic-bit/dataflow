import { StatusDOM } from "./dom/status"

export class Status {
    private __content!: string
    private _dom: StatusDOM

    constructor() {
        this._dom = new StatusDOM()
        this.setIdle()
    }

    setIdle(): void {
        // TODO: Deal with localization
        this.content = "Click on a row to select it"
    }

    setRange(start: number, end: number, total: number): void {
        this.content = `Showing ${start} to ${end} of ${total} entries`
    }

    setEmpty(): void {
        this.content = "No entries available"
    }

    get dom(): StatusDOM {
        return this._dom
    }

    get content(): string {
        return this.__content
    }

    set content(text: string) {
        this.__content = text
        this._dom.set(text)
    }

}
