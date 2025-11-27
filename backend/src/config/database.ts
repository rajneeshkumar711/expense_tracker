import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

console.log('Attempting to connect to database...');
console.log('Database host:', connectionString.split('@')[1]?.split('/')[0] || 'unknown');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

prisma.$connect()
  .then(() => {
    console.log('Prisma connected to database successfully');
  })
  .catch((error) => {
    console.error('Failed to connect to database:', error.message);
    console.error('Please check your DATABASE_URL and ensure the database is accessible');
    console.error('Error details:', error);
  });

process.on('beforeExit', async () => {
  await prisma.$disconnect();
  console.log('Disconnected from database');
});

export default prisma;
