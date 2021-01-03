export interface ICommonIO {
    input(description: string): Promise<string>
    select<T>(choices: { label: string, description?: string, data: T }[]): Promise<T>
    output(text: string): Promise<void>
}