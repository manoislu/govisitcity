-- =============================================
-- POLITIQUES DE SÉCURITÉ RLS (ROW LEVEL SECURITY)
-- =============================================

-- Activer RLS sur toutes les tables
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_plans ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLITIQUES POUR LA TABLE activities
-- =============================================

-- Politique : Tout le monde peut lire les activités actives
CREATE POLICY "Les activités actives sont visibles par tout le monde" ON activities
    FOR SELECT USING (is_active = true);

-- Politique : Personne ne peut modifier/supprimer les activités (protégées)
CREATE POLICY "Personne ne peut modifier les activités" ON activities
    FOR UPDATE USING (false);

CREATE POLICY "Personne ne peut supprimer les activités" ON activities
    FOR DELETE USING (false);

-- Politique : Insertion d'activités (si nécessaire pour l'IA)
CREATE POLICY "Permettre l'insertion d'activités" ON activities
    FOR INSERT WITH CHECK (true);

-- =============================================
-- POLITIQUES POUR LA TABLE travel_plans
-- =============================================

-- Politique : Seuls les propriétaires peuvent voir leurs plans
CREATE POLICY "Les utilisateurs ne voient que leurs propres plans" ON travel_plans
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true) OR user_id IS NULL);

-- Politique : Les utilisateurs peuvent créer leurs propres plans
CREATE POLICY "Les utilisateurs peuvent créer leurs propres plans" ON travel_plans
    FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', true) OR user_id IS NULL);

-- Politique : Les utilisateurs peuvent modifier leurs propres plans
CREATE POLICY "Les utilisateurs peuvent modifier leurs propres plans" ON travel_plans
    FOR UPDATE USING (user_id = current_setting('app.current_user_id', true) OR user_id IS NULL);

-- Politique : Les utilisateurs peuvent supprimer leurs propres plans
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres plans" ON travel_plans
    FOR DELETE USING (user_id = current_setting('app.current_user_id', true) OR user_id IS NULL);

-- =============================================
-- CRÉATION D'UN UTILISATEUR SERVICE POUR L'IA
-- =============================================

-- Créer un rôle service pour les opérations automatisées
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
        CREATE ROLE service_role;
    END IF;
END
$$;

-- Donner les permissions nécessaires au service_role
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON activities TO service_role;
GRANT ALL ON travel_plans TO service_role;

-- =============================================
-- INDEX POUR OPTIMISER LES PERFORMANCES
-- =============================================

-- Index pour les activités
CREATE INDEX IF NOT EXISTS idx_activities_city_active ON activities(city, is_active);
CREATE INDEX IF NOT EXISTS idx_activities_category ON activities(category);
CREATE INDEX IF NOT EXISTS idx_activities_popular ON activities(is_popular);

-- Index pour les travel_plans
CREATE INDEX IF NOT EXISTS idx_travel_plans_user_id ON travel_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_plans_city ON travel_plans(city);
CREATE INDEX IF NOT EXISTS idx_travel_plans_created_at ON travel_plans(created_at);

-- =============================================
-- VALIDATION DES DONNÉES
-- =============================================

-- Ajouter des contraintes de validation
ALTER TABLE activities 
ADD CONSTRAINT check_rating_range CHECK (rating >= 0 AND rating <= 5),
ADD CONSTRAINT check_duration_format CHECK (duration ~ '^[0-9]+h[0-9]*$|^[0-9]+h[0-9]+min$|^[0-9]+min$');

ALTER TABLE travel_plans 
ADD CONSTRAINT check_participants_positive CHECK (participants > 0),
ADD CONSTRAINT check_dates_order CHECK (end_date >= start_date);

-- =============================================
-- AUDIT ET LOGGING
-- =============================================

-- Créer une table d'audit pour suivre les modifications
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    user_id TEXT,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger pour l'audit des activités
CREATE OR REPLACE FUNCTION audit_activities()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (table_name, operation, user_id, old_values, new_values)
    VALUES (
        'activities',
        TG_OP,
        current_setting('app.current_user_id', true),
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger
DROP TRIGGER IF EXISTS activities_audit_trigger ON activities;
CREATE TRIGGER activities_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON activities
    FOR EACH ROW EXECUTE FUNCTION audit_activities();

COMMIT;