import { TableDOM } from "./dom/table"
import type { TableCell, TableColumn } from "./types/columns"
import { Pagination } from "./pagination"
import { Status } from "./status"
import { PageLength, PagesAll, PagesSome } from "./types/pagination"

export class TableCollection {
    mount: Element
    handler: () => void
    getter: () => void
    private static tables: Table[]

    constructor(mount: string, handler: () => void, getter: () => void) {
        const mountDOM = document.querySelector(mount)
        if (mountDOM == null) {
            throw Error(`Mount point "${mount}" does not exist in DOM`)
        }
        mountDOM.classList.add("dataflow-table-wrapper")
        this.mount = mountDOM
        this.handler = handler
        this.getter = getter
        TableCollection.tables = []
    }

    public get tables(): Table[] {
        return this.tables
    }

    find(id: string): Table | null {
        for (const tbl of TableCollection.tables) {
            if (tbl.config.id === id) {
                return tbl
            }
        }
        return null
    }

    new(id: string, init: string): _TableFactory {
        return new _TableFactory(id, id, init, this)
    }
}

interface TableConfig {
    id: string
    title: string
    init: string
    columns: TableColumn[]
    outer: TableCollection
    pageSizes: PageLength[]
}

class _TableFactory {
    private _data: TableConfig

    constructor(id: string, title: string, init: string, outer: TableCollection) {
        this._data = { id, title, init, outer, columns: [], pageSizes: [] }
    }

    column(definition: TableColumn): _TableFactory {
        this._data.columns.push(definition)
        return this
    }

    pageSizes(sizes: PageLength[]): _TableFactory {
        this._data.pageSizes = sizes
        return this
    }

    init(): Table {
        // TODO: Extract defaults to another file
        if (this._data.pageSizes.length == 0) {
            this._data.pageSizes = [PagesSome(20), PagesSome(10), PagesAll]
        }
        return new Table(this._data)
    }
}

export class Table {
    private _config: TableConfig
    private _dom: TableDOM
    private _data: TableCell[][] = []
    private _pagination: Pagination
    private _status: Status
    private _selectedRowIndex: number | null = null

    constructor(config: TableConfig) {
        this._config = config
        this._dom = new TableDOM(config.outer.mount, config.columns, this)
        this._status = new Status(this._dom.footer)
        this._pagination = new Pagination(this, this._config.pageSizes)
        this._updateStatus()
    }

    private _updateStatus(): void {
        const [start, end] = this._pagination.retrieveDisplayRange(this._data.length)
        this._status.setRange(start + 1, Math.min(end, this._data.length), this._data.length)
    }

    add(rows: TableCell[][]): void {
        this._data = this._data.concat(rows)
        this.refresh()
    }

    refresh(): void {
        // TODO: Address performance
        const [pageStart, pageEnd] = this._pagination.retrieveDisplayRange(this._data.length)
        this._dom.clear()
        this._dom.add(this._data.slice(pageStart, pageEnd))
        this._pagination.updatePagination(this._data.length)
        this._updateStatus()
        if (this._selectedRowIndex != null &&
            this._selectedRowIndex >= pageStart &&
                this._selectedRowIndex < pageEnd) {
            this._dom.highlight(this._selectedRowIndex - pageStart)
        }
    }

    toggleRow(relativeRowIndex: number): void {
        // TODO: Address performance
        const [pageStart, pageEnd] = this._pagination.retrieveDisplayRange(this._data.length)
        const absoluteRowIndex = relativeRowIndex + pageStart
        if (absoluteRowIndex == this._selectedRowIndex) {
            this._selectedRowIndex = null
            this._dom.clearHighlight(relativeRowIndex)
        } else {
            if (this._selectedRowIndex != null &&
                this._selectedRowIndex >= pageStart &&
                this._selectedRowIndex < pageEnd) {
                this._dom.clearHighlight(this._selectedRowIndex - pageStart)
            }
            this._dom.highlight(relativeRowIndex)
            this._selectedRowIndex = absoluteRowIndex
        }
    }

    get rows(): TableCell[][] {
        return this._data
    }

    get config(): TableConfig {
        return this._config
    }

    get dom(): TableDOM {
        return this._dom
    }

    get pagination(): Pagination {
        return this._pagination
    }

    get selectedRow(): number | null {
        return this._selectedRowIndex
    }

    set activePage(pageIndex: number) {
        this._pagination.activePage = pageIndex
        this.refresh()
    }
}
