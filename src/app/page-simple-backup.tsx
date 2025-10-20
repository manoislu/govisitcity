'use client'

export default function SimplePage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          GoVisitCity
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Votre assistant de voyage intelligent
        </p>
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          ✅ L'application fonctionne correctement !
        </div>
      </div>
    </div>
  )
}