import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.$queryRaw`ALTER SEQUENCE "Order_invoiceNumber_seq" RESTART WITH 1;`
  console.log('Sequence reset!')
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect())
