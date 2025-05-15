'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useFormStatus } from 'react-dom'
import { createOrder } from '@/lib/actions/order.actions'

interface PlaceOrderFormProps {
  paymentMethod: string // Expected to be either 'Cash' or another payment method
  totalPrice: number // The total price for the cart
}

const PlaceOrderForm = ({ paymentMethod, totalPrice }: PlaceOrderFormProps) => {
  const router = useRouter()
  const [cashTendered, setCashTendered] = useState('')

  // Debugging logs for initial state
  useEffect(() => {
    console.log('Total Price:', totalPrice)
    console.log('Payment Method:', paymentMethod)
  }, [totalPrice, paymentMethod])

  // Calculate the change due only if cashTendered is a valid number and greater than totalPrice
  const numericCashTendered = parseFloat(cashTendered.trim())
  const isValidCash =
    !isNaN(numericCashTendered) && numericCashTendered >= totalPrice

  const changeDue = isValidCash
    ? (numericCashTendered - totalPrice).toFixed(2)
    : '0.00'

  // Debugging log for change due
  useEffect(() => {
    console.log('Change Due:', changeDue)
  }, [cashTendered, changeDue, totalPrice])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    // Ensure cashTendered is a valid number for the request
    try {
      const res = await createOrder({ cashTendered: numericCashTendered })

      if (res.redirectTo) {
        router.push(res.redirectTo)
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      //  Consider showing a user-friendly error message here.
    }
  }

  const PlaceOrderButton = () => {
    const { pending } = useFormStatus()
    const disabled = pending || (paymentMethod === 'Cash' && !isValidCash)

    return (
      <Button disabled={disabled} className='w-full'>
        {pending ? (
          <Loader className='w-4 h-4 animate-spin' />
        ) : (
          <Check className='w-4 h-4' />
        )}{' '}
        Place Order
      </Button>
    )
  }

  // This effect will update changeDue whenever the cashTendered changes
  const handleChangeCashTendered = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCashTendered(e.target.value)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Conditionally render Cash Tendered input if paymentMethod is 'Cash' */}
      {paymentMethod === 'Cash' && (
        <div>
          <label
            htmlFor='cashTendered'
            className='block text-sm font-medium text-gray-700'
          >
            Cash Tendered
          </label>
          <Input
            type='number'
            id='cashTendered'
            name='cashTendered'
            value={cashTendered}
            onChange={handleChangeCashTendered}
            placeholder='Enter amount given'
            className='py-4 text-xl text-right'
            min={totalPrice}
            step='0.01' // Ensure 2 decimal places are allowed
            autoComplete='off'
          />

          {/* Show Change Due only if Cash Tendered is greater than or equal to totalPrice */}
          {cashTendered && paymentMethod === 'Cash' && isValidCash && (
            <p className='mt-2 text-sm text-gray-600'>
              Change Due:{' '}
              <span className='font-semibold text-black'>₱ {changeDue}</span>
            </p>
          )}

          {/* Show validation error if cashTendered is less than totalPrice */}
          {paymentMethod === 'Cash' && !isValidCash && (
            <p className='text-sm text-red-600 mt-1'>
              Cash tendered must be at least ₱{totalPrice.toFixed(2)}
            </p>
          )}
        </div>
      )}

      {/* Place Order Button */}
      <PlaceOrderButton />
    </form>
  )
}

export default PlaceOrderForm
