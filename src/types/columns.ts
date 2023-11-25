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

interface DateInputProps extends BaseInputProps {
    max?: string
    min?: string
    step?: number
}

interface DateTimeInputProps extends DateInputProps {}

interface SelectProps extends BaseInputProps {}

interface BaseTableColumn {
    type: string
    name: string
    title?: string
    required?: boolean
    relies?: {
        callback(value: unknown): Promise<string>,
        source: string,
    }
    render?(value: unknown): string
    preprocess?(value: unknown): string
    overflow?: boolean
}

interface HiddenTableColumn extends BaseTableColumn {
    type: "hidden"
    props?: HiddenInputProps
}

interface TextTableColumn extends BaseTableColumn {
    type: "text"
    props?: TextInputProps
}

interface TextAreaTableColumn extends BaseTableColumn {
    type: "textarea"
    props?: TextAreaProps
}

interface EmailTableColumn extends BaseTableColumn {
    type: "email"
    props?: EmailInputProps
}

interface TelTableColumn extends BaseTableColumn {
    type: "tel"
    props?: TelInputProps
}

interface NumberTableColumn extends BaseTableColumn {
    type: "number"
    props?: NumberInputProps
}

interface DateTableColumn extends BaseTableColumn {
    type: "date"
    props?: DateInputProps
}

interface DateTimeTableColumn extends BaseTableColumn {
    type: "datetime-local"
    now?: boolean
    props?: DateTimeInputProps
}

interface SelectTableColumn extends BaseTableColumn {
    type: "select"
    choices: string[] | SelectDependency
    props?: SelectProps
}

export type TableColumn = HiddenTableColumn |
                          TextTableColumn |
                          TextAreaTableColumn |
                          EmailTableColumn |
                          TelTableColumn |
                          NumberTableColumn |
                          DateTableColumn |
                          DateTimeTableColumn |
                          SelectTableColumn
