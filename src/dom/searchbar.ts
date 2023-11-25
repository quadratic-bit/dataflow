import { SearchBar } from "components/search"

export class SearchBarDOM {
    private _container: HTMLDivElement

    constructor(owner: SearchBar<any>) {
        const bar: HTMLInputElement = document.createElement("input")
        bar.type = "text"
        bar.addEventListener("input", (e: Event) => {
            const target = e.target as HTMLInputElement
            owner.updateSearchResults(target.value)
        })
        const wrapper = document.createElement("div")
        wrapper.classList.add("dataflow-table-searchbar")
        wrapper.appendChild(bar)
        this._container = wrapper
    }

    get container(): HTMLDivElement {
        return this._container
    }
}
