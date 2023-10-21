import { Table } from "./dataflow"
import { PagintaionDOM } from "./dom/pagination"
import { PageLength } from "./types/pagination"

export class Pagination {
    private _length: PageLength
    private _dom: PagintaionDOM
    private _lastDataSize: number = 1

    constructor(table: Table, options: PageLength[]) {
        this._length = options[0]
        this._dom = new PagintaionDOM(table, options)
    }

    setActivePage(pageIndex: number): void {
        this._dom.activePage = pageIndex
    }

    setPageLength(length: PageLength): void {
        this._length = length
        this.setActivePage(0)
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
