#![feature(proc_macro, wasm_custom_section, wasm_import_module)]

extern crate wasm_bindgen;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub extern fn add(a: &str, b: &str) -> String {
    format!("{}{}", a, b)
}
