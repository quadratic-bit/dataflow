import { Localization, PartialLocale } from "./locale"
import { ActionHook, Action } from "core/actions"
import { Table, TableConfig } from "core/table"

export interface TableCollectionConfig {
    mount: string,
    receiver: (query: any) => Promise<any>,
    locale?: Partial<PartialLocale>
}

export class TableCollection {
    private _mount: Element
    receiver: (query: any) => Promise<any>
    currentTable: string | null = null
    private _tables: Table<any>[]
    private _localization: Localization

    constructor(config: TableCollectionConfig)
    {
        const mountDOM = document.querySelector(config.mount)
        if (mountDOM == null) {
            throw Error(`Mount point "${config.mount}" does not exist in DOM`)
        }
        mountDOM.classList.add("dataflow-table-wrapper")
        this._mount = mountDOM
        this.receiver = config.receiver
        this._tables = []
        this._localization = new Localization(config.locale)
    }

    public get tables(): Table<any>[] {
        return this._tables
    }

    public get mountDOM(): Element {
        return this._mount
    }

    actionAdd(callback: (data: FormData, table: Table<any>) => Promise<void | boolean>): Action<any> {
        return {
            label: this.locale.actions.add,
            hook: ActionHook.Always,
            callback,
            act: function (table: Table<any>) { table.formManager.applyAdd(this.label, this.callback) }
        }
    }

    actionEdit(callback: (data: FormData, table: Table<any>) => Promise<void | boolean>): Action<any> {
        return {
            label: this.locale.actions.edit,
            hook: ActionHook.OnSelect,
            callback,
            act: function (table: Table<any>) { table.formManager.applyEdit(this.label, this.callback) }
        }
    }

    actionDelete(callback: (data: FormData, table: Table<any>) => Promise<void | boolean>): Action<any> {
        return {
            label: this.locale.actions.delete,
            hook: ActionHook.OnSelect,
            callback,
            act: function (table: Table<any>) { table.formManager.applyDelete(this.label, this.callback) }
        }
    }

    find(id: string): Table<any> | null {
        for (const tbl of this._tables) {
            if (tbl.id === id) {
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

    new<Row>(config: TableConfig<Row>, early_subs?: Set<string>): Table<Row> {
        let table = new Table(config, this, early_subs)
        this.currentTable = this.currentTable ?? table.id
        this._tables.push(table)
        return table
    }

    get locale(): Localization {
        return this._localization
    }
}

