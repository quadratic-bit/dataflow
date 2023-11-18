import { Table } from "common/dataflow"
import { PaginationDOM } from "dom/pagination"
import { LocalePagination } from "common/locale"
import { PageLength } from "types/pagination"

export class Pagination {
    private _length: PageLength
    private _dom: PaginationDOM
    private _lastDataSize: number = 1

    constructor(table: Table<any>, options: PageLength[], locale: LocalePagination) {
        this._length = options[0]
        this._dom = new PaginationDOM(table, options, locale)
    }

    retrieveDisplayRange(dataSize: number): [number, number] {
        const activePage = this._dom.activePage
        switch (this._length.kind) {
            case "some":
                const offset = activePage * this._length.amount
                return [offset, offset + this._length.amount]
            case "all":
                return [0, dataSize]
        }
    }

    updatePagination(dataSize: number): void {
        this._lastDataSize = dataSize
        switch (this._length.kind) {
            case "some":
                const pagesN = Math.ceil(dataSize / this._length.amount)
                this._dom.updatePagination(pagesN == 0 ? 1 : pagesN)
                break
            case "all":
                this._dom.updatePagination(1)
        }
    }

    get dom(): PaginationDOM {
        return this._dom
    }

    set activePage(pageIndex: number) {
        this._dom.activePage = pageIndex
    }

    set pageLength(length: PageLength) {
        this._length = length
        this.activePage = 0
        this.updatePagination(this._lastDataSize)
    }
}
