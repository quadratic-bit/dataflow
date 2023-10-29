import { Table } from "./dataflow"
import { ActionTrayDOM } from "./dom/buttons"
import { Action } from "./types/actions"

export class ActionTray<Row> {
    private _dom: ActionTrayDOM
    private _owner: Table<Row>

    constructor(mount: HTMLDivElement, actions: Action<Row>[], table: Table<Row>) {
        this._dom = new ActionTrayDOM(mount, actions, this)
        this._owner = table
    }

    dispatch(action: Action<Row>): void {
        console.log(action)
        action.callback(this._owner)
    }

    get dom(): ActionTrayDOM {
        return this._dom
    }
}
