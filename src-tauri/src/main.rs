// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

type Quantities = Vec<i32>;
type Price = f64;
#[derive(Deserialize, Serialize, Debug, Default)]
struct Merchandise {
    name: String,
    price: Price,
    amount: i32,
}
#[derive(Deserialize, Serialize, Debug, Default)]
struct MerchandiseDTO {
    merchandises: Vec<Merchandise>,
    minimum_threshold: Price,
    discount: Price,
}
#[derive(Deserialize, Serialize, Debug, Default)]
struct Combine {
    total_amount:i32,
    price: Price,
    discount_price: Price,
    quantities_combine: Quantities,
    cost_performance_ratio: f64,
    cost_per_unit: f64,
}

#[derive(Deserialize, Serialize, Debug, Default)]
struct CombineList {
    merchandises: Vec<Merchandise>,
    combines: Vec<Combine>,
    minimum_threshold: Price,
    discount: Price,
}
trait Caculator {
    fn caculate_discount(&self, minimum_threshold: f64, discount: f64) -> Vec<Combine>;
}
impl Caculator for Vec<Merchandise> {
    fn caculate_discount(&self, minimum_threshold: f64, discount: f64) -> Vec<Combine> {
        let seed: (Quantities, Price) = (vec![0; self.len()], 0.0);
        let mut stack: Vec<(Quantities, Price)> = vec![seed];
        let mut visited: HashSet<Quantities> = HashSet::new();
        let mut result: Vec<(Quantities, Price)> = vec![];
        while let Some((mut quantitiy_candidate, price)) = stack.pop() {
            if price >= minimum_threshold {
                result.push((quantitiy_candidate, price));
                continue;
            }
            (0..self.len()).for_each(|index| {
                quantitiy_candidate[index] += 1;
                if !visited.contains(&quantitiy_candidate) {
                    let merchandise = &self[index];
                    let add_price = merchandise.price;
                    let new_candidate = quantitiy_candidate.clone();
                    stack.push((new_candidate, price + add_price));
                    visited.insert(quantitiy_candidate.clone());
                }
                quantitiy_candidate[index] -= 1;
            })
        }
        result
            .into_iter()
            .map(|(quantities, price)| {
                let total_amount = (0..self.len())
                    .map(|index| {
                        let amount = self[index].amount;
                        let quantity = quantities[index];
                        amount * quantity
                    })
                    .sum::<i32>() as f64;
                let discount_price = price - discount;
                Combine {
                    total_amount:total_amount as i32,
                    price,
                    discount_price,
                    quantities_combine: quantities,
                    cost_per_unit: discount_price / total_amount,
                    cost_performance_ratio: total_amount / discount_price,
                }
            })
            .collect()
    }
}
#[tauri::command]
fn max_discount(merchandise_dto: MerchandiseDTO) -> CombineList {
    let (merchandises, minimum_threshold, discount) = (
        merchandise_dto.merchandises,
        merchandise_dto.minimum_threshold,
        merchandise_dto.discount,
    );
    let mut combines = merchandises.caculate_discount(minimum_threshold, discount);
    combines.sort_by(|a, b| a.cost_per_unit.partial_cmp(&b.cost_per_unit).unwrap());

    CombineList {
        merchandises,
        combines,
        minimum_threshold,
        discount,
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            max_discount])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
