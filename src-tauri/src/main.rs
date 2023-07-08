// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use serde::{Serialize,Deserialize};
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello Hey, {}! You've been greeted from Rust!", name)
}
#[derive(Deserialize,Serialize,Debug,Default)]
struct Merchandise{
    name:String,
    price:i32,
    amount:i32,
}
#[derive(Deserialize,Serialize,Debug,Default)]
struct MerchandiseDTO{
    merchandises:Vec<Merchandise>,
    minum_threshold:f64,
}
trait Caculator {
    fn caculate_discount(&self)->();
}
impl Caculator for Vec<Merchandise>{
    fn caculate_discount(&self)->() {
        let price:Vec<i32> = self.iter().map(|m|m.price).collect();
        let seed = vec![0;self.len()];
        let mut stack = vec![seed];
        while let Some(quantitiy_candidate) = stack.pop() {
            
        }
    }
}
#[tauri::command]
fn max_discount(merchandise_dto:MerchandiseDTO)->Vec<Merchandise>{
    println!("hi");
    println!("threshold:{}",merchandise_dto.minum_threshold);

    //format!("first_merchandise: {:?}",merchandises[1])
    //merchandises_info.merchandises
    merchandise_dto.merchandises
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet,max_discount])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
