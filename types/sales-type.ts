export interface OrderItem {
  orderId: string
  productId: string
  qty: number
  price: number
  name: string
  slug: string
  image: string
  product: {
    id: string
    createdAt: Date
    name: string
    slug: string
    category: string
    images: string[]
    brand: string
    description: string
    stock: number
    numReviews: number
    isFeatured: boolean
    banner: string | null
    price: string
    rating: string
  }
}
