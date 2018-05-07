import { BuildError } from './error';
import { reverseString } from './util';
import fse from 'fs-extra';
import path from 'path';

export const parseDependencies = (data, baseFile) =>
  data
    .split('\n')
    .filter(str => str.startsWith(baseFile))
    .map(str => str.slice(str.indexOf(': ') + 2))
    .map(reverseString)
    .map(str => str.split(/(?: (?!\\))+/))
    .reduce((allDeps, lineDeps) => [...allDeps, ...lineDeps], [])
    .map(reverseString)
    .map(str => str.replace(/\\ /g, ' '));

export const findSrcDir = async function (childPath) {
  let candidate = childPath;

  while (candidate !== path.parse(candidate).root) {
    const maybeCargoFile = path.join(candidate, 'Cargo.toml');
    if (await fse.pathExists(maybeCargoFile)) {
      return candidate;
    }

    const newCandidate = path.dirname(candidate);
    if (newCandidate === candidate) {
      break;
    }
    candidate = newCandidate;
  }

  return null;
};

export const cargoCommand = (target, release, subcmd = []) => {
  const cmd = ['cargo', ...subcmd, 'build', '--message-format=json', '--target=' + target];

  if (release) {
    cmd.push('--release');
  }

  return cmd.join(' ');
};

export const handleCargo = async function (self, result) {
  let wasmFile;
  let jsFile;
  let hasError = false;
  outer: for (let line of result.stdout.split('\n')) {
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
            hasError = true;
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

  if (hasError) {
    throw new BuildError('Cargo build failed');
  }

  const depFile = wasmFile.slice(0, -'.wasm'.length) + '.d';
  const depContents = await fse.readFile(depFile, 'utf-8');
  const deps = parseDependencies(depContents, wasmFile.replace(/ /g, '\\ '));

  for (let dep of deps) {
    self.addDependency(dep);
  }

  return {wasmFile, jsFile};
};
