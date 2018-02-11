import { add, wasmBooted } from './mywasmbindgenlib/src/lib.rs';

export const run = async () => {
  await wasmBooted;
  return add('Hello, ', 'World!');
};
