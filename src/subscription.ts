import { TableColumn } from "types/columns"
import { Table } from "./dataflow"

export interface SelectDependency {
    table: string
    column: string
    reference: string
}

export function isSelectDependency(obj: any): obj is SelectDependency {
    return "table" in obj && "column" in obj && "reference" in obj
}

export function createDependency(tableID: string, columnName: string, referenceName: string): SelectDependency {
    return { table: tableID, column: columnName, reference: referenceName }
}

export function populateSelect<Row>(element: HTMLSelectElement,
                                    column: TableColumn,
                                    table: Table<Row>,
                                    rowValue?: Row) {
    // TODO: isSelectDependency was a bad idea
    if (column.type !== "select") throw Error("Cannot repopulate non-select field");
    const choices = isSelectDependency(column.choices) ?
                    table.resolveSelectDependency(column.choices) :
                    column.choices
    let chosen: string | null = null
    if (rowValue != null) {
        const chosenRaw = rowValue[column.name as keyof Row]
        if (isSelectDependency(column.choices)) {
            chosen = table.resolveDependency(column.choices, chosenRaw)
        } else {
            chosen = chosenRaw + ""
        }
    }
    for (const entry of choices) {
        const option = document.createElement("option")
        option.textContent = typeof entry === "string" ? entry : entry.label
        option.value = typeof entry === "string" ? entry : entry.value + ""
        if (typeof entry === "string" ? chosen == entry : chosen == entry.label) {
            option.selected = true
        }
        element.appendChild(option)
    }

}

export class FormSelector {
    dom: HTMLFormElement
    private _owner: Table<any>
    private _messageBox: HTMLDivElement | null = null

    constructor(form: HTMLFormElement, table: Table<any>) {
        this.dom = form
        this._owner = table
    }

    private _createMessageBox(): HTMLDivElement {
        const box: HTMLDivElement = document.createElement("div")
        box.classList.add("dataflow-form-messagebox")
        this.dom.parentElement!.appendChild(box)
        return box
    }

    private _removeMessageBox() {
        if (this._messageBox != null) this.dom.parentElement!.removeChild(this._messageBox);
        this._messageBox = null
    }

    select(name: string): HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
        let result = this.dom.querySelector(`[name="${name}"]`)
        if (result == null) throw Error(`No field named ${name}`);
        return result as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    }

    repopulate(name: string): void {
        const col: TableColumn | undefined = this._owner.config.columns.find(
            (col: TableColumn) => col.name == name)
        if (col == null) throw Error("Cannot find column with such name");
        if (col.type !== "select") throw Error("Cannot repopulate non-select field");
        const select = this.select(name) as HTMLSelectElement
        while (select.lastElementChild) {
            select.removeChild(select.lastElementChild)
        }
        populateSelect(select, col, this._owner)
    }

    setMessage(...lines: string[]) {
        if (this._messageBox == null) {
            this._messageBox = this._createMessageBox()
        }
        while (this._messageBox.lastChild) {
            this._messageBox.removeChild(this._messageBox.lastChild)
        }
        for (const line of lines) {
            const paragraph = document.createElement("p")
            paragraph.textContent = line
            this._messageBox.appendChild(paragraph)
        }
    }

    clearMessage() {
        if (this._messageBox == null) return;
        while (this._messageBox.lastChild) {
            this._messageBox.removeChild(this._messageBox.lastChild)
        }
        this._removeMessageBox()
    }
}
