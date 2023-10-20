export class PagintaionDOM {
    private _container: HTMLDivElement
    private _wrapper: HTMLDivElement
    private _buttonsAmount: number

    constructor(container: HTMLDivElement) {
        this._container = container
        const wrapper: HTMLDivElement = document.createElement("div")
        this._container.appendChild(wrapper)
        this._wrapper = wrapper
        this._buttonsAmount = 0
        this.repopulateButtons(1)
    }

    repopulateButtons(amount: number) {
        const previousAmount = this._buttonsAmount
        this._buttonsAmount = amount
        if (previousAmount == amount) {
            return
        } else if (previousAmount < amount) {
            let newButtons: HTMLButtonElement[] = Array(amount - previousAmount)
            for (let i = previousAmount + 1; i <= amount; ++i) {
                let button = document.createElement("button")
                button.textContent = i + ""
                newButtons[i - previousAmount - 1] = button
            }
            this._wrapper.append(...newButtons)
            return
        }
        // previousAmount > amount
        for (let i = 0; i < previousAmount - amount; ++i) {
            const lastChild = this._wrapper.lastChild
            if (lastChild == null) break;
            this._wrapper.removeChild(lastChild)
        }
    }

    changePageNum(pagesNum: number) {
        console.log(pagesNum)
    }

    get container(): Element {
        return this._container
    }
}
