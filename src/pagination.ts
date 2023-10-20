import { PagintaionDOM } from "./dom/pagination"

interface PaginationSome {
    kind: "some"
    amount: number
}

interface PaginationAll {
    kind: "all"
}

type PaginationLen = PaginationSome | PaginationAll

export class Pagination {
    private _length: PaginationLen
    private _dom: PagintaionDOM

    constructor(mount: HTMLDivElement, pageLength: PaginationLen) {
        this._length = pageLength
        this._dom = new PagintaionDOM(mount)
    }

    updatePageNum(dataSize: number) {
        switch (this._length.kind) {
            case "some":
                this._dom.changePageNum(Math.ceil(dataSize / this._length.amount))
                break
            case "all":
                this._dom.changePageNum(1)
        }
    }
}
