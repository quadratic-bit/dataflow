export interface SelectDependency {
    table: string
    column: string
    reference: string
}

export function isSelectDependency(obj: any): obj is SelectDependency {
    return "table" in obj && "column" in obj && "reference" in obj
}

export function createDependency(tableID: string, columnName: string, referenceName: string): SelectDependency {
    return { table: tableID, column: columnName, reference: referenceName }
}
