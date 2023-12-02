import { TableDOM } from "dom/table"
import type { TableColumn } from "types/columns"
import type { FormSelector, SelectDependency } from "./subscription"
import { Pagination } from "components/pagination"
import { Status } from "components/status"
import { PageLength, PagesAll, PagesSome } from "types/pagination"
import { SearchBar } from "components/search"
import { Action, ButtonLink } from "types/actions"
import { ActionTray } from "components/actionset"
import { FormManager } from "dom/form"
import { Localization, PartialLocale } from "common/locale"
import { Filter } from "components/filter"

export class TableCollection {
    private _mount: Element
    handler: () => void
    getter: (query: any) => Promise<any>
    currentTable: string | null = null
    private _tables: Table<any>[]
    private _localization: Localization

    constructor(
        mount: string,
        handler: () => void,
        getter: (query: any) => Promise<any>,
        locale?: Partial<PartialLocale>)
    {
        const mountDOM = document.querySelector(mount)
        if (mountDOM == null) {
            throw Error(`Mount point "${mount}" does not exist in DOM`)
        }
        mountDOM.classList.add("dataflow-table-wrapper")
        this._mount = mountDOM
        this.handler = handler
        this.getter = getter
        this._tables = []
        this._localization = new Localization(locale)
    }

    public get tables(): Table<any>[] {
        return this._tables
    }

    public get mountDOM(): Element {
        return this._mount
    }

    find(id: string): Table<any> | null {
        for (const tbl of this._tables) {
            if (tbl.config.id === id) {
                return tbl
            }
        }
        return null
    }

    mount(id: string): void {
        if (this.currentTable != null) throw Error(`Cannot mount: ${this.currentTable} is up`);
        const table = this.find(id)
        if (table == null) throw Error(`No table found with id ${id}`);
        this.mountDOM.textContent = ""
        this.mountDOM.classList.remove("dataflow-table-filler")
        table.mount();
        this.currentTable = id
    }

    unmount(): void {
        if (this.currentTable == null) throw Error(`Cannot unmount: no table is up`);
        const table = this.find(this.currentTable)!
        table.unmount();
        this.currentTable = null
        this.mountDOM.textContent = this._localization.frame.empty
        this.mountDOM.classList.add("dataflow-table-filler")
    }

    swap(id: string): void {
        // TODO: Deal with swaps during actions
        if (this.currentTable == id) return;
        this.unmount()
        this.mount(id)
    }

    new<Row>(id: string, init: string, title?: string): _TableFactory<Row> {
        return new _TableFactory(id, title ?? id, init, this, (table: Table<Row>) => {
            this.currentTable = this.currentTable ?? table.config.id
            this._tables.push(table)
        })
    }

    get locale(): Localization {
        return this._localization
    }
}

interface TableConfig<Row> {
    id: string
    title: string
    init: any
    columns: TableColumn[]
    collection: TableCollection
    pageSizes: PageLength[]
    actions: (Action<Row> | ButtonLink<Row>)[]
    // TODO: remove or remake after the 5th task
    colors: Map<string, [any, string][]>
}

class _TableFactory<Row> {
    private _data: TableConfig<Row>
    private _subscribers: Set<string> = new Set()
    private _callback: (table: Table<Row>) => void

    constructor(id: string, title: string, init: any, outer: TableCollection,
                callback: (table: Table<Row>) => void) {
        this._data = { id, title, init, collection: outer, columns: [], pageSizes: [], actions: [], colors: new Map()}
        this._callback = callback
    }

    describe(definition: TableColumn): _TableFactory<Row> {
        this._data.columns.push(definition)
        return this
    }

    subscribe(table: string): _TableFactory<Row> {
        this._subscribers.add(table)
        return this
    }

    color(column: string, value: any, color: string): _TableFactory<Row> {
        if (this._data.colors.has(column)) {
            this._data.colors.get(column)!.push([value, color])
        } else {
            this._data.colors.set(column, [[value, color]])
        }
        return this
    }

    action(action: Action<Row>): _TableFactory<Row> {
        this._data.actions.push(action)
        return this
    }

    actionAdd(callback: (data: FormData, table: Table<Row>) => Promise<void | boolean>, preprocess?: (selector: FormSelector) => Promise<void>): _TableFactory<Row> {
        this._data.actions.push({
            label: this._data.collection.locale.actions.add,
            showColumns: true,
            fillColumns: false,
            activateOnSelect: false,
            callback,
            preprocess
        })
        return this
    }

    actionEdit(callback: (data: FormData, table: Table<Row>) => Promise<void | boolean>, preprocess?: (selector: FormSelector) => Promise<void>): _TableFactory<Row> {
        this._data.actions.push({
            label: this._data.collection.locale.actions.edit,
            showColumns: true,
            fillColumns: true,
            activateOnSelect: true,
            callback,
            preprocess
        })
        return this
    }

    actionDelete(callback: (data: FormData, table: Table<Row>) => Promise<void | boolean>, preprocess?: (selector: FormSelector) => Promise<void>): _TableFactory<Row> {
        this._data.actions.push({
            label: this._data.collection.locale.actions.delete,
            showColumns: false,
            activateOnSelect: true,
            callback,
            preprocess
        })
        return this
    }

    actionLink(label: string,
               target: string,
               action: string,
               dataMap: any,
               callback?: () => void,
               predicate?: (table: Table<Row>) => boolean): _TableFactory<Row> {
        this._data.actions.push({
            label,
            target,
            action,
            dataMap,
            activateOnSelect: true,
            callback,
            predicate
        })
        return this
    }

    pageSizes(sizes: PageLength[]): _TableFactory<Row> {
        this._data.pageSizes = sizes
        return this
    }

    init(): Table<Row> {
        // TODO: Extract defaults to another file
        if (this._data.pageSizes.length == 0) {
            this._data.pageSizes = [PagesSome(15), PagesSome(25), PagesAll]
        }
        const table = new Table(this._data, this._subscribers)
        this._callback(table)
        return table
    }
}

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
