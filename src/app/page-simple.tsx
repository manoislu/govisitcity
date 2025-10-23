'use client'

export default function SimplePage() {
  console.log('🚀 SimplePage rendering')
  
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold text-blue-600">Page de test simple</h1>
      <p className="mt-4 text-gray-700">Si vous voyez cette page, le problème vient du composant TravelPlanner.</p>
    </div>
  )
}