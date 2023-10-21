import { Table } from "./dataflow"
import { PaginationSizeSelectorDOM, PagintaionDOM } from "./dom/pagination"
import { PaginationLen } from "./types/pagination"

export class Pagination {
    private _length: PaginationLen
    private _dom: PagintaionDOM

    constructor(mount: HTMLDivElement, pageLength: PaginationLen, table: Table) {
        this._length = pageLength
        this._dom = new PagintaionDOM(mount, table)
    }

    setActivePage(pageIndex: number): void {
        this._dom.activePage = pageIndex
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
    constructor(mount: HTMLDivElement, options: PaginationLen[]) {
        new PaginationSizeSelectorDOM(mount, options)
    }
}
