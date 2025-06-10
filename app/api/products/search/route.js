import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim() || ''

    let products

    if (q.length > 0) {
      // Search by name or slug case-insensitive partial match
      products = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { slug: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          price: true,
          slug: true,
          category: true,
          brand: true,
        },
        take: 20,
      })
    } else {
      // No query, return default list
      products = await prisma.product.findMany({
        select: {
          id: true,
          name: true,
          price: true,
          slug: true,
          category: true,
          brand: true,
        },
        take: 20,
      })
    }

    return new Response(JSON.stringify(products), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
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
