import * as crypto from 'crypto'
import { IPaymentProvider, InitializationResult } from './payment-provider.interface'
import { AppError } from '../../../../shared/errors/AppError'
import { config } from '../../../../config/env'

export class NowPaymentsProvider implements IPaymentProvider {
  private apiKey: string
  private ipnSecret: string

  constructor() {
    this.apiKey = process.env.NOWPAYMENTS_API_KEY || ''
    this.ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET || ''
    if (!this.apiKey || !this.ipnSecret) {
      console.warn('NOWPAYMENTS_API_KEY or NOWPAYMENTS_IPN_SECRET is not set in the environment variables.')
    }
  }

  async initializePayment(
    internalReference: string,
    amount: number,
    currency: string,
    email: string
  ): Promise<InitializationResult> {
    try {
      const response = await fetch((process.env.NOWPAYMENTS_API_URL || "https://api.nowpayments.io/v1") + "/invoice", {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_amount: amount,
          price_currency: currency.toLowerCase(), // NOWPayments often expects lowercase 'usd'
          order_id: internalReference,
          order_description: "Course Enrollment",
          success_url: `${config.academyUrl}/dashboard`,
        }),
      })

      const data = await response.json() as any

      if (!response.ok) {
        throw new Error(data.message || 'Failed to initialize NOWPayments transaction')
      }

      return {
        checkoutUrl: data.invoice_url,
        providerReference: data.id.toString(),
      }
    } catch (error: any) {
      throw new AppError(`NOWPayments Initialization Error: ${error.message}`, 500)
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.ipnSecret || !signature) return false

    const hash = crypto
      .createHmac('sha512', this.ipnSecret)
      .update(payload)
      .digest('hex')

    return hash === signature
  }
}
