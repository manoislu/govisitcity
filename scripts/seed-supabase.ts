import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Sample activities pour Supabase (même données que le seed local)
const supabaseActivities = [
  // Paris Activities
  {
    name: "Tour Eiffel",
    description: "Visite iconique de la tour Eiffel avec vue panoramique sur Paris",
    category: "Culture",
    duration: "2h",
    rating: 4.8,
    price: "€€€",
    city: "Paris",
    theme: "Culturel",
    isPopular: true,
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%2387CEEB' width='400' height='300'/%3E%3Cpolygon fill='%23654321' points='200,50 180,200 220,200'/%3E%3Cpolygon fill='%238B4513' points='200,50 170,200 230,200'/%3E%3Ctext x='200' y='250' text-anchor='middle' fill='white' font-family='Arial' font-size='16'%3ETour Eiffel%3C/text%3E%3C/svg%3E"
  },
  {
    name: "Musée du Louvre",
    description: "Plus grand musée du monde avec la Joconde et des chefs-d'œuvre",
    category: "Culture",
    duration: "4h",
    rating: 4.9,
    price: "€€",
    city: "Paris",
    theme: "Culturel",
    isPopular: true,
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23F5F5DC' width='400' height='300'/%3E%3Cpolygon fill='%238B7355' points='200,80 150,150 250,150'/%3E%3Crect fill='%23D2691E' x='180' y='150' width='40' height='100'/%3E%3Ctext x='200' y='250' text-anchor='middle' fill='black' font-family='Arial' font-size='16'%3EMusée du Louvre%3C/text%3E%3C/svg%3E"
  },
  {
    name: "Croisière sur la Seine",
    description: "Croisière romantique sur la Seine pour admirer les monuments",
    category: "Romantique",
    duration: "1h30",
    rating: 4.6,
    price: "€€",
    city: "Paris",
    theme: "Romantique",
    isPopular: true,
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%234682B4' width='400' height='300'/%3E%3Cellipse fill='%2332CD32' cx='100' cy='250' rx='80' ry='30'/%3E%3Cellipse fill='%2332CD32' cx='300' cy='250' rx='80' ry='30'/%3E%3Cpath fill='white' d='M50,200 Q200,180 350,200 L350,250 Q200,230 50,250 Z'/%3E%3Ctext x='200' y='280' text-anchor='middle' fill='white' font-family='Arial' font-size='16'%3ECroisière Seine%3C/text%3E%3C/svg%3E"
  },
  {
    name: "Montmartre et Sacré-Cœur",
    description: "Quartier bohème avec artistes de rue et vue imprenable",
    category: "Culture",
    duration: "3h",
    rating: 4.7,
    price: "Gratuit",
    city: "Paris",
    theme: "Culturel",
    isPopular: true,
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23FFE4B5' width='400' height='300'/%3E%3Ccircle fill='white' cx='200' cy='100' r='40'/%3E%3Cpolygon fill='%23FFD700' points='200,60 190,80 210,80'/%3E%3Crect fill='%238B7355' x='180' y='140' width='40' height='80'/%3E%3Ctext x='200' y='250' text-anchor='middle' fill='black' font-family='Arial' font-size='16'%3EMontmartre%3C/text%3E%3C/svg%3E"
  },
  {
    name: "Dîner spectacle Moulin Rouge",
    description: "Soirée festive avec dîner et spectacle de cabaret légendaire",
    category: "Nocturne",
    duration: "4h",
    rating: 4.5,
    price: "€€€€",
    city: "Paris",
    theme: "Nocturne",
    isPopular: true,
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23FF0000' width='400' height='300'/%3E%3Cpolygon fill='white' points='200,50 150,100 250,100'/%3E%3Ccircle fill='yellow' cx='200' cy='120' r='20'/%3E%3Ctext x='200' y='250' text-anchor='middle' fill='white' font-family='Arial' font-size='16'%3EMoulin Rouge%3C/text%3E%3C/svg%3E"
  },
  {
    name: "Jardin des Tuileries",
    description: "Promenade relaxante entre le Louvre et la Concorde",
    category: "Nature",
    duration: "1h",
    rating: 4.3,
    price: "Gratuit",
    city: "Paris",
    theme: "Nature",
    isPopular: false,
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%2390EE90' width='400' height='300'/%3E%3Ccircle fill='%23228B22' cx='100' cy='100' r='30'/%3E%3Ccircle fill='%23228B22' cx='300' cy='100' r='30'/%3E%3Ccircle fill='%23228B22' cx='200' cy='150' r='30'/%3E%3Cpath fill='%238B4513' d='M95,130 L95,160 L105,160 L105,130 Z'/%3E%3Cpath fill='%238B4513' d='M295,130 L295,160 L305,160 L305,130 Z'/%3E%3Cpath fill='%238B4513' d='M195,180 L195,210 L205,210 L205,180 Z'/%3E%3Ctext x='200' y='250' text-anchor='middle' fill='black' font-family='Arial' font-size='16'%3EJardin des Tuileries%3C/text%3E%3C/svg%3E"
  },

  // Lyon Activities
  {
    name: "Vieux Lyon",
    description: "Quartier Renaissance avec traboules et bouchons traditionnels",
    category: "Culture",
    duration: "3h",
    rating: 4.7,
    price: "€€",
    city: "Lyon",
    theme: "Gastronomique",
    isPopular: true,
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23DEB887' width='400' height='300'/%3E%3Crect fill='%238B4513' x='50' y='100' width='60' height='100'/%3E%3Crect fill='%238B4513' x='150' y='100' width='60' height='100'/%3E%3Crect fill='%238B4513' x='250' y='100' width='60' height='100'/%3E%3Ctext x='200' y='250' text-anchor='middle' fill='black' font-family='Arial' font-size='16'%3EVieux Lyon%3C/text%3E%3C/svg%3E"
  },
  {
    name: "Basilique Notre-Dame de Fourvière",
    description: "Basilique majestueuse avec vue panoramique sur Lyon",
    category: "Culture",
    duration: "2h",
    rating: 4.8,
    price: "Gratuit",
    city: "Lyon",
    theme: "Culturel",
    isPopular: true,
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%2387CEEB' width='400' height='300'/%3E%3Cpolygon fill='white' points='200,80 170,150 230,150'/%3E%3Cpolygon fill='%23FFD700' points='200,80 190,100 210,100'/%3E%3Crect fill='white' x='180' y='150' width='40' height='80'/%3E%3Ctext x='200' y='250' text-anchor='middle' fill='black' font-family='Arial' font-size='16'%3EBasilique Fourvière%3C/text%3E%3C/svg%3E"
  },
  {
    name: "Parc de la Tête d'Or",
    description: "Grand parc urbain avec lac, zoo et jardins botaniques",
    category: "Nature",
    duration: "3h",
    rating: 4.6,
    price: "Gratuit",
    city: "Lyon",
    theme: "Nature",
    isPopular: true,
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%2390EE90' width='400' height='300'/%3E%3Cellipse fill='%234682B4' cx='200' cy='200' rx='100' ry='40'/%3E%3Ccircle fill='%23228B22' cx='100' cy='100' r='25'/%3E%3Ccircle fill='%23228B22' cx='300' cy='100' r='25'/%3E%3Ccircle fill='%23228B22' cx='200' cy='80' r='25'/%3E%3Ctext x='200' y='280' text-anchor='middle' fill='black' font-family='Arial' font-size='16'%3EParc de la Tête d'Or%3C/text%3E%3C/svg%3E"
  },

  // Marseille Activities
  {
    name: "Vieux Port",
    description: "Port historique avec bateaux et restaurants de poissons",
    category: "Culture",
    duration: "2h",
    rating: 4.5,
    price: "Gratuit",
    city: "Marseille",
    theme: "Gastronomique",
    isPopular: true,
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%234682B4' width='400' height='300'/%3E%3Cpath fill='white' d='M50,200 Q200,180 350,200 L350,250 Q200,230 50,250 Z'/%3E%3Crect fill='%238B4513' x='100' y='180' width='30' height='40'/%3E%3Crect fill='%238B4513' x='200' y='180' width='30' height='40'/%3E%3Crect fill='%238B4513' x='300' y='180' width='30' height='40'/%3E%3Ctext x='200' y='280' text-anchor='middle' fill='white' font-family='Arial' font-size='16'%3EVieux Port Marseille%3C/text%3E%3C/svg%3E"
  },
  {
    name: "Notre-Dame de la Garde",
    description: "Basilique emblématique avec vue sur la Méditerranée",
    category: "Culture",
    duration: "2h",
    rating: 4.9,
    price: "Gratuit",
    city: "Marseille",
    theme: "Culturel",
    isPopular: true,
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%2387CEEB' width='400' height='300'/%3E%3Cpolygon fill='white' points='200,60 170,140 230,140'/%3E%3Cpolygon fill='%23FFD700' points='200,60 190,80 210,80'/%3E%3Crect fill='white' x='180' y='140' width='40' height='90'/%3E%3Ctext x='200' y='250' text-anchor='middle' fill='black' font-family='Arial' font-size='16'%3ENotre-Dame de la Garde%3C/text%3E%3C/svg%3E"
  },
  {
    name: "Calanques de Cassis",
    description: "Randonnée dans les calanques entre mer et falaises",
    category: "Aventure",
    duration: "5h",
    rating: 4.8,
    price: "€€",
    city: "Marseille",
    theme: "Aventure",
    isPopular: true,
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%234682B4' width='400' height='300'/%3E%3Cpolygon fill='%238B7355' points='50,150 150,100 200,200'/%3E%3Cpolygon fill='%23A0522D' points='200,200 250,120 350,180'/%3E%3Cpath fill='%231E90FF' d='M150,200 Q200,180 250,200 L250,250 Q200,230 150,250 Z'/%3E%3Ctext x='200' y='280' text-anchor='middle' fill='white' font-family='Arial' font-size='16'%3ECalanques de Cassis%3C/text%3E%3C/svg%3E"
  }
]

async function seedSupabase() {
  console.log('🌱 Seeding Supabase database with activities...')
  
  try {
    // Clear existing activities
    await prisma.activities.deleteMany()
    console.log('🗑️ Cleared existing activities')
    
    // Insert activities for Supabase
    for (const activity of supabaseActivities) {
      await prisma.activities.create({
        data: activity
      })
    }
    
    console.log(`✅ Successfully seeded ${supabaseActivities.length} activities for Supabase`)
    
    // Display summary
    const cities = [...new Set(supabaseActivities.map(a => a.city))]
    console.log(`📍 Cities covered: ${cities.join(', ')}`)
    
    const categories = [...new Set(supabaseActivities.map(a => a.category))]
    console.log(`🏷️ Categories: ${categories.join(', ')}`)
    
  } catch (error) {
    console.error('❌ Error seeding Supabase database:', error)
    throw error
  }
}

seedSupabase()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })