import { Metadata } from 'next'
import { getOrderById } from '@/lib/actions/order.actions'
import { notFound } from 'next/navigation'
import OrderDetailsTable from './order-details-table'
import { ShippingAddress } from '@/types'
import { auth } from '@/auth'

//export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Order Details',
}

type PaypalResult = {
  id: string
  status: string
  email_address: string
  pricePaid: string
}

const OrderDetailsPage = async (props: { params: Promise<{ id: string }> }) => {
  const { id } = await props.params

  const order = await getOrderById(id)

  if (!order) notFound()
  const session = await auth()

  return (
    <OrderDetailsTable
      order={{
        ...order,
        shippingAddress: order.shippingAddress as ShippingAddress,
        paymentResult: order.paymentResult as PaypalResult,
        cashTendered: String(order.cashTendered),
        changeDue: String(order.changeDue),
        taxPrice: String(order.taxPrice),
        totalPrice: String(order.totalPrice),
        itemsPrice: String(order.itemsPrice),
      }}
      paypalClientId={process.env.PAYPAL_CLIENT_ID || 'sb'}
      isAdmin={session?.user?.role === 'admin' || false}
    />
  )
}

export default OrderDetailsPage
