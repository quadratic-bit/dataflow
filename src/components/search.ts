import { Table } from "core/table"
import { Nullable } from "types/columns"

const SEARCH_ID: string = "%dataflow_search"

export class SearchBar<Row> {
    private _dom: SearchBarDOM
    private _owner: Table<Row>

    constructor(table: Table<Row>) {
        this._dom = new SearchBarDOM(this)
        this._owner = table
    }

    setToken(token: string): void {
        if (token.length == 0) {
            this._owner.filter.filters.delete(SEARCH_ID)
            this._owner.filter.updateFilterResults()
            return;
        }
        token = token.toLowerCase()
        // TODO: performance?
        this._owner.filter.filters.set(
            SEARCH_ID,
            (row: Nullable<Row>) => {
                for (const key in row)
                    if ((row[key] + "").toLowerCase().includes(token))
                        return true
                return false
            }
        )
        this._owner.filter.updateFilterResults()
    }

    get dom(): HTMLDivElement {
        return this._dom.container
    }
}

export class SearchBarDOM {
    private _container: HTMLDivElement

    constructor(owner: SearchBar<any>) {
        const bar: HTMLInputElement = document.createElement("input")
        bar.type = "text"
        bar.addEventListener("input", (e: Event) => {
            const target = e.target as HTMLInputElement
            owner.setToken(target.value)
        })
        const wrapper = document.createElement("div")
        wrapper.classList.add("dataflow-table-searchbar")
        wrapper.appendChild(bar)
        this._container = wrapper
    }

    get container(): HTMLDivElement {
        return this._container
    }
}
