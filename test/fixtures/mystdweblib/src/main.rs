#[macro_use]
extern crate stdweb;

fn main() {
    stdweb::initialize();

    js! {
        Module.exports.add = @{add};
    }
}

fn add(a: String, b: String) -> String {
    a + &b
}
