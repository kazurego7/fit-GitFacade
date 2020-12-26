import { IStringIO } from '../IOInterface/IStringIO';

export const sayHello = async (io: IStringIO) => {
    await io.output("hello");
}