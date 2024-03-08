import { Table } from "core/table"
import { populateSelect } from "core/fields"
import { Nullable } from "types/columns"

export class Filter<Row> {
    private _dom: FilterDOM<Row>
    private _owner: Table<Row>

    private _mask: number[] | null = null
    private _listedRows: Row[] = []

    filters: Map<string, (row: Nullable<Row>) => boolean> = new Map()

    constructor(table: Table<Row>) {
        this._dom = new FilterDOM(this, table)
        this._owner = table
    }

    updateFilterResults(): void {
        let mask: number[] = []
        let someFiltered = false;
        for (let i = 0; i < this._owner.data.length; ++i) {
            const row = this._owner.data[i]
            let passed = true;
            for (const predicate of this.filters.values()) {
                if (!predicate(row)) {
                    passed = false;
                    someFiltered = true;
                    break;
                }
            }
            if (passed) mask.push(i);
        }
        this.mask = someFiltered ? mask : null;
        this._owner.refresh()
    }

    refreshTray(): void {
        this._dom.refresh()
    }

    refreshMask(): void {
        this.mask = this.mask
    }

    get dom(): HTMLDivElement {
        return this._dom.container
    }

    get listedRows(): Row[] {
        return this._listedRows
    }

    get mask(): number[] | null {
        return this._mask
    }

    set mask(newMask: number[] | null) {
        if (newMask == null) {
            this._listedRows = this._owner.data
        } else {
            this._listedRows = newMask.map((e: number) => this._owner.data[e])
        }
        this._mask = newMask
        this._owner.pagination.activePage = 0
        this._owner.selectedRowIndex = null
    }

}

class FilterDOM<Row> {
    private _container: HTMLDivElement
    private _owner: Filter<Row>
    private _table: Table<Row>

    constructor(owner: Filter<Row>, table: Table<Row>) {
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

    private _fill() {
        for (const col of this._table.columns) {
            if (col.type !== "select" || col.filterable !== true) {
                continue
            }
            const box = document.createElement("label")
            box.textContent = (col.title ?? col.name) + ": "
            const select = document.createElement("select")
            populateSelect(select, col, this._table)

            const optionAll = document.createElement("option")
            optionAll.textContent = this._table.collection.locale.pagination.all

            optionAll.dataset.all = ""
            select.insertBefore(optionAll, select.firstElementChild)
            select.addEventListener("change", _ => {
                const selectedOption = select.children[select.selectedIndex] as HTMLOptionElement
                const isAll = "all" in selectedOption.dataset
                if (isAll) {
                    this._owner.filters.delete(col.name)
                } else {
                    this._owner.filters.set(
                        col.name,
                        (row: Nullable<Row>) => row[col.name as keyof Row] + "" === select.value
                    )
                }
                this._owner.updateFilterResults()
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
