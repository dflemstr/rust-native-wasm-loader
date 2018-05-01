# Simple example

This is a simple example of calling Rust from node or a browser.

To try out this example, install Rust and npm (documented elsewhere) and then run:

    npm install
    npm run build
    node dist/index.js

If everything went well, it should print:

    $ npm install

        > uglifyjs-webpack-plugin@0.4.6 postinstall ~/projects/rust-native-wasm-loader/examples/simple/node_modules/uglifyjs-webpack-plugin
        > node lib/post_install.js

        npm WARN ajv-keywords@3.2.0 requires a peer of ajv@^6.0.0 but none is installed. You must install peer dependencies yourself.
        npm WARN optional SKIPPING OPTIONAL DEPENDENCY: fsevents@1.2.3 (node_modules/fsevents):
        npm WARN notsup SKIPPING OPTIONAL DEPENDENCY: Unsupported platform for fsevents@1.2.3: wanted {"os":"darwin","arch":"any"} (current: {"os":"linux","arch":"x64"})

        added 429 packages in 4.799s

    $ npm run build

        > simple@1.0.0 build ~/projects/rust-native-wasm-loader/examples/simple
        > webpack

        Hash: 3e2fae5cf48fff942ae8
        Version: webpack 3.11.0
        Time: 1915ms
        Asset     Size  Chunks                    Chunk Names
        index.js  1.99 MB       0  [emitted]  [big]  main
        [0] ./src/index.js 155 bytes {0} [built]
        [1] ./src/lib.rs 1.99 MB {0} [built]

    $ node dist/index.js
        return value was 5
