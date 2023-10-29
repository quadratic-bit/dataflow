import { TableDOM } from "./dom/table"
import type { TableColumn } from "./types/columns"
import { Pagination } from "./pagination"
import { Status } from "./status"
import { PageLength, PagesAll, PagesSome } from "./types/pagination"
import { SearchBar } from "./search"
import { Action } from "./types/actions"
import { ActionTray } from "./actionset"

export class TableCollection {
    mount: Element
    handler: () => void
    getter: () => void
    private static tables: Table<any>[]

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

    public get tables(): Table<any>[] {
        return this.tables
    }

    find(id: string): Table<any> | null {
        for (const tbl of TableCollection.tables) {
            if (tbl.config.id === id) {
                return tbl
            }
        }
        return null
    }

    new<Row>(id: string, init: string): _TableFactory<Row> {
        return new _TableFactory(id, id, init, this)
    }
}

interface TableConfig<Row> {
    id: string
    title: string
    init: string
    columns: TableColumn[]
    outer: TableCollection
    pageSizes: PageLength[]
    actions: Action<Row>[]
}

class _TableFactory<Row> {
    private _data: TableConfig<Row>

    constructor(id: string, title: string, init: string, outer: TableCollection) {
        this._data = { id, title, init, outer, columns: [], pageSizes: [], actions: [] }
    }

    describe(definition: TableColumn): _TableFactory<Row> {
        this._data.columns.push(definition)
        return this
    }

    action(action: Action<Row>): _TableFactory<Row> {
        this._data.actions.push(action)
        return this
    }

    pageSizes(sizes: PageLength[]): _TableFactory<Row> {
        this._data.pageSizes = sizes
        return this
    }

    init(): Table<Row> {
        // TODO: Extract defaults to another file
        if (this._data.pageSizes.length == 0) {
            this._data.pageSizes = [PagesSome(20), PagesSome(10), PagesAll]
        }
        return new Table(this._data)
    }
}

export class Table<Row> {
    private _config: TableConfig<Row>
    private _dom: TableDOM<Row>
    private _pagination: Pagination
    private _status: Status
    private _actionTray: ActionTray<Row>
    private _searchbar: SearchBar<Row>
    private _data: Row[] = []
    private _mask: number[] | null = null
    private _listedRows: Row[] = []
    private _selectedRowIndex: number | null = null

    constructor(config: TableConfig<Row>) {
        this._config = config
        this._dom = new TableDOM(config.outer.mount, config.columns, this)
        this._status = new Status(this._dom.footer)
        // TODO: Refactor to extract element addition to this funtion body
        this._pagination = new Pagination(this, this._config.pageSizes)
        this._actionTray = new ActionTray(this._dom.header, config.actions, this)
        this._searchbar = new SearchBar(this._dom.header, this)
        this._updateStatus()
    }

    private _updateStatus(): void {
        if (this.rows.length == 0) {
            this._status.setEmpty()
            return;
        }
        const [start, end] = this._pagination.retrieveDisplayRange(this.rows.length)
        this._status.setRange(start + 1, Math.min(end, this.rows.length), this.rows.length)
    }

    add(rows: Row[]): void {
        this._data = this._data.concat(rows)
        // TODO: add possible optimization
        this.mask = this.mask
        this.refresh()
        // TODO: Add status update
    }

    replace(chunk: Row[]): void {
        // TODO: Address performance
        const [pageStart, pageEnd] = this._pagination.retrieveDisplayRange(this.rows.length)
        this._dom.clear()
        this._dom.add(chunk)
        this._pagination.updatePagination(this.rows.length)
        this._updateStatus()
        if (this._selectedRowIndex != null &&
            this._selectedRowIndex >= pageStart &&
                this._selectedRowIndex < pageEnd) {
            this._dom.highlight(this._selectedRowIndex - pageStart)
        }
        this._mask = null
    }

    refresh(): void {
        // TODO: Address performance
        const [pageStart, pageEnd] = this._pagination.retrieveDisplayRange(this.rows.length)
        this.replace(this.rows.slice(pageStart, pageEnd))
    }

    toggleRow(relativeRowIndex: number): void {
        // TODO: Address performance
        const [pageStart, pageEnd] = this._pagination.retrieveDisplayRange(this.rows.length)
        const absoluteRowIndex = relativeRowIndex + pageStart
        if (absoluteRowIndex == this._selectedRowIndex) {
            this.selectedRowIndex = null
            this._dom.clearHighlight(relativeRowIndex)
        } else {
            if (this._selectedRowIndex != null &&
                this._selectedRowIndex >= pageStart &&
                this._selectedRowIndex < pageEnd) {
                this._dom.clearHighlight(this._selectedRowIndex - pageStart)
            }
            this._dom.highlight(relativeRowIndex)
            this.selectedRowIndex = absoluteRowIndex
        }
    }

    get data(): Row[] {
        return this._data
    }

    get rows(): Row[] {
        return this._listedRows
    }

    get config(): TableConfig<Row> {
        return this._config
    }

    get dom(): TableDOM<Row> {
        return this._dom
    }

    get pagination(): Pagination {
        return this._pagination
    }

    get searchBar(): SearchBar<Row> {
        return this._searchbar
    }

    get actionTray(): ActionTray<Row> {
        return this._actionTray
    }

    get selectedRow(): Row | null {
        return this.selectedRowIndex == null ? null : this.rows[this.selectedRowIndex]
    }

    get selectedRowIndex(): number | null {
        return this._selectedRowIndex
    }

    get mask(): number[] | null {
        return this._mask
    }

    set mask(newMask: number[] | null) {
        if (newMask == null) {
            this._listedRows = this._data
        } else {
            this._listedRows = newMask.map((e: number) => this._data[e])
        }
        this._mask = newMask
        this._pagination.activePage = 0
        this.selectedRowIndex = null
    }

    set activePage(pageIndex: number) {
        this._pagination.activePage = pageIndex
        this.refresh()
    }

    set selectedRowIndex(value: number | null) {
        if (value == null) {
            if (this._selectedRowIndex != null) {
                this.actionTray.triggerRowDeselect()
            }
            this._selectedRowIndex = null
        } else {
            if (this._selectedRowIndex == null) {
                this.actionTray.triggerRowSelect()
            }
            this._selectedRowIndex = value
        }
    }
}
