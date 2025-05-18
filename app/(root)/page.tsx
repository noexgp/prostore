import {
  getLatestProducts,
  getFeaturedProducts,
} from '@/lib/actions/products.actions'
import ProductList from '@/components/shared/product/product-list'
import ProductCarousel from '@/components/shared/product/product-carousel'
import ViewAllProductsButton from '@/components/view-all-products-button'

export const metadata = {
  title: 'Home',
}

const Homepage = async () => {
  const latestProducts = await getLatestProducts()
  const featuredProducts = await getFeaturedProducts()

  return (
    <div>
      {featuredProducts.length > 0 && (
        <ProductCarousel data={featuredProducts} />
      )}

      <ProductList data={latestProducts} title='Newest Arrivals' limit={4} />
      <ViewAllProductsButton />
    </div>
  )
}

export default Homepage

///this will add delay to page to simulate loading page...
//const delay = (ms: number): Promise<void> =>
//new Promise((resolve) => setTimeout(resolve, ms))

// export const metadata = {
//   title: 'Home',
// }

// const Homepage = async () => {
//   await delay(2000)
//   return (
//     <div>
//       <h1>Prostore</h1>
//     </div>
//   )
// }

// export default Homepage
//////////////////
