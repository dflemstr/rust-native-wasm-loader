# `rust-native-wasm-loader`

[![Build Status](https://travis-ci.org/dflemstr/rust-native-wasm-loader.svg?branch=master)](https://travis-ci.org/dflemstr/rust-native-wasm-loader) [![rust-native-wasm-loader](https://img.shields.io/npm/dt/rust-native-wasm-loader.svg)](https://www.npmjs.com/package/rust-native-wasm-loader) [![npm](https://img.shields.io/npm/v/rust-native-wasm-loader.svg)](https://www.npmjs.com/package/rust-native-wasm-loader)

This is a webpack loader that loads Rust code as a WebAssembly module.  It uses the native Rust
support for compiling to `wasm32` and does not require Emscripten.

   * [rust-native-wasm-loader](#rust-native-wasm-loader)
   * [Usage](#usage)
      * [Short version](#short-version)
      * [Available loader options](#available-loader-options)
      * [Long version](#long-version)
   * [wasm-bindgen experimental support](#wasm-bindgen-experimental-support)
   * [cargo-web experimental support](#cargo-web-experimental-support)

# Usage

If you already know how to use Rust and Webpack, read the "Short version" of this section.  If you
want a full example, read the "Long version."

## Short version

Add both this loader and `wasm-loader` to your Webpack loaders in `webpack.config.js`:

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

Then, specify that your Rust library should be a `cdylib` in `Cargo.toml`:

```toml
[lib]
crate-type = ["cdylib"]
```

Now you can import any functions marked with `#[no_mangle]` as WebAssembly functions:

```js
import loadWasm from './path/to/rustlib/src/lib.rs'

loadWasm().then(result => {
  const add = result.instance.exports['add'];
  console.log('return value was', add(2, 3));
});
```

## Available loader options

  - `release`: `boolean`; whether to compile the WebAssembly module in debug or release mode;
    defaults to `false`.
  - `gc`: `boolean`; whether to run `wasm-gc` on the WebAssembly output.  Reduces binary size but
    requires installing [wasm-gc][].  Defaults to `false` and is a no-op in `wasmBindgen` or
    `cargoWeb` mode.
  - `target`: `string`; the Rust target to use; this defaults to `wasm32-unknown-unknown`
  - `wasmBindgen`: `boolean`; use `wasm-bindgen` to post-process the wasm file.  This probably means
    that you need to chain this loader with `babel-loader` as well since `wasm-bindgen` outputs ES6
    (or typescript).
      - `wasm2es6js`: `boolean`; use `wasm2es6js` to inline the wasm file into generated Javascript.
        Useful if webpack is not configured to load wasm files via some other loader.
      - `typescript`: `boolean`; emit a typescript declaration file as part of the build.  This file
        will automatically be referenced, and in a way that `ts-loader` will pick it up but it's
        still possible to treat the output from this loader like a normal Javascript module
        compatible with `babel-loader`.
  - `cargoWeb`: `boolean`; use `cargo-web` to compile the project instead of only building a `wasm`
    module.  Defaults to `false`.
      - `name`: `string`; the file name to use for emitting the wasm file for `cargo-web`, e.g.
        `'static/wasm/[name].[hash:8].wasm'`.
      - `regExp`: `string`; a regexp to extract additional variables for use in `name`.

## Long version

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

Then, specify that your Rust library should be a `cdylib` in `Cargo.toml`:

```toml
[lib]
crate-type = ["cdylib"]
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

You can now run webpack and the resulting code from node.js or a browser:

```text
$ yarn run webpack
$ node dist/index.js
return value was 5
```

# `wasm-bindgen` experimental support

You can use experimental `wasm-bindgen` support with the following options:

```js
{
  test: /\.rs$/,
  use: [
    {
      loader: 'babel-loader',
      options: {
        compact: true,
      }
    },
    {
      loader: 'rust-native-wasm-loader',
      options: {
        release: true,
        wasmBindgen: true,
        wasm2es6js: true,
      }
    }
  ]
}
```

The loader now uses `wasm-bindgen` to build the project.  If you are using webpack 4, you probably
don't need the `wasm2es6js` flag, but if you are using webpack 3, it is needed in order to inline
the loading of the wasm file correctly.  The loader now returns a normal Javascript module that can
be loaded like so:

```js
import { add, wasmBooted } from './path/to/rustlib/src/lib.rs'

wasmBooted.then(() => {
  console.log('return value was', add(2, 3));
});
```

(The `wasmBooted` promise is not necessary when using webpack 4)

# `cargo-web` experimental support

You can use experimental `cargo-web` support with the following options:

```js
{
  loader: 'rust-native-wasm-loader',
  options: {
    cargoWeb: true,
    name: 'static/wasm/[name].[hash:8].wasm'
  }
}
```

The loader now uses `cargo-web` to build the project, and as a result needs to emit the wasm file
separately.  The loader now returns a normal Javascript module that can be loaded like so:

```js
import loadWasm from './path/to/rustlib/src/lib.rs'

loadWasm.then(module => {
  console.log('return value was', module.add(2, 3));
});
```

[rustup.rs]: https://rustup.rs/
[wasm-gc]: https://github.com/alexcrichton/wasm-gc
