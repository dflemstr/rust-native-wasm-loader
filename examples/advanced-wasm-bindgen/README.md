# Advanced wasm-bindgen example

This is an advanced example of calling Rust from a browser.

To try out this example, install Rust, `wasm-bindgen` and Yarn (documented elsewhere) and then run:

    yarn install
    yarn build
    serve dist

If everything went well, it should print:

    $ yarn install
    [1/4] Resolving packages...
    [2/4] Fetching packages...
    [3/4] Linking dependencies...
    [4/4] Building fresh packages...
    Done in 12.70s.

    $  yarn build
      yarn run v1.3.2
      $ webpack
      Hash: 0efef1241cbe6e7a6b0c
      Version: webpack 3.11.0
      Time: 77937ms
                               Asset       Size  Chunks             Chunk Names
          static/js/main.c3ada3b0.js     130 kB       0  [emitted]  main
      static/js/main.c3ada3b0.js.map     144 kB       0  [emitted]  main
                          index.html  469 bytes          [emitted]  
         [0] ./target/wasm32-unknown-unknown/release/advanced_wasm_bindgen_wasm.js 63.7 kB {0} [built]
         [1] ./src/index.js 516 bytes {0} [built]
         [2] ./src/lib.rs 2.87 kB {0} [built]
         [4] (webpack)/buildin/global.js 509 bytes {0} [built]
         [8] ./target/wasm32-unknown-unknown/release/advanced_wasm_bindgen.js 2.72 kB {0} [built]
          + 4 hidden modules
      Child html-webpack-plugin for "index.html":
           1 asset
             [0] ./node_modules/html-webpack-plugin/lib/loader.js!./src/index.html 870 bytes {0} [built]
             [2] (webpack)/buildin/global.js 509 bytes {0} [built]
             [3] (webpack)/buildin/module.js 517 bytes {0} [built]
              + 1 hidden module
      Done in 78.47s.

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
