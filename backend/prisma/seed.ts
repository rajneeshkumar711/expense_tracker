import { PrismaClient, Role, ExpenseStatus, ExpenseCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  await prisma.expense.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@company.com',
      password: hashedPassword,
      name: 'Admin User',
      role: Role.ADMIN,
    },
  });

  const employee1 = await prisma.user.create({
    data: {
      email: 'john@company.com',
      password: hashedPassword,
      name: 'John Doe',
      role: Role.EMPLOYEE,
    },
  });

  const employee2 = await prisma.user.create({
    data: {
      email: 'jane@company.com',
      password: hashedPassword,
      name: 'Jane Smith',
      role: Role.EMPLOYEE,
    },
  });

  console.log('Created users:', { admin, employee1, employee2 });

  const expenses = await Promise.all([
    prisma.expense.create({
      data: {
        amount: 250.50,
        category: ExpenseCategory.TRAVEL,
        description: 'Taxi to client meeting',
        date: new Date('2024-01-15'),
        status: ExpenseStatus.APPROVED,
        userId: employee1.id,
      },
    }),
    prisma.expense.create({
      data: {
        amount: 45.00,
        category: ExpenseCategory.FOOD,
        description: 'Team lunch',
        date: new Date('2024-01-20'),
        status: ExpenseStatus.APPROVED,
        userId: employee1.id,
      },
    }),
    prisma.expense.create({
      data: {
        amount: 120.00,
        category: ExpenseCategory.SOFTWARE,
        description: 'Software license renewal',
        date: new Date('2024-02-01'),
        status: ExpenseStatus.PENDING,
        userId: employee1.id,
      },
    }),
    prisma.expense.create({
      data: {
        amount: 500.00,
        category: ExpenseCategory.EQUIPMENT,
        description: 'New keyboard and mouse',
        date: new Date('2024-01-10'),
        status: ExpenseStatus.APPROVED,
        userId: employee2.id,
      },
    }),
    prisma.expense.create({
      data: {
        amount: 75.50,
        category: ExpenseCategory.OFFICE_SUPPLIES,
        description: 'Notebooks and pens',
        date: new Date('2024-01-25'),
        status: ExpenseStatus.PENDING,
        userId: employee2.id,
      },
    }),
    prisma.expense.create({
      data: {
        amount: 300.00,
        category: ExpenseCategory.TRAINING,
        description: 'Online course subscription',
        date: new Date('2024-02-05'),
        status: ExpenseStatus.REJECTED,
        userId: employee2.id,
      },
    }),
    prisma.expense.create({
      data: {
        amount: 1200.00,
        category: ExpenseCategory.TRAVEL,
        description: 'Flight to conference',
        date: new Date('2024-01-05'),
        status: ExpenseStatus.APPROVED,
        userId: admin.id,
      },
    }),
    prisma.expense.create({
      data: {
        amount: 85.00,
        category: ExpenseCategory.ENTERTAINMENT,
        description: 'Client dinner',
        date: new Date('2024-01-18'),
        status: ExpenseStatus.APPROVED,
        userId: admin.id,
      },
    }),
  ]);

  console.log(`Created ${expenses.length} expenses`);
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
