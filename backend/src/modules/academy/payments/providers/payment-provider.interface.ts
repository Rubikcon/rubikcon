export interface InitializationResult {
  checkoutUrl: string
  providerReference?: string
}

export interface IPaymentProvider {
  /**
   * Initializes a payment session with the provider.
   * @param internalReference The unique internal reference for the payment.
   * @param amount The amount in MAJOR units (e.g. 150000 for NGN 150,000). The provider handles subunit conversion.
   * @param currency The currency code (e.g. 'NGN', 'USD').
   * @param email The user's email address.
   */
  initializePayment(
    internalReference: string,
    amount: number,
    currency: string,
    email: string
  ): Promise<InitializationResult>

  /**
   * Verifies the signature of an incoming webhook payload.
   * @param payload The raw webhook payload string.
   * @param signature The signature from the headers.
   */
  verifyWebhookSignature(payload: string, signature: string): boolean
}
