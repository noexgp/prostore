'use client'

import React, {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  KeyboardEvent,
} from 'react'
import { Minus, Plus, X, Smartphone } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import PaymentMethodsDialog from './paymentMethods'
import { Button } from '@/components/ui/button'

type tProduct = {
  id: string
  name: string
  price: number
  category: string
  slug?: string
}

type CartItem = tProduct & {
  qty: number
  discount: number
}

export default function ProductSearchCart() {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<tProduct[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [globalDiscount, setGlobalDiscount] = useState(0)

  const [cashAmount, setCashAmount] = useState(0)
  const [gcashAmount, setGcashAmount] = useState(0)
  const [cardAmount, setCardAmount] = useState(0)
  const [chargeAmount, setChargeAmount] = useState(0)

  const [approvalCodeGCash, setApprovalCodeGCash] = useState('')
  const [approvalCodeCard, setApprovalCodeCard] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [quantityOverride, setQuantityOverride] = useState(1)

  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)

  const customers = [
    { id: 'cust001', name: 'Alice Reyes' },
    { id: 'cust002', name: 'Ben Santos' },
    { id: 'cust003', name: 'Charlie Tan' },
    { id: 'cust004', name: 'Diana Lopez' },
    { id: 'cust005', name: 'Eddie Cruz' },
  ]

  const inputRef = useRef<HTMLInputElement>(null)

  // ✅ Search products using backend API
  useEffect(() => {
    const handler = setTimeout(async () => {
      try {
        const url = query.trim()
          ? `/api/products/search?q=${encodeURIComponent(query.trim())}`
          : `/api/products/search`

        const res = await fetch(url)
        if (!res.ok) throw new Error('Failed to fetch products')
        const data = await res.json()
        setSearchResults(data)
      } catch (err) {
        console.error('Failed to fetch products:', err)
      }
    }, 300)

    return () => clearTimeout(handler)
  }, [query])

  // Autofocus search input on load
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function addToCart(product: tProduct) {
    setCart((curr) => {
      const index = curr.findIndex((item) => item.id === product.id)
      if (index !== -1) {
        const updated = [...curr]
        updated[index].qty += quantityOverride
        return updated
      }
      return [...curr, { ...product, qty: quantityOverride, discount: 0 }]
    })

    if (query.trim()) {
      setQuery('')
      setSearchResults([])
    }

    setTimeout(() => {
      inputRef.current?.focus()
    }, 50)
    setQuantityOverride(1)
  }

  function updateCartItem(
    id: string,
    field: 'qty' | 'discount',
    value: number | string
  ) {
    setCart((curr) =>
      curr.map((item) =>
        item.id === id ? { ...item, [field]: Number(value) || 0 } : item
      )
    )
  }

  function removeFromCart(id: string) {
    setCart((curr) => curr.filter((item) => item.id !== id))
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const product =
        searchResults.find(
          (p) =>
            p.slug?.toLowerCase() === query.trim().toLowerCase() ||
            p.id === query.trim()
        ) || searchResults[0]
      if (product) addToCart(product)
    }
  }

  function clearCart() {
    setCart([])
  }

  const totalItems = cart.reduce((sum, item) => sum + Number(item.qty), 0)
  const subTotal = cart.reduce((sum, item) => {
    const price = Number(item.price) || 0
    const discount = Number(item.discount) || 0
    const qty = Number(item.qty) || 0
    return sum + qty * (price - discount)
  }, 0)
  const totalAmount = Math.max(subTotal - globalDiscount, 0)
  const totalPaid = cashAmount + gcashAmount + cardAmount + chargeAmount
  const change = cashAmount > totalAmount ? cashAmount - totalAmount : 0

  const isFormValid =
    (totalAmount - totalPaid)! <= 0 &&
    (gcashAmount === 0 || approvalCodeGCash.trim() !== '') &&
    (cardAmount === 0 || approvalCodeCard.trim() !== '') &&
    (chargeAmount === 0 || selectedCustomerId.trim() !== '')

  function handleCheckout() {
    if (!isFormValid) {
      alert(
        'Please complete payment and fill all required fields before checkout.'
      )
      return
    }

    const orderItems = cart.map(({ id, name, qty, price, discount }) => {
      const p = Number(price) || 0
      const d = Number(discount) || 0
      const q = Number(qty) || 0
      return {
        productId: id,
        name,
        qty: q,
        price: p,
        discount: d,
        amount: q * (p - d),
      }
    })

    const orderData = {
      totalAmount,
      globalDiscount,
      items: orderItems,
      createdAt: new Date().toISOString(),
    }

    inputRef.current?.focus()
    console.log(orderData)
    // Optionally send to backend here
  }

  // (Render UI remains unchanged, omitted here for brevity)

  const orderData = {
    totalAmount,
    globalDiscount,
    items: cart.map(({ id, name, qty, price, discount }) => ({
      productId: id,
      name,
      qty,
      price,
      discount,
      amount: qty * (price - discount),
    })),
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto p-4'>
        {/* Header */}
        <div className='bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg shadow-lg p-6 mb-6'>
          <div className='flex flex-wrap items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold mb-2'>POS System</h1>
              <p className='text-blue-100'>
                Items: {totalItems} | Subtotal: ₱{subTotal.toFixed(2)}
              </p>
            </div>
            <div className='text-right'>
              <p className='text-blue-100 text-sm'>Total Amount</p>
              <p className='text-3xl font-bold'>₱{totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Left: Product Search */}
          <div className='bg-white rounded-lg shadow-md p-6'>
            <div className='flex items-center gap-2 mb-4'>
              <div className='p-2 bg-green-100 rounded-lg'>
                <Smartphone className='text-green-600' size={20} />
              </div>
              <h2 className='text-xl font-semibold'>Search Products</h2>
            </div>

            <div className='relative'>
              <Input
                ref={inputRef}
                type='text'
                placeholder='Type product name, scan barcode, or use qty*product (e.g., 2*coke)'
                value={
                  quantityOverride > 1 ? `${quantityOverride}*${query}` : query
                }
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const val = e.target.value
                  if (val.includes('*')) {
                    const [qtyStr, ...rest] = val.split('*')
                    const qty = parseInt(qtyStr, 10)
                    const restQuery = rest.join('*')
                    if (!isNaN(qty) && qty > 0) {
                      setQuantityOverride(qty)
                      setQuery(restQuery)
                    } else {
                      setQuantityOverride(1)
                      setQuery(val)
                    }
                  } else {
                    setQuantityOverride(1)
                    setQuery(val)
                  }
                }}
                onKeyDown={onKeyDown}
                className='w-full'
              />

              {quantityOverride > 1 && (
                <div className='absolute right-2 top-2 bg-blue-500 text-white text-xs px-2 py-1 rounded'>
                  Qty: {quantityOverride}
                </div>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className='mt-4 max-h-80 overflow-y-auto border rounded-lg'>
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className='cursor-pointer p-4 hover:bg-gray-50 border-b last:border-b-0 transition-colors'
                  >
                    <div className='flex justify-between items-center'>
                      <div>
                        <p className='font-medium'>{product.name}</p>
                        <p className='text-sm text-gray-500'>
                          {product.category}
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='font-bold text-green-600'>
                          ₱{Number(product.price).toFixed(2)}
                        </p>
                        <p className='text-xs text-gray-400'>{product.id}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Cart */}
          <div className='bg-white rounded-lg shadow-md p-6'>
            <div className='flex items-center gap-2 mb-4'>
              <div className='p-2 bg-orange-100 rounded-lg'>
                <div className='w-5 h-5 bg-orange-600 rounded'></div>
              </div>
              <h2 className='text-xl font-semibold'>Shopping Cart</h2>
            </div>

            <div className='overflow-x-auto'>
              <table className='w-full border-collapse'>
                <thead>
                  <tr className='border-b'>
                    <th className='text-left p-2 font-semibold'>Item</th>
                    <th className='text-center p-2 font-semibold'>Qty</th>
                    <th className='text-right p-2 font-semibold'>Price</th>
                    <th className='text-right p-2 font-semibold'>Disc.</th>
                    <th className='text-right p-2 font-semibold'>Total</th>
                    <th className='text-center p-2 font-semibold'>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan={6} className='text-center p-8 text-gray-500'>
                        <div className='flex flex-col items-center gap-2'>
                          <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center'>
                            <div className='w-8 h-8 bg-gray-300 rounded'></div>
                          </div>
                          <p>Cart is empty</p>
                          <p className='text-sm'>
                            Search and add products above
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    cart.map(({ id, name, qty, price, discount }) => {
                      const amount = qty * (price - discount)
                      return (
                        <tr key={id} className='border-b hover:bg-gray-50'>
                          <td className='p-2'>
                            <div>
                              <p className='font-medium text-sm'>{name}</p>
                              <p className='text-xs text-gray-500'>{id}</p>
                            </div>
                          </td>
                          <td className='p-2'>
                            <div className='flex items-center justify-center gap-1'>
                              <button
                                onClick={() =>
                                  updateCartItem(
                                    id,
                                    'qty',
                                    Math.max(qty - 1, 1)
                                  )
                                }
                                className='p-1 hover:bg-gray-200 rounded'
                              >
                                <Minus size={12} />
                              </button>
                              <input
                                type='number'
                                value={qty}
                                min={1}
                                onChange={(e) =>
                                  updateCartItem(id, 'qty', e.target.value)
                                }
                                className='w-12 text-center text-sm border rounded px-1 py-0.5'
                              />
                              <button
                                onClick={() =>
                                  updateCartItem(id, 'qty', qty + 1)
                                }
                                className='p-1 hover:bg-gray-200 rounded'
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </td>
                          <td className='text-right p-2 text-sm'>
                            ₱{Number(price).toFixed(2)}
                          </td>
                          <td className='p-2'>
                            <input
                              type='number'
                              value={discount}
                              min={0}
                              max={price}
                              onChange={(e) =>
                                updateCartItem(id, 'discount', e.target.value)
                              }
                              className='w-16 text-center text-sm border rounded px-1 py-0.5'
                            />
                          </td>
                          <td className='text-right p-2 font-medium'>
                            ₱{amount.toFixed(2)}
                          </td>
                          <td className='text-center p-2'>
                            <button
                              onClick={() => removeFromCart(id)}
                              className='text-red-500 hover:text-red-700 p-1'
                            >
                              <X size={16} />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {cart.length > 0 && (
              <>
                {/* Global Discount */}
                <div className='mt-4 p-4 bg-gray-50 rounded-lg'>
                  <div className='flex items-center justify-between'>
                    <label className='font-semibold text-sm'>
                      Global Discount:
                    </label>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm'>₱</span>
                      <input
                        type='number'
                        min={0}
                        max={subTotal}
                        value={globalDiscount}
                        onChange={(e) =>
                          setGlobalDiscount(Number(e.target.value) || 0)
                        }
                        className='w-24 text-right border rounded px-2 py-1'
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Section */}
                <Dialog
                  open={isPaymentDialogOpen}
                  onOpenChange={setIsPaymentDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant='outline'>Check out</Button>
                  </DialogTrigger>
                  <DialogContent className='sm:max-w-[425px]'>
                    <DialogHeader>
                      <DialogTitle>Payment Summary</DialogTitle>
                      <DialogDescription>{''}</DialogDescription>
                    </DialogHeader>
                    <div>
                      <PaymentMethodsDialog
                        cashAmount={cashAmount}
                        gcashAmount={gcashAmount}
                        cardAmount={cardAmount}
                        chargeAmount={chargeAmount}
                        approvalCodeGCash={approvalCodeGCash}
                        approvalCodeCard={approvalCodeCard}
                        selectedCustomerId={selectedCustomerId}
                        customers={customers}
                        totalAmount={totalAmount}
                        totalPaid={totalPaid}
                        change={change}
                        isFormvalid={isFormValid}
                        cart={cart}
                        orderData={orderData}
                        setCashAmount={setCashAmount}
                        setGcashAmount={setGcashAmount}
                        setCardAmount={setCardAmount}
                        setChargeAmount={setChargeAmount}
                        setApprovalCodeGCash={setApprovalCodeGCash}
                        setApprovalCodeCard={setApprovalCodeCard}
                        setSelectedCustomerId={setSelectedCustomerId}
                        handleCheckout={handleCheckout}
                        onClose={() => setIsPaymentDialogOpen(false)} // <---- Fixed here
                        clearCart={clearCart}
                      />
                    </div>
                    <DialogFooter>{''}</DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>

        {/* Payment Modal */}
      </div>
    </div>
  )
}
