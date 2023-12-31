import { Table } from "common/table";
import { Action } from "types/actions";
import { FormSelector, createField } from "common/fields";
import { LocaleForm } from "common/locale";

export class FormManager<Row> {
    private _owner: Table<Row>
    private _container: HTMLDivElement
    private _visible: boolean = false
    private _active: boolean = false
    private _locale: LocaleForm

    constructor(owner: Table<Row>, locale: LocaleForm) {
        this._owner = owner
        this._locale = locale
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
        exitButton.textContent = this._locale.goBack
        exitButton.href = "javascript:void(0)"
        exitButton.addEventListener("click", () => { this.finish() })
        header.appendChild(document.createTextNode(`${this._owner.config.title} / ${title}`))
        header.appendChild(exitButton)

        const wrapper = document.createElement("div")
        wrapper.classList.add("dataflow-form-msg-wrapper")
        const body = document.createElement("div")
        body.classList.add("dataflow-form-body")
        const content = document.createElement("form")
        content.classList.add("dataflow-form-content")
        body.appendChild(wrapper)
        wrapper.appendChild(content)

        this._owner.dom.container.appendChild(header)
        this._owner.dom.container.appendChild(body)

        return content
    }

    private async _spreadRelations(container: HTMLFormElement, apply: boolean = true): Promise<void> {
        for (const col of this._owner.config.columns) {
            if (col.relies == null) continue;
            const source = container.querySelector(`[name="${col.relies.source}"]`) as HTMLInputElement
            const dest = container.querySelector(`[name="${col.name}"]`) as HTMLInputElement
            source.addEventListener("change", async _ => {
                dest.value = await col.relies?.callback(source.value) as string
                dest.dispatchEvent(new Event("change"))
            })
            if (apply) dest.value = await col.relies.callback(source.value) as string;
        }
    }

    private async _applyFilledInputs(container: HTMLFormElement, row: Row, action: Action<Row>): Promise<void> {
        for (const col of this._owner.config.columns) {
            if (action.exclude != null && action.exclude.includes(col.name)) continue;
            const field = createField(this._owner, col, row)
            container.appendChild(field)
        }
        await this._spreadRelations(container, false)
        if (action.preprocess) {
            await action.preprocess(new FormSelector(container, this._owner))
        }
    }

    private _applyFilledHiddenInputs(container: HTMLFormElement, row: Row): void {
        container.appendChild(document.createTextNode(this._locale.confirmation))
        for (const col of this._owner.config.columns) {
            const input = document.createElement("input")
            input.name = col.name
            // TODO: handle missing field case
            input.value = row[input.name as keyof Row] + ""
            input.type = "hidden"
            container.appendChild(input)
        }
    }

    private async _applyEmptyInputs(container: HTMLFormElement, action: Action<Row>, rowValue?: Partial<Row>): Promise<void> {
        for (const col of this._owner.config.columns) {
            const field = createField(this._owner, col, rowValue)
            container.appendChild(field)
        }
        await this._spreadRelations(container)
        if (action.preprocess) {
            await action.preprocess(new FormSelector(container, this._owner))
        }
    }

    private _createButtons(): HTMLDivElement {
        const footer = document.createElement("div")
        footer.classList.add("dataflow-form-footer")

        const buttonCancel = document.createElement("button")
        buttonCancel.textContent = this._locale.buttonCancel
        buttonCancel.type = "button"
        buttonCancel.addEventListener("click", () => { this.finish() })

        const buttonSubmit = document.createElement("button")
        buttonSubmit.textContent = this._locale.buttonSubmit
        buttonSubmit.type = "submit"

        footer.appendChild(buttonCancel)
        footer.appendChild(buttonSubmit)
        return footer
    }

    apply(action: Action<Row>, rowValue?: Partial<Row>): void {
        const contentContainer = this._prepareContainer(action.label)
        if (action.showColumns) {
            if (action.fillColumns) {
                const row: Row | null = this._owner.selectedRow
                if (row == null) {
                    throw Error(`Cannot perform action "${action.label}" with no column selected`)
                }
                this._applyFilledInputs(contentContainer, row, action)
            } else {
                this._applyEmptyInputs(contentContainer, action, rowValue)
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
            const response = await action.callback(new FormData(contentContainer), this._owner)
            if (response !== false) {
                this.finish()
            }
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
