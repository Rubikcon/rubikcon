/**
 * One-shot script to create or update a SUPER_ADMIN user.
 *
 * Usage (local):
 *   SUPERADMIN_EMAIL=sudoadmin@rubikconacademy.xyz \
 *   SUPERADMIN_PASSWORD='your-strong-password-here' \
 *   SUPERADMIN_NAME='Sudo Admin' \
 *   npx tsx scripts/create-superadmin.ts
 *
 * Usage (Render shell):
 *   1. Open your backend service on render.com → Shell tab
 *   2. Run the same command (with your real password)
 *
 * The script is idempotent: re-running with the same email updates the
 * password and ensures the role is SUPER_ADMIN.
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.SUPERADMIN_PASSWORD
  const name = process.env.SUPERADMIN_NAME?.trim() || 'Super Admin'

  if (!email) {
    console.error('Missing SUPERADMIN_EMAIL env var')
    process.exit(1)
  }
  if (!password || password.length < 8) {
    console.error('Missing or short SUPERADMIN_PASSWORD env var (must be 8+ chars)')
    process.exit(1)
  }

  const hashed = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashed,
      name,
      role: 'SUPER_ADMIN',
    },
    create: {
      email,
      password: hashed,
      name,
      role: 'SUPER_ADMIN',
    },
  })

  // Round-trip the password through bcrypt.compare to confirm it can be verified.
  const verified = await bcrypt.compare(password, user.password)

  // Mask the password but keep enough characters to confirm you typed it right.
  const masked = password.length <= 4
    ? '*'.repeat(password.length)
    : `${password.slice(0, 2)}${'*'.repeat(password.length - 4)}${password.slice(-2)}`

  console.log('')
  console.log('═══════════════════════════════════════════════════')
  console.log(' Super admin account ready — use these to log in')
  console.log('═══════════════════════════════════════════════════')
  console.log(`  Email:    ${user.email}`)
  console.log(`  Password: ${masked}  (length=${password.length})`)
  console.log(`  Name:     ${user.name}`)
  console.log(`  Role:     ${user.role}`)
  console.log(`  User ID:  ${user.id}`)
  console.log(`  Password verifies: ${verified ? '✅' : '❌'}`)
  console.log('═══════════════════════════════════════════════════')
  console.log('')
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
