import fse from 'fs-extra';
import loaderUtils from 'loader-utils';
import path from 'path';
import { BuildError } from './error';
import { execPermissive, execAsync, clapVersion } from './util';
import { cargoCommand, findSrcDir, handleCargo } from './cargo';
import * as semver from 'semver';

const DEFAULT_OPTIONS = {
  release: false,
  gc: false,
  target: 'wasm32-unknown-unknown',
  cargoWeb: false,
  name: undefined,
  regExp: undefined,
  wasmBindgen: false,
  wasm2es6js: false,
  typescript: false,
};

const SUPPORTED_WASM_BINDGEN_VERSION = '^0.2';
const SUPPORTED_CARGO_WEB_VERSION = '^0.6.9';

const loadWasmBindgen = async function (self, {release, target, wasmBindgen}, srcDir) {
  const wasmBindgenVersion = await clapVersion('wasm-bindgen', srcDir);

  if (!semver.satisfies(wasmBindgenVersion, SUPPORTED_WASM_BINDGEN_VERSION)) {
    throw new BuildError(
      `wasm-bindgen version not supported; got ${wasmBindgenVersion} but need ${SUPPORTED_WASM_BINDGEN_VERSION}`);
  }

  const cmd = cargoCommand(target, release);
  const result = await execPermissive(cmd, srcDir);

  const { wasmFile } = await handleCargo(self, result);

  const suffixlessPath = wasmFile.slice(0, -'.wasm'.length);
  const moduleDir = path.dirname(wasmFile);

  const wasmBindgenCmd = ['wasm-bindgen', wasmFile, '--out-dir', moduleDir];

  if (wasmBindgen.typescript) {
    wasmBindgenCmd.push('--typescript');
  }

  if (wasmBindgen.nodejs) {
    wasmBindgenCmd.push('--nodejs');
  }

  if (wasmBindgen.debug) {
    wasmBindgenCmd.push('--debug');
  }

  await execAsync(wasmBindgenCmd.join(' '));
  await fse.remove(suffixlessPath + '.wasm')

  if (wasmBindgen.wasm2es6js) {
    const glueWasmPath = suffixlessPath + '_bg.wasm';
    const glueJsPath = suffixlessPath + '_bg.js';

    await execAsync(`wasm2es6js ${glueWasmPath} -o ${glueJsPath} --base64`);
    await fse.remove(glueWasmPath)
  }

  if (wasmBindgen.typescript) {
    const tsdPath = suffixlessPath + '.d.ts';
    const jsPath = suffixlessPath + '.js';
    const wasmPath = suffixlessPath + (wasmBindgen.wasm2es6js ? '_bg.js' : '_bg.wasm');

    const jsRequest = loaderUtils.stringifyRequest(self, jsPath);
    const tsdRequest = loaderUtils.stringifyRequest(self, tsdPath);
    const wasmRequest = loaderUtils.stringifyRequest(self, wasmPath);

    let contents = `
/// <reference path=${tsdRequest} />
export * from ${jsRequest};
`;
    if (wasmBindgen.wasm2es6js) {
      contents += `
import * as wasm from ${wasmRequest};
export const wasmBooted: Promise<boolean> = wasm.booted
`;
    }
    return contents;
  } else {
    const jsRequest = loaderUtils.stringifyRequest(self, suffixlessPath + '.js');
    let contents = '';
    if (wasmBindgen.nodejs) {
      contents += `module.exports = require(${jsRequest});\n`;
    } else {
      contents += `export * from ${jsRequest};\n`;
    }
    if (wasmBindgen.wasm2es6js) {
      const wasmImport = suffixlessPath + '_bg';
      const wasmRequest = loaderUtils.stringifyRequest(self, wasmImport);
      if (wasmBindgen.nodejs) {
        contents += `module.exports.wasmBooted = require(${wasmRequest}).booted\n`;
      } else {
        contents += `export {booted as wasmBooted} from ${wasmRequest};\n`;
      }
    }
    return contents;
  }
};

const loadCargoWeb = async function (self, {release, target, cargoWeb}, srcDir) {
  const cargoWebVersion = await clapVersion('cargo web', srcDir);

  if (!semver.satisfies(cargoWebVersion, SUPPORTED_CARGO_WEB_VERSION)) {
    throw new BuildError(
      `cargo-web version not supported; got ${cargoWebVersion} but need ${SUPPORTED_CARGO_WEB_VERSION}`);
  }

  const cmd = cargoCommand(target, release, ['web']);
  const result = await execPermissive(cmd, srcDir);

  const { wasmFile, jsFile } = await handleCargo(self, result);

  const jsData = await fse.readFile(jsFile, 'utf-8');
  const wasmData = await fse.readFile(wasmFile);

  const context = self.context || self.options && self.options.context;
  const wasmOutFileName = loaderUtils.interpolateName(self, cargoWeb.name, {
    context, content: wasmData, regExp: cargoWeb.regExp,
  });

  self.emitFile(wasmOutFileName, wasmData);

  // Ugly way to do replaceAll... would be great to have some way to create a custom template here
  return jsData
    .split(`fetch( ${JSON.stringify(path.basename(wasmFile))} )`)
    .join(`fetch(__webpack_public_path__ + ${JSON.stringify(wasmOutFileName)})`)
    .split(JSON.stringify(path.basename(wasmFile)))
    .join(JSON.stringify(wasmOutFileName));
};

const loadRaw = async function (self, {release, gc, target}, srcDir) {
  const cmd = cargoCommand(target, release);
  const result = await execPermissive(cmd, srcDir);

  let { wasmFile } = await handleCargo(self, result);

  if (gc) {
    let gcWasmFile = wasmFile.substr(0, wasmFile.length - '.wasm'.length) + '.gc.wasm';
    await execAsync(`wasm-gc ${wasmFile} ${gcWasmFile}`);
    wasmFile = gcWasmFile;
  }

  return await fse.readFile(wasmFile);
};

const load = async function (self) {
  const srcDir = await findSrcDir(self.resourcePath);
  if (!srcDir) {
    throw new BuildError('No Cargo.toml file found in any parent directory.');
  }
  self.addDependency(path.join(srcDir, 'Cargo.toml'));

  const opts = Object.assign({}, DEFAULT_OPTIONS, loaderUtils.getOptions(self));
  const cargoWeb = opts.cargoWeb;
  const wasmBindgen = opts.wasmBindgen;

  if (wasmBindgen || cargoWeb) {
    try {
      if (wasmBindgen) {
        return await loadWasmBindgen(self, opts, srcDir);
      } else if (cargoWeb) {
        return await loadCargoWeb(self, opts, srcDir);
      } else {
        throw new Error('Unreachable code');
      }
    } catch (e) {
      if (e instanceof BuildError) {
        self.emitError(e);
        return `throw new Error(${JSON.stringify(e.message)});\n`;
      } else {
        throw e;
      }
    }
  } else {
    return await loadRaw(self, opts, srcDir);
  }
};

export default function () {
  const callback = this.async();
  load(this).then(r => callback(null, r), e => callback(e, null));
};
