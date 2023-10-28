interface BaseTableColumn {
    column: string
    title?: string
    required?: boolean
    readonly?: boolean
    hidden?: boolean
}

interface TextTableColumn extends BaseTableColumn {
    maxlength?: number
    minlength?: number
    pattern?: string
    validation?: "email"
}

interface TextAreaTableColumn extends TextTableColumn {
    rows?: number
    cols?: number
}

interface NumberTableColumn extends BaseTableColumn {
    max?: number
    min?: number
    step?: number
}

export type TableColumn = TextTableColumn | TextAreaTableColumn | NumberTableColumn
