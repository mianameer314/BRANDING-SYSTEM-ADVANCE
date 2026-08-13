import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"


interface ScheduleDateTimePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  time: string
  setTime: (time: string) => void
  disabled?: boolean
}

export function ScheduleDateTimePicker({ date, setDate, time, setTime, disabled }: ScheduleDateTimePickerProps) {

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setTime(newTime)
    
    if (date && newTime) {
      const [hours, minutes] = newTime.split(":").map(Number)
      const newDate = new Date(date)
      newDate.setHours(hours)
      newDate.setMinutes(minutes)
      setDate(newDate)
    }
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      if (time) {
        const [hours, minutes] = time.split(":").map(Number)
        selectedDate.setHours(hours)
        selectedDate.setMinutes(minutes)
      }
      setDate(selectedDate)
    } else {
      setDate(undefined)
    }
  }

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start w-full">
      <div className="flex flex-col gap-2.5 flex-1">
        <label className="text-sm font-semibold text-foreground/90">Publish Date</label>
        <div className="relative group">
          <CalendarIcon className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
          <input
            type="date"
            min={format(new Date(), "yyyy-MM-dd")}
            value={date ? format(date, "yyyy-MM-dd") : ""}
            onChange={(e) => handleDateSelect(e.target.value ? new Date(e.target.value) : undefined)}
            disabled={disabled}
            className="w-full pl-10 pr-4 py-2.5 bg-background/50 border border-input rounded-xl text-sm text-foreground shadow-sm transition-all hover:bg-accent/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          />
        </div>
      </div>
      
      <div className="flex flex-col gap-2.5 w-full sm:w-[160px]">
        <label className="text-sm font-semibold text-foreground/90">Time (Local)</label>
        <div className="relative group">
          <Clock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
          <input
            type="time"
            value={time}
            onChange={handleTimeChange}
            disabled={!date || disabled}
            className="w-full pl-10 pr-4 py-2.5 bg-background/50 border border-input rounded-xl text-sm text-foreground shadow-sm transition-all hover:bg-accent/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          />
        </div>
      </div>
    </div>
  )
}
