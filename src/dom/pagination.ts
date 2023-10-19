export class PagintaionDOM {
    private _container: HTMLDivElement

    constructor(container: HTMLDivElement) {
        this._container = container
        const sth: HTMLSpanElement = document.createElement("span")
        sth.textContent = "2"
        this._container.appendChild(sth)
    }

    changePageNum(pagesNum: number) {
        console.log(pagesNum)
    }

    get container(): Element {
        return this._container
    }
}
