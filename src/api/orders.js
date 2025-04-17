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
    res.status(500).json({ error: 'Failed to fetch orders' });
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
    res.status(500).json({ error: 'Failed to fetch order' });
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

    // Добавляем расходы только если они есть
    if (expenses && expenses.length > 0) {
      formattedOrderData.expenses = {
        create: expenses.map(exp => ({
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
      expenses: {
        deleteMany: {}, // Удаляем все существующие расходы
        create: expenses.map(exp => ({
          name: exp.name || '',
          amount: parseFloat(exp.amount) || 0,
          link: exp.link || ''
        }))
      }
    };

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: formattedOrderData,
      include: {
        expenses: true
      }
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
    await prisma.expense.deleteMany({
      where: { orderId: parseInt(req.params.id) },
    });
    
    await prisma.order.delete({
      where: { id: parseInt(req.params.id) },
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
}; 