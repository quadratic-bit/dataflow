import { Table } from "core/table"
import { ActionHook, Action } from "types/actions"

export class ActionTray<Row> {
    private _dom: ActionTrayDOM
    private _owner: Table<Row>

    constructor(actions: Action<Row>[], table: Table<Row>) {
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
        action.act(this._owner)
    }

    /*
    // Dangerous thing, need to reimagine
    link(anchor: ButtonLink<Row>): void {
        this._owner.collection.swap(anchor.target)
        if (anchor.callback != null) anchor.callback();
        // Could've optimized that
        const target = this._owner.collection.find(anchor.target)!
        const action = target.actions.find((ac) => ac.label == anchor.action &&
                                                          "showColumns" in ac)
        if (action == null) throw Error("Failed to find an action from a link");
        const rowValue: any = {}
        const selectedRow = this._owner.selectedRow!
        for (const [name, field] of Object.entries(anchor.dataMap)) {
            rowValue[name] = field == null ? null : selectedRow[field as keyof Row]
        }
        target.setContext(action as Action<Row>, rowValue)
    }
    */

    get dom(): HTMLDivElement {
        return this._dom.container
    }
}

class ActionTrayDOM {
    private _container: HTMLDivElement
    private _buttons: Action<any>[]

    constructor(actions: Action<any>[], owner: ActionTray<any>) {
        const container = document.createElement("div")
        container.classList.add("dataflow-table-actiontray")
        for (const action of actions) {
            const button: HTMLButtonElement = document.createElement("button")
            button.textContent = action.label
            button.addEventListener("click", (_: MouseEvent) => owner.dispatch(action))
            if (action.hook == ActionHook.OnSelect || action.hook == ActionHook.Never)
                button.disabled = true;
            container.appendChild(button)
        }
        this._container = container
        this._buttons = actions
    }

    enableConditionalButtons(_: Table<any>): void {
        for (let i = 0; i < this._buttons.length; ++i) {
            if (this._buttons[i].hook == ActionHook.OnSelect) {
                // TODO: action predicates
                // if (this._buttons[i].predicate != null && this._buttons[i].predicate!(table)) {
                //     (this._container.children.item(i) as HTMLButtonElement).disabled = true
                //     continue
                // }
                (this._container.children.item(i) as HTMLButtonElement).disabled = false
            }
        }
    }

    disableConditionalButtons(): void {
        for (let i = 0; i < this._buttons.length; ++i) {
            if (this._buttons[i].hook == ActionHook.OnSelect) {
                (this._container.children.item(i) as HTMLButtonElement).disabled = true
            }
        }
    }

    get container(): HTMLDivElement {
        return this._container
    }
}
