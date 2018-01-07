import loadWasm from './mystdweblib/src/main.rs';

export const run = async () => {
  const result = await loadWasm;
  return result.add('Hello, ', 'World!');
};
