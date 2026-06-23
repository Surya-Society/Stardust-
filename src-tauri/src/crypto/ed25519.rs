// src/crypto/ed25519.rs
use ring::signature::{Ed25519KeyPair, KeyPair, UnparsedPublicKey, ED25519};
use ring::rand::SystemRandom;
use base64::{Engine as _, engine::general_purpose::STANDARD as base64_engine};
use serde_json::json;
use chrono::{DateTime, Utc};
use log::{info, warn, error};
use std::fs;
use std::path::PathBuf;

pub struct LicenseSigner {
    key_pair: Ed25519KeyPair,
    public_key: Vec<u8>,
}

impl LicenseSigner {
    /// ✅ En production, utilise une clé fixe stockée sur le disque
    pub fn new() -> Self {
        let key_path = Self::get_key_path();
        
        if key_path.exists() {
            // Charger la clé existante
            info!("🔑 Loading existing Ed25519 key from: {:?}", key_path);
            let key_data = fs::read(&key_path).expect("Failed to read private key");
            let key_pair = Ed25519KeyPair::from_pkcs8(&key_data)
                .map_err(|e| {
                    error!("❌ Failed to parse private key: {}", e);
                    e
                })
                .expect("Failed to parse private key");
            let public_key = key_pair.public_key().as_ref().to_vec();
            
            Self { key_pair, public_key }
        } else {
            // Générer une nouvelle clé et la sauvegarder
            info!("🔑 Generating new Ed25519 key pair...");
            let rng = SystemRandom::new();
            let pkcs8_bytes = Ed25519KeyPair::generate_pkcs8(&rng)
                .expect("Failed to generate Ed25519 key pair");
            
            // Sauvegarder la clé privée
            if let Some(parent) = key_path.parent() {
                if let Err(e) = fs::create_dir_all(parent) {
                    error!("❌ Failed to create key directory: {}", e);
                }
            }
            if let Err(e) = fs::write(&key_path, pkcs8_bytes.as_ref()) {
                error!("❌ Failed to save private key: {}", e);
            } else {
                info!("✅ Ed25519 key pair saved to: {:?}", key_path);
            }
            
            let key_pair = Ed25519KeyPair::from_pkcs8(pkcs8_bytes.as_ref())
                .expect("Failed to create key pair from PKCS8");
            let public_key = key_pair.public_key().as_ref().to_vec();
            
            info!("✅ Ed25519 key pair generated and saved");
            
            Self { key_pair, public_key }
        }
    }

    /// Chemin où stocker la clé privée
    fn get_key_path() -> PathBuf {
        let config_dir = dirs::config_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("surya");
        
        config_dir.join("licence_private_key.pem")
    }

    /// 🔐 Signer les données de la licence (avec clé privée + challenge)
    pub fn sign_licence_data(
        &self,
        licence_key: &str,
        licence_id: &str,
        expiry_date: &DateTime<Utc>,
        challenge: &str,  // ✅ AJOUTER challenge
    ) -> Result<String, Box<dyn std::error::Error>> {
        let data = json!({
            "licence_key": licence_key,
            "licence_id": licence_id,
            "expiry": expiry_date.to_rfc3339(),
            "challenge": challenge,  // ✅ Inclure le challenge
        });
        
        let data_str = serde_json::to_string(&data)?;
        let signature = self.key_pair.sign(data_str.as_bytes());
        
        Ok(base64_engine.encode(signature.as_ref()))
    }

    /// ✅ Vérifier la signature (avec clé publique + challenge)
    pub fn verify_license_signature(
        &self,
        licence_key: &str,
        signature_base64: &str,
        public_key_base64: &str,
        challenge: &str,  // ✅ AJOUTER challenge
    ) -> Result<bool, Box<dyn std::error::Error>> {
        let signature_bytes = base64_engine.decode(signature_base64)?;
        let public_key_bytes = base64_engine.decode(public_key_base64)?;
        
        // ✅ Les données signées doivent inclure le challenge
        let data = json!({
            "licence_key": licence_key,
            "challenge": challenge,  // ✅ Inclure le challenge
        });
        let data_str = serde_json::to_string(&data)?;
        
        let public_key = UnparsedPublicKey::new(&ED25519, public_key_bytes);
        let result = public_key.verify(data_str.as_bytes(), &signature_bytes);
        
        Ok(result.is_ok())
    }

    /// Vérifier un challenge-response (pour USB)
    pub fn verify_challenge(
        &self,
        challenge: &str,
        signature_base64: &str,
        public_key_base64: &str,
    ) -> Result<bool, Box<dyn std::error::Error>> {
        let signature_bytes = base64_engine.decode(signature_base64)?;
        let public_key_bytes = base64_engine.decode(public_key_base64)?;
        
        let public_key = UnparsedPublicKey::new(&ED25519, public_key_bytes);
        let result = public_key.verify(challenge.as_bytes(), &signature_bytes);
        
        Ok(result.is_ok())
    }

    /// Générer un challenge aléatoire (pour USB)
    pub fn generate_challenge(&self) -> String {
        use rand::RngCore;
        let mut rng = rand::thread_rng();
        let mut challenge = vec![0u8; 32];
        rng.fill_bytes(&mut challenge);
        base64_engine.encode(&challenge)
    }

    /// 🔓 Obtenir la clé publique en base64
    pub fn get_public_key_base64(&self) -> Result<String, Box<dyn std::error::Error>> {
        Ok(base64_engine.encode(&self.public_key))
    }

    /// 🔓 Obtenir la clé publique (raw)
    pub fn get_public_key(&self) -> &[u8] {
        &self.public_key
    }
}

impl Default for LicenseSigner {
    fn default() -> Self {
        Self::new()
    }
}