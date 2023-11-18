import { Table } from "../dataflow";
import { Action } from "../types/actions";
import { TableColumn, isSelectDependency } from "../types/columns";

export class FormManager<Row> {
    private _owner: Table<Row>
    private _container: HTMLDivElement
    private _visible: boolean = false
    private _active: boolean = false

    constructor(owner: Table<Row>) {
        this._owner = owner
        // Intended to hold DOM content while unmounted
        this._container = document.createElement("div")
    }

    private _prepareContainer(title: string): HTMLFormElement {
        this._owner.dom.unmount()

        this._owner.dom.container.classList.remove("dataflow-table-wrapper")
        this._owner.dom.container.classList.add("dataflow-form-wrapper")

        const header = document.createElement("div")
        header.classList.add("dataflow-form-header")
        const exitButton = document.createElement("a")
        exitButton.textContent = "Go back"
        exitButton.href = "javascript:void(0)"
        exitButton.addEventListener("click", () => { this.finish() })
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

    private _newField(column: TableColumn): HTMLDivElement {
        const field = document.createElement("div")
        const label = document.createElement("label")
        label.textContent = column.title ??
                            column.name.charAt(0).toUpperCase() +
                            column.name.slice(1)
        if (column.type === "hidden") field.style.display = "none";
        let input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

        switch (column.type) {
        case "select":
            input = document.createElement("select")
            const choices = isSelectDependency(column.choices) ?
                            this._owner.resolveDependency(column.choices) :
                            column.choices
            for (const entry of choices) {
                const option = document.createElement("option")
                option.textContent = entry
                option.value = entry
                input.appendChild(option)
            }
            break
        case "textarea":
            input = document.createElement("textarea")
            break
        default:
            input = document.createElement("input")
            input.type = column.type
        }

        input.name = column.name
        input.required = column.required ?? false
        if (column.props != null) {
            for (const [prop, value] of Object.entries(column.props)) {
                input.setAttribute(prop, value)
            }
        }
        field.appendChild(label)
        field.appendChild(input)
        field.classList.add("dataflow-form-field")
        return field
    }

    private _applyFilledInputs(container: HTMLFormElement, row: Row): void {
        for (const col of this._owner.config.columns) {
            const field = this._newField(col)
            const input = field.children.item(1) as HTMLInputElement
            // TODO: handle missing field case
            let data: string
            if (col.preprocess != null) {
                data = col.preprocess(row[input.name as keyof Row])
            } else (
                data = row[input.name as keyof Row] + ""
            )
            input.value = data
            container.appendChild(field)
        }
    }

    private _applyFilledHiddenInputs(container: HTMLFormElement, row: Row): void {
        container.appendChild(document.createTextNode(
            "Are you sure you want to perform this action?"
        ))
        for (const col of this._owner.config.columns) {
            const input = document.createElement("input")
            input.name = col.name
            // TODO: handle missing field case
            input.value = row[input.name as keyof Row] + ""
            input.type = "hidden"
            container.appendChild(input)
        }
    }

    private _applyEmptyInputs(container: HTMLFormElement): void {
        for (const col of this._owner.config.columns) {
            const field = this._newField(col)
            container.appendChild(field)
        }
    }

    private _createButtons(): HTMLDivElement {
        const footer = document.createElement("div")
        footer.classList.add("dataflow-form-footer")

        const buttonCancel = document.createElement("button")
        buttonCancel.textContent = "Cancel"
        buttonCancel.type = "button"
        buttonCancel.addEventListener("click", () => { this.finish() })

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
        contentContainer.addEventListener("submit", async (e: SubmitEvent) => {
            e.preventDefault()
            await action.callback(new FormData(contentContainer), this._owner)
            this.finish()
        })
        this._active = true
        this._visible = true
    }

    finish(): void {
        while (this._owner.dom.container.lastElementChild) {
            this._owner.dom.container.removeChild(this._owner.dom.container.lastElementChild)
        }
        this._owner.dom.container.classList.remove("dataflow-form-wrapper")
        this._owner.dom.container.classList.add("dataflow-table-wrapper")
        this._owner.dom.mount()
        this._active = false
        this._visible = false
    }

    unmount(): void {
        this._container.append(...this._owner.dom.container.children)
        this._owner.dom.container.classList.remove("dataflow-form-wrapper")
        this._owner.dom.container.classList.add("dataflow-table-wrapper")
        this._visible = false
    }

    mount(): void {
        if (!this._active) throw Error("Cannot mount non-existing form. Apply action first");
        this._owner.dom.container.append(...this._container.children)
        this._owner.dom.container.classList.remove("dataflow-table-wrapper")
        this._owner.dom.container.classList.add("dataflow-form-wrapper")
        this._visible = true
    }

    get active(): boolean {
        return this._active
    }

    get visible(): boolean {
        return this._visible
    }
}
