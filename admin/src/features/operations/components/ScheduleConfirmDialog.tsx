import * as React from "react"
import { CalendarClock, Loader2, Info } from "lucide-react"
import { format } from "date-fns"

import { ScheduleDateTimePicker } from "./ScheduleDateTimePicker"

interface ScheduleConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (date: Date) => void
  isLoading?: boolean
  title?: string
  description?: string
}

export function ScheduleConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  title = "Schedule Content",
  description = "Select a date and time to automatically publish this content."
}: ScheduleConfirmDialogProps) {
  const [date, setDate] = React.useState<Date | undefined>()
  const [time, setTime] = React.useState<string>("")

  const handleConfirm = () => {
    if (date) {
      onConfirm(date)
    }
  }

  // Reset state when opening
  React.useEffect(() => {
    if (open) {
      setDate(undefined)
      setTime("")
    }
  }, [open])

  return (
    <div className={open ? "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-200" : "hidden"}>
      <div className="bg-card text-card-foreground p-8 rounded-2xl shadow-2xl max-w-md w-full border border-border/50 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

        <div className="mb-2 mt-2">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-3 text-foreground">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <CalendarClock className="w-5 h-5" />
            </div>
            {title}
          </h2>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            {description}
          </p>
        </div>
        
        <div className="py-6">
          <ScheduleDateTimePicker date={date} setDate={setDate} time={time} setTime={setTime} disabled={isLoading} />
          
          {date && !time && (
            <div className="mt-6 flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 text-amber-950 p-4 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed text-amber-950 font-medium">
                Please select a time to complete the schedule.
              </p>
            </div>
          )}

          {date && time && (
            <div className="mt-6 flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 text-blue-950 p-4 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed text-blue-950">
                Content will be scheduled to automatically publish on <br/>
                <strong className="text-blue-950 font-bold tracking-wide">{format(date, "EEEE, MMMM do, yyyy 'at' p")}</strong>.
              </p>
            </div>
          )}
        </div>
        
        <div className="pt-2 flex justify-end gap-3 border-t border-border/40 mt-2">
          <button type="button" 
            onClick={() => onOpenChange(false)} 
            disabled={isLoading} 
            className="px-5 py-2.5 rounded-lg font-medium text-sm border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
          >
            Cancel
          </button>
          <button type="button" 
            onClick={handleConfirm} 
            disabled={!date || !time || isLoading}
            className="px-6 py-2.5 rounded-lg font-medium text-sm bg-primary text-primary-foreground shadow-md hover:brightness-95 hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirm Schedule
          </button>
        </div>
      </div>
    </div>
  )
}
