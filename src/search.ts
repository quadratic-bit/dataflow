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
        console.log(token)
        console.log(this._owner)
    }

    get dom(): SearchBarDOM {
        return this._dom
    }
}
