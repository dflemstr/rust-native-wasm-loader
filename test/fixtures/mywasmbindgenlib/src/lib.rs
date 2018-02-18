#![feature(proc_macro)]

extern crate wasm_bindgen;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[no_mangle]
pub extern fn add(a: &str, b: &str) -> String {
    format!("{}{}", a, b)
}
