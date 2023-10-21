import { Table } from "./dataflow"
import { PaginationSizeSelectorDOM, PagintaionDOM } from "./dom/pagination"
import { PaginationLen } from "./types/pagination"

export class Pagination {
    private _length: PaginationLen
    private _dom: PagintaionDOM
    private _lastDataSize: number = 1

    constructor(mount: HTMLDivElement, pageLength: PaginationLen, table: Table) {
        this._length = pageLength
        this._dom = new PagintaionDOM(mount, table)
    }

    setActivePage(pageIndex: number): void {
        this._dom.activePage = pageIndex
    }

    setPageSize(size: PaginationLen): void {
        this._length = size
        this.updatePagination(this._lastDataSize)
    }

    getDisplayRange(dataSize: number): [number, number] {
        const activePage = this._dom.activePage
        switch (this._length.kind) {
            case "some":
                const offset = activePage * this._length.amount
                return [offset, offset + this._length.amount]
            case "all":
                return [0, dataSize - 1]
        }
    }

    updatePagination(dataSize: number): void {
        this._lastDataSize = dataSize
        switch (this._length.kind) {
            case "some":
                this._dom.updatePagination(Math.ceil(dataSize / this._length.amount))
                break
            case "all":
                this._dom.updatePagination(1)
        }
    }
}

export class PaginationSizeSelector {
    private _owner: Table
    private _dom: PaginationSizeSelectorDOM

    constructor(mount: HTMLDivElement, options: PaginationLen[], table: Table) {
        this._owner = table
        this._dom = new PaginationSizeSelectorDOM(mount, options, this)
    }

    setPageSize(size: number): void {
        switch (size) {
            case NaN:
                throw Error("Page size cannot be zero")
            case 0:
                this._owner.pagination.setPageSize({ kind: "all" })
                this._owner.refresh()
                break
            default:
                this._owner.pagination.setPageSize({ kind: "some", amount: size })
                this._owner.refresh()
        }
    }

    get dom(): PaginationSizeSelectorDOM {
        return this._dom
    }
}
