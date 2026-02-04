use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn move_player(x: i32, y: i32, key: &str) -> Vec<i32> {
    let mut nx = x;
    let mut ny = y;

    match key {
        "w" => ny -= 5,
        "s" => ny += 5,
        "a" => nx -= 5,
        "d" => nx += 5,
        _ => {}
    }

    vec![nx, ny]
}
