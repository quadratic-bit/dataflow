import type { Table } from "common/table"
import type { FormSelector } from "common/fields"

interface _BaseAction<Row> {
    callback(data: FormData, table: Table<Row>): Promise<void | boolean>
    label: string
    showColumns: boolean
    activateOnSelect: boolean
    exclude?: string[]
    // TODO: come up with a more clever name
    preprocess?(selector: FormSelector): Promise<void>
    predicate?(table: Table<Row>): boolean
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

export interface ButtonLink<Row> {
    label: string
    target: string
    action: string
    dataMap: any
    activateOnSelect: true
    callback?(): void
    predicate?(table: Table<Row>): boolean
}

export type Action<Row> = ActionNew<Row> | ActionEdit<Row> | ActionBlank<Row>

export type ActionCallback<Row> = (data: FormData, table: Table<Row>) => Promise<void | boolean>
export interface ActionConfig {
    preprocess?(selector: FormSelector): Promise<void>
    exclude?: string[]
}
