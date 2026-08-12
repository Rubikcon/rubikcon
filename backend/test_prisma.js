const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 

async function main() { 
  const c = await prisma.course.findUnique({ 
    where: { slug: 'nulla-decens-amoveo-19' }, 
    include: { modules: true, weeks: true, courseFacilitators: { include: { facilitator: true } } } 
  }); 
  console.log(JSON.stringify(c, null, 2)); 
  await prisma.$disconnect(); 
} 
main().catch(console.error);