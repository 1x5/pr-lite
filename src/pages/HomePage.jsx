import React, { useState } from 'react';
import { Search, DollarSign, Home, Settings, Plus, Calendar, Sun, Check, X } from 'lucide-react';

const HomePage = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [filterActive, setFilterActive] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Все');
  
  // Фильтры для заказов
  const filters = ['Все', 'Ожидает', 'В работе', 'Выполнен'];
  
  // Моковые данные заказов
  const [orders, setOrders] = useState([
    {
      id: 1,
      name: 'Стол обеденный',
      customer: 'Иванов А.П.',
      status: 'Выполнен',
      endDate: '2025-04-08',
      price: 13000,
      cost: 5700,
      profit: 7300,
      profitPercent: 56.2
    },
    {
      id: 2,
      name: 'Шкаф-купе',
      customer: 'Петрова Е.С.',
      status: 'В работе',
      endDate: '2025-04-15',
      price: 35000,
      cost: 18500,
      profit: 16500,
      profitPercent: 47.1
    },
    {
      id: 3,
      name: 'Кухонный гарнитур',
      customer: 'Сидоров В.М.',
      status: 'Ожидает',
      endDate: '2025-04-25',
      price: 85000,
      cost: 42000,
      profit: 43000,
      profitPercent: 50.6
    },
    {
      id: 4,
      name: 'Прихожая',
      customer: 'Козлова Н.И.',
      status: 'В работе',
      endDate: '2025-04-18',
      price: 27000,
      cost: 14800,
      profit: 12200,
      profitPercent: 45.2
    }
  ]);
  
  const theme = {
    bg: darkMode ? '#121212' : '#ffffff',
    card: darkMode ? '#252525' : '#f8f9fa',
    innerCard: darkMode ? '#333333' : '#ffffff',
    cardBorder: darkMode ? '#333333' : '#e0e0e0',
    textPrimary: darkMode ? '#e0e0e0' : '#333333',
    textSecondary: darkMode ? '#808080' : '#606060',
    accent: darkMode ? '#7c3aed' : '#333333',
    green: darkMode ? '#4ade80' : '#16a34a',
    red: darkMode ? '#ef4444' : '#dc2626',
    navBg: darkMode ? '#1a1a1a' : '#f0f0f0',
    inputBg: darkMode ? '#444444' : '#f0f0f0'
  };
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'Выполнен':
        return theme.green;
      case 'В работе':
        return theme.accent;
      case 'Ожидает':
        return theme.textSecondary;
      default:
        return theme.accent;
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
  
  const filteredOrders = selectedFilter === 'Все' 
    ? orders 
    : orders.filter(order => order.status === selectedFilter);
  
  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: theme.bg }}>
      {/* Верхняя панель с поиском */}
      <div className="p-3 flex justify-between items-center" style={{ backgroundColor: darkMode ? '#1a1a1a' : theme.bg }}>
        <div className="flex-1">
          <h1 className="text-xl font-bold" style={{ color: theme.textPrimary }}>
            Мои заказы
          </h1>
        </div>
        
        <div className="flex items-center">
          <div className="relative mr-2">
            <input
              type="text"
              placeholder="Поиск..."
              className="py-2 pl-8 pr-4 rounded-full text-sm"
              style={{ 
                backgroundColor: theme.inputBg, 
                color: theme.textPrimary,
                border: 'none',
                width: '180px'
              }}
            />
            <Search 
              size={16} 
              color={theme.textSecondary} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2" 
            />
          </div>
          
          <button 
            className="rounded-full p-2"
            style={{ backgroundColor: theme.card }}
            onClick={() => setDarkMode(!darkMode)}
          >
            <Sun size={20} color={theme.textPrimary} />
          </button>
        </div>
      </div>
      
      {/* Фильтры */}
      <div className="px-3 pt-2 pb-3 overflow-x-auto flex space-x-2" style={{ backgroundColor: darkMode ? '#1a1a1a' : theme.bg }}>
        {filters.map(filter => (
          <button
            key={filter}
            className="px-4 py-1.5 rounded-full text-sm whitespace-nowrap"
            style={{ 
              backgroundColor: selectedFilter === filter ? theme.accent : theme.card,
              color: selectedFilter === filter ? '#ffffff' : theme.textPrimary
            }}
            onClick={() => setSelectedFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
      
      {/* Основное содержимое - список заказов */}
      <div className="flex-1 overflow-auto px-3 pb-20">
        {filteredOrders.map(order => (
          <div
            key={order.id}
            className="mb-3 rounded-xl p-3"
            style={{ backgroundColor: theme.card }}
          >
            <div className="flex justify-between items-start mb-1">
              <div>
                <h2 className="text-lg font-bold" style={{ color: theme.textPrimary }}>{order.name}</h2>
                <p className="text-sm" style={{ color: theme.textSecondary }}>{order.customer}</p>
              </div>
              <span
                style={{ 
                  color: '#ffffff', 
                  backgroundColor: getStatusColor(order.status),
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.85rem'
                }}
              >
                {order.status}
              </span>
            </div>
            
            <div className="h-px w-full my-2" style={{ backgroundColor: theme.cardBorder }}></div>
            
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                <Calendar size={16} color={theme.textSecondary} className="mr-1" />
                <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>Сдача:</span>
              </div>
              <span style={{ color: theme.textPrimary, fontSize: '0.9rem' }}>{formatDate(order.endDate)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>Стоимость:</span>
              <span style={{ color: theme.textPrimary, fontSize: '0.9rem' }}>{order.price}₽</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>Прибыль:</span>
              <div className="flex items-center">
                <span style={{ color: theme.green, fontSize: '0.9rem', marginRight: '4px' }}>
                  +{order.profit}₽
                </span>
                <span 
                  style={{ 
                    color: order.profitPercent < 50 ? theme.red : theme.green, 
                    fontSize: '0.8rem',
                    backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    padding: '1px 4px',
                    borderRadius: '2px'
                  }}
                >
                  {order.profitPercent}%
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {filteredOrders.length === 0 && (
          <div 
            className="flex flex-col items-center justify-center mt-10 p-4 rounded-lg"
            style={{ backgroundColor: theme.card }}
          >
            <p style={{ color: theme.textSecondary, marginBottom: '8px' }}>
              Нет заказов с выбранным статусом
            </p>
            <button
              className="px-4 py-2 rounded text-sm"
              style={{ backgroundColor: theme.accent, color: '#ffffff' }}
              onClick={() => setSelectedFilter('Все')}
            >
              Показать все заказы
            </button>
          </div>
        )}
      </div>
      
      {/* Упрощенная нижняя панель навигации для двух окон */}
      <div className="fixed bottom-0 left-0 w-full flex justify-around items-center py-3 border-t" style={{ backgroundColor: theme.navBg, borderColor: theme.cardBorder }}>
        <button className="flex-1 p-3 flex flex-col items-center">
          <Home size={24} color={theme.accent} />
          <span className="text-xs mt-1" style={{ color: theme.accent }}>Все заказы</span>
        </button>
        
        {/* Центральная кнопка добавления */}
        <button 
          className="rounded-full w-16 h-16 flex items-center justify-center mx-4 -mt-6 shadow-lg"
          style={{ backgroundColor: theme.accent }}
        >
          <Plus size={28} color="#ffffff" />
        </button>
        
        <button className="flex-1 p-3 flex flex-col items-center">
          <Settings size={24} color={theme.textSecondary} />
          <span className="text-xs mt-1" style={{ color: theme.textSecondary }}>Настройки</span>
        </button>
      </div>
    </div>
  );
};

export default HomePage; 