import { execAsync, execPermissive } from '../src/util';

describe('execAsync', () => {
  it('captures stdout for successful commands', async () => {
    await execAsync('echo ok', {encoding: 'utf-8'}).then((result) => {
      expect(result.stdout).toEqual('ok\n');
    });
  });
  it('captures stderr for successful commands', async () => {
    await execAsync('echo >&2 ok', {encoding: 'utf-8'}).then((result) => {
      expect(result.stderr).toEqual('ok\n');
    });
  });
  it('captures stdout for failing commands', async () => {
    await execAsync('echo ok && exit 1', {encoding: 'utf-8'}).catch((err) => {
      expect(err.stdout).toEqual('ok\n');
    });
  });
  it('captures stderr for failing commands', async () => {
    await execAsync('echo >&2 ok && exit 1', {encoding: 'utf-8'}).catch((err) => {
      expect(err.stderr).toEqual('ok\n');
    });
  });
});

describe('execPermissive', () => {
  it('starts commands in a specified directory', async () => {
    await execPermissive('cat arbitrary-file', 'test/fixtures').then((result) => {
      expect(result.stdout).toEqual('Hello, World!\n');
    });
  });
  it('captures stdout for successful commands', async () => {
    await execPermissive('echo ok').then((result) => {
      expect(result.stdout).toEqual('ok\n');
    });
  });
  it('captures stderr for successful commands', async () => {
    await execPermissive('echo >&2 ok').then((result) => {
      expect(result.stderr).toEqual('ok\n');
    });
  });
  it('captures stdout for failing commands', async () => {
    await execPermissive('echo ok && exit 1').then((result) => {
      expect(result.stdout).toEqual('ok\n');
    });
  });
  it('captures stderr for failing commands', async () => {
    await execPermissive('echo >&2 ok && exit 1').then((result) => {
      expect(result.stderr).toEqual('ok\n');
    });
  });
});
