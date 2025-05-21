import { z } from 'zod'
import {
  insertProductSchema,
  insertCartSchema,
  cartItemSchema,
  shippingAddressSchema,
  insertOrderItemSchema,
  insertOrderSchema,
  paymentResultSchema,
  insertReviewSchecma,
} from '@/lib/validators'

export type Product = z.infer<typeof insertProductSchema> & {
  id: string
  rating: string
  numReviews: number
  createdAt: Date
}

export type Cart = z.infer<typeof insertCartSchema>

export type CartItem = z.infer<typeof cartItemSchema>

export type ShippingAddress = z.infer<typeof shippingAddressSchema>

export type OrderItem = z.infer<typeof insertOrderItemSchema>

export type Order = z.infer<typeof insertOrderSchema> & {
  id: string
  createdAt: Date
  isPaid: boolean
  paidAt: Date | null
  isDelivered: boolean
  deliveredAt: Date | null
  orderitems: OrderItem[]
  user: { name: string; email: string }
  paymentResult: PaymentResult
  invoiceNumber: number
}

export type PaymentResult = z.infer<typeof paymentResultSchema>

export type Review = z.infer<typeof insertReviewSchecma> & {
  id: string
  createdAt: Date
  user?: { name: string }
}

export type InvoiceData = {
  company: {
    name: string
    address: string
    email: string
  }
  customer: {
    name: string
    address: string
  }
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  paymentMethod: string
  items: {
    description: string
    quantity: number
    rate: number
  }[]
  taxRate: number
  notes: string
}
