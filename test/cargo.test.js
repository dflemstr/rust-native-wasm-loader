import { cargoCommand, findSrcDir } from '../src/cargo';

describe('findSrcDir', () => {
  it('finds a Cargo source dir for the main file', async () => {
    await findSrcDir('test/fixtures/myrustlib/src/lib.rs').then((result) => {
      expect(result).toEqual('test/fixtures/myrustlib');
    });
  });
  it('finds a Cargo source dir for an arbitrary source file', async () => {
    await findSrcDir('test/fixtures/myrustlib/src/add.rs').then((result) => {
      expect(result).toEqual('test/fixtures/myrustlib');
    });
  });
  it('returns null for files outside of a Cargo project', async () => {
    await findSrcDir('test/fixtures/arbitrary-file').then((result) => {
      expect(result).toBeNull();
    });
  });
});

describe('cargoCommand', () => {
  it('formats a basic command for a target', () => {
    const result = cargoCommand('foo', false);
    expect(result).toEqual('cargo build --message-format=json --target=foo');
  });
  it('formats a basic command for a target in release mode', () => {
    const result = cargoCommand('foo', true);
    expect(result).toEqual('cargo build --message-format=json --target=foo --release');
  });
  it('formats a basic command for a target with a subcommand', () => {
    const result = cargoCommand('foo', false, ['web', 'extra']);
    expect(result).toEqual('cargo web extra build --message-format=json --target=foo');
  });
  it('formats a basic command for a target in release mode', () => {
    const result = cargoCommand('foo', true, ['web', 'extra']);
    expect(result).toEqual('cargo web extra build --message-format=json --target=foo --release');
  });
});
