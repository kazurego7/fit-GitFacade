import { IInOut } from '../IOInterface/IInOut';

export const sayHello = async (io: IInOut) => {
    await io.output("hello");
}