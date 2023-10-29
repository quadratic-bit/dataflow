import { ActionTray } from "../actionset"
import { Action } from "../types/actions"

export class ActionTrayDOM {
    private _container: HTMLDivElement
    private _actions: Action<any>[]

    constructor(actions: Action<any>[], owner: ActionTray<any>) {
        const container = document.createElement("div")
        container.classList.add("dataflow-table-actiontray")
        for (const action of actions) {
            const button: HTMLButtonElement = document.createElement("button")
            button.textContent = action.label
            button.addEventListener("click", (_: MouseEvent) => owner.dispatch(action))
            if (action.activateOnSelect) button.disabled = true;
            container.appendChild(button)
        }
        this._container = container
        this._actions = actions
    }

    enableConditionalButtons(): void {
        for (let i = 0; i < this._actions.length; ++i) {
            if (this._actions[i].activateOnSelect) {
                (this._container.children.item(i) as HTMLButtonElement).disabled = false
            }
        }
    }

    disableConditionalButtons(): void {
        for (let i = 0; i < this._actions.length; ++i) {
            if (this._actions[i].activateOnSelect) {
                (this._container.children.item(i) as HTMLButtonElement).disabled = true
            }
        }
    }

    get container(): HTMLDivElement {
        return this._container
    }
}
