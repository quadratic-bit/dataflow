import { Table } from "./table"
import { TableColumn } from "types/columns"
import { createField } from "dom/fields"

interface LabelledResult<Row> {
    value: Row[keyof Row]
    label: string
}

export function resolveDependency<Row>(table: Table<Row>,
                                       dependency: SelectDependency,
                                       query: any): string | null {
    const other = table.config.collection.find(dependency.table)
    if (other == null) throw Error(`Couldn't resolve dependency of ${dependency.table}`);

    other.subscribe(table.config.id)

    for (const row of other.data) {
        if (row[dependency.reference] === query) {
            return row[dependency.column]
        }
    }
    return null
}

export function resolveDependencyAll<Row>(table: Table<Row>,
                                             dependency: SelectDependency): LabelledResult<Row>[] {
    const other = table.config.collection.find(dependency.table)
    if (other == null) throw Error(`Couldn't resolve dependency of ${dependency.table}`);

    return other.data.map((r: any) => {
        return { value: r[dependency.reference], label: r[dependency.column] }
    })
}

export interface SelectDependency {
    table: string
    column: string
    reference: string
}

export function createDependency(tableID: string, columnName: string, referenceName: string): SelectDependency {
    return { table: tableID, column: columnName, reference: referenceName }
}

export function populateSelect<Row>(element: HTMLSelectElement,
                                    column: TableColumn,
                                    table: Table<Row>,
                                    rowValue?: Row) {
    if (column.type !== "select") throw Error("Cannot populate non-select field");
    const choices = resolveDependencyAll(table, column.choices)
    let chosen: string | null = null
    if (rowValue != null) {
        const tmp = rowValue[column.name as keyof Row]
        chosen = resolveDependency(table, column.choices, tmp)
    }
    for (const entry of choices) {
        const option = document.createElement("option")
        option.textContent = entry.label
        option.value = entry.value + ""
        if (chosen == entry.label) {
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

    insert(name: string, column: TableColumn, value?: any): void {
        let field: HTMLDivElement;
        if (value == null) {
            field = createField(this._owner, column)
        } else {
            let row: any = {}
            row[column.name] = value
            field = createField(this._owner, column, row)
        }
        const target = this.select(name).parentElement!
        target.after(field)
    }

    remove(name: string): void {
        const target = this.select(name)
        target.parentElement!.parentElement!.removeChild(target.parentElement!)
    }

    has(name: string): boolean {
        let result = this.dom.querySelector(`[name="${name}"]`)
        return result != null
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
