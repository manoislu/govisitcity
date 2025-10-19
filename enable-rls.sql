-- Activer RLS sur toutes les tables
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_plans ENABLE ROW LEVEL SECURITY;

-- Politiques pour la table activities
-- Tout le monde peut lire les activités actives
CREATE POLICY "Les activités actives sont visibles par tous" ON activities
    FOR SELECT USING (is_active = true);

-- Personne ne peut modifier/supprimer les activités (sauf via le service role)
CREATE POLICY "Personne ne peut modifier les activités" ON activities
    FOR INSERT WITH CHECK (false);
CREATE POLICY "Personne ne peut supprimer les activités" ON activities
    FOR UPDATE USING (false);
CREATE POLICY "Personne ne peut delete les activités" ON activities
    FOR DELETE USING (false);

-- Politiques pour la table travel_plans
-- Seuls les créateurs peuvent voir leurs plans
CREATE POLICY "Les utilisateurs peuvent voir leurs propres plans" ON travel_plans
    FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

-- Seuls les créateurs peuvent insérer des plans
CREATE POLICY "Les utilisateurs peuvent créer leurs propres plans" ON travel_plans
    FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Seuls les créateurs peuvent modifier leurs plans
CREATE POLICY "Les utilisateurs peuvent modifier leurs propres plans" ON travel_plans
    FOR UPDATE USING (user_id = auth.uid() OR user_id IS NULL);

-- Seuls les créateurs peuvent supprimer leurs plans
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres plans" ON travel_plans
    FOR DELETE USING (user_id = auth.uid() OR user_id IS NULL);