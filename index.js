import {execAsync} from 'async-child-process';
import fse from 'fs-extra';
import loaderUtils from 'loader-utils';
import os from 'os';
import path from 'path';
import ab2str from 'arraybuffer-to-string';

const findSrcDir = async function(childPath) {
  let candidate = childPath;

  while (candidate !== path.parse(candidate).root) {
    const maybeCargoFile = path.join(candidate, 'Cargo.toml');
    if (await fse.pathExists(maybeCargoFile)) {
      return candidate;
    }
    candidate = path.dirname(candidate);
  }

  return null;
};

const readBinCrateName = async function(srcDir) {
  const result = await execAsync('cargo read-manifest', {cwd: srcDir});
  const data = JSON.parse(result.stdout);

  let binCrate = data.targets.find(t => t.kind.indexOf('bin') >= 0);

  if (binCrate) {
    return binCrate.name;
  } else {
    throw new Error(`No bin crate found in ${srcDir}`);
  }
};

const DEFAULT_OPTIONS = {
  release: false,
  gc: false,
  target: 'wasm32-unknown-unknown',
  cargoWeb: false,
  name: undefined,
  regExp: undefined,
};

const loadCargoWeb = async function(self, opts, srcDir) {
  const release = opts.release;
  const target = opts.target;
  const name = opts.name;

  const crateName = await readBinCrateName(srcDir);
  const jsFileName = crateName + '.js';
  const wasmFileName = crateName + '.wasm';

  const cmd = `cargo web build --target-webasm${release ? ' --release' : ''}`;
  await execAsync(cmd, {cwd: srcDir});

  const outDir = path.join(srcDir, 'target', target, (release ? 'release' : 'debug'));

  const jsData = await fse.readFile(path.join(outDir, jsFileName));
  const wasmData = await fse.readFile(path.join(outDir, wasmFileName));

  const context = opts.context || self.rootContext || self.options && self.options.context;
  const wasmOutFileName = loaderUtils.interpolateName(self, name, {
    context, content: wasmData, regExp: opts.regExp,
  });

  self.emitFile(wasmOutFileName, wasmData);

  // Ugly way to do replaceAll
  return ab2str(jsData)
    .split(JSON.stringify(wasmFileName))
    .join(`__webpack_public_path__ + ${JSON.stringify(wasmOutFileName)}`);
};

const loadRaw = async function(opts, srcDir) {
  const release = opts.release;
  const gc = opts.gc;
  const target = opts.target;
  const cmd = `cargo build --message-format=json --target=${target}${release ? ' --release' : ''}`;

  const result = await execAsync(cmd, {cwd: srcDir});

  let wasmFile;
  for (let line of result.stdout.split(os.EOL)) {
    if (/^\s*$/.test(line)) {
      continue;
    }
    const data = JSON.parse(line);
    if (data.hasOwnProperty('filenames')) {
      wasmFile = data['filenames'].find((p) => p.endsWith('.wasm'));
      if (wasmFile) {
        break;
      }
    }
  }

  if (!wasmFile) {
    throw new Error('No wasm file produced as build output', null);
  }

  if (gc) {
    let gcWasmFile = wasmFile.substr(0, wasmFile.length - '.wasm'.length) + '.gc.wasm';
    await execAsync(`wasm-gc ${wasmFile} ${gcWasmFile}`);
    wasmFile = gcWasmFile;
  }

  return await fse.readFile(wasmFile);
};

const load = async function(self) {
  const srcDir = await findSrcDir(self.resourcePath);
  if (!srcDir) {
    throw new Error('No Cargo.toml file found in any parent directory.');
  }

  const opts = Object.assign({}, DEFAULT_OPTIONS, loaderUtils.getOptions(self));
  const cargoWeb = opts.cargoWeb;

  if (cargoWeb) {
    return await loadCargoWeb(self, opts, srcDir);
  } else {
    return await loadRaw(opts, srcDir);
  }
};

export default function() {
  const callback = this.async();
  load(this).then(r => callback(null, r), e => callback(e, null));
};
