import { Table } from "../dataflow";
import { Action } from "../types/actions";

export class FormManager<Row> {
    private _owner: Table<Row>

    constructor(owner: Table<Row>) {
        this._owner = owner
    }

    private _prepareContainer(title: string): HTMLDivElement {
        this._owner.dom.container.classList.remove("dataflow-table-wrapper")
        this._owner.dom.container.classList.add("dataflow-form-wrapper")

        const header = document.createElement("div")
        header.classList.add("dataflow-form-header")
        const exitButton = document.createElement("a")
        exitButton.textContent = "Go back"
        exitButton.href = "javascript:void(0)"
        exitButton.addEventListener("click", () => { this.hide() })
        header.appendChild(document.createTextNode(`${this._owner.config.title} / ${title}`))
        header.appendChild(exitButton)

        const content = document.createElement("div")
        content.classList.add("dataflow-form-body")
        this._owner.dom.container.appendChild(header)
        this._owner.dom.container.appendChild(content)

        return content
    }

    private _applyFilledInputs(container: HTMLDivElement): void {
        for (const col of this._owner.config.columns) {
            const field = document.createElement("div")
            const label = document.createElement("label")
            label.textContent = col.title ??
                                col.column.charAt(0).toUpperCase() +
                                col.column.slice(1)
            const input = document.createElement("input")
            field.appendChild(label)
            field.appendChild(input)
            container.appendChild(field)
        }
    }

    private _applyBlank(container: HTMLDivElement): void {
        container.textContent = "bruh"
    }

    apply(action: Action<Row>): void {
        const contentContainer = this._prepareContainer(action.label)
        if (action.showColumns) {
            this._applyFilledInputs(contentContainer)
        } else {
            this._applyBlank(contentContainer)
        }
    }

    hide(): void {
        while (this._owner.dom.container.lastElementChild) {
            this._owner.dom.container.removeChild(this._owner.dom.container.lastElementChild)
        }
        this._owner.dom.container.classList.remove("dataflow-form-wrapper")
        this._owner.dom.container.classList.add("dataflow-table-wrapper")
        this._owner.dom.mount()
    }
}
