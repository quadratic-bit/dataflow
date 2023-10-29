import { Table } from "../dataflow"
import { PageLength } from "../types/pagination"

// TODO: oh that's a typo right here
export class PagintaionDOM {
    private _container: HTMLDivElement
    private _sizeSelector: PaginationSizeSelectorDOM
    private _buttonsAmount: number
    private _activePageIndex: number
    private _owner: Table<any>

    constructor(table: Table<any>, options: PageLength[]) {
        this._container = document.createElement("div")
        this._container.addEventListener("click", (e: MouseEvent) => {
            if ((e.target as Element).tagName != "BUTTON") return;
            const targetBtn = e.target as HTMLButtonElement
            // TODO: Stop hiding the problem
            const pageIndex = targetBtn.dataset.index!
            this._owner.activePage = Number.parseInt(pageIndex)
            this._owner.refresh()
        })
        this._buttonsAmount = 0
        this._activePageIndex = 0
        this._owner = table
        this.repopulateButtons(1)
        this._sizeSelector = new PaginationSizeSelectorDOM(options, table)
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

    get container(): HTMLDivElement {
        return this._container
    }

    get sizeSelector(): PaginationSizeSelectorDOM {
        return this._sizeSelector
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
    private _container: HTMLSpanElement
    private _chooser: HTMLSelectElement
    private _owner: Table<any>

    constructor(options: PageLength[], sizeSelector: Table<any>) {
        this._owner = sizeSelector
        this._container = document.createElement("span")
        this._container.appendChild(document.createTextNode("Show "))
        this._chooser = document.createElement("select")
        this._container.appendChild(this._chooser)
        this._container.appendChild(document.createTextNode(" entries"))

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
            this._chooser.appendChild(optionDOM)
        }

        this._chooser.addEventListener("change", (_: Event) => {
            const value: number = Number.parseInt(this._chooser.value)
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

    get container(): HTMLSpanElement {
        return this._container
    }
}
