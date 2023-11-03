interface TextInputProps {
    maxlength?: number
    minlength?: number
    pattern?: number
    placeholder?: string
    readonly?: boolean
    size?: string
    spellcheck?: boolean
}

interface NumberInputProps {
    max?: number
    min?: number
    placeholder?: string
    step?: number
}

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

interface NumberTableColumn extends BaseTableColumn {
    type: "number"
    props?: NumberInputProps
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

export type TableColumn = TextTableColumn | NumberTableColumn | SelectTableColumn
