import { Table } from "../dataflow";
import { Action } from "../types/actions";
import { TableColumn } from "../types/columns";

export class FormManager<Row> {
    private _owner: Table<Row>

    constructor(owner: Table<Row>) {
        this._owner = owner
    }

    private _prepareContainer(title: string): HTMLFormElement {
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

        const body = document.createElement("div")
        body.classList.add("dataflow-form-body")
        const content = document.createElement("form")
        content.classList.add("dataflow-form-content")
        body.appendChild(content)

        this._owner.dom.container.appendChild(header)
        this._owner.dom.container.appendChild(body)

        return content
    }

    private static _newField(column: TableColumn): HTMLDivElement {
        const field = document.createElement("div")
        const label = document.createElement("label")
        label.textContent = column.title ??
                            column.column.charAt(0).toUpperCase() +
                            column.column.slice(1)
        const input = document.createElement("input")
        input.name = column.column
        field.appendChild(label)
        field.appendChild(input)
        field.classList.add("dataflow-form-field")
        return field
    }

    private _applyFilledInputs(container: HTMLFormElement, row: Row): void {
        for (const col of this._owner.config.columns) {
            const field = FormManager._newField(col)
            const input = field.children.item(1) as HTMLInputElement
            // TODO: handle missing field case
            input.value = row[input.name as keyof Row] + ""
            container.appendChild(field)
        }
    }

    private _applyFilledHiddenInputs(container: HTMLFormElement, row: Row): void {
        container.appendChild(document.createTextNode(
            "Are you sure you want to perform this action?"
        ))
        for (const col of this._owner.config.columns) {
            const input = document.createElement("input")
            input.name = col.column
            // TODO: handle missing field case
            input.value = row[input.name as keyof Row] + ""
            input.type = "hidden"
            container.appendChild(input)
        }
    }

    private _applyEmptyInputs(container: HTMLFormElement): void {
        for (const col of this._owner.config.columns) {
            const field = FormManager._newField(col)
            container.appendChild(field)
        }
    }

    private _createButtons(): HTMLDivElement {
        const footer = document.createElement("div")
        footer.classList.add("dataflow-form-footer")

        const buttonCancel = document.createElement("button")
        buttonCancel.textContent = "Cancel"
        buttonCancel.type = "button"
        buttonCancel.addEventListener("click", () => { this.hide() })

        const buttonSubmit = document.createElement("button")
        buttonSubmit.textContent = "Submit"
        buttonSubmit.type = "submit"

        footer.appendChild(buttonCancel)
        footer.appendChild(buttonSubmit)
        return footer
    }

    apply(action: Action<Row>): void {
        const contentContainer = this._prepareContainer(action.label)
        if (action.showColumns) {
            if (action.fillColumns) {
                const row: Row | null = this._owner.selectedRow
                if (row == null) {
                    throw Error(`Cannot perform action "${action.label}" with no column selected`)
                }
                this._applyFilledInputs(contentContainer, row)
            } else {
                this._applyEmptyInputs(contentContainer)
            }
        } else {
            const row: Row | null = this._owner.selectedRow
            if (row == null) {
                throw Error(`Cannot perform action "${action.label}" with no column selected`)
            }
            this._applyFilledHiddenInputs(contentContainer, row)
        }
        const footer = this._createButtons()
        contentContainer.appendChild(footer)
        contentContainer.addEventListener("submit", (e: SubmitEvent) => {
            e.preventDefault()
            const formData = new FormData(contentContainer)
            const row = Object.fromEntries(formData.entries()) as Row
            action.callback(row, this._owner)
            this.hide()
        })
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