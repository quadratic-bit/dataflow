import type { Table } from "core/table"
import { LOCALE_DEFAULT } from "./locale"
import { FormSelector } from "./fields"
import { Nullable } from "types/columns"

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
    Link,
    Custom
}

export interface Action<Row> {
    type: ActionType
    label: string
    act(table: Table<Row>, rowData?: Partial<Nullable<Row>>): void
    hook: ActionHook
}

export interface ActionEmptyConfig {
    preprocess?(selector: FormSelector): Promise<void>
}

// TODO: allow custom label
export function actionAdd<Row>(callback: ActionCallback<Row>, config?: ActionEmptyConfig): Action<Row> {
    return {
        type: ActionType.Add,
        label: LOCALE_DEFAULT.actions.add,
        hook: ActionHook.Always,
        act: function (table: Table<Row>, rowData?: Partial<Nullable<Row>>) {
            table.formManager.applyEmpty(this.label, callback, rowData, config)
        }
    }
}

export interface ActionFilledConfig {
    preprocess?(selector: FormSelector): Promise<void>
    exclude?: string[]
}

export function actionEdit<Row>(callback: ActionCallback<Row>, config?: ActionFilledConfig): Action<Row> {
    return {
        type: ActionType.Edit,
        label: LOCALE_DEFAULT.actions.edit,
        hook: ActionHook.OnSelect,
        act: function (table: Table<Row>) {
            table.formManager.applyFilled(this.label, callback, config)
        }
    }
}

export function actionDelete<Row>(callback: ActionCallback<Row>): Action<Row> {
    return {
        type: ActionType.Delete,
        label: LOCALE_DEFAULT.actions.delete,
        hook: ActionHook.OnSelect,
        act: function (table: Table<Row>) {
            table.formManager.applyDialogue(this.label, callback)
        }
    }
}

interface ActionLinkConfig<TargetRow> {
    label: string
    targetId: string
    actionIndex: number
    dataMap: any
    callback?: (table: Table<TargetRow>) => void
}

export function actionLink<Row, TargetRow>(config: ActionLinkConfig<TargetRow>): Action<Row> {
    return {
        type: ActionType.Link,
        hook: ActionHook.OnSelect,
        label: config.label,
        act: function (table: Table<Row>) {
            let target: Table<TargetRow> = table.collection.swap(config.targetId)!
            const selectedRow = table.selectedRow!

            const rowValue: Partial<Nullable<TargetRow>> = {}
            // TODO: deal with null values
            for (const [name, field] of Object.entries(config.dataMap)) {
                rowValue[name as keyof TargetRow] =
                    field == null ?
                    null :
                    selectedRow[field as keyof Row] as unknown as TargetRow[keyof TargetRow]
            }
            target.actions[config.actionIndex].act(target, rowValue)
            if (config.callback != null) config.callback(target);
        }
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
