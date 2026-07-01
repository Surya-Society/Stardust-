// src/models/etablissement.rs
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone, FromRow)]
pub struct Etablissement {
    pub id_etablissement: String,
    pub nom: String,
    pub sigle: Option<String>,
    pub numero_agrement: String,
    pub numero_fiscal: String,
    pub registre_commerciale: Option<String>,
    pub type_etablissement: String,
    pub statut_juridique: String,
    pub pays: String,
    pub region: String,
    pub ville: String,
    pub commune: Option<String>,
    pub quartier: Option<String>,  // ✅ CORRIGÉ: quartier au lieu de quatier
    pub adresse: String,
    pub code_postal: Option<String>,
    pub telephone_principal: String,
    pub telephone_secondaire: Option<String>,
    pub email: Option<String>,
    pub site_web: Option<String>,
    pub annee_scolaire_debut: String,
    pub annee_scolaire_fin: String,
    pub statut: String,
    pub date_creation: String,
    pub date_modification: Option<String>,
    pub synced: i32,
    pub sync_date: Option<String>,
}

impl Etablissement {
    /// ✅ Vérifie si l'établissement a un ID valide
    pub fn has_valid_id(&self) -> bool {
        !self.id_etablissement.is_empty()
    }
    
    /// ✅ Génère un UUID si l'ID est vide
    pub fn ensure_id(&mut self) {
        if self.id_etablissement.is_empty() {
            self.id_etablissement = Uuid::new_v4().to_string();
        }
    }
    
    /// ✅ Retourne une copie avec un ID garanti non vide
    pub fn with_valid_id(&self) -> Self {
        let mut clone = self.clone();
        clone.ensure_id();
        clone
    }
    
    /// ✅ Vérifie si l'établissement est valide pour synchronisation
    pub fn is_valid_for_sync(&self) -> bool {
        !self.nom.is_empty() 
            && !self.id_etablissement.is_empty()
            && !self.numero_agrement.is_empty()
            && !self.numero_fiscal.is_empty()
            && !self.telephone_principal.is_empty()
    }
    
    /// ✅ Retourne un nom d'affichage
    pub fn display_name(&self) -> String {
        match &self.sigle {
            Some(sigle) if !sigle.is_empty() => format!("{} ({})", self.nom, sigle),
            _ => self.nom.clone(),
        }
    }
    
    /// ✅ Retourne l'adresse complète formatée
    pub fn full_address(&self) -> String {
        let mut parts = Vec::new();
        
        if !self.adresse.is_empty() {
            parts.push(self.adresse.clone());
        }
        if let Some(ref quartier) = self.quartier {
            if !quartier.is_empty() {
                parts.push(quartier.clone());
            }
        }
        if let Some(ref commune) = self.commune {
            if !commune.is_empty() {
                parts.push(commune.clone());
            }
        }
        if !self.ville.is_empty() {
            parts.push(self.ville.clone());
        }
        if !self.region.is_empty() {
            parts.push(self.region.clone());
        }
        if !self.pays.is_empty() {
            parts.push(self.pays.clone());
        }
        if let Some(ref code_postal) = self.code_postal {
            if !code_postal.is_empty() {
                parts.push(code_postal.clone());
            }
        }
        
        parts.join(", ")
    }
    
    /// ✅ Retourne le numéro de téléphone formaté
    pub fn formatted_phone(&self) -> String {
        let phone = self.telephone_principal.trim();
        // Si le numéro commence par 0, ajouter +225 (Côte d'Ivoire)
        if phone.starts_with('0') && phone.len() == 10 {
            format!("+225{}", &phone[1..])
        } else if phone.len() == 9 && phone.chars().all(|c| c.is_ascii_digit()) {
            format!("+225{}", phone)
        } else if phone.starts_with('+') {
            phone.to_string()
        } else {
            phone.to_string()
        }
    }
    
    /// ✅ Vérifie si l'établissement est actif
    pub fn is_active(&self) -> bool {
        self.statut.to_uppercase() == "ACTIF" || self.statut.to_uppercase() == "ACTIVE"
    }
    
    /// ✅ Vérifie si l'établissement est synchronisé
    pub fn is_synced(&self) -> bool {
        self.synced == 1
    }
}

// ================================================================
// EtablissementInfo - Version simplifiée pour les fichiers .licpkg
// ================================================================

/// ✅ Version simplifiée de Etablissement pour le fichier .licpkg
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EtablissementInfo {
    pub id_etablissement: String,
    pub nom: String,
    pub sigle: Option<String>,
    pub numero_agrement: String,
    pub numero_fiscal: String,
    pub registre_commerciale: Option<String>,
    pub type_etablissement: String,  // PUBLIC, PRIVE, MIXTE
    pub statut_juridique: String,     // SARL, SA, ASSOCIATION, GIE, AUTRE
    pub pays: String,
    pub region: String,
    pub ville: String,
    pub commune: Option<String>,
    pub quartier: Option<String>,  // ✅ CORRIGÉ: quartier au lieu de quatier
    pub adresse: String,
    pub code_postal: Option<String>,
    pub telephone_principal: String,
    pub telephone_secondaire: Option<String>,
    pub email: Option<String>,
    pub site_web: Option<String>,
    pub annee_scolaire_debut: String,
    pub annee_scolaire_fin: String,
    pub statut: String,
}

impl EtablissementInfo {
    /// ✅ Convertit EtablissementInfo en Etablissement
    pub fn to_etablissement(&self) -> Etablissement {
        let now = chrono::Utc::now().to_rfc3339();
        
        Etablissement {
            id_etablissement: self.id_etablissement.clone(),
            nom: self.nom.clone(),
            sigle: self.sigle.clone(),
            numero_agrement: self.numero_agrement.clone(),
            numero_fiscal: self.numero_fiscal.clone(),
            registre_commerciale: self.registre_commerciale.clone(),
            type_etablissement: self.type_etablissement.clone(),
            statut_juridique: self.statut_juridique.clone(),
            pays: self.pays.clone(),
            region: self.region.clone(),
            ville: self.ville.clone(),
            commune: self.commune.clone(),
            quartier: self.quartier.clone(),
            adresse: self.adresse.clone(),
            code_postal: self.code_postal.clone(),
            telephone_principal: self.telephone_principal.clone(),
            telephone_secondaire: self.telephone_secondaire.clone(),
            email: self.email.clone(),
            site_web: self.site_web.clone(),
            annee_scolaire_debut: self.annee_scolaire_debut.clone(),
            annee_scolaire_fin: self.annee_scolaire_fin.clone(),
            statut: self.statut.clone(),
            date_creation: now,
            date_modification: None,
            synced: 0,
            sync_date: None,
        }
    }
    
    /// ✅ Génère un ID si vide
    pub fn ensure_id(&mut self) {
        if self.id_etablissement.is_empty() {
            self.id_etablissement = Uuid::new_v4().to_string();
        }
    }
    
    /// ✅ Vérifie si l'établissement est valide
    pub fn is_valid(&self) -> bool {
        !self.nom.is_empty() 
            && !self.id_etablissement.is_empty()
            && !self.numero_agrement.is_empty()
            && !self.numero_fiscal.is_empty()
            && !self.telephone_principal.is_empty()
    }
}

// ================================================================
// TESTS
// ================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_etablissement_ensure_id() {
        let mut etab = Etablissement {
            id_etablissement: String::new(),
            nom: "Test".to_string(),
            sigle: None,
            numero_agrement: "AGR-123".to_string(),
            numero_fiscal: "FISC-123".to_string(),
            registre_commerciale: None,
            type_etablissement: "PRIVE".to_string(),
            statut_juridique: "SARL".to_string(),
            pays: "CI".to_string(),
            region: "Abidjan".to_string(),
            ville: "Abidjan".to_string(),
            commune: None,
            quartier: None,
            adresse: "123 Rue Test".to_string(),
            code_postal: None,
            telephone_principal: "07000000".to_string(),
            telephone_secondaire: None,
            email: None,
            site_web: None,
            annee_scolaire_debut: "2025".to_string(),
            annee_scolaire_fin: "2026".to_string(),
            statut: "ACTIF".to_string(),
            date_creation: chrono::Utc::now().to_rfc3339(),
            date_modification: None,
            synced: 0,
            sync_date: None,
        };
        
        assert!(!etab.has_valid_id());
        etab.ensure_id();
        assert!(etab.has_valid_id());
    }

    #[test]
    fn test_etablissement_display_name() {
        let etab = Etablissement {
            id_etablissement: "id-123".to_string(),
            nom: "École Test".to_string(),
            sigle: Some("ET".to_string()),
            numero_agrement: "AGR-123".to_string(),
            numero_fiscal: "FISC-123".to_string(),
            registre_commerciale: None,
            type_etablissement: "PRIVE".to_string(),
            statut_juridique: "SARL".to_string(),
            pays: "CI".to_string(),
            region: "Abidjan".to_string(),
            ville: "Abidjan".to_string(),
            commune: None,
            quartier: None,
            adresse: "123 Rue Test".to_string(),
            code_postal: None,
            telephone_principal: "07000000".to_string(),
            telephone_secondaire: None,
            email: None,
            site_web: None,
            annee_scolaire_debut: "2025".to_string(),
            annee_scolaire_fin: "2026".to_string(),
            statut: "ACTIF".to_string(),
            date_creation: chrono::Utc::now().to_rfc3339(),
            date_modification: None,
            synced: 0,
            sync_date: None,
        };
        
        assert_eq!(etab.display_name(), "École Test (ET)");
        
        let etab_no_sigle = Etablissement {
            sigle: None,
            ..etab
        };
        assert_eq!(etab_no_sigle.display_name(), "École Test");
    }

    #[test]
    fn test_etablissement_formatted_phone() {
        let mut etab = Etablissement {
            id_etablissement: "id-123".to_string(),
            nom: "Test".to_string(),
            sigle: None,
            numero_agrement: "AGR-123".to_string(),
            numero_fiscal: "FISC-123".to_string(),
            registre_commerciale: None,
            type_etablissement: "PRIVE".to_string(),
            statut_juridique: "SARL".to_string(),
            pays: "CI".to_string(),
            region: "Abidjan".to_string(),
            ville: "Abidjan".to_string(),
            commune: None,
            quartier: None,
            adresse: "123 Rue Test".to_string(),
            code_postal: None,
            telephone_principal: "07000000".to_string(),
            telephone_secondaire: None,
            email: None,
            site_web: None,
            annee_scolaire_debut: "2025".to_string(),
            annee_scolaire_fin: "2026".to_string(),
            statut: "ACTIF".to_string(),
            date_creation: chrono::Utc::now().to_rfc3339(),
            date_modification: None,
            synced: 0,
            sync_date: None,
        };
        
        assert_eq!(etab.formatted_phone(), "+2257000000");
        
        etab.telephone_principal = "+22570000000".to_string();
        assert_eq!(etab.formatted_phone(), "+22570000000");
    }

    #[test]
    fn test_etablissement_is_active() {
        let mut etab = Etablissement {
            id_etablissement: "id-123".to_string(),
            nom: "Test".to_string(),
            sigle: None,
            numero_agrement: "AGR-123".to_string(),
            numero_fiscal: "FISC-123".to_string(),
            registre_commerciale: None,
            type_etablissement: "PRIVE".to_string(),
            statut_juridique: "SARL".to_string(),
            pays: "CI".to_string(),
            region: "Abidjan".to_string(),
            ville: "Abidjan".to_string(),
            commune: None,
            quartier: None,
            adresse: "123 Rue Test".to_string(),
            code_postal: None,
            telephone_principal: "07000000".to_string(),
            telephone_secondaire: None,
            email: None,
            site_web: None,
            annee_scolaire_debut: "2025".to_string(),
            annee_scolaire_fin: "2026".to_string(),
            statut: "ACTIF".to_string(),
            date_creation: chrono::Utc::now().to_rfc3339(),
            date_modification: None,
            synced: 0,
            sync_date: None,
        };
        
        assert!(etab.is_active());
        
        etab.statut = "INACTIF".to_string();
        assert!(!etab.is_active());
    }
}