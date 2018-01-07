#[macro_use]
extern crate stdweb;

fn main() {
    stdweb::initialize();
    js! {
        Module.exports.helloWorld = @{hello_world};
    }
}

fn hello_world(mut first_name: String, mut last_name: String) -> String {
    // This is fairly silly code but it is just an example...
    if first_name.is_empty() {
        first_name = "John".to_owned();
    }
    if last_name.is_empty() {
        last_name = "Doe".to_owned();
    }
    let message = format!("Called hello_world({:?}, {:?})", first_name, last_name);
    js! {
        console.log(@{message});
    }
    format!("Hello, {} {}!", first_name, last_name)
}
