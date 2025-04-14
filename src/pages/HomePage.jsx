import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Filter } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  const [orders] = useState([
    {
      id: 1,
      name: 'Кухонный гарнитур',
      date: '25.04',
      day: 'Пт',
      cost: 85000,
      profitPercent: 56.2,
      status: 'orange'
    },
    {
      id: 2,
      name: 'Прихожая',
      date: '18.04',
      day: 'Пт',
      cost: 27000,
      profitPercent: 47.1,
      status: 'blue'
    },
    {
      id: 3,
      name: 'Новый заказ',
      date: '21.04',
      day: 'Пн',
      cost: 0,
      profitPercent: 0,
      status: 'orange'
    }
  ]);

  const statusOptions = [
    { id: 'all', name: 'Все', color: 'bg-gray-400' },
    { id: 'orange', name: 'В работе', color: 'bg-orange-500' },
    { id: 'blue', name: 'Ожидает', color: 'bg-blue-500' },
    { id: 'green', name: 'Выполнен', color: 'bg-green-500' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'blue':
        return 'bg-blue-500';
      case 'orange':
        return 'bg-orange-500';
      case 'green':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getProfitColor = (percent) => {
    return percent >= 50 ? 'text-green-700' : 'text-orange-700';
  };

  const handleAddOrder = () => {
    navigate('/order/new');
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
          <button 
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-500"
            onClick={handleStatusChange}
          >
            <div className={`w-2 h-2 rounded-full ${currentStatus.color}`}></div>
          </button>
        </div>

        <div className="space-y-2">
          {filteredOrders.map(order => (
            <Link
              key={order.id}
              to={`/order/${order.id}`}
              className="block"
            >
              <div className="bg-gray-50 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center h-[40px]">
                  <div className={`w-0.5 h-full ${getStatusColor(order.status)}`}></div>
                  <div className="flex-grow min-w-0 ml-3 mr-2">
                    <h3 className="text-sm text-gray-900 truncate">{order.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap pr-3">
                    <span className="text-xs text-gray-500">{order.date} ({order.day})</span>
                    <span className="text-sm text-gray-900">{order.cost}₽</span>
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