"use client"

export function Header() {
  return (
    <div className="w-full flex justify-center py-6 bg-white border-b">
      <div className="text-center">
        <img 
          src="/govisitcity-logo.png" 
          alt="GoVisitCity" 
          className="h-16 mx-auto mb-2"
        />
        <p className="text-gray-600 mt-1">Votre assistant de voyage intelligent</p>
      </div>
    </div>
  )
}