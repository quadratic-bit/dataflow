import { Table } from "common/table"
import { FilterDOM } from "dom/filter"

export class Filter<Row> {
    private _dom: FilterDOM
    private _owner: Table<Row>

    constructor(table: Table<Row>) {
        this._dom = new FilterDOM(this, table)
        this._owner = table
    }

    updateFilterResults(column: string, value: unknown, selectAll: boolean): void {
        const searchBar = this._owner.searchbar.dom.children[0] as HTMLInputElement
        if (selectAll) {
            searchBar.disabled = false
            this._owner.mask = null
            this._owner.refresh()
            return;
        }
        searchBar.value = ""
        searchBar.disabled = true
        let mask: number[] = []
        for (let i = 0; i < this._owner.data.length; ++i) {
            const row = this._owner.data[i]
            if (row[column as keyof Row] + "" === value) {
                mask.push(i)
            }
        }
        this._owner.mask = mask
        this._owner.refresh()
    }

    refresh(): void {
        this._dom.refresh()
    }

    get dom(): HTMLDivElement {
        return this._dom.container
    }
}
