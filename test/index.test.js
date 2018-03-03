import webpack from 'webpack';
import path from 'path';
import nodeFileEval from 'node-file-eval';
import process from 'process';
import { execAsync } from 'async-child-process';
import { TextDecoder, TextEncoder } from 'text-encoding';

describe('rust-native-wasm-loader', () => {
  it('loads a simple cargo project', async () => {
    jest.setTimeout(100000);

    const options = {
      release: true,
    };

    const preRules = [{
      loader: 'wasm-loader'
    }];

    const stats = await runLoader('simple.js', 'simple', options, preRules);

    await expectToMatchSnapshot(stats);
  });

  it('loads a simple cargo project with warnings', async () => {
    jest.setTimeout(100000);

    const options = {
      release: true,
    };

    const preRules = [{
      loader: 'wasm-loader'
    }];

    // Run clean to ensure that the warning is generated every time
    await execAsync('cargo clean', {cwd: path.resolve(__dirname, 'fixtures', 'mywarninglib')});

    const stats = await runLoader('warning.js', 'warning', options, preRules);

    await expectToMatchSnapshot(stats);
  });

  it('loads a simple cargo project with errors', async () => {
    jest.setTimeout(100000);

    const options = {
      release: true,
    };

    const stats = await runLoader('error.js', 'error', options);

    await expectToMatchSnapshot(stats);
  });

  it('loads a simple cargo project with wasm-gc', async () => {
    jest.setTimeout(100000);

    const options = {
      release: true,
      gc: true,
    };

    const preRules = [{
      loader: 'wasm-loader'
    }];

    const stats = await runLoader('simple.js', 'simple-gc', options, preRules);

    await expectToMatchSnapshot(stats);
  });

  it('loads a cargo-web project', async () => {
    jest.setTimeout(100000);

    const options = {
      release: true,
      cargoWeb: true,
      name: '[name].[hash:8].wasm',
    };

    const stats = await runLoader('stdweb.js', 'stdweb', options);

    await expectToMatchSnapshot(stats);
  });

  it('loads a wasm-bindgen project', async () => {
    jest.setTimeout(400000);

    const options = {
      release: true,
      wasmBindgen: true,
      wasm2es6js: true,
    };

    const stats = await runLoader('wasmbindgen.js', 'wasmbindgen', options, []);

    await expectToMatchSnapshot(stats);
  });

  it('loads a wasm-bindgen project with typescript support', async () => {
    jest.setTimeout(400000);

    const options = {
      release: true,
      wasmBindgen: true,
      wasm2es6js: true,
      typescript: true,
    };

    const otherRules = [{
      test: /\.(js|rs|ts)$/,
      use: [{
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.rs$/],
          onlyCompileBundledFiles: true
        }
      }]
    }];

    const stats = await runLoader('wasmbindgen.ts', 'wasmbindgen-ts', options, [], otherRules);

    await expectToMatchSnapshot(stats);
  });

  it('loads a wasm-bindgen project with typescript support and a type error', async () => {
    jest.setTimeout(400000);

    const options = {
      release: true,
      wasmBindgen: true,
      wasm2es6js: true,
      typescript: true,
    };

    const otherRules = [{
      test: /\.(js|rs|ts)$/,
      use: [{
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.rs$/],
          onlyCompileBundledFiles: true
        }
      }]
    }];

    const stats = await runLoader('wasmbindgen-type-error.ts', 'wasmbindgen-ts', options, [], otherRules);

    await expectToMatchSnapshot(stats);
  });

  it('loads a wasm-bindgen project with typescript support and a rust error', async () => {
    jest.setTimeout(400000);

    const options = {
      release: true,
      wasmBindgen: true,
      wasm2es6js: true,
      typescript: true,
    };

    const otherRules = [{
      test: /\.(js|rs|ts)$/,
      use: [{
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.rs$/],
          onlyCompileBundledFiles: true
        }
      }]
    }];

    const stats = await runLoader('wasmbindgen-rust-error.ts', 'wasmbindgen-ts', options, [], otherRules);

    await expectToMatchSnapshot(stats);
  });
});

function removeCWD(str) {
  return str.split(`${process.cwd()}/`).join('');
}

function cleanErrorStack(error) {
  return removeCWD(error.message).split('\n').filter(l => !l.match(/^\s+at\s/)).join('\n');
}

function collectDependencies(dependencies, obj) {
  if ('fileDependencies' in obj) {
    for (let dep of obj.fileDependencies) {
      dependencies.add(removeCWD(dep));
    }
  }

  if ('entries' in obj) {
    for (let entry of obj.entries) {
      collectDependencies(dependencies, entry);
    }
  }

  if ('module' in obj) {
    collectDependencies(dependencies, obj.module);
  }
}

async function expectToMatchSnapshot(stats) {
  const errors = stats.compilation.errors.map(cleanErrorStack);
  const warnings = stats.compilation.warnings.map(cleanErrorStack);
  const dependencies = new Set();

  collectDependencies(dependencies, stats.compilation);

  expect(errors).toMatchSnapshot('errors');
  expect(warnings).toMatchSnapshot('warnings');
  expect(dependencies).toMatchSnapshot('dependencies');

  const assetPath = stats.compilation.assets['index.js'].existsAt;
  try {
    const module = await nodeFileEval(assetPath, {
      encoding: 'utf-8',
      context: {
        require,
        Buffer,
        TextDecoder,
        TextEncoder,
        console,
        __dirname: path.dirname(assetPath)
      }
    });
    expect(await module.run()).toMatchSnapshot('output');
  } catch (e) {
    expect(e.message.split('\n')[0]).toMatchSnapshot('failure');
  }
}

function runLoader(fixture, test, options, preRules = [], otherRules = []) {
  const config = {
    context: path.resolve(__dirname, 'fixtures'),
    entry: `./${fixture}`,
    target: 'node',
    output: {
      path: path.resolve(__dirname, 'outputs', test),
      filename: 'index.js'
    },
    module: {
      rules: otherRules.concat([{
        test: /\.rs$/,
        use: preRules.concat([{
          loader: path.resolve(__dirname, '../src'),
          options,
        }])
      }])
    },
    node: {
      __dirname: false,
    }
  };

  const compiler = webpack(config);

  return new Promise((resolve, reject) => compiler.run((err, stats) => {
    if (err) {
      reject(err);
    } else {
      resolve(stats);
    }
  }))
}
