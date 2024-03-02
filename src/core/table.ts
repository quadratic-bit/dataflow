import { TableDOM } from "dom/table"
import { PagesAll, PagesSome, Pagination } from "components/pagination"
import { Status } from "components/status"
import { SearchBar } from "components/search"
import { Action } from "core/actions"
import { ActionTray } from "components/actiontray"
import { FormManager } from "dom/form"
import { Filter } from "components/filter"
import { TableColumn } from "types/columns"
import { PageLength } from "components/pagination"
import { TableCollection } from "core/collection"

export interface TableConfig<Row> {
    id: string
    init: any
    columns: TableColumn[]
    title?: string
    pageSizes?: PageLength[]
    actions?: Action<Row>[]
    // TODO: remove or remake after the 5th task
    colors?: Map<string, [any, string][]>
}

export class Table<Row> {
    id: string
    title: string
    init: any
    columns: TableColumn[]
    collection: TableCollection
    pageSizes: PageLength[]
    actions: Action<Row>[]

    // TODO: remove or remake after the 5th task
    colors: Map<string, [any, string][]>

    dom: TableDOM<Row>
    pagination: Pagination
    searchbar: SearchBar<Row>
    actionTray: ActionTray<Row>
    filterTray: Filter<Row>
    status: Status

    formManager: FormManager<Row>

    private _data: Row[] = []
    private _mask: number[] | null = null
    private _listedRows: Row[] = []
    private _selectedRowIndex: number | null = null
    private _subscribers: Set<string>

    constructor(config: TableConfig<Row>, collection: TableCollection, early_subs?: Set<string>) {
        this.id = config.id
        this.title = config.title ?? config.id.charAt(0).toUpperCase() + config.id.slice(1)
        this.init = config.init
        this.columns = config.columns
        this.collection = collection
        this.pageSizes = config.pageSizes ?? [PagesSome(15), PagesSome(25), PagesAll]
        this.actions = config.actions ?? []
        this.colors = config.colors ?? new Map()
        this._subscribers = early_subs ?? new Set()
        this.dom = new TableDOM(collection.mountDOM, config.columns, this)
        this.status = new Status(collection.locale.status)
        this.pagination = new Pagination(
            this,
            this.pageSizes,
            collection.locale.pagination)
        this.actionTray = new ActionTray(this.actions, this)
        this.searchbar = new SearchBar(this)
        this.filterTray = new Filter(this)

        this.dom.footer.append(this.status.dom,
                               this.pagination.dom)
        this.dom.header.append(this.pagination.sizeSelector,
                               this.actionTray.dom,
                               this.searchbar.dom,
                               this.filterTray.dom)
        this.formManager = new FormManager(this, collection.locale.form)
        this._updateStatus()

        this._init()

        if (this.collection.tables.length === 0) this.dom.mount();
    }

    private async _init(): Promise<void> {
        const data = await this.collection.receiver(this.init) as Row[]
        this.add(data)
    }

    private _updateStatus(): void {
        if (this.rows.length == 0) {
            this.status.setEmpty()
            return;
        }
        const [start, end] = this.pagination.retrieveDisplayRange(this.rows.length)
        this.status.setRange(start + 1, Math.min(end, this.rows.length), this.rows.length)
    }

    private _serveUpdates(): void {
        for (const subID of this.subscribers) {
            const subscriber = this.collection.find(subID)
            if (subscriber == null) {
                console.warn(`Couldn't resolve subscription of ${subID}`)
                return
            }
            subscriber.refresh()
            subscriber.filterTray.refresh()
        }
    }

    add(rows: Row[]): void {
        this._data = this._data.concat(rows)
        // TODO: add possible optimization
        this.mask = this.mask
        this.refresh()
        this._serveUpdates()
    }

    replace(chunk: Row[]): void {
        // TODO: Address performance
        const [pageStart, pageEnd] = this.pagination.retrieveDisplayRange(this.rows.length)
        this.dom.clear()
        this.dom.add(chunk)
        this.pagination.updatePagination(this.rows.length)
        this._updateStatus()
        if (this._selectedRowIndex != null &&
            this._selectedRowIndex >= pageStart &&
                this._selectedRowIndex < pageEnd) {
            this.dom.highlight(this._selectedRowIndex - pageStart)
        }
        this._mask = null
    }

    refresh(): void {
        // TODO: Address performance
        const [pageStart, pageEnd] = this.pagination.retrieveDisplayRange(this.rows.length)
        this.replace(this.rows.slice(pageStart, pageEnd))
    }

    reinit(): void {
        this._data = []
        this._init()
    }

    toggleRow(relativeRowIndex: number): void {
        // TODO: Address performance
        const [pageStart, pageEnd] = this.pagination.retrieveDisplayRange(this.rows.length)
        const absoluteRowIndex = relativeRowIndex + pageStart
        if (absoluteRowIndex == this._selectedRowIndex) {
            this.selectedRowIndex = null
            this.dom.clearHighlight(relativeRowIndex)
        } else {
            if (this._selectedRowIndex != null &&
                this._selectedRowIndex >= pageStart &&
                this._selectedRowIndex < pageEnd) {
                this.dom.clearHighlight(this._selectedRowIndex - pageStart)
            }
            this.dom.highlight(relativeRowIndex)
            this.selectedRowIndex = absoluteRowIndex
        }
    }

    subscribe(subscriberID: string): void {
        this._subscribers.add(subscriberID)
    }

    mount(): void {
        if (this.formManager.active && !this.formManager.visible) {
            this.formManager.mount()
        } else if (!this.formManager.active && !this.dom.active) {
            this.dom.mount()
        }
    }

    unmount(): void {
        if (this.formManager.active && this.formManager.visible) {
            this.formManager.unmount()
        } else if (!this.formManager.active && this.dom.active) {
            this.dom.unmount()
        }
    }

    get data(): Row[] {
        return this._data
    }

    get rows(): Row[] {
        return this._listedRows
    }

    get subscribers(): Set<string> {
        return this._subscribers
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
        this.pagination.activePage = 0
        this.selectedRowIndex = null
    }

    set activePage(pageIndex: number) {
        this.pagination.activePage = pageIndex
        this.refresh()
    }

    set selectedRowIndex(value: number | null) {
        if (value == null) {
            if (this._selectedRowIndex != null) {
                this.actionTray.triggerRowDeselect()
            }
            this._selectedRowIndex = null
        } else {
            this._selectedRowIndex = value
            this.actionTray.triggerRowSelect()
        }
    }
}
