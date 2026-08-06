import { prisma } from './src/infrastructure/prisma/client';
async function main() { const users = await prisma.user.findMany({ take: 1 }); console.log('Users OK'); }
main().catch(console.error).finally(() => prisma.$disconnect());
