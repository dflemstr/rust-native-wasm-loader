# Advanced wasm-bindgen example

This is an advanced example of calling Rust from a browser.

To try out this example, install Rust, `wasm-bindgen` and npm (documented elsewhere), serve (npm i -g serve) and then run:

    npm install
    npm run build
    serve dist

If everything went well, it should print:

    $ npm install

        > uglifyjs-webpack-plugin@0.4.6 postinstall ~/projects/rust-native-wasm-loader/examples/advanced-wasm-bindgen/node_modules/uglifyjs-webpack-plugin
        > node lib/post_install.js

        npm WARN ajv-keywords@3.2.0 requires a peer of ajv@^6.0.0 but none is installed. You must install peer dependencies yourself.
        npm WARN optional SKIPPING OPTIONAL DEPENDENCY: fsevents@1.2.3 (node_modules/fsevents):
        npm WARN notsup SKIPPING OPTIONAL DEPENDENCY: Unsupported platform for fsevents@1.2.3: wanted {"os":"darwin","arch":"any"} (current: {"os":"linux","arch":"x64"})

        added 443 packages in 4.95s


    $npm run build

        > advanced-wasm-bindgen@1.0.0 build ~/projects/rust-native-wasm-loader/examples/advanced-wasm-bindgen
        > webpack

        Hash: 213120abad260a093f52
        Version: webpack 3.11.0
        Time: 96866ms
                                Asset       Size  Chunks                    Chunk Names
            static/js/main.afe5de87.js     394 kB       0  [emitted]  [big]  main
        static/js/main.afe5de87.js.map     416 kB       0  [emitted]         main
                            index.html  469 bytes          [emitted]         
        [1] ./target/wasm32-unknown-unknown/release/advanced_wasm_bindgen_bg.js 298 kB {0} [built]
        [2] (webpack)/buildin/global.js 509 bytes {0} [built]
        [3] ./src/index.js 516 bytes {0} [built]
        [4] ./src/lib.rs 6.39 kB {0} [built]
        [9] ./target/wasm32-unknown-unknown/release/advanced_wasm_bindgen.js 4.92 kB {0} [built]
            + 8 hidden modules
        Child html-webpack-plugin for "index.html":
            1 asset
            [0] ./node_modules/html-webpack-plugin/lib/loader.js!./src/index.html 870 bytes {0} [built]
            [2] (webpack)/buildin/global.js 509 bytes {0} [built]
            [3] (webpack)/buildin/module.js 517 bytes {0} [built]
                + 1 hidden module


    $ serve dist

       ┌─────────────────────────────────────────────────┐
       │                                                 │
       │   Serving!                                      │
       │                                                 │
       │   - Local:            http://localhost:5000     │
       │   - On Your Network:  http://192.168.1.2:5000   │
       │                                                 │
       │   Copied local address to clipboard!            │
       │                                                 │
       └─────────────────────────────────────────────────┘

The resulting web page behaves like this:

![Screenshot](./screenshot.png)
