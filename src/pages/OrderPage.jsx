import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Check, X, Clock, Calendar, DollarSign, Percent, User } from 'lucide-react';

const OrderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [order, setOrder] = useState({
    id: parseInt(id),
    name: 'Стол обеденный',
    customer: 'Иван Иванов',
    endDate: '2025-04-08',
    price: 13000,
    profitPercent: 56.2,
    status: 'active',
    description: 'Стол обеденный из массива дуба. Размеры: 160x90x75 см. Цвет: натуральный дуб.'
  });

  const handleSave = () => {
    setIsEditing(false);
    // Здесь будет логика сохранения изменений
  };

  const handleDelete = () => {
    if (window.confirm('Вы уверены, что хотите удалить этот заказ?')) {
      navigate('/');
      // Здесь будет логика удаления заказа
    }
  };

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
    const year = date.getFullYear();
    
    return `${day}.${month}.${year}`;
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Шапка */}
      <div className="px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            <span>Назад</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              <Edit size={16} />
              <span>Редактировать</span>
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded-md hover:bg-red-100"
            >
              <Trash2 size={16} />
              <span>Удалить</span>
            </button>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isEditing ? (
                <input
                  type="text"
                  value={order.name}
                  onChange={(e) => setOrder({...order, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                />
              ) : (
                order.name
              )}
            </h1>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
              <Clock size={14} />
              <span>
                {order.status === 'active' && 'В работе'}
                {order.status === 'pending' && 'Ожидает'}
                {order.status === 'completed' && 'Завершен'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                  <User size={16} className="text-gray-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Заказчик</div>
                  <div className="font-medium text-gray-900">
                    {isEditing ? (
                      <input
                        type="text"
                        value={order.customer}
                        onChange={(e) => setOrder({...order, customer: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    ) : (
                      order.customer
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                  <Calendar size={16} className="text-gray-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Срок сдачи</div>
                  <div className="font-medium text-gray-900">
                    {isEditing ? (
                      <input
                        type="date"
                        value={order.endDate}
                        onChange={(e) => setOrder({...order, endDate: e.target.value})}
                        className="px-3 py-2 border rounded-md"
                      />
                    ) : (
                      formatDate(order.endDate)
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                  <DollarSign size={16} className="text-gray-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Стоимость</div>
                  <div className="font-medium text-gray-900">
                    {isEditing ? (
                      <input
                        type="number"
                        value={order.price}
                        onChange={(e) => setOrder({...order, price: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    ) : (
                      `${order.price}₽`
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                  <Percent size={16} className="text-gray-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Процент прибыли</div>
                  <div className={`font-medium ${
                    order.profitPercent >= 50 ? 'text-green-700' : 'text-orange-700'
                  }`}>
                    {isEditing ? (
                      <input
                        type="number"
                        value={order.profitPercent}
                        onChange={(e) => setOrder({...order, profitPercent: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    ) : (
                      `${order.profitPercent}%`
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Описание</h2>
            {isEditing ? (
              <textarea
                value={order.description}
                onChange={(e) => setOrder({...order, description: e.target.value})}
                className="w-full px-3 py-2 border rounded-md h-32"
              />
            ) : (
              <p className="text-gray-700">{order.description}</p>
            )}
          </div>

          {isEditing && (
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                <X size={16} />
                <span>Отмена</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-purple-600 rounded-md hover:bg-purple-700"
              >
                <Check size={16} />
                <span>Сохранить</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderPage; 