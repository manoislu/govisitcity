-- Création de la table des activités
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  duration TEXT NOT NULL,
  rating DECIMAL(3,2),
  price TEXT,
  image TEXT,
  theme TEXT,
  is_popular BOOLEAN DEFAULT FALSE,
  city TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Création de la table des plans de voyage
CREATE TABLE IF NOT EXISTS travel_plans (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  city TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  participants INTEGER NOT NULL,
  budget TEXT,
  activities JSONB NOT NULL,
  itinerary JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id TEXT DEFAULT 'default_user'
);

-- Création des indexes pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_activities_city ON activities(city);
CREATE INDEX IF NOT EXISTS idx_activities_category ON activities(category);
CREATE INDEX IF NOT EXISTS idx_activities_is_active ON activities(is_active);
CREATE INDEX IF NOT EXISTS idx_activities_is_popular ON activities(is_popular);
CREATE INDEX IF NOT EXISTS idx_travel_plans_user_id ON travel_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_plans_city ON travel_plans(city);

-- Insertion d'activités exemples pour Paris
INSERT INTO activities (id, name, description, category, duration, rating, price, image, theme, is_popular, city, is_active) VALUES
('act_1', 'Visite de la Tour Eiffel', 'Montez au sommet de la Tour Eiffel pour une vue panoramique exceptionnelle sur Paris.', 'Culture', '2h30', 4.8, '€€', 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%234F46E5" width="400" height="300"/%3E%3Ctext x="200" y="150" text-anchor="middle" fill="white" font-family="Arial" font-size="16"%3ETour Eiffel%3C/text%3E%3C/svg%3E', 'Culturel', true, 'Paris', true),
('act_2', 'Croisière sur la Seine', 'Profitez d une croisière romantique sur la Seine pour admirer les monuments de Paris.', 'Romantique', '1h30', 4.6, '€€€', 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%234F46E5" width="400" height="300"/%3E%3Ctext x="200" y="150" text-anchor="middle" fill="white" font-family="Arial" font-size="16"%3ECroisière Seine%3C/text%3E%3C/svg%3E', 'Romantique', true, 'Paris', true),
('act_3', 'Musée du Louvre', 'Explorez la plus grande collection d art du monde au célèbre Musée du Louvre.', 'Culture', '3h', 4.9, '€€', 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%234F46E5" width="400" height="300"/%3E%3Ctext x="200" y="150" text-anchor="middle" fill="white" font-family="Arial" font-size="16"%3EMusée du Louvre%3C/text%3E%3C/svg%3E', 'Culturel', true, 'Paris', true),
('act_4', 'Montmartre et Sacré-Cœur', 'Promenez-vous dans le quartier artistique de Montmartre et visitez la basilique du Sacré-Cœur.', 'Culture', '2h', 4.7, 'Gratuit', 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%234F46E5" width="400" height="300"/%3E%3Ctext x="200" y="150" text-anchor="middle" fill="white" font-family="Arial" font-size="16"%3EMontmartre%3C/text%3E%3C/svg%3E', 'Culturel', true, 'Paris', true),
('act_5', 'Dégustation de pâtisseries', 'Savourez les meilleures pâtisseries parisiennes dans une boulangerie traditionnelle.', 'Gastronomie', '1h', 4.5, '€', 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%234F46E5" width="400" height="300"/%3E%3Ctext x="200" y="150" text-anchor="middle" fill="white" font-family="Arial" font-size="16"%3EPâtisseries%3C/text%3E%3C/svg%3E', 'Gastronomique', false, 'Paris', true)
ON CONFLICT (id) DO NOTHING;