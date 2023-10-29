import { ActionTray } from "../actionset"
import { Action } from "../types/actions"

export class ActionTrayDOM {
    private _container: HTMLDivElement

    constructor(mount: HTMLDivElement, actions: Action<any>[], owner: ActionTray<any>) {
        const container = document.createElement("div")
        container.classList.add("dataflow-table-actiontray")
        for (const action of actions) {
            const button: HTMLButtonElement = document.createElement("button")
            button.textContent = action.label
            button.addEventListener("click", (_: MouseEvent) => owner.dispatch(action))
            container.appendChild(button)
        }
        this._container = container
        mount.appendChild(this._container)
    }

    get container(): HTMLDivElement {
        return this._container
    }
}
