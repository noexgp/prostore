// global.fetch = jest.fn(() =>
//   Promise.resolve({
//     ok: true,
//     json: () => Promise.resolve({ access_token: 'mocked-access-token' }),
//   })
// ) as jest.Mock

import { generateAccessToken, paypal } from '../lib/paypal'

//Test to generate acess token from paypal
test('generates token from paypal', async () => {
  const tokenResponse = await generateAccessToken()
  console.log(tokenResponse)
  expect(typeof tokenResponse).toBe('string')
  expect(tokenResponse.length).toBeGreaterThan(0)
  // expect(tokenResponse).toBe('mocked-access-token')
})

//test a create a paypal order
test('Creates a PayPal Order', async () => {
  const token = await generateAccessToken()
  const price = 10.0
  const orderResponse = await paypal.createOrder(price)
  console.log(orderResponse)

  expect(orderResponse).toHaveProperty('id')
  expect(orderResponse).toHaveProperty('status')
  expect(orderResponse.status).toBe('CREATED')
})

//Test to capture payment with mock order
test('simulate caputring a payment from an order', async () => {
  const orderId = '100'
  const mockCapturePayment = jest
    .spyOn(paypal, 'capturePayment')
    .mockResolvedValue({
      status: 'COMPLETED',
    })
  const captureResponse = await paypal.capturePayment(orderId)
  expect(captureResponse).toHaveProperty('status', 'COMPLETED')

  mockCapturePayment.mockRestore()
})
