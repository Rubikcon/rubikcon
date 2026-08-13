import { v4 as uuidv4 } from 'uuid'
import { AppError } from '../../../../shared/errors/AppError'
import { courseCatalogRepository } from '../../course-catalog/repositories/course-catalog.repository'
import { paymentsRepository } from '../repositories/payments.repository'
import { PaystackProvider } from '../providers/paystack.provider'
import { NowPaymentsProvider } from '../providers/nowpayments.provider'
import { IPaymentProvider } from '../providers/payment-provider.interface'

export class PaymentsService {
  private paystack: IPaymentProvider
  private nowpayments: IPaymentProvider

  constructor() {
    this.paystack = new PaystackProvider()
    this.nowpayments = new NowPaymentsProvider()
  }

  async initializePayment(userId: string, email: string, courseId: string, currency: string) {
    const course = await courseCatalogRepository.findById(courseId)
    if (!course) throw new AppError('Course not found', 404)

    if (!course.isPaid) {
      throw new AppError('Course is free. Use direct enrollment endpoint.', 400)
    }

    const curr = currency.toUpperCase()
    
    let basePriceStr: string
    let payableAmount: number
    let provider: IPaymentProvider
    let providerEnum: 'PAYSTACK' | 'NOWPAYMENTS'
    let paymentMethod: string

    if (curr === 'NGN' || curr === 'USD') {
      // Fiat -> Paystack
      provider = this.paystack
      providerEnum = 'PAYSTACK'
      paymentMethod = 'CARD'
      const price = curr === 'NGN' ? course.priceNgn : course.priceUsd
      
      if (!price) {
        throw new AppError(`Price not configured for ${curr}`, 400)
      }
      
      basePriceStr = price.toString()
      payableAmount = Number(price)
      
      if (course.discountPercent) {
        payableAmount = payableAmount * (1 - course.discountPercent / 100)
      }
    } else {
      // Crypto -> NOWPayments. Base currency passed to NOWPayments is USD.
      provider = this.nowpayments
      providerEnum = 'NOWPAYMENTS'
      paymentMethod = 'CRYPTO'
      
      if (!course.priceUsd) {
        throw new AppError('USD Price not configured for this course. Required for crypto conversion.', 400)
      }
      
      basePriceStr = course.priceUsd.toString()
      payableAmount = Number(course.priceUsd)
      
      if (course.discountPercent) {
        payableAmount = payableAmount * (1 - course.discountPercent / 100)
      }
    }

    const internalReference = uuidv4()

    const payment = await paymentsRepository.createPayment({
      internalReference,
      userId,
      courseId,
      basePrice: basePriceStr,
      baseCurrency: curr === 'NGN' ? 'NGN' : 'USD',
      payableAmount: payableAmount.toString(),
      paymentCurrency: curr, 
      provider: providerEnum,
      paymentMethod
    })

    try {
      const initResult = await provider.initializePayment(internalReference, payableAmount, curr, email)
      
      if (initResult.providerReference) {
        await paymentsRepository.updatePaymentProviderDetails(payment.id, initResult.providerReference)
      }

      return {
        checkoutUrl: initResult.checkoutUrl,
        internalReference
      }
    } catch (err: any) {
      await paymentsRepository.markPaymentFailed(payment.id, { error: err.message })
      throw err
    }
  }

  async verifyPaystackWebhook(signature: string, payload: any, rawBody: string) {
    if (!this.paystack.verifyWebhookSignature(rawBody, signature)) {
      throw new AppError('Invalid signature', 401)
    }

    const event = payload.event
    const data = payload.data

    if (event === 'charge.success') {
      const internalReference = data.reference
      const providerReference = data.id.toString()

      const payment = await paymentsRepository.findByInternalReference(internalReference)
      if (!payment) return { status: 'ignored', reason: 'payment not found' }
      if (payment.status === 'SUCCESS') return { status: 'success', reason: 'already processed' }

      // Validate amount (Paystack sends subunit)
      const expectedSubunit = Math.round(Number(payment.payableAmount) * 100)
      if (data.amount !== expectedSubunit) {
        await paymentsRepository.markPaymentFailed(payment.id, { reason: 'Amount mismatch', payload: data })
        return { status: 'failed', reason: 'amount mismatch' }
      }
      
      if (data.currency !== payment.paymentCurrency) {
        await paymentsRepository.markPaymentFailed(payment.id, { reason: 'Currency mismatch', payload: data })
        return { status: 'failed', reason: 'currency mismatch' }
      }

      // Mark success & Enroll safely via transaction
      await paymentsRepository.updatePaymentProviderDetails(payment.id, providerReference)
      await paymentsRepository.handleSuccessfulPayment(
        payment.id, 
        payment.userId, 
        payment.courseId, 
        data
      )
      
      return { status: 'success' }
    }
    
    return { status: 'ignored' }
  }

  async verifyNowPaymentsWebhook(signature: string, payload: any, rawBody: string) {
    if (!this.nowpayments.verifyWebhookSignature(rawBody, signature)) {
      throw new AppError('Invalid signature', 401)
    }

    const status = payload.payment_status
    const internalReference = payload.order_id

    const payment = await paymentsRepository.findByInternalReference(internalReference)
    if (!payment) return { status: 'ignored', reason: 'payment not found' }
    if (payment.status === 'SUCCESS') return { status: 'success', reason: 'already processed' }

    if (status === 'finished') {
      await paymentsRepository.handleSuccessfulPayment(
        payment.id, 
        payment.userId, 
        payment.courseId, 
        payload
      )
      return { status: 'success' }
    } else if (status === 'failed' || status === 'expired') {
      await paymentsRepository.markPaymentFailed(payment.id, payload)
      return { status: 'failed' }
    }

    return { status: 'ignored', state: status }
  }

  async getPaymentStatus(internalReference: string, userId: string) {
    const payment = await paymentsRepository.findByInternalReference(internalReference)
    if (!payment) throw new AppError('Payment not found', 404)
    if (payment.userId !== userId) throw new AppError('Unauthorized', 403)

    return {
      status: payment.status,
      courseId: payment.courseId
    }
  }

  async getAdminPayments(skip: number, limit: number) {
    return paymentsRepository.findAllPaymentsAdmin(skip, limit)
  }
}

export const paymentsService = new PaymentsService()
