import { Table } from "common/table"
import { ActionTrayDOM } from "dom/actiontray"
import { Action, ButtonLink } from "types/actions"

export class ActionTray<Row> {
    private _dom: ActionTrayDOM
    private _owner: Table<Row>

    constructor(actions: (Action<Row> | ButtonLink<Row>)[], table: Table<Row>) {
        this._dom = new ActionTrayDOM(actions, this)
        this._owner = table
    }

    triggerRowSelect(): void {
        this._dom.enableConditionalButtons(this._owner)
    }

    triggerRowDeselect(): void {
        this._dom.disableConditionalButtons()
    }

    dispatch(action: Action<Row>): void {
        this._owner.setContext(action)
    }

    // Dangerous thing, need to reimagine
    link(anchor: ButtonLink<Row>): void {
        this._owner.config.collection.swap(anchor.target)
        if (anchor.callback != null) anchor.callback();
        // Could've optimized that
        const target = this._owner.config.collection.find(anchor.target)!
        const action = target.config.actions.find((ac) => ac.label == anchor.action &&
                                                          "showColumns" in ac)
        if (action == null) throw Error("Failed to find an action from a link");
        const rowValue: any = {}
        const selectedRow = this._owner.selectedRow!
        for (const [name, field] of Object.entries(anchor.dataMap)) {
            rowValue[name] = field == null ? null : selectedRow[field as keyof Row]
        }
        target.setContext(action as Action<Row>, rowValue)
    }

    get dom(): HTMLDivElement {
        return this._dom.container
    }
}
