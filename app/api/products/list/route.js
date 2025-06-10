import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        brand: true,
      },
      take: 20, // limit number of results
    })

    return new Response(JSON.stringify(products), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        details: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
