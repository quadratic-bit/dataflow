import { Table } from "common/table"
import { populateSelect } from "common/subscription"
import { Filter } from "components/filter"

export class FilterDOM {
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
            // TODO: add localization
            optionAll.textContent = "Все"
            // TODO: come up with a better candidate for this
            optionAll.value = "-1"

            select.insertBefore(optionAll, select.firstElementChild)
            select.addEventListener("change", _ => {
                this._owner.updateFilterResults(col.name, select.value)
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
