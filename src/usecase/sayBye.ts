import { ICommonIO } from "../IOInterface/ICommonIO";

export const sayBye = async (io: ICommonIO) => {
    try {
        io.output("prease say bye.");
        const word = await io.input();
        io.output(word);
    } catch (error) {
        io.output("escape");
    }
}