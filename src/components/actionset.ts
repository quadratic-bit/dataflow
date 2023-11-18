import { Table } from "common/dataflow"
import { ActionTrayDOM } from "dom/buttons"
import { Action } from "types/actions"

export class ActionTray<Row> {
    private _dom: ActionTrayDOM
    private _owner: Table<Row>

    constructor(actions: Action<Row>[], table: Table<Row>) {
        this._dom = new ActionTrayDOM(actions, this)
        this._owner = table
    }

    triggerRowSelect(): void {
        this._dom.enableConditionalButtons()
    }

    triggerRowDeselect(): void {
        this._dom.disableConditionalButtons()
    }

    dispatch(action: Action<Row>): void {
        this._owner.setContext(action)
    }

    get dom(): ActionTrayDOM {
        return this._dom
    }
}
