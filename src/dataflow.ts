import { TableDOM } from "./dom/table"
import type { TableCell, TableColumn } from "./types/columns"
import { Pagination } from "./pagination"

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
}

class _TableFactory {
    private _data: TableConfig

    constructor(id: string, title: string, init: string, outer: TableCollection) {
        this._data = { id, title, init, outer, columns: [] }
    }

    column(definition: TableColumn): _TableFactory {
        this._data.columns.push(definition)
        return this
    }

    init(): Table {
        return new Table(this._data)
    }
}

export class Table {
    private _config: TableConfig
    private _dom: TableDOM
    private _data: TableCell[][] = []
    private _pagination: Pagination

    constructor(config: TableConfig) {
        this._config = config
        this._dom = new TableDOM(config.outer.mount, config.columns)
        this._pagination = new Pagination(this._dom.footer, { kind: "some", amount: 10 })
    }

    add(rows: TableCell[][]): void {
        this._data = this._data.concat(rows)
        this._dom.add(rows)
        this._pagination.updatePageNum(this._data.length)
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
}
