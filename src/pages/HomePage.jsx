import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [orders, setOrders] = useState([]);
  
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        console.error('Unexpected response format:', data);
        setOrders([]);
        return;
      }

      // Сортируем заказы по дате создания (новые сверху)
      const sortedOrders = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    }
  };

  const handleAddOrder = () => {
    navigate('/order/new');
  };

  const statusOptions = [
    { id: 'all', name: 'Все', color: 'bg-gray-400' },
    { id: 'pending', name: 'Ожидает', color: 'bg-yellow-400' },
    { id: 'inProgress', name: 'В работе', color: 'bg-blue-500' },
    { id: 'completed', name: 'Выполнен', color: 'bg-green-500' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-400';
      case 'inProgress':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      default:
        return 'bg-gray-400';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    const day = localDate.getDate().toString().padStart(2, '0');
    const month = (localDate.getMonth() + 1).toString().padStart(2, '0');
    const year = localDate.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const getProfitColor = (percent) => {
    if (percent >= 30) return 'text-green-600';
    if (percent >= 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleStatusChange = () => {
    const currentIndex = statusOptions.findIndex(option => option.id === selectedStatus);
    const nextIndex = (currentIndex + 1) % statusOptions.length;
    setSelectedStatus(statusOptions[nextIndex].id);
  };

  const filteredOrders = selectedStatus === 'all'
    ? orders
    : orders.filter(order => order.status === selectedStatus);

  // Get the current status option
  const currentStatus = statusOptions.find(option => option.id === selectedStatus) || statusOptions[0];

  return (
    <div className="min-h-screen bg-white">
      <div className="px-2 sm:px-4 py-3">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-lg">Заказы</h1>
          <div className="flex items-center gap-2">
            <button 
              className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-500"
              onClick={handleStatusChange}
            >
              <div className={`w-2 h-2 rounded-full ${currentStatus.color}`}></div>
            </button>
            <button
              onClick={handleAddOrder}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-900 text-white"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {filteredOrders.map(order => (
            <Link
              key={order.id}
              to={`/order/${order.id}`}
              className="block"
            >
              <div className="bg-gray-50 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center h-[36px]">
                  <div className={`w-1 h-full ${getStatusColor(order.status)}`}></div>
                  <div className="flex-grow min-w-0 ml-2 mr-2">
                    <h3 className="text-sm text-gray-900 truncate">{order.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap pr-3">
                    <span className="text-xs text-gray-500">{formatDate(order.startDate)}</span>
                    <span className="text-xs text-gray-900">{order.price}₽</span>
                    <span className={`text-xs ${getProfitColor(order.profitPercent)}`}>
                      {order.profitPercent}%
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage; 