# `rust-native-wasm-loader`

This is a webpack loader that loads Rust code as a WebAssembly module.  It uses the native Rust
support for compiling to `wasm32` and does not require Emscripten.

## Usage

### Short version

Add both this loader and `wasm-loader` to your Webpack loaders:

```js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.rs$/,
        use: [{
          loader: 'wasm-loader'
        }, {
          loader: 'rust-native-wasm-loader',
          options: {
            release: true
          }
        }]
      }
    ]
  }
}
```

Then, you can import your `#[no_mangle]`d Rust functions from your Rust Cargo library:

```js
import loadWasm from './lib.rs'

loadWasm().then(result => {
  const add = result.instance.exports['add'];
  console.log('return value was', add(2, 3));
});
```

### Available options

  - `release`: `boolean`; whether to compile the WebAssembly module in debug or release mode;
    defaults to `false`.
  - `target`: `string`; the Rust target to use; this defaults to `wasm32-unknown-unknown`

### Long version

First, you need Rust installed.  The easiest way is to follow the instructions at [rustup.rs][].

Then, you need to add support for WebAssembly cross-compilation.  At the time of writing, this
requires using the `nightly` compiler:

```text
rustup toolchain install nightly
rustup target add wasm32-unknown-unknown --toolchain nightly
```

The next step is to integrate a cargo/node project.  Let's assume we don't already have one, so we
create one:

```text
cargo init add
cd add
```

We can add the Rust code that should be available in the WebAssembly module to `src/lib.rs`.  All
functions that should be reachable from WebAssembly should be marked with `#[no_mangle]`:

```rust
#[no_mangle]
pub fn add(a: i32, b: i32) -> i32 {
    eprintln!("add({:?}, {:?}) was called", a, b);
    a + b
}
```

Now you can actually start to use this loader.  This loader itself does not create Javascript code
for loading a WebAssembly module, so you need to compose it with another loader, like `wasm-loader`:

```text
yarn init
yarn add --dev webpack
yarn add --dev rust-native-wasm-loader wasm-loader
```

The loaders can be registered the usual way by adding them to your `webpack.config.js`:

```js
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.rs$/,
        use: [{
          loader: 'wasm-loader'
        }, {
          loader: 'rust-native-wasm-loader',
          options: {
            release: true
          }
        }]
      }
    ]
  }
};
```

You can now import the WebAssembly module by using the main `.rs` file from your Cargo project
(`lib.rs` or `main.rs`); e.g. from your `index.js`:

```js
import loadAdd from './lib.rs'

loadAdd().then(result => {
  const add = result.instance.exports['add'];
  console.log('return value was', add(2, 3));
});
```

[rustup.rs]: https://rustup.rs/
