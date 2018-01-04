import webpack from 'webpack';
import MemoryFS from 'memory-fs';
import path from 'path';

describe('rust-native-wasm-loader', () => {
  it('loads a simple cargo project', async () => {
    jest.setTimeout(100000);

    const options = {
      release: true,
    };

    const preRules = [{
      loader: 'wasm-loader'
    }];

    const stats = await runLoader('simple', options, preRules);

    expectToMatchSnapshot(stats);
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

    const stats = await runLoader('simple', options, preRules);

    expectToMatchSnapshot(stats);
  });

  it('loads a cargo-web project', async () => {
    jest.setTimeout(100000);

    const options = {
      release: true,
      cargoWeb: true,
      name: 'static/wasm/[name].[hash:8].wasm',
    };

    const stats = await runLoader('stdweb', options);

    expectToMatchSnapshot(stats);
  });
});

function expectToMatchSnapshot(stats) {
  stats = stats.toJson();
  expect(stats.modules.map(m => m.source)).toMatchSnapshot();
}

function runLoader(fixture, options, preRules = []) {
  const config = {
    devtool: 'sourcemap',
    context: path.resolve(__dirname, 'fixtures'),
    entry: `./${fixture}`,
    output: {
      path: path.resolve(__dirname, 'outputs', fixture),
      filename: '[name].bundle.js',
    },
    module: {
      rules: preRules.concat([{
        test: /\.rs$/,
        use: {
          loader: path.resolve(__dirname, '../src'),
          options,
        }
      }])
    },
    plugins: [
      new webpack.optimize.CommonsChunkPlugin(
        {
          name: ['runtime'],
          minChunks: Infinity
        }
      )
    ]
  };

  const compiler = webpack(config);

  compiler.outputFileSystem = new MemoryFS();

  return new Promise((resolve, reject) => compiler.run((err, stats) => {
    if (err) {
      reject(err);
    } else {
      resolve(stats);
    }
  }))
}
