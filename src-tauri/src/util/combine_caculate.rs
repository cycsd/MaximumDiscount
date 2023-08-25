use std::collections::HashMap;

use crate::{Combine, CombineList, Merchandise, MerchandiseDTO, Price};

use self::privat_combine_caculate::PrivateCaculate;

mod privat_combine_caculate {
    use crate::Combine;

    pub trait PrivateCaculate {
        fn caculate_discount(&self, minimum_threshold: f64, discount: f64) -> Vec<Combine>;
    }
}

type PriceCombines<'a> = Vec<&'a String>;
impl PrivateCaculate for Vec<Merchandise> {
    fn caculate_discount(&self, minimum_threshold: f64, discount: f64) -> Vec<Combine> {
        let map: HashMap<&String, usize> = self
            .iter()
            .map(|m| &m.name)
            .enumerate()
            .map(|(i, name)| (name, i))
            .collect();
        let mut stack: Vec<(PriceCombines, &[Merchandise], Price)> = vec![(vec![], self, 0.0)];
        let mut result = vec![];
        while let Some((combine, choice, price)) = stack.pop() {
            if price >= minimum_threshold {
                result.push((combine, price));
                continue;
            }
            choice.iter().enumerate().for_each(|(index, select)| {
                let mut new_combine = combine.clone();
                new_combine.push(&select.name);
                stack.push((new_combine, &choice[index..], price + select.price));
            })
        }
        result
            .into_iter()
            .map(|(combines, price)| {
                let quantities_combine = combines.iter().fold(
                    vec![0; self.len()],
                    |mut amount_combines, merchant_name| {
                        let &index = map.get(merchant_name).expect("name must exist in map");
                        amount_combines[index] += 1;
                        amount_combines
                    },
                );
                let total_amount = (0..self.len())
                    .map(|index| {
                        let amount = self[index].amount;
                        let quantity = quantities_combine[index];
                        amount * quantity
                    })
                    .sum::<i32>() as f64;
                let discount_price = price - discount;
                Combine {
                    total_amount: total_amount as i32,
                    price,
                    discount_price,
                    quantities_combine,
                    cost_per_unit: discount_price / total_amount,
                    cost_performance_ratio: total_amount / discount_price,
                }
            })
            .collect()
    }
}

pub trait Caculator {
    fn find_max_discount(self) -> CombineList;
}
impl Caculator for MerchandiseDTO {
    fn find_max_discount(self) -> CombineList {
        let (mut merchandises, minimum_threshold, discount) =
            (self.merchandises, self.minimum_threshold, self.discount);
        merchandises.sort_unstable_by(|a, b| {
            a.price
                .partial_cmp(&b.price)
                .expect("price is correct number")
        });
        let mut combines = merchandises.caculate_discount(minimum_threshold, discount);
        combines.sort_by(|a, b| a.cost_per_unit.partial_cmp(&b.cost_per_unit).unwrap());

        CombineList {
            merchandises,
            combines,
            minimum_threshold,
            discount,
        }
    }
}
