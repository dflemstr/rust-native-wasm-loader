#[macro_use]
extern crate stdweb;

fn main() {
    stdweb::initialize();

    js! {
        Module.exports.add = @{add};
    }
}

fn add(a: i32, b: i32) -> i32 {
    a + b
}
