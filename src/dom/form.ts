import { Table } from "core/table";
import { FormSelector, createField } from "core/fields";
import { LocaleForm } from "core/locale";
import { ActionCallback, ActionEmptyConfig, ActionFilledConfig } from "core/actions";
import { Nullable } from "types/columns";

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
        header.appendChild(document.createTextNode(`${this._owner.title} / ${title}`))
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
        for (const col of this._owner.columns) {
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

    private _createFooter(container: HTMLFormElement, callback: ActionCallback<Row>): void {
        const footer = this._createButtons()
        container.appendChild(footer)
        container.addEventListener("submit", async (e: SubmitEvent) => {
            e.preventDefault()
            let buttonSubmit = footer.querySelector("button[type=submit]") as HTMLButtonElement
            buttonSubmit.disabled = true;
            const response = await callback(new FormData(container), this._owner)
            if (response !== false) {
                this.finish()
            } else {
                buttonSubmit.disabled = false;
            }
        })
        this._active = true
        this._visible = true
    }

    async applyEmpty(label: string, callback: ActionCallback<Row>, rowValue?: Partial<Nullable<Row>>, config?: ActionEmptyConfig): Promise<void> {
        const contentContainer = this._prepareContainer(label)
        for (const col of this._owner.columns) {
            const field = createField(this._owner, col, rowValue)
            contentContainer.appendChild(field)
        }
        await this._spreadRelations(contentContainer)
        if (config?.preprocess != null) {
            await config.preprocess(new FormSelector(contentContainer, this._owner))
        }
        this._createFooter(contentContainer, callback)
    }

    async applyFilled(label: string, callback: ActionCallback<Row>, config?: ActionFilledConfig): Promise<void> {
        const contentContainer = this._prepareContainer(label)
        const row: Row | null = this._owner.selectedRow
        if (row == null) {
            throw Error(`Cannot perform action "${label}" with no column selected`)
        }
        for (const col of this._owner.columns) {
            if (config?.exclude?.includes(col.name)) continue;
            const field = createField(this._owner, col, row)
            contentContainer.appendChild(field)
        }
        await this._spreadRelations(contentContainer, false)
        if (config?.preprocess != null) {
            await config.preprocess(new FormSelector(contentContainer, this._owner))
        }
        this._createFooter(contentContainer, callback)
    }

    applyDialogue(label: string, callback: ActionCallback<Row>): void {
        const contentContainer = this._prepareContainer(label)
        const row: Row | null = this._owner.selectedRow
        if (row == null) {
            throw Error(`Cannot perform action "${label}" with no column selected`)
        }
        contentContainer.appendChild(document.createTextNode(this._locale.confirmation))
        for (const col of this._owner.columns) {
            const input = document.createElement("input")
            input.name = col.name
            // TODO: handle missing field case
            input.value = row[input.name as keyof Row] + ""
            input.type = "hidden"
            contentContainer.appendChild(input)
        }
        this._createFooter(contentContainer, callback)
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
