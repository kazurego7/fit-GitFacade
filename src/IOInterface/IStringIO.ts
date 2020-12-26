export interface IStringIO {
    input(): Promise<string>
    output(text: string): Promise<void>
}