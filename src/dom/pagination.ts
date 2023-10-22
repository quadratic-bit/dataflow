import { Table } from "../dataflow"
import { PageLength } from "../types/pagination"

export class PagintaionDOM {
    private _container: HTMLDivElement
    private _buttonsAmount: number
    private _activePageIndex: number
    private _owner: Table

    constructor(table: Table, options: PageLength[]) {
        this._container = document.createElement("div")
        table.dom.footer.appendChild(this._container)
        this._buttonsAmount = 0
        this._activePageIndex = 0
        this._owner = table
        this.repopulateButtons(1)
        new PaginationSizeSelectorDOM(table.dom.header, options, table)
        this.activePage = 0
    }

    private repopulateButtons(amount: number): void {
        const previousAmount = this._buttonsAmount
        this._buttonsAmount = amount
        if (previousAmount == amount) {
            return
        } else if (previousAmount < amount) {
            let newButtons: HTMLButtonElement[] = Array(amount - previousAmount)
            for (let i = previousAmount; i < amount; ++i) {
                let button = document.createElement("button")
                button.textContent = (i + 1) + ""
                button.dataset.index = i + ""
                button.addEventListener("click", (e: MouseEvent) => {
                    const targetBtn = e.target as HTMLButtonElement
                    // TODO: Stop hiding the problem
                    const pageIndex = targetBtn.dataset.index!
                    this._owner.activePage = Number.parseInt(pageIndex)
                    this._owner.refresh()
                })
                newButtons[i - previousAmount] = button
            }
            this._container.append(...newButtons)
            return
        }
        // previousAmount > amount
        for (let i = 0; i < previousAmount - amount; ++i) {
            const lastChild = this._container.lastChild
            if (lastChild == null) break;
            this._container.removeChild(lastChild)
        }
    }

    updatePagination(pagesNum: number): void {
        this.repopulateButtons(pagesNum)
    }

    get activePage(): number {
        return this._activePageIndex
    }

    set activePage(pageIndex: number) {
        // TODO: Resolve null or non-button case
        const prevBtn = this._container.children.item(this._activePageIndex) as HTMLButtonElement
        const nextBtn = this._container.children.item(pageIndex) as HTMLButtonElement
        prevBtn.disabled = false
        nextBtn.disabled = true
        this._activePageIndex = pageIndex
    }
}

class PaginationSizeSelectorDOM {
    private _container: HTMLSelectElement
    private _owner: Table

    constructor(mount: HTMLDivElement, options: PageLength[], sizeSelector: Table) {
        this._owner = sizeSelector
        this._container = document.createElement("select")
        mount.appendChild(this._container)

        for (const option of options) {
            const optionDOM = document.createElement("option")
            switch (option.kind) {
                case "some":
                    optionDOM.textContent = option.amount + ""
                    optionDOM.value = option.amount + ""
                    break
                case "all":
                    optionDOM.textContent = "All"
                    optionDOM.value = "0"
            }
            this._container.appendChild(optionDOM)
        }

        this._container.addEventListener("change", (_: Event) => {
            const value: number = Number.parseInt(this._container.value)
            switch (value) {
                case NaN:
                    throw Error("Page size cannot be zero")
                case 0:
                    this._owner.pagination.pageLength = { kind: "all" }
                    this._owner.refresh()
                    break
                default:
                    this._owner.pagination.pageLength = { kind: "some", amount: value }
                    this._owner.refresh()
            }
        })
    }
}
