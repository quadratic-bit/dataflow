import { Table } from "./dataflow"
import { SearchBarDOM } from "./dom/searchbar"

export class SearchBar {
    private _dom: SearchBarDOM
    private _owner: Table

    constructor(mount: HTMLDivElement, table: Table) {
        this._dom = new SearchBarDOM(mount, this)
        this._owner = table
    }

    updateSearchResults(token: string): void {
        // TODO: It works, but limited and pretty slowly
        if (token.length == 0) {
            this._owner.mask = null
            this._owner.refresh()
            return;
        }
        token = token.toLowerCase()
        let mask: number[] = []
        for (let i = 0; i < this._owner.data.length; ++i) {
            const row = this._owner.data[i]
            for (const field of row) {
                if ((field + "").toLowerCase().includes(token)) {
                    mask.push(i)
                    break
                }
            }
        }
        this._owner.mask = mask
        this._owner.refresh()
    }

    get dom(): SearchBarDOM {
        return this._dom
    }
}
