"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { format, isSameDay, isAfter, isBefore, addMonths, subMonths } from "date-fns"
import { fr } from "date-fns/locale"

interface DateRange {
  startDate: Date | null
  endDate: Date | null
}

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  className?: string
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  const [isOpen, setIsOpen] = React.useState(false)
  
  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ]
  
  const weekDays = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]
  
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }
  
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }
  
  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }
  
  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    )
  }
  
  const isStartDate = (day: number) => {
    if (!value.startDate) return false
    return isSameDay(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day),
      value.startDate
    )
  }
  
  const isEndDate = (day: number) => {
    if (!value.endDate) return false
    return isSameDay(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day),
      value.endDate
    )
  }
  
  const isInRange = (day: number) => {
    if (!value.startDate || !value.endDate) return false
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return (isAfter(date, value.startDate) || isSameDay(date, value.startDate)) &&
           (isBefore(date, value.endDate) || isSameDay(date, value.endDate))
  }
  
  const isPast = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }
  
  const handleDateClick = (day: number) => {
    if (isPast(day)) return
    
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    
    if (!value.startDate) {
      // Premier clic : sélection de la date de début
      onChange({ startDate: clickedDate, endDate: null })
    } else if (!value.endDate) {
      // Deuxième clic : sélection de la date de fin
      if (isSameDay(clickedDate, value.startDate)) {
        // Même date : annuler la sélection
        onChange({ startDate: null, endDate: null })
      } else if (isAfter(clickedDate, value.startDate)) {
        // Date après le début : valide
        onChange({ startDate: value.startDate, endDate: clickedDate })
      } else {
        // Date avant le début : inverser
        onChange({ startDate: clickedDate, endDate: value.startDate })
      }
    } else {
      // Nouvelle sélection : réinitialiser et commencer avec cette date
      onChange({ startDate: clickedDate, endDate: null })
    }
  }
  
  const renderDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const days = []
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>)
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={cn(
            "h-8 w-8 rounded-full text-sm font-medium transition-all relative",
            "hover:bg-blue-100 hover:text-blue-600",
            isStartDate(day) && "bg-blue-600 text-white hover:bg-blue-700",
            isEndDate(day) && "bg-blue-600 text-white hover:bg-blue-700",
            isInRange(day) && !isStartDate(day) && !isEndDate(day) && "bg-blue-100 text-blue-600",
            isToday(day) && !isStartDate(day) && !isEndDate(day) && "bg-blue-50 text-blue-600 font-bold border border-blue-200",
            isPast(day) && "text-gray-300 cursor-not-allowed hover:bg-transparent hover:text-gray-300"
          )}
          disabled={isPast(day)}
        >
          {day}
          {isStartDate(day) && (
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
          )}
          {isEndDate(day) && (
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
          )}
        </button>
      )
    }
    
    return days
  }
  
  const getDuration = () => {
    if (!value.startDate || !value.endDate) return 0
    const diffTime = Math.abs(value.endDate.getTime() - value.startDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }
  
  return (
    <div className={cn("space-y-3", className)}>
      {/* Bouton d'ouverture du calendrier */}
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal h-auto p-3",
          !value.startDate && "text-muted-foreground"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 rounded" />
            {value.startDate && value.endDate ? (
              <div className="text-sm">
                <div className="font-medium">
                  {format(value.startDate, "dd MMMM yyyy", { locale: fr })}
                </div>
                <div className="text-gray-500">
                  au {format(value.endDate, "dd MMMM yyyy", { locale: fr })}
                </div>
              </div>
            ) : value.startDate ? (
              <div className="text-sm">
                <div className="font-medium">
                  {format(value.startDate, "dd MMMM yyyy", { locale: fr })}
                </div>
                <div className="text-gray-500">Cliquez pour la date de fin</div>
              </div>
            ) : (
              <span>Sélectionnez les dates de votre voyage</span>
            )}
          </div>
          {value.startDate && value.endDate && (
            <Badge variant="secondary">
              {getDuration()} {getDuration() === 1 ? 'jour' : 'jours'}
            </Badge>
          )}
        </div>
      </Button>
      
      {/* Calendrier */}
      {isOpen && (
        <Card className="shadow-lg border-2">
          <CardContent className="p-0">
            <div className="p-3 bg-gray-50 border-b">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={previousMonth}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="font-semibold text-sm">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextMonth}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-3">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(day => (
                  <div key={day} className="h-6 text-xs font-medium text-gray-500 text-center">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {renderDays()}
              </div>
              
              {value.startDate && !value.endDate && (
                <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-700">
                  📅 Date de début sélectionnée : {format(value.startDate, "dd MMMM yyyy", { locale: fr })}
                  <br />
                  Cliquez sur une date pour sélectionner la fin
                </div>
              )}
              
              {value.startDate && value.endDate && (
                <div className="mt-3 p-2 bg-green-50 rounded text-sm text-green-700">
                  ✅ Sélection complète : {getDuration()} {getDuration() === 1 ? 'jour' : 'jours'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}