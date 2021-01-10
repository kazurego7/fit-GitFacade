export interface ICommonIO {
    input(description: string): Promise<string>
    select<T>(choices: SelectItem<T>[]): Promise<T>
    message<T>(message: string, choices: MessageItem<T>[]): Promise<T>
    output(text: string): Promise<void>
}

export class SelectItem<T> {
    label: string;
    description?: string;
    data: T;
    constructor(
        props: {
            label: string, description?: string, data: T
        }
    ) {
        this.label = props.label;
        this.description = props.description;
        this.data = props.data;
    };
}

export class MessageItem<T> {
    label: string;
    data: T;
    constructor(
        props: {
            label: string, data: T
        }
    ) {
        this.label = props.label;
        this.data = props.data;
    };
}