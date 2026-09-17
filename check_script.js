const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  console.log(await prisma.user.findUnique({where:{email:'tuhin@tuhin.xyz'}}));
}
main().finally(() => prisma.$disconnect());
