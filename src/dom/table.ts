import { TableCell, TableColumn } from "../types/columns"

export class TableDOM {
    private _container: Element
    private _cover!: HTMLDivElement
    private _footer!: HTMLDivElement
    private _tableBody!: HTMLTableSectionElement
    private _headers: TableColumn[]

    constructor(container: Element, headers: TableColumn[]) {
        this._container = container
        this._headers = headers
        this.initCover()
        this.initTable()
        this.initFooter()
    }

    initCover(): void {
        const coverDOM: HTMLDivElement = document.createElement("div")
        coverDOM.classList.add("dataflow-table-header")
        this._container.appendChild(coverDOM)
        this._cover = coverDOM
    }

    initTable(): void {
        const tbl: HTMLTableElement = document.createElement("table")
        const tblHead: HTMLTableSectionElement = document.createElement("thead")
        const tblBody: HTMLTableSectionElement = document.createElement("tbody")
        this._tableBody = tblBody

        const trHead: HTMLTableRowElement = document.createElement("tr")
        for (const col of this._headers) {
            const th = document.createElement("th")
            th.textContent = col.title ?? col.name
            trHead.appendChild(th)
        }
        tblHead.appendChild(trHead)
        tbl.appendChild(tblHead)
        tbl.appendChild(tblBody)
        tbl.classList.add("dataflow-table")
        this._container.appendChild(tbl)
    }

    initFooter(): void {
        const footerDOM: HTMLDivElement = document.createElement("div")
        footerDOM.classList.add("dataflow-table-footer")
        this._container.appendChild(footerDOM)
        this._footer = footerDOM
    }

    clear(): void {
        // TODO: Address performance
        while (this._tableBody.lastChild) {
            this._tableBody.removeChild(this._tableBody.lastChild)
        }
    }

    add(rows: TableCell[][]): void {
        for (const row of rows) {
            const tr: HTMLTableRowElement = document.createElement("tr")
            for (const cell of row) {
                const td: HTMLTableCellElement = document.createElement("td")
                td.textContent = cell + ""
                tr.appendChild(td)
            }
            this._tableBody.appendChild(tr)
        }
    }

    get container(): Element {
        return this._container
    }

    get header(): HTMLDivElement {
        return this._cover
    }

    get footer(): HTMLDivElement {
        return this._footer
    }
}
