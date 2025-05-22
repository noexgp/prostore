/* eslint-disable @typescript-eslint/no-unused-vars */
'use server'

import { z } from 'zod'
import { insertReviewSchema } from '../validators'
import { formatError } from '../utils'
import { auth } from '@/auth'
import { prisma } from '@/db/prisma'
import { revalidatePath } from 'next/cache'
//create & Update Reviews
export async function createUpdateReview(
  data: z.infer<typeof insertReviewSchema>
) {
  try {
    const session = await auth()
    if (!session) throw new Error('User not authenticated')

    // Validate and store the review
    const review = insertReviewSchema.parse({
      ...data,
      userId: session?.user?.id,
    })

    // Get product that is being reviewed
    const product = await prisma.product.findFirst({
      where: { id: review.productId },
    })
    if (!product) throw new Error('Product not found')

    //Check if user already reviewed
    const reviewedExist = await prisma.review.findFirst({
      where: {
        productId: review.productId,
        userId: review.userId,
      },
    })

    await prisma.$transaction(async (tx) => {
      if (reviewedExist) {
        //Update review
        await tx.review.update({
          where: { id: reviewedExist.id },
          data: {
            title: review.title,
            description: review.description,
            rating: review.rating,
          },
        })
      } else {
        //Create review
        await tx.review.create({
          data: review,
        })
      }

      //Get the averate rating
      const averageRating = await tx.review.aggregate({
        _avg: { rating: true },
        where: { productId: review.productId },
      })

      //Get the number of reviews
      const numReviews = await tx.review.count({
        where: { productId: review.productId },
      })

      //Update the raring and numReviews
      await tx.product.update({
        where: { id: review.productId },
        data: {
          rating: averageRating._avg.rating || 0,
          numReviews,
        },
      })
    })

    revalidatePath(`/products/${product.slug}`)
    return {
      success: true,
      message: 'Review Updated Successfully',
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    }
  }
}

// Get all reviews for a product
export async function getReviews({ productId }: { productId: string }) {
  const data = await prisma.review.findMany({
    where: {
      productId: productId,
    },
    include: {
      user: {
        select: { name: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return { data }
}

// Get a review written by the current user
export async function getReviewByProductId({
  productId,
}: {
  productId: string
}) {
  const session = await auth()

  if (!session) throw new Error('User is not authenticated')

  return await prisma.review.findFirst({
    where: {
      productId,
      userId: session?.user?.id,
    },
  })
}
