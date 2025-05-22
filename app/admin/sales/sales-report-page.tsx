/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { DatePickerWithRange } from '@/components/admin/date-picker-with-range'
import { getSalesByDateRange } from '@/lib/actions/order.actions'

type ProductSummary = {
  id: string
  name: string
  category: string
  price: string
}

type GroupedItem = {
  product: ProductSummary
  qty: number
  totalPrice: number
}

type GroupedSales = {
  [category: string]: GroupedItem[]
}

type PaymentMethodSales = {
  [method: string]: {
    qty: number
    total: number
  }
}

export default function SalesReportPage() {
  const [groupedSales, setGroupedSales] = useState<GroupedSales>({})
  const [paymentMethodSales, setPaymentMethodSales] =
    useState<PaymentMethodSales>({})

  const [dataLoaded, setDataLoaded] = useState(false)

  const handleDateChange = async (range: { from?: Date; to?: Date }) => {
    if (!range.from || !range.to) return

    const data = await getSalesByDateRange(range.from, range.to)

    const grouped: GroupedSales = {}
    const paymentGrouped: PaymentMethodSales = {}

    data.forEach((item: any) => {
      const category = item.product.category
      const price = Number(item.price)
      const total = item.qty * price

      // Group by category
      grouped[category] ??= []
      const existing = grouped[category].find(
        (i) => i.product.id === item.product.id
      )

      if (existing) {
        existing.qty += item.qty
        existing.totalPrice += total
      } else {
        grouped[category].push({
          product: item.product,
          qty: item.qty,
          totalPrice: total,
        })
      }

      // Group by payment method
      const paymentMethod = item.order.paymentMethod ?? 'Unknown'
      paymentGrouped[paymentMethod] ??= { qty: 0, total: 0 }
      paymentGrouped[paymentMethod].qty += item.qty
      paymentGrouped[paymentMethod].total += total
    })

    setGroupedSales(grouped)
    setPaymentMethodSales(paymentGrouped)
    setDataLoaded(true)
  }

  const grandTotal = Object.values(groupedSales).reduce(
    (acc, items) => {
      items.forEach((item) => {
        acc.qty += item.qty
        acc.total += item.totalPrice
      })
      return acc
    },
    { qty: 0, total: 0 }
  )

  const downloadCSV = () => {
    const rows: string[] = []
    const headers = [
      'Category',
      'Product Name',
      'Unit Price',
      'Qty Sold',
      'Total Sales',
    ]
    rows.push(headers.join(','))

    Object.entries(groupedSales).forEach(([category, items]) => {
      items.forEach((item) => {
        const row = [
          `"${category}"`,
          `"${item.product.name}"`,
          parseFloat(item.product.price).toFixed(2),
          item.qty,
          item.totalPrice.toFixed(2),
        ]
        rows.push(row.join(','))
      })
    })

    const csvContent = rows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `sales-report-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className='p-4 space-y-4'>
      <h1 className='text-xl font-bold'>Sales Report</h1>

      <DatePickerWithRange onDateChange={handleDateChange} />

      {/* Show download button only if data is loaded */}
      {dataLoaded && (
        <button
          onClick={downloadCSV}
          className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
        >
          Download CSV
        </button>
      )}

      {/* Grouped by category */}
      {Object.entries(groupedSales).map(([category, items]) => {
        const subtotal = items.reduce(
          (acc, item) => ({
            qty: acc.qty + item.qty,
            total: acc.total + item.totalPrice,
          }),
          { qty: 0, total: 0 }
        )

        return (
          <div key={category} className='mt-6'>
            <h2 className='text-lg font-semibold mb-2'>{category}</h2>
            <div className='overflow-x-auto'>
              <table className='w-full table-auto border border-gray-300'>
                <thead className='bg-gray-100'>
                  <tr>
                    <th className='border p-2 text-left'>Product</th>
                    <th className='border p-2 text-right'>Unit Price</th>
                    <th className='border p-2 text-right'>Qty Sold</th>
                    <th className='border p-2 text-right'>Total Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.product.id}>
                      <td className='border p-2'>{item.product.name}</td>
                      <td className='border p-2 text-right'>
                        ${parseFloat(item.product.price).toFixed(2)}
                      </td>
                      <td className='border p-2 text-right'>{item.qty}</td>
                      <td className='border p-2 text-right'>
                        ${item.totalPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className='bg-gray-100 font-semibold'>
                    <td className='border p-2' colSpan={2}>
                      Subtotal
                    </td>
                    <td className='border p-2 text-right'>{subtotal.qty}</td>
                    <td className='border p-2 text-right'>
                      ${subtotal.total.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )
      })}

      {/* Grand Total */}
      {grandTotal.qty > 0 && (
        <div className='overflow-x-auto mt-8'>
          <table className='w-full table-auto border border-gray-400'>
            <thead className='bg-gray-200'>
              <tr>
                <th className='border p-2 text-left' colSpan={2}>
                  TOTAL
                </th>
                <th className='border p-2 text-right'>Qty</th>
                <th className='border p-2 text-right'>Sales</th>
              </tr>
            </thead>
            <tbody>
              <tr className='bg-gray-300 font-bold'>
                <td className='border p-2 text-left' colSpan={2}>
                  All Categories
                </td>
                <td className='border p-2 text-right'>{grandTotal.qty}</td>
                <td className='border p-2 text-right'>
                  ${grandTotal.total.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Sales by Payment Method */}
      {Object.keys(paymentMethodSales).length > 0 && (
        <div className='overflow-x-auto mt-8'>
          <h2 className='text-lg font-semibold mb-2'>
            Sales by Payment Method
          </h2>
          <table className='w-full table-auto border border-gray-300'>
            <thead className='bg-gray-100'>
              <tr>
                <th className='border p-2 text-left'>Payment Method</th>
                <th className='border p-2 text-right'>Qty</th>
                <th className='border p-2 text-right'>Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(paymentMethodSales).map(([method, stats]) => (
                <tr key={method}>
                  <td className='border p-2'>{method}</td>
                  <td className='border p-2 text-right'>{stats.qty}</td>
                  <td className='border p-2 text-right'>
                    ${stats.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
