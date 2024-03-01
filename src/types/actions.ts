import type { Table } from "core/table"
import type { FormSelector } from "core/fields"

export enum ActionHook {
    Always,
    OnSelect,
    Never
}

export interface Action<Row> {
    label: string
    act(table: Table<Row>): void
    callback(data: FormData, table: Table<Row>): Promise<void | boolean>
    hook: ActionHook
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

export type ActionCallback<Row> = (data: FormData, table: Table<Row>) => Promise<void | boolean>
export interface ActionConfig {
    preprocess?(selector: FormSelector): Promise<void>
    exclude?: string[]
}
