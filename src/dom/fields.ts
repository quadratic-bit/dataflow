import { Table } from "common/dataflow";
import { TableColumn } from "types/columns";
import { populateSelect } from "common/subscription";

export function createField<Row>(table: Table<Row>, column: TableColumn, rowValue?: Row): HTMLDivElement {
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

    if (rowValue != null && column.type !== "select") {
        let data: any
        if (column.preprocess != null) {
            // TODO: handle missing field case
            data = column.preprocess(rowValue[column.name as keyof Row])
        } else (
            data = rowValue[column.name as keyof Row]
        )
        if (column.type === "checkbox") {
            (input as HTMLInputElement).checked = !!data
        } else {
            input.value = data
        }
    } else if (column.type === "datetime-local" && column.now) {
        if (column.now === true) {
            let now: Date = new Date(Date.now())
            now = new Date(Date.now() - now.getTimezoneOffset() * 60000)
            input.value = now.toISOString().split(".")[0]
        }
    }

    field.appendChild(label)
    field.appendChild(input)
    field.classList.add("dataflow-form-field")
    return field
}
