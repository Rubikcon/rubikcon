import { PrismaClient, Prisma } from '@prisma/client'

function makePrisma() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          const MAX_RETRIES = 3
          for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
              return await query(args)
            } catch (err) {
              const isClosedConnection =
                err instanceof Error && err.message.includes('kind: Closed')
              const isKnownConnError =
                err instanceof Prisma.PrismaClientKnownRequestError &&
                ['P1001', 'P1002', 'P1008', 'P1017'].includes(err.code)
              const isInitError = err instanceof Prisma.PrismaClientInitializationError

              if (attempt < MAX_RETRIES - 1 && (isClosedConnection || isKnownConnError || isInitError)) {
                await new Promise(r => setTimeout(r, 2 ** attempt * 150))
                await client.$disconnect()
                await client.$connect()
                continue
              }
              throw err
            }
          }
          // unreachable
          return query(args)
        },
      },
    },
  })
}

type ExtendedPrismaClient = ReturnType<typeof makePrisma>
const globalForPrisma = globalThis as unknown as { prisma: ExtendedPrismaClient }

export const prisma = globalForPrisma.prisma || makePrisma()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
