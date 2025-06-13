-- ========================================
-- DONNÉES INITIALES DES ABONNEMENTS
-- ========================================

-- Plans d'abonnement
INSERT INTO subscription_plans (
    name, 
    description, 
    price_monthly, 
    price_yearly, 
    max_pets, 
    features, 
    trial_days
) VALUES
-- Plan Basic
(
    'Basic', 
    'Plan idéal pour débuter avec un animal de compagnie. Accès aux fonctionnalités essentielles de suivi et de santé.',
    9.99, 
    99.90, 
    1,
    '{
        "health_tracking": true,
        "activity_monitoring": true,
        "basic_analytics": true,
        "email_support": true,
        "mobile_app": true,
        "daily_reports": true,
        "basic_alerts": true,
        "data_export": false,
        "vet_integration": false,
        "premium_support": false,
        "family_sharing": false,
        "advanced_analytics": false
    }',
    14
),
-- Plan Premium
(
    'Premium',
    'Notre plan le plus populaire. Parfait pour les propriétaires dévoués avec plusieurs animaux.',
    19.99,
    199.90,
    3,
    '{
        "health_tracking": true,
        "activity_monitoring": true,
        "basic_analytics": true,
        "email_support": true,
        "mobile_app": true,
        "daily_reports": true,
        "basic_alerts": true,
        "data_export": true,
        "vet_integration": true,
        "premium_support": true,
        "family_sharing": false,
        "advanced_analytics": true,
        "custom_alerts": true,
        "behavioral_analysis": true,
        "health_predictions": true,
        "video_consultations": 2
    }',
    14
),
-- Plan Family
(
    'Family',
    'Solution complète pour les familles avec plusieurs animaux. Accès illimité à toutes les fonctionnalités.',
    29.99,
    299.90,
    10,
    '{
        "health_tracking": true,
        "activity_monitoring": true,
        "basic_analytics": true,
        "email_support": true,
        "mobile_app": true,
        "daily_reports": true,
        "basic_alerts": true,
        "data_export": true,
        "vet_integration": true,
        "premium_support": true,
        "family_sharing": true,
        "advanced_analytics": true,
        "custom_alerts": true,
        "behavioral_analysis": true,
        "health_predictions": true,
        "video_consultations": "unlimited",
        "priority_support": true,
        "emergency_assistance": true,
        "multi_user_access": true,
        "wellness_coaching": true
    }',
    14
);

-- Codes promo de lancement
INSERT INTO promo_codes (
    code,
    description,
    discount_type,
    discount_value,
    max_uses,
    valid_from,
    valid_until,
    applies_to,
    is_active
) VALUES
-- Code de lancement
(
    'LAUNCH2024',
    'Offre de lancement : -30% sur tous les abonnements',
    'percentage',
    30.00,
    1000,
    '2024-01-01 00:00:00',
    '2024-03-31 23:59:59',
    '{"all": true}',
    true
),
-- Code parrainage
(
    'FRIEND2024',
    'Parrainage : -20% sur le premier mois',
    'percentage',
    20.00,
    null,
    '2024-01-01 00:00:00',
    '2024-12-31 23:59:59',
    '{"all": true}',
    true
),
-- Offre premium
(
    'PREMIUM50',
    '50€ de réduction sur l''abonnement Premium annuel',
    'fixed_amount',
    50.00,
    500,
    '2024-01-01 00:00:00',
    '2024-06-30 23:59:59',
    '{"plans": ["Premium"], "billing_cycle": ["yearly"]}',
    true
),
-- Offre famille
(
    'FAMILY100',
    '100€ de réduction sur l''abonnement Family annuel',
    'fixed_amount',
    100.00,
    250,
    '2024-01-01 00:00:00',
    '2024-06-30 23:59:59',
    '{"plans": ["Family"], "billing_cycle": ["yearly"]}',
    true
); 