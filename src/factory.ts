import { Table } from "./dataflow"
import { Localization, PartialLocale } from "./locale"
import { TableColumn } from "types/columns"
import { PageLength, PagesSome, PagesAll } from "types/pagination"
import { Action, ActionCallback, ActionConfig, ButtonLink } from "types/actions"

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

export interface TableConfig<Row> {
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

    actionAdd(callback: ActionCallback<Row>, config?: ActionConfig): _TableFactory<Row> {
        this._data.actions.push({
            label: this._data.collection.locale.actions.add,
            showColumns: true,
            fillColumns: false,
            activateOnSelect: false,
            callback: callback,
            preprocess: config != null ? config.preprocess : undefined,
            exclude: config != null ? config.exclude : undefined
        })
        return this
    }

    actionEdit(callback: ActionCallback<Row>, config?: ActionConfig): _TableFactory<Row> {
        this._data.actions.push({
            label: this._data.collection.locale.actions.edit,
            showColumns: true,
            fillColumns: true,
            activateOnSelect: true,
            callback: callback,
            preprocess: config != null ? config.preprocess : undefined,
            exclude: config != null ? config.exclude : undefined
        })
        return this
    }

    actionDelete(callback: ActionCallback<Row>, config?: ActionConfig): _TableFactory<Row> {
        this._data.actions.push({
            label: this._data.collection.locale.actions.delete,
            showColumns: false,
            activateOnSelect: true,
            callback: callback,
            preprocess: config != null ? config.preprocess : undefined,
            exclude: config != null ? config.exclude : undefined
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
