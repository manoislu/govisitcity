"use client"

import * as React from "react"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { DateRangeModal } from "./date-range-modal"

interface DateRange {
  startDate: Date | null
  endDate: Date | null
}

interface DateRangeTriggerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  className?: string
}

export function DateRangeTrigger({ value, onChange, className }: DateRangeTriggerProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  
  const getDuration = () => {
    if (!value.startDate || !value.endDate) return 0
    const diffTime = Math.abs(value.endDate.getTime() - value.startDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }
  
  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal h-auto p-4",
          !value.startDate && "text-muted-foreground",
          className
        )}
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            {value.startDate && value.endDate ? (
              <div className="text-sm">
                <div className="font-medium text-gray-900">
                  {format(value.startDate, "dd MMMM yyyy", { locale: fr })}
                </div>
                <div className="text-gray-500">
                  au {format(value.endDate, "dd MMMM yyyy", { locale: fr })}
                </div>
              </div>
            ) : value.startDate ? (
              <div className="text-sm">
                <div className="font-medium text-gray-900">
                  {format(value.startDate, "dd MMMM yyyy", { locale: fr })}
                </div>
                <div className="text-gray-500">Sélectionnez la date de fin</div>
              </div>
            ) : (
              <span className="text-gray-500">Sélectionnez les dates de votre voyage</span>
            )}
          </div>
          {value.startDate && value.endDate && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {getDuration()} {getDuration() === 1 ? 'jour' : 'jours'}
            </Badge>
          )}
        </div>
      </Button>
      
      <DateRangeModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        value={value}
        onChange={onChange}
      />
    </>
  )
}