import { TableDOM } from "dom/table"
import { Pagination } from "components/pagination"
import { Status } from "components/status"
import { SearchBar } from "components/search"
import { Action } from "types/actions"
import { ActionTray } from "components/actiontray"
import { FormManager } from "dom/form"
import { Filter } from "components/filter"
import { TableConfig } from "./factory"

export class Table<Row> {
    dom: TableDOM<Row>
    config: TableConfig<Row>
    pagination: Pagination
    searchbar: SearchBar<Row>
    actionTray: ActionTray<Row>
    filterTray: Filter<Row>
    status: Status

    private _formManager: FormManager<Row>
    private _data: Row[] = []
    private _mask: number[] | null = null
    private _listedRows: Row[] = []
    private _selectedRowIndex: number | null = null
    private _subscribers: Set<string>

    constructor(config: TableConfig<Row>, early_subs?: Set<string>) {
        this.config = config
        this._subscribers = early_subs ?? new Set()
        this.dom = new TableDOM(config.collection.mountDOM, config.columns, this)
        this.status = new Status(config.collection.locale.status)
        this.pagination = new Pagination(
            this,
            this.config.pageSizes,
            config.collection.locale.pagination)
        this.actionTray = new ActionTray(config.actions, this)
        this.searchbar = new SearchBar(this)
        this.filterTray = new Filter(this)

        this.dom.footer.append(this.status.dom,
                               this.pagination.dom)
        this.dom.header.append(this.pagination.sizeSelector,
                               this.actionTray.dom,
                               this.searchbar.dom,
                               this.filterTray.dom)
        this._formManager = new FormManager(this, config.collection.locale.form)
        this._updateStatus()

        this._init()

        if (this.config.collection.tables.length === 0) this.dom.mount();
    }

    private async _init(): Promise<void> {
        const data = await this.config.collection.getter(this.config.init) as Row[]
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
            const subscriber = this.config.collection.find(subID)
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

    setContext(action: Action<Row>, rowValue?: Partial<Row>): void {
        this._formManager.apply(action, rowValue)
    }

    subscribe(subscriberID: string): void {
        this._subscribers.add(subscriberID)
    }

    mount(): void {
        if (this._formManager.active && !this._formManager.visible) {
            this._formManager.mount()
        } else if (!this._formManager.active && !this.dom.active) {
            this.dom.mount()
        }
    }

    unmount(): void {
        if (this._formManager.active && this._formManager.visible) {
            this._formManager.unmount()
        } else if (!this._formManager.active && this.dom.active) {
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
