'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import Invoice, { InvoiceData } from './invoice'

type Props = {
  data: InvoiceData
}

const InvoiceDialog = ({ data }: Props) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='default'>Preview Invoice</Button>
      </DialogTrigger>

      <DialogContent className='max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Invoice Preview</DialogTitle>
        </DialogHeader>

        {/* Render the Invoice inside the dialog */}
        <Invoice data={data} />
      </DialogContent>
    </Dialog>
  )
}

export default InvoiceDialog
