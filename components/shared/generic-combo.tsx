'use client'

import React, { useState } from 'react'
import { Check } from 'lucide-react'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'

type GenericComboboxProps<T> = {
  items: T[]
  getLabel: (item: T) => string
  getValue: (item: T) => string
  onChange?: (item: T | null) => void
  placeholder?: string
  groupLabel?: string
}

export function GenericCombobox<T>({
  items,
  getLabel,
  getValue,
  onChange,
  placeholder = 'Select an item...',
  groupLabel = 'Items',
}: GenericComboboxProps<T>) {
  const [selected, setSelected] = useState<T | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (value: string) => {
    const item = items.find((i) => getValue(i) === value) || null
    setSelected(item)
    setInputValue(item ? getLabel(item) : '')
    onChange?.(item)
    setIsOpen(false)
  }

  const handleFocus = () => setIsOpen(true)
  const handleBlur = () => setTimeout(() => setIsOpen(false), 150)

  return (
    <div className='space-y-4'>
      <Command className='rounded-lg border shadow-md w-full max-w-md'>
        <CommandInput
          placeholder={placeholder}
          value={inputValue}
          onValueChange={setInputValue}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        {isOpen && (
          <CommandList>
            <CommandEmpty>No item found.</CommandEmpty>
            <CommandGroup heading={groupLabel}>
              {items
                .filter((item) =>
                  getLabel(item)
                    .toLowerCase()
                    .includes(inputValue.toLowerCase().trim())
                )
                .map((item) => {
                  const label = getLabel(item)
                  const value = getValue(item)

                  return (
                    <CommandItem
                      key={value}
                      value={label}
                      onSelect={() => handleSelect(value)}
                    >
                      <div className='flex justify-between w-full'>
                        <span>{label}</span>
                        <Check
                          className={cn(
                            'ml-2',
                            selected && getValue(selected) === value
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                      </div>
                    </CommandItem>
                  )
                })}
            </CommandGroup>
          </CommandList>
        )}
      </Command>

      {/*selected && (
        <div className='text-sm border rounded p-4 bg-gray-50'>
          <p>
            <strong>Selected:</strong> {getLabel(selected)} (
            {getValue(selected)})
          </p>
        </div>
      )*/}
    </div>
  )
}
