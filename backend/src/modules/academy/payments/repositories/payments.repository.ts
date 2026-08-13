import { prisma } from '../../../../infrastructure/prisma/client'
import { Prisma } from '@prisma/client'

export class PaymentsRepository {
  async createPayment(data: any) {
    return prisma.payment.create({ data })
  }

  async findByInternalReference(internalReference: string) {
    return prisma.payment.findUnique({
      where: { internalReference },
      include: { course: true, user: true }
    })
  }

  async findByProviderReference(providerReference: string) {
    return prisma.payment.findUnique({
      where: { providerReference },
      include: { course: true, user: true }
    })
  }
  
  async updatePaymentProviderDetails(id: string, providerReference: string) {
    return prisma.payment.update({
      where: { id },
      data: { providerReference }
    })
  }

  async handleSuccessfulPayment(
    paymentId: string,
    userId: string,
    courseId: string,
    providerMetadata?: any
  ) {
    return prisma.$transaction(async (tx: any) => {
      // 1. Mark payment as SUCCESS
      let enrollment = await tx.courseEnrollment.findUnique({
        where: { userId_courseId: { userId, courseId } }
      })

      if (!enrollment) {
        enrollment = await tx.courseEnrollment.create({
          data: { userId, courseId }
        })
      }

      const payment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'SUCCESS',
          enrollmentId: enrollment.id,
          paidAt: new Date(),
          providerMetadata: providerMetadata || undefined
        }
      })

      return payment
    })
  }

  async markPaymentFailed(paymentId: string, providerMetadata?: any) {
    return prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'FAILED',
        providerMetadata: providerMetadata || undefined
      }
    })
  }

  async findUserPayments(userId: string) {
    return prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { course: true }
    })
  }

  async findAllPaymentsAdmin(skip: number, limit: number) {
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { course: true, user: true }
      }),
      prisma.payment.count()
    ])
    return { payments, total }
  }
}

export const paymentsRepository = new PaymentsRepository()
