import { exec } from 'child_process';
import { promisify } from 'util';

export const execAsync = promisify(exec);

export const execPermissive = async function (cmd, srcDir) {
  try {
    let options = {cwd: srcDir, encoding: 'utf-8', maxBuffer: 2 * 1024 * 1024 * 1024};
    return await execAsync(cmd, options);
  } catch (e) {
    return e;
  }
};

export const clapVersion = async function (tool, srcDir) {
  return (await execPermissive(`${tool} --version`, srcDir)).stdout.split(' ').slice(-1)[0].trim();
};
