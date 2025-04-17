import prisma from '../lib/db.js';

// GET /api/orders
export const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        expenses: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
  }
};

// GET /api/orders/:id
export const getOrder = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        expenses: true
      },
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order', details: error.message });
  }
};

// POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const { expenses, ...orderData } = req.body;
    
    // Преобразуем строковые даты в объекты Date
    const formattedOrderData = {
      ...orderData,
      startDate: orderData.startDate ? new Date(orderData.startDate) : null,
      endDate: orderData.endDate ? new Date(orderData.endDate) : null,
    };

    // Добавляем расходы только если они есть и это не пустые объекты
    const filteredExpenses = expenses?.filter(exp => exp.name || exp.amount) || [];
    
    if (filteredExpenses.length > 0) {
      formattedOrderData.expenses = {
        create: filteredExpenses.map(exp => ({
          name: exp.name || '',
          amount: parseFloat(exp.amount) || 0,
          link: exp.link || ''
        }))
      };
    }

    const order = await prisma.order.create({
      data: formattedOrderData,
      include: {
        expenses: true
      }
    });

    res.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
};

// PUT /api/orders/:id
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { expenses, ...orderData } = req.body;

    // Преобразуем строковые даты в объекты Date
    const formattedOrderData = {
      ...orderData,
      startDate: orderData.startDate ? new Date(orderData.startDate) : null,
      endDate: orderData.endDate ? new Date(orderData.endDate) : null,
    };

    // Фильтруем пустые расходы
    const filteredExpenses = expenses?.filter(exp => exp.name || exp.amount) || [];

    // Обновляем заказ
    const order = await prisma.$transaction(async (tx) => {
      // 1. Удаляем все существующие расходы
      await tx.expense.deleteMany({
        where: { orderId: parseInt(id) }
      });

      // 2. Обновляем основную информацию о заказе
      const updatedOrder = await tx.order.update({
        where: { id: parseInt(id) },
        data: formattedOrderData
      });

      // 3. Создаем новые расходы, если они есть
      if (filteredExpenses.length > 0) {
        await tx.expense.createMany({
          data: filteredExpenses.map(exp => ({
            name: exp.name || '',
            amount: parseFloat(exp.amount) || 0,
            link: exp.link || '',
            orderId: parseInt(id)
          }))
        });
      }

      // 4. Получаем обновленный заказ со всеми расходами
      return tx.order.findUnique({
        where: { id: parseInt(id) },
        include: { expenses: true }
      });
    });

    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order', details: error.message });
  }
};

// DELETE /api/orders/:id
export const deleteOrder = async (req, res) => {
  try {
    // Cascade deletion: когда заказ удаляется, все связанные расходы удаляются автоматически
    await prisma.order.delete({
      where: { id: parseInt(req.params.id) },
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order', details: error.message });
  }
}; 