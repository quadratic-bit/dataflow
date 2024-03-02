export interface LocaleStatus {
    idle: string
    showRange: string
    showEmpty: string
}

export interface LocalePagination {
    size: string
    all: string
}

export interface LocaleActions {
    add: string
    edit: string
    delete: string
}

export interface LocaleForm {
    goBack: string
    confirmation: string
    buttonSubmit: string
    buttonCancel: string
}

export interface LocaleFrame {
    empty: string
}

export interface PartialLocale {
    status: Partial<LocaleStatus>
    pagination: Partial<LocalePagination>
    actions: Partial<LocaleActions>
    form: Partial<LocaleForm>
    frame: Partial<LocaleFrame>
}

export interface Locale {
    status: LocaleStatus
    pagination: LocalePagination
    actions: LocaleActions
    form: LocaleForm
    frame: LocaleFrame
}

export const LOCALE_DEFAULT: Locale = {
    status: {
        idle: "Click on a row to select it",
        showRange: "Showing _START_ to _END_ of _TOTAL_ entries",
        showEmpty: "No entries available"
    },
    pagination: {
        size: "Show _TOTAL_ entries",
        all: "All"
    },
    actions: {
        add: "Add",
        edit: "Edit",
        delete: "Delete"
    },
    form: {
        goBack: "Go back",
        confirmation: "Are you sure you want to perform this action?",
        buttonSubmit: "Submit",
        buttonCancel: "Cancel"
    },
    frame: {
        empty: "Looks like there's nothing here"
    }
}

export class Localization {
    private _locale: Locale

    constructor(locale?: Partial<PartialLocale>) {
        this._locale = {
            status: {
                idle: locale?.status?.idle ?? LOCALE_DEFAULT.status.idle,
                showRange: locale?.status?.showRange ?? LOCALE_DEFAULT.status.showRange,
                showEmpty: locale?.status?.showEmpty ?? LOCALE_DEFAULT.status.showEmpty
            },
            pagination: {
                size: locale?.pagination?.size ?? LOCALE_DEFAULT.pagination.size,
                all: locale?.pagination?.all ?? LOCALE_DEFAULT.pagination.all
            },
            actions: {
                add: locale?.actions?.add ?? LOCALE_DEFAULT.actions.add,
                edit: locale?.actions?.edit ?? LOCALE_DEFAULT.actions.edit,
                delete: locale?.actions?.delete ?? LOCALE_DEFAULT.actions.delete
            },
            form: {
                goBack: locale?.form?.goBack ?? LOCALE_DEFAULT.form.goBack,
                confirmation: locale?.form?.confirmation ?? LOCALE_DEFAULT.form.confirmation,
                buttonCancel: locale?.form?.buttonCancel ?? LOCALE_DEFAULT.form.buttonCancel,
                buttonSubmit: locale?.form?.buttonSubmit ?? LOCALE_DEFAULT.form.buttonSubmit
            },
            frame: {
                empty: locale?.frame?.empty ?? LOCALE_DEFAULT.frame.empty
            }
        }
    }

    get status(): LocaleStatus {
        return this._locale.status
    }

    get pagination(): LocalePagination {
        return this._locale.pagination
    }

    get actions(): LocaleActions {
        return this._locale.actions
    }

    get form(): LocaleForm {
        return this._locale.form
    }

    get frame(): LocaleFrame {
        return this._locale.frame
    }
}
