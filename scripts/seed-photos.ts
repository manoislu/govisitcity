import { db } from '../src/lib/db';

async function seedPhotos() {
  try {
    // Vider la table des photos existantes
    await db.photo.deleteMany();
    
    // Photos à insérer
    const photos = [
      {
        title: 'Mountain Sunset',
        description: 'A beautiful mountain landscape with sunset colors',
        filename: 'mountain1.jpg',
        category: 'landscape',
        tags: 'mountain,sunset,nature'
      },
      {
        title: 'Ocean Waves',
        description: 'A serene ocean view with gentle waves',
        filename: 'ocean1.jpg',
        category: 'nature',
        tags: 'ocean,waves,water'
      },
      {
        title: 'Forest Light',
        description: 'A lush green forest with sunlight filtering through',
        filename: 'forest1.jpg',
        category: 'nature',
        tags: 'forest,trees,sunlight'
      },
      {
        title: 'City Nights',
        description: 'A city skyline illuminated at night',
        filename: 'city1.jpg',
        category: 'urban',
        tags: 'city,night,lights'
      },
      {
        title: 'Desert Dunes',
        description: 'Sand dunes stretching across the desert landscape',
        filename: 'desert1.jpg',
        category: 'landscape',
        tags: 'desert,sand,dunes'
      }
    ];

    // Insérer les photos dans la base de données
    for (const photo of photos) {
      await db.photo.create({
        data: photo
      });
    }

    console.log(`✅ ${photos.length} photos ont été ajoutées à la base de données`);
    
    // Vérifier l'insertion
    const count = await db.photo.count();
    console.log(`📊 Total des photos dans la base: ${count}`);
    
  } catch (error) {
    console.error('❌ Erreur lors du peuplement des photos:', error);
  } finally {
    await db.$disconnect();
  }
}

seedPhotos();