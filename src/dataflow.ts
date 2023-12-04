import { TableDOM } from "dom/table"
import type { SelectDependency } from "./subscription"
import { Pagination } from "components/pagination"
import { Status } from "components/status"
import { SearchBar } from "components/search"
import { Action } from "types/actions"
import { ActionTray } from "components/actionset"
import { FormManager } from "dom/form"
import { Filter } from "components/filter"
import { TableCollection, TableConfig } from "./factory"

export { TableCollection }

export class Table<Row> {
    private _config: TableConfig<Row>
    private _dom: TableDOM<Row>
    private _pagination: Pagination
    private _status: Status
    private _formManager: FormManager<Row>
    private _actionTray: ActionTray<Row>
    private _searchbar: SearchBar<Row>
    private _filterTray: Filter<Row>
    private _data: Row[] = []
    private _mask: number[] | null = null
    private _listedRows: Row[] = []
    private _selectedRowIndex: number | null = null
    private _subscribers: Set<string>

    constructor(config: TableConfig<Row>, early_subs?: Set<string>) {
        this._config = config
        this._subscribers = early_subs ?? new Set()
        this._dom = new TableDOM(config.collection.mountDOM, config.columns, this)
        this._status = new Status(config.collection.locale.status)
        this._pagination = new Pagination(
            this,
            this._config.pageSizes,
            config.collection.locale.pagination)
        this._actionTray = new ActionTray(config.actions, this)
        this._searchbar = new SearchBar(this)
        this._filterTray = new Filter(this)

        this._dom.footer.append(this._status.dom.container,
                                this._pagination.dom.container)
        this._dom.header.append(this._pagination.dom.sizeSelector.container,
                                this._actionTray.dom.container,
                                this._searchbar.dom.container,
                                this._filterTray.dom.container)
        this._formManager = new FormManager(this, config.collection.locale.form)
        this._updateStatus()

        this._init()

        if (this.config.collection.tables.length === 0) this.dom.mount();
    }

    private async _init(): Promise<void> {
        const data = await this._config.collection.getter(this._config.init) as Row[]
        this.add(data)
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
        this.serveUpdates()
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

    reinit(): void {
        this._data = []
        this._init()
        this.refresh()
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

    setContext(action: Action<Row>, rowValue?: Partial<Row>): void {
        this._formManager.apply(action, rowValue)
    }

    subscribe(subscriberID: string): void {
        this._subscribers.add(subscriberID)
    }

    serveUpdates(): void {
        for (const subID of this._subscribers) {
            const subscriber = this._config.collection.find(subID)
            if (subscriber == null) {
                console.warn(`Couldn't resolve subscription of ${subID}`)
                return
            }
            subscriber.refresh()
            subscriber.filterTray.dom.refresh()
        }
    }

    resolveDependency(dependency: SelectDependency, query: any): string | null {
        const table = this._config.collection.find(dependency.table)
        if (table == null) throw Error(`Couldn't resolve dependency of ${dependency.table}`);
        table.subscribe(this._config.id)
        for (const row of table._data) {
            if (row[dependency.reference] === query) {
                return row[dependency.column]
            }
        }
        return null
    }

    resolveSelectDependency(dependency: SelectDependency): { value: unknown, label: string }[] {
        const table = this._config.collection.find(dependency.table)
        if (table == null) throw Error(`Couldn't resolve dependency of ${dependency.table}`);
        return table.data.map((r: any) => {
            return { value: r[dependency.reference], label: r[dependency.column] }
        })
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

    get filterTray(): Filter<Row> {
        return this._filterTray
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
            this._selectedRowIndex = value
            this.actionTray.triggerRowSelect()
        }
    }
}
