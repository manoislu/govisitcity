"use client"

import * as React from "react"
import { MapPin, Users, DollarSign, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { DateRangeTrigger } from '@/components/ui/date-range-trigger'
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface TravelFormProps {
  value: {
    city: string
    startDate: Date | null
    endDate: Date | null
    participants: number
    budget: string
  }
  onChange: (value: {
    city: string
    startDate: Date | null
    endDate: Date | null
    participants: number
    budget: string
  }) => void
}

export function TravelForm({ value, onChange }: TravelFormProps) {
  const popularCities = [
    'Paris', 'Londres', 'Rome', 'Barcelone', 'Amsterdam', 
    'Berlin', 'Madrid', 'Venise', 'Prague', 'Budapest'
  ]

  const budgetOptions = [
    { value: '€ (Économique)', label: '€ Économique' },
    { value: '€€ (Modéré)', label: '€€ Modéré' },
    { value: '€€€ (Confort)', label: '€€€ Confort' },
    { value: '€€€€ (Luxe)', label: '€€€€ Luxe' }
  ]

  const handleDateRangeChange = (dateRange: { startDate: Date | null; endDate: Date | null }) => {
    onChange({
      ...value,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    })
  }

  const getDuration = () => {
    if (!value.startDate || !value.endDate) return 0
    const diffTime = Math.abs(value.endDate.getTime() - value.startDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  return (
    <div className="space-y-6">
      {/* Destination */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Destination
        </label>
        <Input
          placeholder="Entrez le nom d'une ville..."
          value={value.city}
          onChange={(e) => onChange({ ...value, city: e.target.value })}
          className="text-base"
        />
        <div className="flex flex-wrap gap-2">
          {popularCities.map((cityName) => (
            <Badge
              key={cityName}
              variant="outline"
              className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
              onClick={() => onChange({ ...value, city: cityName })}
            >
              <MapPin className="w-3 h-3 mr-1" />
              {cityName}
            </Badge>
          ))}
        </div>
      </div>

      {/* Sélection des dates */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Dates du voyage
        </label>
        <DateRangeTrigger
          value={{
            startDate: value.startDate,
            endDate: value.endDate
          }}
          onChange={handleDateRangeChange}
        />
      </div>

      {/* Participants et budget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Participants
          </label>
          <Select 
            value={value.participants.toString()} 
            onValueChange={(val) => onChange({ ...value, participants: parseInt(val) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? 'personne' : 'personnes'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Budget
          </label>
          <Select 
            value={value.budget} 
            onValueChange={(val) => onChange({ ...value, budget: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir un budget" />
            </SelectTrigger>
            <SelectContent>
              {budgetOptions.map(budget => (
                <SelectItem key={budget.value} value={budget.value}>
                  {budget.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Résumé du voyage */}
      {value.city && value.startDate && value.endDate && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-blue-900">📍 {value.city}</h4>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {getDuration()} {getDuration() === 1 ? 'jour' : 'jours'}
                </Badge>
              </div>
              <div className="text-sm text-blue-700">
                📅 {format(value.startDate, "dd MMMM yyyy", { locale: fr })} - {format(value.endDate, "dd MMMM yyyy", { locale: fr })}
              </div>
              <div className="flex items-center gap-4 text-sm text-blue-600">
                <span>👥 {value.participants} {value.participants === 1 ? 'personne' : 'personnes'}</span>
                {value.budget && <span>💰 {value.budget}</span>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}