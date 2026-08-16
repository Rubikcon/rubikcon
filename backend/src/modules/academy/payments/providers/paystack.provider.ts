import * as crypto from 'crypto'
import { IPaymentProvider, InitializationResult } from './payment-provider.interface'
import { AppError } from '../../../../shared/errors/AppError';
import { config } from '../../../../config/env';

export class PaystackProvider implements IPaymentProvider {
  private secretKey: string

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY || ''
    if (!this.secretKey) {
      console.warn('PAYSTACK_SECRET_KEY is not set in the environment variables.')
    }
  }

  async initializePayment(
    internalReference: string,
    amount: number,
    currency: string,
    email: string
  ): Promise<InitializationResult> {
    if (currency !== 'NGN' && currency !== 'USD') {
      throw new AppError(`Paystack does not support currency: ${currency}`, 400)
    }

    // Paystack expects amount in subunit (kobo for NGN, cents for USD)
    const amountInSubunit = Math.round(amount * 100)

    try {
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference: internalReference,
          amount: amountInSubunit,
          currency,
          email,
          callback_url: `${config.academyUrl}/dashboard`
        }),
      })

      const data = await response.json() as any

      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to initialize Paystack transaction')
      }

      return {
        checkoutUrl: data.data.authorization_url,
        providerReference: data.data.reference, // Paystack echoes back the reference
      }
    } catch (error: any) {
      throw new AppError(`Paystack Initialization Error: ${error.message}`, 500)
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.secretKey || !signature) return false

    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(payload)
      .digest('hex')

    return hash === signature
  }
}
