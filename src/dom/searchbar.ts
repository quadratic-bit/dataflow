import { SearchBar } from "../search"

export class SearchBarDOM {
    private _container: HTMLInputElement

    constructor(mount: HTMLDivElement, owner: SearchBar<any>) {
        const bar = document.createElement("input")
        bar.type = "text"
        bar.addEventListener("input", (e: Event) => {
            const target = e.target as HTMLInputElement
            owner.updateSearchResults(target.value)
        })
        mount.appendChild(bar)
        this._container = bar
    }

    get container(): HTMLInputElement {
        return this._container
    }
}
