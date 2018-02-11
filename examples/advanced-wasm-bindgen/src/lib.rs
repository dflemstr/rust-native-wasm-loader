#![feature(proc_macro)]

extern crate wasm_bindgen;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[no_mangle]
pub extern fn hello_world(mut first_name: &str, mut last_name: &str) -> String {
    // This is fairly silly code but it is just an example...
    if first_name.is_empty() {
        first_name = "John";
    }
    if last_name.is_empty() {
        last_name = "Doe";
    }
    format!("Hello, {} {}!", first_name, last_name)
}
