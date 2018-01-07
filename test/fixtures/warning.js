import loadWasm from './mywarninglib/src/lib.rs';

export const run = async () => {
  const result = await loadWasm();
  return result.instance.exports.add(1, 2);
};
