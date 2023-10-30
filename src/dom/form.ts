import { Table } from "../dataflow";
import { Action } from "../types/actions";

export class FormManager<Row> {
    private _owner: Table<Row>

    constructor(owner: Table<Row>) {
        this._owner = owner
    }

    private _prepareContainer(): void {
        this._owner.dom.container.classList.remove("dataflow-table-wrapper")
        this._owner.dom.container.classList.add("dataflow-form-wrapper")
    }

    private _applyFilledInputs(): void {
        for (const col of this._owner.config.columns) {
            const field = document.createElement("div")
            const label = document.createElement("label")
            label.textContent = col.title ??
                                col.column.charAt(0).toUpperCase() +
                                col.column.slice(1)
            const input = document.createElement("input")
            field.appendChild(label)
            field.appendChild(input)
            this._owner.dom.container.appendChild(field)
        }
    }

    private _applyBlank(): void {
        this._owner.dom.container.textContent = "bruh"
    }

    apply(action: Action<Row>): void {
        this._prepareContainer()
        if (action.showColumns) {
            this._applyFilledInputs()
        } else {
            this._applyBlank()
        }
    }
}
