import { Table } from "common/dataflow"

interface _BaseAction<Row> {
    callback(data: FormData, table: Table<Row>): Promise<void | boolean>
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
