import type { Table } from "core/table"
import { LOCALE_DEFAULT } from "./locale"

export enum ActionHook {
    Always,
    OnSelect,
    Never
}

export type ActionCallback<Row> = (data: FormData, table: Table<Row>) => Promise<void | boolean>
export enum ActionType {
    Add,
    Edit,
    Delete,
    Custom
}

export interface Action<Row> {
    type: ActionType
    label: string
    act(table: Table<Row>): void
    callback: ActionCallback<Row>
    hook: ActionHook
}

export function actionAdd<Row>(callback: ActionCallback<Row>, label?: string): Action<Row> {
    return {
        type: ActionType.Add,
        label: label ?? LOCALE_DEFAULT.actions.add,
        hook: ActionHook.Always,
        callback,
        act: function (table: Table<Row>) { table.formManager.applyEmpty(this) }
    }
}

export function actionEdit<Row>(callback: ActionCallback<Row>, label?: string): Action<Row> {
    return {
        type: ActionType.Edit,
        label: label ?? LOCALE_DEFAULT.actions.edit,
        hook: ActionHook.OnSelect,
        callback,
        act: function (table: Table<Row>) { table.formManager.applyFilled(this) }
    }
}

export function actionDelete<Row>(callback: ActionCallback<Row>, label?: string): Action<Row> {
    return {
        type: ActionType.Delete,
        label: label ?? LOCALE_DEFAULT.actions.delete,
        hook: ActionHook.OnSelect,
        callback,
        act: function (table: Table<Row>) { table.formManager.applyDialogue(this) }
    }
}

/*
export interface ButtonLink<Row> {
    label: string
    target: string
    action: string
    dataMap: any
    activateOnSelect: true
    callback?(): void
    predicate?(table: Table<Row>): boolean
}
*/
