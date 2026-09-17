const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const start = Date.now();
  const bills = await prisma.bill.count();
  const expenses = await prisma.expense.count();
  const units = await prisma.unit.count();
  const messages = await prisma.message.count();
  console.log(`Bills: ${bills}, Expenses: ${expenses}, Units: ${units}, Messages: ${messages}`);
  console.log(`Time: ${Date.now() - start}ms`);
}

check().catch(console.error).finally(() => prisma.$disconnect());
