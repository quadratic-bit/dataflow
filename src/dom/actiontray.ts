import { Table } from "common/table"
import { ActionTray } from "components/actiontray"
import { Action, ButtonLink } from "types/actions"

export class ActionTrayDOM {
    private _container: HTMLDivElement
    private _buttons: (Action<any> | ButtonLink<any>)[]

    constructor(actions: (Action<any> | ButtonLink<any>)[], owner: ActionTray<any>) {
        const container = document.createElement("div")
        container.classList.add("dataflow-table-actiontray")
        for (const action of actions) {
            const button: HTMLButtonElement = document.createElement("button")
            button.textContent = action.label
            if (!("showColumns" in action)) {
                button.addEventListener("click", (_: MouseEvent) => owner.link(action))
                button.disabled = true;
            } else {
                button.addEventListener("click", (_: MouseEvent) => owner.dispatch(action))
                if (action.activateOnSelect) button.disabled = true;
            }
            container.appendChild(button)
        }
        this._container = container
        this._buttons = actions
    }

    enableConditionalButtons(table: Table<any>): void {
        for (let i = 0; i < this._buttons.length; ++i) {
            if (this._buttons[i].activateOnSelect) {
                if (this._buttons[i].predicate != null && this._buttons[i].predicate!(table)) {
                    (this._container.children.item(i) as HTMLButtonElement).disabled = true
                    continue
                }
                (this._container.children.item(i) as HTMLButtonElement).disabled = false
            }
        }
    }

    disableConditionalButtons(): void {
        for (let i = 0; i < this._buttons.length; ++i) {
            if (this._buttons[i].activateOnSelect) {
                (this._container.children.item(i) as HTMLButtonElement).disabled = true
            }
        }
    }

    get container(): HTMLDivElement {
        return this._container
    }
}
