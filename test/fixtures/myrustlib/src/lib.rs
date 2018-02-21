mod add;

#[no_mangle]
pub fn add(a: i32, b: i32) -> i32 {
    add::add(a, b)
}
