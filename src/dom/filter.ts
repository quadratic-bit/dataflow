import { Table } from "common/table"
import { isSelectDependency } from "common/subscription"
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
            const choices = isSelectDependency(col.choices) ?
                            this._table.resolveSelectDependency(col.choices) :
                            col.choices
            const optionAll = document.createElement("option")
            // TODO: add localization
            optionAll.textContent = "Все"
            // TODO: come up with a better candidate for this
            optionAll.value = "-1"
            select.appendChild(optionAll)
            for (const entry of choices) {
                const option = document.createElement("option")
                option.textContent = typeof entry === "string" ? entry : entry.label
                option.value = typeof entry === "string" ? entry : entry.value + ""
                select.appendChild(option)
            }
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
