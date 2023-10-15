interface BaseTableColumn {
    name: string
    title?: string
    type: "text" | "textarea" | "number" | "select" | "time"
    required?: boolean
    readonly?: boolean
    hidden?: boolean
}

interface TextTableColumn extends BaseTableColumn {
    type: "text" | "textarea"
    maxlength?: number
    minlength?: number
    pattern?: string
    validation?: "email"
}

interface TextAreaTableColumn extends TextTableColumn {
    type: "textarea"
    rows?: number
    cols?: number
}

interface NumberTableColumn extends BaseTableColumn {
    type: "number"
    max?: number
    min?: number
    step?: number
}

export type TableColumn = TextTableColumn | TextAreaTableColumn | NumberTableColumn

export type TableCell = string | number
