import { TableCell, TableColumn } from "../types/columns"

export class TableDOM {
    private _container: Element
    private _footer!: HTMLDivElement
    private _tableBody!: HTMLTableSectionElement
    private _headers: TableColumn[]

    constructor(container: Element, headers: TableColumn[]) {
        this._container = container
        this._headers = headers
        this.initTable()
        this.initFooter()
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

    get footer(): HTMLDivElement {
        return this._footer
    }
}
