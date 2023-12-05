import { StatusDOM } from "dom/status"
import { LocaleStatus } from "common/locale"

export class Status {
    private __content!: string
    private _dom: StatusDOM
    private _locale: LocaleStatus

    constructor(locale: LocaleStatus) {
        this._dom = new StatusDOM()
        this._locale = locale
        this.setIdle()
    }

    setIdle(): void {
        this.content = this._locale.idle
    }

    setRange(start: number, end: number, total: number): void {
        this.content = this._locale.showRange
            .replaceAll("_START_", start + "")
            .replaceAll("_END_", end + "")
            .replaceAll("_TOTAL_", total + "")
    }

    setEmpty(): void {
        this.content = this._locale.showEmpty
    }

    get dom(): HTMLSpanElement {
        return this._dom.container
    }

    get content(): string {
        return this.__content
    }

    set content(text: string) {
        this.__content = text
        this._dom.set(text)
    }

}
