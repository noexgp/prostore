'use client'

import React, { useRef } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Button } from './ui/button'

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
  totalPrice: number
  taxRate: number
  notes: string
}
type InvoiceProps = {
  data: InvoiceData
}

const Invoice: React.FC<InvoiceProps> = ({ data }) => {
  const printRef = useRef(null)

  const handleDownloadPdf = async () => {
    const element = printRef.current
    if (!element) return

    const canvas = await html2canvas(element, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`invoice-${data.invoiceNumber}.pdf`)
  }

  const handlePrint = () => {
    if (!printRef.current) return

    const printContents = (printRef.current as HTMLElement).innerHTML
    const originalContents = document.body.innerHTML

    document.body.innerHTML = printContents
    window.print()
    document.body.innerHTML = originalContents
    window.location.reload() // Reload to restore event handlers, styles, etc.
  }

  const subtotal = data.items.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0
  )
  const tax = data.taxRate ? subtotal * data.taxRate : 0
  const total = subtotal + tax

  return (
    <div className='p-6'>
      <div
        ref={printRef}
        className='bg-white p-8 shadow-md text-sm text-gray-800 space-y-6'
      >
        <div className='flex justify-between items-center border-b pb-4'>
          <div>
            <h1 className='text-2xl font-bold'>{data.company.name}</h1>
            <p>
              {data.company.address}
              <br />
              {data.company.email}
            </p>
          </div>
          <div className='text-right'>
            <h2 className='text-xl font-semibold'>INVOICE</h2>
            <p>
              Invoice #: {data.invoiceNumber}
              <br />
              Date: {data.invoiceDate}
              <br />
              Due: {data.dueDate}
            </p>
          </div>
        </div>

        <div className='flex justify-between'>
          <div>
            <h3 className='font-semibold'>Billed To:</h3>
            <p>
              {data.customer.name}
              <br />
              {data.customer.address}
            </p>
          </div>
          <div>
            <h3 className='font-semibold'>Payment Method:</h3>
            <p>{data.paymentMethod}</p>
          </div>
        </div>

        <div className='border rounded overflow-hidden'>
          <table className='w-full table-auto text-left'>
            <thead className='bg-gray-100'>
              <tr>
                <th className='p-2 border'>Item</th>
                <th className='p-2 border'>Qty</th>
                <th className='p-2 border'>Price</th>
                <th className='p-2 border'>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={index}>
                  <td className='p-2 border'>{item.description}</td>
                  <td className='p-2 border'>{item.quantity}</td>
                  <td className='p-2 border'>₱{item.rate.toFixed(2)}</td>
                  <td className='p-2 border'>
                    ${(item.quantity * item.rate).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className='p-2 text-right font-semibold border'>
                  Subtotal
                </td>
                <td className='p-2 border'>₱{subtotal.toFixed(2)}</td>
              </tr>
              {data.taxRate && (
                <tr>
                  <td
                    colSpan={3}
                    className='p-2 text-right font-semibold border'
                  >
                    Tax ({(data.taxRate * 100).toFixed(0)}%)
                  </td>
                  <td className='p-2 border'>₱{tax.toFixed(2)}</td>
                </tr>
              )}
              <tr>
                <td colSpan={3} className='p-2 text-right font-bold border'>
                  Total
                </td>
                <td className='p-2 font-bold border'>₱{total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {data.notes && (
          <div>
            <h3 className='font-semibold'>Notes:</h3>
            <p>{data.notes}</p>
          </div>
        )}
      </div>

      <div className='flex justify-between mt-6'>
        <Button
          onClick={handleDownloadPdf}
          className='px-6 py-3 rounded w-full sm:w-auto'
        >
          Download Invoice as PDF
        </Button>

        <Button
          onClick={handlePrint}
          variant='secondary' // optional, if you have a secondary button style
          className='px-6 py-3 rounded w-full sm:w-auto'
        >
          Print Invoice
        </Button>
      </div>
    </div>
  )
}

export default Invoice
