#![feature(proc_macro)]

#[macro_use]
extern crate stdweb;

use stdweb::js_export;

fn main() {}

#[js_export]
fn add(a: String, b: String) -> String {
    a + &b
}
