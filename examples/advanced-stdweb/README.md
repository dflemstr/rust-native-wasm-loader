# Advanced stdweb example

This is an advanced example of calling Rust from a browser.

To try out this example, install Rust, `cargo-web`, npm (documented elsewhere), serve (npm i -g serve) and then run:

    npm install
    npm run build
    serve dist

If everything went well, it should print:

    $ npm install

        > uglifyjs-webpack-plugin@0.4.6 postinstall ~/projects/rust-native-wasm-loader/examples/advanced-stdweb/node_modules/uglifyjs-webpack-plugin
        > node lib/post_install.js

        npm WARN ajv-keywords@3.2.0 requires a peer of ajv@^6.0.0 but none is installed. You must install peer dependencies yourself.
        npm WARN optional SKIPPING OPTIONAL DEPENDENCY: fsevents@1.2.3 (node_modules/fsevents):
        npm WARN notsup SKIPPING OPTIONAL DEPENDENCY: Unsupported platform for fsevents@1.2.3: wanted {"os":"darwin","arch":"any"} (current: {"os":"linux","arch":"x64"})

        added 494 packages in 45.224s

    $ npm run build

        > advanced-stdweb@1.0.0 build ~/projects/rust-native-wasm-loader/examples/advanced-stdweb
        > webpack

        Hash: dd3893fe5a6613e91472
        Version: webpack 3.11.0
        Time: 163874ms
                                    Asset       Size  Chunks                    Chunk Names
        f7deecb643855177d18aecfbe8426326.rs     338 kB          [emitted]  [big]  
                static/js/main.c12fba11.js    14.1 kB       0  [emitted]         main
            static/js/main.c12fba11.js.map    89.6 kB       0  [emitted]         main
                                index.html  469 bytes          [emitted]         
        [1] ./src/index.js 637 bytes {0} [built]
        [2] ./src/main.rs 15.9 kB {0} [built]
            + 3 hidden modules
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
