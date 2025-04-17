import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  // Очищаем существующие данные
  await prisma.expense.deleteMany();
  await prisma.order.deleteMany();

  console.log('Существующие данные удалены');

  // Создаем 5 заказов с расходами
  for (let i = 1; i <= 5; i++) {
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - i * 2);
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7);
    
    const price = Math.floor(Math.random() * 50000) + 10000;
    const prepayment = Math.floor(price * (Math.random() * 0.5 + 0.3));
    
    const order = await prisma.order.create({
      data: {
        name: `Тестовый заказ ${i}`,
        phone: `+7${Math.floor(Math.random() * 10000000000)}`,
        messenger: Math.random() > 0.5 ? 'WhatsApp' : 'Telegram',
        startDate,
        endDate,
        price,
        prepayment,
        status: ['pending', 'inProgress', 'completed'][Math.floor(Math.random() * 3)],
        notes: `Это тестовый заказ номер ${i}. Здесь могут быть любые заметки по заказу.`,
        expenses: {
          create: [
            {
              name: 'Материалы',
              amount: Math.floor(Math.random() * 5000) + 1000,
              link: 'https://example.com/materials'
            },
            {
              name: 'Доставка',
              amount: Math.floor(Math.random() * 1000) + 500,
              link: null
            },
            {
              name: 'Услуги подрядчика',
              amount: Math.floor(Math.random() * 3000) + 2000,
              link: 'https://example.com/contractor'
            }
          ]
        }
      }
    });

    console.log(`Создан заказ: ${order.name} (ID: ${order.id})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 