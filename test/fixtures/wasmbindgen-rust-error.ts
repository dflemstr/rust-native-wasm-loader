import { add, wasmBooted } from './mywasmbindgenerrorlib/src/lib.rs';

export const run = async () => {
  await wasmBooted;
  return add('Hello, ', 'World!');
};
