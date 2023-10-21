import { Table } from "../dataflow"

export class PagintaionDOM {
    private _container: HTMLDivElement
    private _buttonsAmount: number
    private _activePageIndex: number
    private _owner: Table

    constructor(mount: HTMLDivElement, table: Table) {
        this._container = document.createElement("div")
        mount.appendChild(this._container)
        this._buttonsAmount = 0
        this._activePageIndex = 0
        this._owner = table
        this.repopulateButtons(1)
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
                    this._owner.setActivePage(Number.parseInt(pageIndex))
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
        this._activePageIndex = pageIndex
    }
}
