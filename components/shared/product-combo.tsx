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

type Product = {
  name: string
  price: string
  id: string
}

type Props = {
  products: Product[]
}

export default function ProductCombobox({ products }: Props) {
  const [selected, setSelected] = useState<Product | null>(null)

  const handleSelect = (value: string) => {
    const product = products.find((p) => p.name === value)
    if (product) setSelected(product)
  }

  return (
    <div className='space-y-4'>
      <Command className='rounded-lg border shadow-md w-full max-w-md'>
        <CommandInput placeholder='Search products...' />
        <CommandList>
          <CommandEmpty>No product found.</CommandEmpty>
          <CommandGroup heading='Products'>
            {products.map((product) => (
              <CommandItem
                key={product.id}
                value={product.name}
                onSelect={handleSelect}
              >
                <div className='flex justify-between w-full'>
                  <span>
                    {product.name} – ₱{product.price}
                  </span>
                  <Check
                    className={cn(
                      'ml-2',
                      selected?.id === product.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  )
}
