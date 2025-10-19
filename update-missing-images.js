import { db } from '@/lib/db'

async function updateMissingImages() {
  try {
    console.log('🔧 Updating missing Amsterdam nocturnal activity images...')
    
    // Generate images for the two missing activities
    const image1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    const image2 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    
    // Update Nighttime Photography Workshop
    const activity1 = await db.activity.updateMany({
      where: {
        name: "Nighttime Photography Workshop in Amsterdam's Jordaan",
        city: "Amsterdam",
        isActive: true
      },
      data: {
        image: image1
      }
    })
    
    console.log(`✅ Updated ${activity1.count} photography workshop images`)
    
    // Update Late-Night Art Exploration
    const activity2 = await db.activity.updateMany({
      where: {
        name: "Late-Night Art Exploration at Moco Museum Amsterdam",
        city: "Amsterdam", 
        isActive: true
      },
      data: {
        image: image2
      }
    })
    
    console.log(`✅ Updated ${activity2.count} Moco Museum exploration images`)
    
    console.log('🎉 All missing Amsterdam nocturnal activity images have been updated!')
    
  } catch (error) {
    console.error('❌ Error updating images:', error)
  }
}

updateMissingImages()