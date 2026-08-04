import { prisma } from '../src/infrastructure/prisma/client'

async function promoteSuperAdmin() {
  const TARGET_EMAIL = 'duruobinnafranklin@gmail.com'

  try {
    console.log(`Looking up user with email: ${TARGET_EMAIL}...`)
    const user = await prisma.user.findUnique({
      where: { email: TARGET_EMAIL },
      select: { id: true, email: true, role: true },
    })

    if (!user) {
      console.error(`\n❌ Error: User with email '${TARGET_EMAIL}' does not exist.`)
      console.error(`Cannot promote a non-existent user. Please ensure the user is registered first.`)
      process.exit(1)
    }

    if (user.role === 'SUPER_ADMIN') {
      console.log(`\n✅ Success: User '${TARGET_EMAIL}' is already a SUPER_ADMIN.`)
      console.log(`No changes were necessary.`)
      process.exit(0)
    }

    console.log(`Promoting user '${TARGET_EMAIL}' from '${user.role}' to 'SUPER_ADMIN'...`)
    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'SUPER_ADMIN' },
    })

    console.log(`\n🚀 Success: User '${TARGET_EMAIL}' has been securely promoted to SUPER_ADMIN.`)
  } catch (error) {
    console.error(`\n❌ An unexpected error occurred during the promotion process:`)
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

void promoteSuperAdmin()
