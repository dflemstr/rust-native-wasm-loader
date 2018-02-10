import loadWasm from './mystdweblib/src/lib.rs';

export const run = async () => {
  const result = await loadWasm;
  return result.add('Hello, ', 'World!');
};
