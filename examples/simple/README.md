# Simple example

This is a simple example of calling Rust from node or a browser.

To try out this example, install Rust and Yarn (documented elsewhere) and then run:

    yarn install
    yarn build
    node dist/index.js

If everything went well, it should print:

    $ yarn install
    yarn install v1.3.2
    [1/4] Resolving packages...
    [2/4] Fetching packages...
    [3/4] Linking dependencies...
    [4/4] Building fresh packages...
    Done in 1.16s.

    $ yarn build
    yarn run v1.3.2
    $ webpack
    Hash: 74d5bd84e0a095f3b2c6
    Version: webpack 3.10.0
    Time: 386ms
       Asset     Size  Chunks             Chunk Names
    index.js  52.2 kB       0  [emitted]  main
       [0] ./src/index.js 155 bytes {0} [built]
       [1] ./src/lib.rs 49.1 kB {0} [built]
    Done in 0.72s.

    $ node dist/index.js
    return value was 5
