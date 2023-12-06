export function getString(data: FormData, name: string): string | null {
    return data.get(name) as string | null
}

export function getInt(data: FormData, name: string): number {
    return Number.parseInt(data.get(name) as string)
}

export function getTimestamp(data: FormData, name: string): number {
    return Math.round(Date.parse(data.get(name) as string) / 1000)
}
