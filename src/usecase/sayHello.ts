import { ICommonIO } from '../IOInterface/ICommonIO';

export const sayHello = async (io: ICommonIO) => {
    await io.output("hello");
}