use wasm_bindgen::prelude::*;
use sha2::{Sha256, Digest};

#[wasm_bindgen]
pub fn process_and_hash_text(text: &str) -> String {
    // Normalize: lowercase and keep only alphanumeric characters to reduce sensitivity
    let normalized_text: String = text
        .to_lowercase()
        .chars()
        .filter(|c| c.is_alphanumeric() || c.is_whitespace())
        .collect();

    // Create a set of unique words (shingles) to represent the content
    let mut words: Vec<&str> = normalized_text.split_whitespace().collect();
    words.sort_unstable();
    words.dedup();

    // Join unique sorted words to create a representative string
    let representative_string = words.join(" ");
    
    // Create a Sha256 object
    let mut hasher = Sha256::new();

    // Write input string
    hasher.update(representative_string.as_bytes());

    // Read hash digest and format it as a hex string
    let result = hasher.finalize();
    format!("{:x}", result)
}
