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
  const name = opts.name;

  const cmd = `cargo web build --message-format=json --target-webasm${release ? ' --release' : ''}`;
  const result = await execAsync(cmd, {cwd: srcDir});

  const {wasmFile, jsFile} = handleCargo(self, result);

  if (!wasmFile) {
    throw new Error('No wasm file produced as build output');
  }
  if (!jsFile) {
    throw new Error('No js file produced as build output');
  }

  const jsData = await fse.readFile(jsFile);
  const wasmData = await fse.readFile(wasmFile);

  const context = opts.context || self.rootContext || self.options && self.options.context;
  const wasmOutFileName = loaderUtils.interpolateName(self, name, {
    context, content: wasmData, regExp: opts.regExp,
  });

  self.emitFile(wasmOutFileName, wasmData);

  // Ugly way to do replaceAll... would be great to have some way to create a custom template here
  return ab2str(jsData)
    .split(`fetch( ${JSON.stringify(path.basename(wasmFile))} )`)
    .join(`fetch(__webpack_public_path__ + ${JSON.stringify(wasmOutFileName)})`)
    .split(JSON.stringify(path.basename(wasmFile)))
    .join(JSON.stringify(wasmOutFileName));
};

const loadRaw = async function(self, opts, srcDir) {
  const release = opts.release;
  const gc = opts.gc;
  const target = opts.target;
  const cmd = `cargo build --message-format=json --target=${target}${release ? ' --release' : ''}`;

  const result = await execAsync(cmd, {cwd: srcDir});

  let {wasmFile} = handleCargo(self, result);

  if (!wasmFile) {
    throw new Error('No wasm file produced as build output');
  }

  if (gc) {
    let gcWasmFile = wasmFile.substr(0, wasmFile.length - '.wasm'.length) + '.gc.wasm';
    await execAsync(`wasm-gc ${wasmFile} ${gcWasmFile}`);
    wasmFile = gcWasmFile;
  }

  return await fse.readFile(wasmFile);
};

const handleCargo = function(self, result) {
  let wasmFile;
  let jsFile;
  outer: for (let line of result.stdout.split(os.EOL)) {
    if (/^\s*$/.test(line)) {
      continue;
    }
    const data = JSON.parse(line);
    switch (data.reason) {
      case 'compiler-message':
        switch (data.message.level) {
          case 'warning':
            self.emitWarning(new Error(data.message.rendered));
            break;
          case 'error':
            self.emitError(new Error(data.message.rendered));
            break;
        }
        break;
      case 'compiler-artifact':
        if (!wasmFile) {
          wasmFile = data.filenames.find((p) => p.endsWith('.wasm'));
        }
        if (!jsFile) {
          jsFile = data.filenames.find((p) => p.endsWith('.js'));
        }
        if (wasmFile) {
          break outer;
        }
        break;
    }
  }
  return {wasmFile, jsFile};
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
    return await loadRaw(self, opts, srcDir);
  }
};

export default function() {
  const callback = this.async();
  load(this).then(r => callback(null, r), e => callback(e, null));
};
