import { Table } from "common/table"
import { populateSelect } from "common/subscription"

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

class FilterDOM {
    private _container: HTMLDivElement
    private _owner: Filter<any>
    private _table: Table<any>

    constructor(owner: Filter<any>, table: Table<any>) {
        const filters = document.createElement("div")
        filters.classList.add("dataflow-table-filtertray")
        this._container = filters
        this._table = table
        this._owner = owner
        this._fill()
    }

    private _empty() {
        while (this._container.lastElementChild) {
            this._container.removeChild(this._container.lastElementChild)
        }
    }

    // TODO: allow multiple filters at once
    private _fill() {
        for (const col of this._table.config.columns) {
            if (col.type !== "select" || col.filterable !== true) {
                continue
            }
            const box = document.createElement("label")
            box.textContent = (col.title ?? col.name) + ": "
            const select = document.createElement("select")
            populateSelect(select, col, this._table)

            const optionAll = document.createElement("option")
            optionAll.textContent = this._table.config.collection.locale.pagination.all

            optionAll.dataset.all = ""
            select.insertBefore(optionAll, select.firstElementChild)
            select.addEventListener("change", _ => {
                const selectedOption = select.children[select.selectedIndex] as HTMLOptionElement
                const isAll = "all" in selectedOption.dataset
                this._owner.updateFilterResults(col.name, select.value, isAll)
            })

            box.appendChild(select)
            this._container.appendChild(box)
        }
    }

    refresh() {
        this._empty()
        this._fill()
    }

    get container(): HTMLDivElement {
        return this._container
    }
}
