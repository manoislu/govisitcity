"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { format, isSameDay, isAfter, isBefore, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from "date-fns"
import { fr } from "date-fns/locale"

interface DateRange {
  startDate: Date | null
  endDate: Date | null
}

interface DateRangeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: DateRange
  onChange: (range: DateRange) => void
}

export function DateRangeModal({ open, onOpenChange, value, onChange }: DateRangeModalProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  const [tempRange, setTempRange] = React.useState<DateRange>({ startDate: value.startDate, endDate: value.endDate })
  
  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ]
  
  const weekDays = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]
  
  const nextMonth = addMonths(currentMonth, 1)
  
  const previousMonths = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }
  
  const nextMonths = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }
  
  const isStartDate = (day: Date) => {
    if (!tempRange.startDate) return false
    return isSameDay(day, tempRange.startDate)
  }
  
  const isEndDate = (day: Date) => {
    if (!tempRange.endDate) return false
    return isSameDay(day, tempRange.endDate)
  }
  
  const isInRange = (day: Date) => {
    if (!tempRange.startDate || !tempRange.endDate) return false
    return (isAfter(day, tempRange.startDate) || isSameDay(day, tempRange.startDate)) &&
           (isBefore(day, tempRange.endDate) || isSameDay(day, tempRange.endDate))
  }
  
  const isPast = (day: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return day < today
  }
  
  const handleDateClick = (day: Date) => {
    if (isPast(day)) return
    
    if (!tempRange.startDate) {
      // Premier clic : sélection de la date de début
      setTempRange({ startDate: day, endDate: null })
    } else if (!tempRange.endDate) {
      // Deuxième clic : sélection de la date de fin
      if (isSameDay(day, tempRange.startDate)) {
        // Même date : annuler la sélection
        setTempRange({ startDate: null, endDate: null })
      } else if (isAfter(day, tempRange.startDate)) {
        // Date après le début : valide
        setTempRange({ startDate: tempRange.startDate, endDate: day })
      } else {
        // Date avant le début : inverser
        setTempRange({ startDate: day, endDate: tempRange.startDate })
      }
    } else {
      // Nouvelle sélection : réinitialiser et commencer avec cette date
      setTempRange({ startDate: day, endDate: null })
    }
  }
  
  const handleConfirm = () => {
    onChange(tempRange)
    onOpenChange(false)
  }
  
  const handleCancel = () => {
    setTempRange({ startDate: value.startDate, endDate: value.endDate })
    onOpenChange(false)
  }
  
  const renderMonth = (month: Date) => {
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
    
    // Get the first day of the month to calculate empty cells
    const firstDay = monthStart.getDay()
    const emptyCells = Array(firstDay).fill(null)
    
    return (
      <div className="flex-1">
        <div className="text-center font-semibold text-sm mb-3 text-gray-700">
          {monthNames[month.getMonth()]} {month.getFullYear()}
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="h-6 text-xs font-medium text-gray-500 text-center">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {emptyCells.map((_, index) => (
            <div key={`empty-${index}`} className="h-8"></div>
          ))}
          
          {days.map(day => (
            <button
              key={day.toISOString()}
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
              {day.getDate()}
              {isStartDate(day) && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
              )}
              {isEndDate(day) && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    )
  }
  
  const getDuration = () => {
    if (!tempRange.startDate || !tempRange.endDate) return 0
    const diffTime = Math.abs(tempRange.endDate.getTime() - tempRange.startDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-lg font-semibold">
            Sélectionnez la période de votre voyage
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={previousMonths}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-center">
              {tempRange.startDate && tempRange.endDate ? (
                <div className="text-sm">
                  <span className="font-medium text-blue-600">
                    {format(tempRange.startDate, "dd MMMM yyyy", { locale: fr })}
                  </span>
                  <span className="mx-2">-</span>
                  <span className="font-medium text-blue-600">
                    {format(tempRange.endDate, "dd MMMM yyyy", { locale: fr })}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">
                    {getDuration()} {getDuration() === 1 ? 'jour' : 'jours'}
                  </div>
                </div>
              ) : tempRange.startDate ? (
                <div className="text-sm">
                  <span className="font-medium text-blue-600">
                    {format(tempRange.startDate, "dd MMMM yyyy", { locale: fr })}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">
                    Sélectionnez la date de fin
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  Sélectionnez la date de début
                </div>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={nextMonths}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Calendriers */}
          <div className="flex gap-6 justify-center">
            {renderMonth(currentMonth)}
            {renderMonth(nextMonth)}
          </div>
          
          {/* Boutons d'action */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel}>
              Annuler
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!tempRange.startDate || !tempRange.endDate}
              className="bg-blue-600 hover:bg-blue-700"
            >
              OK
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}