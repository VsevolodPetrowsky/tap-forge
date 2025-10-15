use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use sha3::{Digest, Keccak256};

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[derive(Serialize, Deserialize)]
pub struct RewardPrediction {
    pub base_reward: u64,
    pub multiplier: u32,
    pub is_critical: bool,
    pub total_reward: u64,
}

/// Predict reward for a given tap without blockchain call
/// Uses local PRNG seeded with user address and block number
#[wasm_bindgen]
pub fn predict_tap_reward(
    user_address: &str,
    miner_power: u64,
    taps_since_critical: u32,
    block_number: u64,
    nonce: u32,
) -> JsValue {
    let seed = generate_seed(user_address, block_number, nonce);
    let random_value = calculate_random_value(&seed);

    // Calculate critical chance with pity system
    let base_critical_chance = 10; // 10%
    let pity_bonus = (taps_since_critical / 50).min(40); // Up to +40% at 2000 taps
    let critical_chance = base_critical_chance + pity_bonus;

    let is_critical = (random_value % 100) < critical_chance as u64;

    let multiplier = if is_critical {
        determine_critical_multiplier(random_value)
    } else {
        1
    };

    let base_reward = miner_power;
    let total_reward = base_reward * multiplier as u64;

    let prediction = RewardPrediction {
        base_reward,
        multiplier,
        is_critical,
        total_reward,
    };

    serde_wasm_bindgen::to_value(&prediction).unwrap()
}

/// Generate deterministic seed from user address and block data
fn generate_seed(user_address: &str, block_number: u64, nonce: u32) -> [u8; 32] {
    let mut hasher = Keccak256::new();
    hasher.update(user_address.as_bytes());
    hasher.update(&block_number.to_be_bytes());
    hasher.update(&nonce.to_be_bytes());

    let result = hasher.finalize();
    let mut seed = [0u8; 32];
    seed.copy_from_slice(&result);
    seed
}

/// Calculate pseudo-random value from seed
fn calculate_random_value(seed: &[u8; 32]) -> u64 {
    let mut value = 0u64;
    for (i, &byte) in seed.iter().take(8).enumerate() {
        value |= (byte as u64) << (i * 8);
    }
    value
}

/// Determine critical multiplier based on random value
/// x2 (70%), x5 (20%), x10 (9%), x50 (1%)
fn determine_critical_multiplier(random_value: u64) -> u32 {
    let roll = (random_value % 100) as u32;

    if roll < 70 {
        2  // 70% chance
    } else if roll < 90 {
        5  // 20% chance
    } else if roll < 99 {
        10 // 9% chance
    } else {
        50 // 1% chance
    }
}

/// Hash user address for commit-reveal scheme
#[wasm_bindgen]
pub fn hash_tap_commit(user_address: &str, nonce: u32, secret: &str) -> String {
    let mut hasher = Keccak256::new();
    hasher.update(user_address.as_bytes());
    hasher.update(&nonce.to_be_bytes());
    hasher.update(secret.as_bytes());

    let result = hasher.finalize();
    format!("0x{}", hex::encode(result))
}

/// Calculate total miner power from array of miner levels and base powers
#[wasm_bindgen]
pub fn calculate_total_power(levels: Vec<u32>, base_powers: Vec<u64>) -> u64 {
    levels
        .iter()
        .zip(base_powers.iter())
        .map(|(level, power)| power * (*level as u64 + 1))
        .sum()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_seed_generation() {
        let seed1 = generate_seed("0x123", 1000, 1);
        let seed2 = generate_seed("0x123", 1000, 1);
        let seed3 = generate_seed("0x123", 1001, 1);

        assert_eq!(seed1, seed2);
        assert_ne!(seed1, seed3);
    }

    #[test]
    fn test_critical_multipliers() {
        // Test multiplier distribution
        for value in 0..100 {
            let mult = determine_critical_multiplier(value);
            assert!(mult == 2 || mult == 5 || mult == 10 || mult == 50);
        }
    }

    #[test]
    fn test_total_power() {
        let levels = vec![0, 1, 2];
        let powers = vec![100, 200, 300];
        let total = calculate_total_power(levels, powers);

        // (100 * 1) + (200 * 2) + (300 * 3) = 100 + 400 + 900 = 1400
        assert_eq!(total, 1400);
    }
}
