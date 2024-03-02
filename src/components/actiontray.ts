import { Table } from "core/table"
import { ActionHook, Action } from "core/actions"

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
