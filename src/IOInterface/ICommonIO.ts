export interface ICommonIO {
    input(): Promise<string>
    output(text: string): Promise<void>
}