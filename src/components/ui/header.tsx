"use client"

import Image from 'next/image'

export function Header() {
  return (
    <div className="w-full flex justify-center py-2 bg-white">
      <div className="relative">
        <Image 
          src="/govisitcity-logo.png" 
          alt="GoVisitCity" 
          width={200}
          height={60}
          className="object-contain"
          priority
        />
      </div>
    </div>
  )
}