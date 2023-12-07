import { SelectDependency } from "common/subscription"

interface BaseInputProps {
    readonly?: boolean
}

interface HiddenInputProps extends BaseInputProps {}

interface TextInputProps extends BaseInputProps {
    maxlength?: number
    minlength?: number
    pattern?: number
    placeholder?: string
    readonly?: boolean
    size?: string
    spellcheck?: boolean
}

interface TextAreaProps extends BaseInputProps {
    autocomplete?: boolean
    autocorrect?: boolean
    cols?: number
    maxlength?: number
    minlength?: number
    placeholder?: string
    readonly?: boolean
    rows?: number
    spellcheck?: boolean
    wrap?: "hard" | "soft" | "off"
}


interface EmailInputProps extends BaseInputProps {
    maxlength?: number
    minlength?: number
    multiple?: boolean
    pattern?: number
    placeholder?: string
    readonly?: boolean
    size?: string
}

interface TelInputProps extends TextInputProps {}

interface NumberInputProps extends BaseInputProps {
    max?: number
    min?: number
    placeholder?: string
    step?: number
}

interface CheckboxInputProps extends BaseInputProps {}

interface DateTimeInputProps extends BaseInputProps {
    max?: string
    min?: string
    step?: number
}

interface DateInputProps extends DateTimeInputProps {}

interface SelectProps extends BaseInputProps {}
interface TimeInputProps extends DateTimeInputProps {}

interface BaseTableColumn {
    type: string
    name: string
    title?: string
    hide?: boolean
    required?: boolean
    relies?: {
        callback(value: unknown): Promise<string>,
        source: string,
    }
    render?(value: unknown): string
    preprocess?(value: unknown): string
    overflow?: boolean
}

export interface HiddenTableColumn extends BaseTableColumn {
    type: "hidden"
    props?: HiddenInputProps
}

export interface TextTableColumn extends BaseTableColumn {
    type: "text"
    props?: TextInputProps
}

export interface TextAreaTableColumn extends BaseTableColumn {
    type: "textarea"
    props?: TextAreaProps
}

export interface EmailTableColumn extends BaseTableColumn {
    type: "email"
    props?: EmailInputProps
}

export interface TelTableColumn extends BaseTableColumn {
    type: "tel"
    props?: TelInputProps
}

export interface NumberTableColumn extends BaseTableColumn {
    type: "number"
    props?: NumberInputProps
}

export interface CheckboxTableColumns extends BaseTableColumn {
    type: "checkbox"
    props?: CheckboxInputProps
}

export interface DateTableColumn extends BaseTableColumn {
    type: "date"
    today?: boolean
    props?: DateInputProps
}

export interface DateTimeTableColumn extends BaseTableColumn {
    type: "datetime-local"
    now?: boolean
    props?: DateTimeInputProps
}

export interface TimeTableColumn extends BaseTableColumn {
    type: "time"
    now?: boolean
    props?: TimeInputProps
}

export interface SelectTableColumn extends BaseTableColumn {
    type: "select"
    choices: SelectDependency
    filterable?: boolean
    props?: SelectProps
}

export type TableColumn = HiddenTableColumn |
                          TextTableColumn |
                          TextAreaTableColumn |
                          EmailTableColumn |
                          TelTableColumn |
                          NumberTableColumn |
                          CheckboxTableColumns |
                          DateTimeTableColumn |
                          DateTableColumn |
                          TimeTableColumn |
                          SelectTableColumn |
