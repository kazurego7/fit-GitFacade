import { IInOut } from "../IOInterface/IInOut";

export const sayBye = async (io: IInOut) => {
    try {
        io.output("prease say bye.");
        const word = await io.input();
        io.output(word);
    } catch (error) {
        io.output("escape");
    }
}