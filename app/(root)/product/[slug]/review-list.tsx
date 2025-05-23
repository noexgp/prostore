/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useEffect } from 'react'
import { Review } from '@/types'
import Link from 'next/link'
import { useState } from 'react'
import ReviewForm from './review-form'
import { getReviews } from '@/lib/actions/review.actions'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Calendar, User } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import Rating from '@/components/shared/product/rating'

const ReviewList = ({
  userId,
  productId,
  productSlug,
}: {
  userId: string
  productId: string
  productSlug: string
}) => {
  const [review, setReviews] = useState<Review[]>([])

  useEffect(() => {
    const loadReviews = async () => {
      const res = await getReviews({ productId })
      setReviews(res.data)
    }

    loadReviews()
  }, [productId])

  //reload reviews after create or update
  const reload = async () => {
    const res = await getReviews({ productId })
    setReviews([...res.data])
  }
  return (
    <div className='space-y-4 '>
      {review.length === 0 && <div>No reivews yet</div>}
      {userId ? (
        <ReviewForm
          userId={userId}
          productId={productId}
          onReviewSubmitted={reload}
        />
      ) : (
        <>
          <div>
            Please
            <Link
              href={`/sign-in?callbackUrl=/product/${productSlug}`}
              className='text-blue-700 px-2'
            >
              sign in
            </Link>
            to write a review
          </div>
        </>
      )}
      <div className='flex flex-col gap-3'>
        {review.map((review) => (
          <Card key={review.id}>
            <CardHeader>
              <div className='flex-between'>
                <CardTitle>{review.title}</CardTitle>
              </div>
              <CardDescription>{review.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex space-x-4 text-sm text-muted-foreground'>
                <Rating value={review.rating} />
                <div className='flex items-center'>
                  <User className='mr-1 h3 w-3' />{' '}
                  {review.user ? review.user.name : 'User'}
                </div>
                <div className='flex items-center'>
                  <Calendar className='mr-1 h3 w-3' />
                  {formatDateTime(review.createdAt).dateTime}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ReviewList
