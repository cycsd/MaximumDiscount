// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
use util::combine_caculate::*;
mod util;

type Quantities = Vec<i32>;
type Price = f64;
#[derive(Deserialize, Serialize, Debug, Default)]
pub struct Merchandise {
    name: String,
    price: Price,
    amount: i32,
}
#[derive(Deserialize, Serialize, Debug, Default)]
struct MerchandiseDTO {
    merchandises: Vec<Merchandise>,
    minimum_threshold: f64,
    discount: f64,
}
#[derive(Deserialize, Serialize, Debug, Default)]
pub struct Combine {
    total_amount: i32,
    price: Price,
    discount_price: Price,
    quantities_combine: Quantities,
    cost_performance_ratio: f64,
    cost_per_unit: f64,
}

#[derive(Deserialize, Serialize, Debug, Default)]
pub struct CombineList {
    merchandises: Vec<Merchandise>,
    combines: Vec<Combine>,
    minimum_threshold: Price,
    discount: Price,
}

#[tauri::command]
fn max_discount(merchandise_dto: MerchandiseDTO) -> CombineList {
    merchandise_dto.find_max_discount()
}

#[tauri::command]
fn save_merchandise(file_path: &str, merchandise_dto: MerchandiseDTO) -> Result<(), String> {
    std::fs::write(
        file_path,
        serde_json::to_string_pretty(&merchandise_dto).unwrap(),
    )
    .map_err(|err| err.to_string())
}
#[tauri::command]
fn import_merchandise(file_path: &str) -> Result<MerchandiseDTO, String> {
    std::fs::read_to_string(file_path)
        .map_err(|err| err.to_string())
        .and_then(|st| serde_json::from_str::<MerchandiseDTO>(&st).map_err(|err| err.to_string()))
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            max_discount,
            save_merchandise,
            import_merchandise
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
