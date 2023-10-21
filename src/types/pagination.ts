interface PaginationSome {
    kind: "some"
    amount: number
}

interface PaginationAll {
    kind: "all"
}

export type PageLength = PaginationSome | PaginationAll

export function PagesSome(amount: number): PaginationSome {
    return { kind: "some", amount }
}

export const PagesAll: PaginationAll = { kind: "all" }
