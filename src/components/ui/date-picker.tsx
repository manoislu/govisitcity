"use client"

import * as React from "react"
import { Calendar as CalendarIcon, Users, DollarSign } from "lucide-react"
import { format, addDays } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value: {
    startDate: Date
    endDate: Date
    participants: number
    budget: string
  }
  onChange: (value: {
    startDate: Date
    endDate: Date
    participants: number
    budget: string
  }) => void
}

export function DatePicker({ value, onChange }: DatePickerProps) {
  const [showCalendar, setShowCalendar] = React.useState(false)
  const [selectedDuration, setSelectedDuration] = React.useState(3)
  
  const budgetOptions = [
    { value: '€ (Économique)', label: '€ Économique' },
    { value: '€€ (Modéré)', label: '€€ Modéré' },
    { value: '€€€ (Confort)', label: '€€€ Confort' },
    { value: '€€€€ (Luxe)', label: '€€€€ Luxe' }
  ]
  
  const durationOptions = [
    { value: 1, label: '1 jour' },
    { value: 2, label: '2 jours' },
    { value: 3, label: '3 jours' },
    { value: 4, label: '4 jours' },
    { value: 5, label: '5 jours' },
    { value: 6, label: '6 jours' },
    { value: 7, label: '7 jours' },
    { value: 14, label: '2 semaines' },
    { value: 21, label: '3 semaines' }
  ]
  
  const handleStartDateChange = (date: Date) => {
    const endDate = addDays(date, selectedDuration - 1)
    onChange({
      ...value,
      startDate: date,
      endDate
    })
    setShowCalendar(false)
  }
  
  const handleDurationChange = (duration: number) => {
    setSelectedDuration(duration)
    const endDate = addDays(value.startDate, duration - 1)
    onChange({
      ...value,
      endDate
    })
  }
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return (
    <div className="space-y-4">
      {/* Sélection de la date de départ et durée */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Date de départ
          </label>
          <div className="relative">
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !value.startDate && "text-muted-foreground"
              )}
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value.startDate ? (
                format(value.startDate, "PPP", { locale: fr })
              ) : (
                "Choisir une date"
              )}
            </Button>
            
            {showCalendar && (
              <div className="absolute top-full left-0 z-50 mt-1">
                <Card className="shadow-lg">
                  <CardContent className="p-0">
                    <Calendar
                      selected={value.startDate}
                      onSelect={handleStartDateChange}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Durée du voyage
          </label>
          <Select 
            value={selectedDuration.toString()} 
            onValueChange={(val) => handleDurationChange(parseInt(val))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {durationOptions.map(option => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Résumé du voyage */}
      {value.startDate && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">
                  📅 {format(value.startDate, "PPP", { locale: fr })}
                </p>
                <p className="text-sm text-blue-700">
                  au {format(value.endDate, "PPP", { locale: fr })}
                </p>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {selectedDuration} {selectedDuration === 1 ? 'jour' : 'jours'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Participants et budget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Nombre de participants
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
    </div>
  )
}