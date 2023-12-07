import { Table } from "common/table"
import type { TableColumn } from "types/columns"
import { resolveDependency } from "common/subscription"

export class TableDOM<Row> {
    private _container: Element
    private _cover: HTMLDivElement
    private _footer: HTMLDivElement
    private _tableWrapper: HTMLDivElement
    private _tableBody: HTMLTableSectionElement
    private _headers: TableColumn[]
    private _owner: Table<Row>
    private _active: boolean = false

    constructor(container: Element, headers: TableColumn[], table: Table<Row>) {
        this._container = container
        this._headers = headers

        // ---- Init Cover ----
        const coverDOM: HTMLDivElement = document.createElement("div")
        coverDOM.classList.add("dataflow-table-header")
        this._cover = coverDOM

        // ---- Init Table ----
        const tblContentWrapper: HTMLDivElement = document.createElement("div")
        tblContentWrapper.classList.add("dataflow-table-content")
        this._tableWrapper = tblContentWrapper
        const tblScrollableWrapper: HTMLDivElement = document.createElement("div")
        tblScrollableWrapper.classList.add("dataflow-table-scrollable")
        const tbl: HTMLTableElement = document.createElement("table")
        const tblHead: HTMLTableSectionElement = document.createElement("thead")
        const tblBody: HTMLTableSectionElement = document.createElement("tbody")
        tblBody.addEventListener("click", (e: MouseEvent) => {
            const el = e.target as Element
            if (el.tagName != "TD" && el.tagName != "DIV") return;
            const row = el.closest("tr")!
            this._owner.toggleRow(Array.from(this._tableBody.children).indexOf(row))
        })
        this._tableBody = tblBody

        const trHead: HTMLTableRowElement = document.createElement("tr")
        for (const col of this._headers) {
            if (col.hide === true) continue;
            const th = document.createElement("th")
            th.textContent = col.title ?? col.name.charAt(0).toUpperCase() + col.name.slice(1)
            trHead.appendChild(th)
        }
        tblHead.appendChild(trHead)
        tbl.appendChild(tblHead)
        tbl.appendChild(tblBody)
        tbl.classList.add("dataflow-table")
        tblScrollableWrapper.appendChild(tbl)
        tblContentWrapper.appendChild(tblScrollableWrapper)

        // ---- Init Footer ----
        const footerDOM: HTMLDivElement = document.createElement("div")
        footerDOM.classList.add("dataflow-table-footer")
        this._footer = footerDOM

        this._owner = table
    }

    clear(): void {
        // TODO: Address performance
        while (this._tableBody.lastChild) {
            this._tableBody.removeChild(this._tableBody.lastChild)
        }
    }

    add(rows: Row[]): void {
        for (const row of rows) {
            const tr: HTMLTableRowElement = document.createElement("tr")
            for (const header of this._headers) {
                if (header.hide === true) continue;
                const td: HTMLTableCellElement = document.createElement("td")
                const divcell: HTMLDivElement = document.createElement("div")

                // TODO: I've successfully stolen this line but some checks should be here I feel
                let value: any = row[header.name as keyof Row]

                if (this._owner.config.colors.has(header.name)) {
                    const specs: [any, string][] = this._owner.config.colors.get(header.name)!
                    for (const [spec, color] of specs) {
                        if (value === spec) {
                            td.style.backgroundColor = color
                        }
                    }
                }

                if (header.type === "select" && !header.preventRenderTimeResolution) {
                    value = resolveDependency(this._owner, header.choices, value)
                }

                if (header.render != null) {
                    value = header.render(value)
                }

                divcell.textContent = value + ""
                divcell.title = value + ""
                if (header.overflow === false) {
                    divcell.style.whiteSpace = "nowrap"
                }
                td.appendChild(divcell)
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

    unmount(): void {
        this._container.removeChild(this._cover)
        this._container.removeChild(this._tableWrapper)
        this._container.removeChild(this._footer)
        this._active = false
    }

    mount(): void {
        this._container.appendChild(this._cover)
        this._container.appendChild(this._tableWrapper)
        this._container.appendChild(this._footer)
        this._active = true
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

    get active(): boolean {
        return this._active
    }
}
