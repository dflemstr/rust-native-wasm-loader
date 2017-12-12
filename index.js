import {execAsync} from 'async-child-process';
import fse from 'fs-extra';
import loaderUtils from 'loader-utils';
import os from 'os';
import path from 'path';

const findSrcDir = async function(childPath) {
  let candidate = childPath;

  while (candidate) {
    const maybeCargoFile = path.join(candidate, 'Cargo.toml');
    if (await fse.pathExists(maybeCargoFile)) {
      break;
    }
    candidate = path.dirname(candidate);
  }

  return candidate;
};

const load = async function(self) {
  const srcDir = await findSrcDir(self.resourcePath);
  if (!srcDir) {
    throw new Error('No Cargo.toml file found in any parent directory.');
  }

  const opts = loaderUtils.getOptions(self);
  const release = (opts && opts.hasOwnProperty('release')) ? opts['release'] : false;
  const target = (opts && opts.hasOwnProperty('target')) ? opts['target'] : 'wasm32-unknown-unknown';

  const cmd = `cargo build --message-format=json --target=${target}${release ? ' --release' : ''}`;

  const result = await execAsync(cmd, {cwd: srcDir});

  for (let line of result.stdout.split(os.EOL)) {
    const data = JSON.parse(line);
    if (data.hasOwnProperty('filenames')) {
      const wasmFile = data['filenames'].find((p) => p.endsWith('.wasm'));
      if (wasmFile) {
        return await fse.readFile(wasmFile);
      }
    }
  }
  throw new Error('No wasm file produced as build output', null);
};

module.exports = async function() {
  const callback = this.async();
  load(this).then(r => callback(null, r), e => callback(e, null));
};
