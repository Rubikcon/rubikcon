/**
 * Quick diagnostic: verify a user exists, their role, and that a given
 * password hash matches.
 *
 * Usage:
 *   CHECK_EMAIL=sudoadmin@rubikconacademy.xyz \
 *   CHECK_PASSWORD='the-password-you-set' \
 *   npx tsx scripts/check-user.ts
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.CHECK_EMAIL?.trim().toLowerCase()
  const password = process.env.CHECK_PASSWORD

  if (!email) {
    console.error('Missing CHECK_EMAIL env var')
    process.exit(1)
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.log(`❌ No user found with email "${email}"`)
    console.log('Searching for similar emails...')
    const similar = await prisma.user.findMany({
      where: { email: { contains: email.split('@')[0] } },
      select: { email: true, role: true },
    })
    console.log('Similar users:', similar)
    process.exit(1)
  }

  console.log('✅ User found:')
  console.log(`   id:    ${user.id}`)
  console.log(`   email: ${user.email}`)
  console.log(`   name:  ${user.name}`)
  console.log(`   role:  ${user.role}`)
  console.log(`   created: ${user.createdAt.toISOString()}`)

  if (password) {
    const matches = await bcrypt.compare(password, user.password)
    console.log(`\n   Password match: ${matches ? '✅ YES' : '❌ NO'}`)
  } else {
    console.log('\n   (skip password check — set CHECK_PASSWORD to verify)')
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
