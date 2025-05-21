'use client'

import { GenericCombobox } from './generic-combo'

type tproducts = {
  name: string
  price: string
  id: string
}

type Props = {
  products: tproducts[]
}

export default function ProductSelect({ products }: Props) {
  return (
    <GenericCombobox
      items={products}
      getLabel={(p) => `${p.name} – ₱${p.price}`}
      getValue={(p) => p.id}
      onChange={(product) => {
        console.log('Selected product ID:', product?.id)
      }}
      placeholder='Search products...'
      groupLabel='Products'
    />
  )
}
