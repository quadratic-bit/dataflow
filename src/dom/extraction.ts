export function getString(data: FormData, name: string): string | null {
    return data.get(name) as string | null
}

export function getInt(data: FormData, name: string): number {
    return Number.parseInt(data.get(name) as string)
}

export function getOptions(data: FormData, name: string): string[] {
    return Array.from(data.getAll(name + "[]")) as string[]
}

export function getTimestamp(data: FormData, name: string): number {
    return Date.parse(data.get(name) as string) / 1000
}

export function getTimestampFromTime(data: FormData, name: string): number {
    const formatted = `01 Jan 1970 ${data.get(name)}:00`
    return Date.parse(formatted) / 1000
}
