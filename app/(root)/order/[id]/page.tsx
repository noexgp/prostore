import { Metadata } from 'next'
import { getOrderByID } from '@/lib/actions/order.actions'
import { notFound } from 'next/navigation'
import OrderDetailsTable from './order-details-table'
import { ShippingAddress } from '@/types'
import { auth } from '@/auth'

//export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Order Details',
}

const OrderDetailsPage = async (props: { params: Promise<{ id: string }> }) => {
  const { id } = await props.params
  const order = await getOrderByID(id)
  if (!order) notFound()
  const session = await auth()

  return (
    <OrderDetailsTable
      order={{
        ...order,
        shippingAddress: order.shippingAddress as ShippingAddress,
        cashTendered: order.cashTendered.toString(),
        changeDue: order.changeDue.toString(),
      }}
      paypalClientId={process.env.PAYPAL_CLIENT_ID || 'sb'}
      isAdmin={session?.user?.role === 'admin' || false}
    />
  )
}

export default OrderDetailsPage
