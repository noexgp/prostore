'use client'

import React, { useState, useEffect } from 'react'
import { CreditCard, DollarSign, Smartphone, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Customer {
  id: string
  name: string
}

interface CartItem {
  id: string
  name: string
  price: number
  category: string
  slug?: string
  qty: number
  discount: number
}

interface PaymentMethodsProps {
  cashAmount: number
  gcashAmount: number
  cardAmount: number
  chargeAmount: number
  approvalCodeGCash: string
  approvalCodeCard: string
  selectedCustomerId: string
  customers: Customer[]
  totalAmount: number
  totalPaid: number
  change: number
  isFormvalid: boolean
  cart: CartItem[]
  orderData: OrderData

  setCashAmount: (val: number) => void
  setGcashAmount: (val: number) => void
  setCardAmount: (val: number) => void
  setChargeAmount: (val: number) => void
  setApprovalCodeGCash: (val: string) => void
  setApprovalCodeCard: (val: string) => void
  setSelectedCustomerId: (val: string) => void
  handleCheckout: () => void
  onClose: () => void // ✅ added prop
  clearCart: () => void
}

type OrderItem = {
  productId: string
  name: string
  qty: number
  price: number
  discount: number
  amount: number
}

type OrderData = {
  totalAmount: number
  globalDiscount: number
  items: OrderItem[]
}

type PaymentType = 'cash' | 'gcash' | 'card' | 'charge'

const PaymentMethodsDialog: React.FC<PaymentMethodsProps> = ({
  cashAmount,
  gcashAmount,
  cardAmount,
  chargeAmount,
  approvalCodeGCash,
  approvalCodeCard,
  selectedCustomerId,
  customers,
  totalAmount,
  totalPaid,
  change,
  isFormvalid,
  cart,
  orderData,
  setCashAmount,
  setGcashAmount,
  setCardAmount,
  setChargeAmount,
  setApprovalCodeGCash,
  setApprovalCodeCard,
  setSelectedCustomerId,
  handleCheckout,
  onClose, // ✅ use here
  clearCart,
}) => {
  const [activeMethod, setActiveMethod] = useState<PaymentType>('cash')

  const isFullyPaidByCash = cashAmount >= totalAmount

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'F1':
          e.preventDefault()
          setActiveMethod('cash')
          break
        case 'F2':
          e.preventDefault()
          if (!isFullyPaidByCash) setActiveMethod('gcash')
          break
        case 'F3':
          e.preventDefault()
          if (!isFullyPaidByCash) setActiveMethod('card')
          break
        case 'F4':
          e.preventDefault()
          if (!isFullyPaidByCash) setActiveMethod('charge')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullyPaidByCash])

  useEffect(() => {
    if (isFullyPaidByCash) {
      setGcashAmount(0)
      setCardAmount(0)
      setChargeAmount(0)
      setApprovalCodeGCash('')
      setApprovalCodeCard('')
      setSelectedCustomerId('')
    }
  }, [cashAmount, totalAmount])

  const renderInputFields = () => {
    if (isFullyPaidByCash && activeMethod !== 'cash') {
      return (
        <p className='text-sm text-gray-500 italic'>
          This payment method is disabled because cash amount exceeds total due.
        </p>
      )
    }

    switch (activeMethod) {
      case 'cash':
        return (
          <div className='flex items-center gap-2 p-3 border rounded-lg'>
            <DollarSign size={16} className='text-green-600' />
            <span className='w-16 text-sm font-medium'>Cash:</span>
            <input
              type='number'
              min={0}
              value={cashAmount}
              onChange={(e) => setCashAmount(Number(e.target.value) || 0)}
              className='w-24 border rounded px-2 py-1 text-sm'
              placeholder='0.00'
            />
            {cashAmount > totalAmount && (
              <span className='text-sm text-green-600 ml-auto'>
                Change: ₱{change.toFixed(2)}
              </span>
            )}
          </div>
        )
      case 'gcash':
        return (
          <div className='flex items-center gap-2 p-3 border rounded-lg'>
            <Smartphone size={16} className='text-blue-600' />
            <span className='w-16 text-sm font-medium'>GCash:</span>
            <input
              type='number'
              min={0}
              value={gcashAmount}
              onChange={(e) => setGcashAmount(Number(e.target.value) || 0)}
              className='w-24 border rounded px-2 py-1 text-sm'
              placeholder='0.00'
              disabled={isFullyPaidByCash}
            />
            <input
              type='text'
              placeholder='Approval Code'
              value={approvalCodeGCash}
              onChange={(e) => setApprovalCodeGCash(e.target.value)}
              disabled={gcashAmount === 0 || isFullyPaidByCash}
              className='flex-1 border rounded px-2 py-1 text-sm disabled:bg-gray-100'
            />
          </div>
        )
      case 'card':
        return (
          <div className='flex items-center gap-2 p-3 border rounded-lg'>
            <CreditCard size={16} className='text-purple-600' />
            <span className='w-16 text-sm font-medium'>Card:</span>
            <input
              type='number'
              min={0}
              value={cardAmount}
              onChange={(e) => setCardAmount(Number(e.target.value) || 0)}
              className='w-24 border rounded px-2 py-1 text-sm'
              placeholder='0.00'
              disabled={isFullyPaidByCash}
            />
            <input
              type='text'
              placeholder='Approval Code'
              value={approvalCodeCard}
              onChange={(e) => setApprovalCodeCard(e.target.value)}
              disabled={cardAmount === 0 || isFullyPaidByCash}
              className='flex-1 border rounded px-2 py-1 text-sm disabled:bg-gray-100'
            />
          </div>
        )
      case 'charge':
        return (
          <div className='flex items-center gap-2 p-3 border rounded-lg'>
            <UserCheck size={16} className='text-orange-600' />
            <span className='w-16 text-sm font-medium'>Charge:</span>
            <input
              type='number'
              min={0}
              value={chargeAmount}
              onChange={(e) => setChargeAmount(Number(e.target.value) || 0)}
              className='w-24 border rounded px-2 py-1 text-sm'
              placeholder='0.00'
              disabled={isFullyPaidByCash}
            />
            <select
              disabled={chargeAmount === 0 || isFullyPaidByCash}
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className='flex-1 border rounded px-2 py-1 text-sm disabled:bg-gray-100'
            >
              <option value=''>Select Customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div>
      {/* payment summary */}
      <div className='space-y-4'>
        <div className='border-b pb-4'>
          <h3 className='font-semibold mb-2'>Items:</h3>
          {orderData.items.map((item, index) => (
            <div key={index} className='flex justify-between text-sm'>
              <span>
                {item.name} x{item.qty}
              </span>
              <span>₱{item.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className='space-y-2'>
          <div className='flex justify-between'>
            <span>Subtotal:</span>
            <span>
              ₱{(orderData.totalAmount + orderData.globalDiscount).toFixed(2)}
            </span>
          </div>
          {orderData.globalDiscount > 0 && (
            <div className='flex justify-between text-green-600'>
              <span>Global Discount:</span>
              <span>-₱{orderData.globalDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className='flex justify-between font-bold text-lg border-t pt-2'>
            <span>Total:</span>
            <span>₱{orderData.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className='mt-6 space-y-4'>
        <h3 className='text-lg font-semibold flex items-center gap-2'>
          <CreditCard size={20} />
          Payment Methods
        </h3>

        {/* Payment method buttons */}
        <div className='flex gap-2'>
          <Button
            variant={activeMethod === 'cash' ? 'default' : 'outline'}
            onClick={() => setActiveMethod('cash')}
          >
            Cash
          </Button>
          <Button
            variant={activeMethod === 'gcash' ? 'default' : 'outline'}
            onClick={() => setActiveMethod('gcash')}
            disabled={isFullyPaidByCash}
          >
            GCash
          </Button>
          <Button
            variant={activeMethod === 'card' ? 'default' : 'outline'}
            onClick={() => setActiveMethod('card')}
            disabled={isFullyPaidByCash}
          >
            Card
          </Button>
          <Button
            variant={activeMethod === 'charge' ? 'default' : 'outline'}
            onClick={() => setActiveMethod('charge')}
            disabled={isFullyPaidByCash}
          >
            Charge
          </Button>
        </div>

        {/* Dynamic form */}
        <div>{renderInputFields()}</div>

        {/* Summary */}
        <div className='p-4 bg-blue-50 rounded-lg'>
          <div className='flex justify-between text-sm mb-2'>
            <span>Amount Due:</span>
            <span>₱{totalAmount.toFixed(2)}</span>
          </div>
          <div className='flex justify-between text-sm mb-2'>
            <span>Amount Paid:</span>
            <span
              className={
                totalPaid >= totalAmount ? 'text-green-600' : 'text-red-600'
              }
            >
              ₱{totalPaid.toFixed(2)}
            </span>
          </div>
          <div className='flex justify-between font-semibold'>
            <span>Balance:</span>
            <span
              className={
                totalPaid >= totalAmount ? 'text-green-600' : 'text-red-600'
              }
            >
              ₱{(totalAmount - totalPaid).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Process Order Button */}
        <Button
          onClick={() => {
            handleCheckout()
            onClose() // ✅ close dialog after processing

            clearCart()
          }}
          disabled={cart.length === 0 || !isFormvalid}
          className='w-full h-12 text-lg font-semibold'
        >
          Process Order
        </Button>
      </div>
    </div>
  )
}

export default PaymentMethodsDialog
