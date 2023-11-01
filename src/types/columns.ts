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

export type TableColumn = TextTableColumn | NumberTableColumn
