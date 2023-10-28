import { Table } from "../dataflow"
import { TableCell, TableColumn } from "../types/columns"

export class TableDOM {
    private _container: Element
    private _cover!: HTMLDivElement
    private _footer!: HTMLDivElement
    private _tableBody!: HTMLTableSectionElement
    private _headers: TableColumn[]
    private _owner: Table

    constructor(container: Element, headers: TableColumn[], table: Table) {
        this._container = container
        this._headers = headers
        this._initCover()
        this._initTable()
        this._initFooter()
        this._owner = table
    }

    private _initCover(): void {
        const coverDOM: HTMLDivElement = document.createElement("div")
        coverDOM.classList.add("dataflow-table-header")
        this._container.appendChild(coverDOM)
        this._cover = coverDOM
    }

    private _initTable(): void {
        const tbl: HTMLTableElement = document.createElement("table")
        const tblHead: HTMLTableSectionElement = document.createElement("thead")
        const tblBody: HTMLTableSectionElement = document.createElement("tbody")
        tblBody.addEventListener("click", (e: MouseEvent) => {
            if ((e.target as Element).tagName != "TD") return;
            const row = (e.target as HTMLTableCellElement).closest("tr")!
            this._owner.toggleRow(Array.from(this._tableBody.children).indexOf(row))
        })
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

    private _initFooter(): void {
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

    highlight(rowIndex: number): void {
        // TODO: Check edge cases
        this._tableBody.children[rowIndex].classList.add("selected")
    }

    clearHighlight(rowIndex: number): void {
        // TODO: Check edge cases
        this._tableBody.children[rowIndex].classList.remove("selected")
    }

    get body(): HTMLTableSectionElement {
        return this._tableBody
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
