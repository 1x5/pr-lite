import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [orders] = useState([
    {
      id: 1,
      name: 'Стол обеденный',
      endDate: '2025-04-08',
      price: 13000,
      profitPercent: 56.2,
      status: 'active'
    },
    {
      id: 2,
      name: 'Шкаф-купе',
      endDate: '2025-04-15',
      price: 35000,
      profitPercent: 47.1,
      status: 'pending'
    },
    {
      id: 3,
      name: 'Кухонный гарнитур',
      endDate: '2025-04-25',
      price: 85000,
      profitPercent: 50.6,
      status: 'completed'
    }
  ]);

  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    return `${day}.${month}`;
  };

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Список заказов */}
      <div className="flex-1 overflow-auto">
        {filteredOrders.map(order => (
          <Link
            key={order.id}
            to={`/order/${order.id}`}
            className="block border-b last:border-b-0"
          >
            <div className="px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-1 h-4 rounded-full ${getStatusColor(order.status).replace('bg-', 'bg-').replace('text-', '')}`} />
                  <span className="font-medium text-gray-900">{order.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">{formatDate(order.endDate)}</span>
                  <span className="text-sm text-gray-500">{order.price}₽</span>
                  <span className={`text-xs ${
                    order.profitPercent >= 50 
                      ? 'text-green-700' 
                      : 'text-orange-700'
                  }`}>
                    {order.profitPercent}%
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Кнопка добавления */}
      <div className="fixed bottom-6 right-6">
        <button className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
          <Plus className="w-8 h-8 text-white" />
        </button>
      </div>
    </div>
  );
};

export default HomePage; 