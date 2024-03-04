import { Table } from "core/table"
import { ConstSelectOption, Nullable, TableColumn } from "types/columns"

interface LabelledResult<Row> {
    value: Row[keyof Row]
    label: string
}

export function resolveDependency<Row>(table: Table<Row>,
                                       dependency: SelectDependency | ConstSelectOption[],
                                       query: any): string | null {
    if (Array.isArray(dependency)) {
        const result = dependency.find(opt => opt.value == query)
        return result == null ? null : result.label
    }

    const other = table.collection.find(dependency.table)
    if (other == null) throw Error(`Couldn't resolve dependency of ${dependency.table}`);

    other.subscribe(table.id)

    for (const row of other.data) {
        if (row[dependency.reference] === query) {
            return row[dependency.column]
        }
    }
    return null
}

export function resolveDependencyAll<Row>(table: Table<Row>,
                                          dependency: SelectDependency |
                                                      ConstSelectOption[]): LabelledResult<Row>[] {
    if (Array.isArray(dependency)) return dependency as LabelledResult<Row>[];

    const other = table.collection.find(dependency.table)
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
                                    rowValue?: Partial<Row>) {
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

export function createField<Row>(table: Table<Row>, column: TableColumn, rowValue?: Partial<Nullable<Row>>): HTMLDivElement {
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
        populateSelect(input, column, table, rowValue)
        break
    case "textarea":
        input = document.createElement("textarea")
        break
    case "checkbox":
        input = document.createElement("input")
        input.type = "checkbox"
        if (column.props != null && column.props.readonly) {
            input.setAttribute("onclick", "return false;")
        }
        break
    default:
        input = document.createElement("input")
        input.type = column.type
    }

    if (column.type === "select" && column.props && column.props.multiple) {
        input.name = column.name + "[]"
    } else {
        input.name = column.name
    }

    input.required = column.required ?? false
    if (column.props != null) {
        for (const [prop, value] of Object.entries(column.props)) {
            input.setAttribute(prop, value)
        }
    }

    if (rowValue != null && column.type !== "select") {
        let data = null
        if (column.preprocess != null && rowValue[column.name as keyof Row] != null) {
            // TODO: handle missing field case
            data = column.preprocess(rowValue[column.name as keyof Row])
        } else if (column.name in (rowValue as object)) {
            data = rowValue[column.name as keyof Row]
        }
        if (column.type === "checkbox" && data != null) {
            (input as HTMLInputElement).checked = !!data
        } else if (data != null) {
            input.value = data + ""
        }
    }

    if (rowValue == null || rowValue[column.name as keyof Row] == null) {
        let now: Date = new Date(Date.now())
        now = new Date(Date.now() - now.getTimezoneOffset() * 60000)
        if (column.type === "datetime-local" && column.now === true) {
            input.value = now.toISOString().split(".")[0]
        } else if (column.type === "time" && column.now === true) {
            input.value = now.toISOString().slice(11, 16)
        } else if (column.type === "date" && column.today === true) {
            input.value = now.toISOString().slice(0, 10)
        }
    }

    field.appendChild(label)
    field.appendChild(input)
    field.classList.add("dataflow-form-field")
    return field
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
        const col: TableColumn | undefined = this._owner.columns.find(
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

export function getString(data: FormData, name: string): string | null {
    return data.get(name) as string | null
}

export function getInt(data: FormData, name: string): number {
    return Number.parseInt(data.get(name) as string)
}

export function getOptions(data: FormData, name: string): string[] {
    return Array.from(data.getAll(name + "[]")) as string[]
}

export function getTimestamp(data: FormData, name: string): number {
    return Date.parse(data.get(name) as string) / 1000
}

export function getTimestampFromTime(data: FormData, name: string): number {
    const formatted = `01 Jan 1970 ${data.get(name)}:00`
    return Date.parse(formatted) / 1000
}
