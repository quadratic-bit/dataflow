interface TextInputProps {
    maxlength?: number
    minlength?: number
    pattern?: number
    placeholder?: string
    readonly?: boolean
    size?: string
    spellcheck?: boolean
}

interface EmailInputProps {
    maxlength?: number
    minlength?: number
    multiple?: boolean
    pattern?: number
    placeholder?: string
    readonly?: boolean
    size?: string
}

interface TelInputProps extends TextInputProps {}

interface NumberInputProps {
    max?: number
    min?: number
    placeholder?: string
    step?: number
}

interface DateInputProps {
    max?: string
    min?: string
    step?: number
}

interface DateTimeInputProps extends DateInputProps {}

interface SelectProps {}

interface BaseTableColumn {
    type: string
    name: string
    title?: string
    required?: boolean
}

interface TextTableColumn extends BaseTableColumn {
    type: "text"
    props?: TextInputProps
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
    props?: DateTimeInputProps
}

export function isSelectDependency(obj: any): obj is SelectDependency {
    return "table" in obj && "column" in obj
}

export function createDependency(tableID: string, columnName: string): SelectDependency {
    return { table: tableID, column: columnName }
}

export interface SelectDependency {
    table: string
    column: string
}

interface SelectTableColumn extends BaseTableColumn {
    type: "select"
    choices: string[] | SelectDependency
    props?: SelectProps
}

export type TableColumn = TextTableColumn |
                          EmailTableColumn |
                          TelTableColumn |
                          NumberTableColumn |
                          DateTableColumn |
                          DateTimeTableColumn |
                          SelectTableColumn
