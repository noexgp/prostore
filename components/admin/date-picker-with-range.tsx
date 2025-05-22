'use client'

import { addDays, format } from 'date-fns'
import React from 'react'
import { DateRange } from 'react-day-picker'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import { CalendarIcon } from 'lucide-react'
import { Calendar } from '../ui/calendar'

// components/DatePickerWithRange.tsx
export function DatePickerWithRange({
  className,
  onDateChange,
}: React.HTMLAttributes<HTMLDivElement> & {
  onDateChange?: (range: DateRange) => void
}) {
  const [date, setDate] = React.useState<DateRange>({
    from: new Date(),
    to: addDays(new Date(), 20),
  })

  const handleSelect = (range: DateRange | undefined) => {
    if (range) {
      setDate(range)
      if (range.from && range.to && onDateChange) {
        onDateChange(range)
      }
    } else {
      // Optionally handle case when range is undefined
      // You can clear or reset the date state if desired.
      setDate({ from: new Date(), to: new Date() })
    }
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id='date'
            variant={'outline'}
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} -{' '}
                  {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            initialFocus
            mode='range'
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
