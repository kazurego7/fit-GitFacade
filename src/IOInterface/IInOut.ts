export interface IInOut {
    input(): Promise<string>
    output(text: string): Promise<void>
}