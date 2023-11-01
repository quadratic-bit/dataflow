import { Table } from "../dataflow"

interface _BaseAction<Row> {
    callback(data: FormData, table: Table<Row>): Promise<void>
    label: string
    showColumns: boolean
    activateOnSelect: boolean
}

interface _ActionShowColumns<Row> extends _BaseAction<Row> {
    showColumns: true
    fillColumns?: boolean
}

interface ActionNew<Row> extends _ActionShowColumns<Row> {
    activateOnSelect: false
    showColumns: true
    fillColumns: false
    hiddenColumns?: string[]
}

interface ActionEdit<Row> extends _ActionShowColumns<Row> {
    activateOnSelect: true
    showColumns: true
    fillColumns: true
    hidden?: string[]
}

interface ActionBlank<Row> extends _BaseAction<Row> {
    activateOnSelect: boolean
    showColumns: false
}

export type Action<Row> = ActionNew<Row> | ActionEdit<Row> | ActionBlank<Row>

export function actionAdd<Row>(callback: (data: FormData, table: Table<Row>) => Promise<void>): Action<Row> {
    return {
        label: "Add",
        showColumns: true,
        fillColumns: false,
        activateOnSelect: false,
        callback
    }
}

export function actionEdit<Row>(callback: (data: FormData, table: Table<Row>) => Promise<void>): Action<Row> {
    return {
        label: "Edit",
        showColumns: true,
        fillColumns: true,
        activateOnSelect: true,
        callback
    }
}

export function actionDelete<Row>(callback: (data: FormData, table: Table<Row>) => Promise<void>): Action<Row> {
    return {
        label: "Delete",
        showColumns: false,
        activateOnSelect: true,
        callback
    }
}
