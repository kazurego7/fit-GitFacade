import { IStringIO } from "../IOInterface/IStringIO";

export const sayBye = async (io: IStringIO) => {
    try {
        io.output("prease say bye.");
        const word = await io.input();
        io.output(word);
    } catch (error) {
        io.output("escape");
    }
}