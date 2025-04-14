import React, { useState } from 'react';
import { ChevronLeft, Edit2, Sun, Check, Move, Calendar, Paperclip, Clock, Plus, ExternalLink, X } from 'lucide-react';

const OrderViewScreen = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [editMode, setEditMode] = useState(false);
  
  // Статусы продукта
  const statuses = ['Ожидает', 'В работе', 'Выполнен'];
  
  // Данные продукта
  const [product, setProduct] = useState({
    name: 'Стол обеденный',
    customer: 'Иванов А.И.',
    cost: 5700,
    price: 13000,
    profit: 7300,
    profitPercent: 56.2,
    status: 'Выполнен',
    duration: 7, // дней на выполнение
    startDate: '2025-04-01',
    endDate: '2025-04-08',
    expenses: [
      {
        id: 1,
        name: 'Материалы',
        cost: 4500,
        link: 'https://example.com/materials'
      },
      {
        id: 2,
        name: 'Транспорт',
        cost: 1200
      }
    ],
    notes: 'Клиент просил светлое дерево. Доставка в пределах города включена в стоимость.'
  });
  
  // Для нового расхода
  const [newExpense, setNewExpense] = useState({ name: '', cost: '' });
  
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
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}.${month}.${year}`;
  };
  
  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: theme.bg }}>
      {/* Верхняя панель */}
      <div className="p-3 flex justify-between items-center" style={{ backgroundColor: darkMode ? '#1a1a1a' : theme.bg }}>
        <div className="flex items-center">
          <ChevronLeft size={24} color={theme.textPrimary} className="mr-2" />
          <h1 className="text-xl font-bold" style={{ color: theme.textPrimary }}>
            {product.name}
          </h1>
        </div>
        
        <div className="flex items-center">
          <button 
            className="rounded-full p-2 mr-2"
            style={{ backgroundColor: theme.card }}
            onClick={() => setDarkMode(!darkMode)}
          >
            <Sun size={20} color={theme.textPrimary} />
          </button>
          
          <button 
            className="rounded-full p-2"
            style={{ backgroundColor: theme.accent }}
            onClick={() => setEditMode(!editMode)}
          >
            <Edit2 size={20} color="#ffffff" />
          </button>
        </div>
      </div>
      
      {/* Статус и контакт */}
      <div className="px-4 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <span style={{ color: theme.textSecondary, marginRight: '8px' }}>Статус:</span>
          <span style={{ 
            color: '#ffffff', 
            backgroundColor: product.status === 'Выполнен' ? theme.green : theme.accent,
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.85rem'
          }}>
            {product.status}
          </span>
        </div>

        <div className="flex items-center">
          <span style={{ color: theme.textSecondary, marginRight: '8px' }}>Контакт:</span>
          <span style={{ color: theme.textPrimary }}>{product.customer}</span>
        </div>
      </div>
      
      {/* Основное содержимое */}
      <div className="flex-1 overflow-auto px-4 pb-20">
        {/* Блок расходов */}
        <div 
          className="mb-3 rounded-xl p-3" 
          style={{ backgroundColor: theme.card }}
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold" style={{ color: theme.textPrimary }}>Расходы: {product.cost}₽</h2>
          </div>
          
          {/* Список расходов */}
          <div className="rounded-lg p-2" style={{ backgroundColor: theme.innerCard }}>
            {product.expenses.map((expense, index) => (
              <div 
                key={expense.id} 
                className="mb-2 last:mb-0"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>{expense.name}</span>
                    
                    {expense.link && (
                      <a 
                        href={expense.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1"
                        style={{ color: theme.accent }}
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                  
                  <span style={{ color: theme.textPrimary, fontSize: '0.9rem' }}>{expense.cost}₽</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Информация о прибыли */}
          <div className="mt-3 p-2 rounded-lg" style={{ backgroundColor: theme.innerCard }}>
            <div className="flex justify-between items-center mb-1">
              <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>Прибыль:</span>
              <span style={{ color: theme.green, fontSize: '0.9rem' }}>+{product.profit}₽</span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>Рентабельность:</span>
              <span 
                style={{ 
                  color: product.profitPercent < 50 ? theme.red : theme.green, 
                  fontSize: '0.9rem' 
                }}
              >
                {product.profitPercent}%
              </span>
            </div>
            
            {/* Поле полная стоимость */}
            <div className="mt-2 pt-2 border-t" style={{ borderColor: theme.cardBorder }}>
              <div className="flex justify-between items-center">
                <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>Полная стоимость:</span>
                <span style={{ color: theme.textPrimary, fontSize: '0.9rem' }}>{product.price}₽</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Заметки */}
        <div className="mb-3 rounded-xl p-3" style={{ backgroundColor: theme.card }}>
          <h2 className="text-lg font-bold mb-1" style={{ color: theme.textPrimary }}>Заметки</h2>
          <div className="h-px w-full mb-2" style={{ backgroundColor: theme.cardBorder }}></div>
          <p style={{ color: theme.textSecondary, fontStyle: 'italic' }}>{product.notes}</p>
        </div>
        
        {/* Фотографии и чертежи */}
        <div className="mb-3 rounded-xl p-3" style={{ backgroundColor: theme.card }}>
          <h2 className="text-lg font-bold mb-1" style={{ color: theme.textPrimary }}>Фотографии и чертежи</h2>
          <div className="h-px w-full mb-2" style={{ backgroundColor: theme.cardBorder }}></div>
          
          <div className="grid grid-cols-4 gap-2">
            {/* Плейсхолдеры для вложений */}
            {[1, 2, 3].map(i => (
              <div 
                key={i} 
                className="aspect-square rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.innerCard }}
              >
                <Paperclip size={20} color={theme.textSecondary} />
              </div>
            ))}
            
            {/* Кнопка добавления файла */}
            <div 
              className="aspect-square rounded-lg flex items-center justify-center cursor-pointer"
              style={{ backgroundColor: theme.innerCard }}
            >
              <Plus size={20} color={theme.textSecondary} />
            </div>
          </div>
        </div>
        
        {/* Даты начала и окончания */}
        <div className="mb-3 rounded-xl p-3" style={{ backgroundColor: theme.card }}>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <Calendar size={18} color={theme.textSecondary} className="mr-2" />
              <span style={{ color: theme.textSecondary }}>Даты выполнения:</span>
            </div>
            <div className="flex items-center">
              <Clock size={16} color={theme.textSecondary} className="mr-1" />
              <span style={{ color: theme.textPrimary }}>{product.duration}</span>
              <span style={{ color: theme.textSecondary, marginLeft: '4px' }}>дней</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-sm mb-1" style={{ color: theme.textSecondary }}>Дата начала:</div>
              <div style={{ color: theme.textPrimary }}>{formatDate(product.startDate)}</div>
            </div>
            
            <div>
              <div className="text-sm mb-1" style={{ color: theme.textSecondary }}>Дата окончания:</div>
              <div style={{ color: theme.textPrimary }}>{formatDate(product.endDate)}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Упрощенная нижняя панель навигации для двух окон */}
      <div className="fixed bottom-0 left-0 w-full flex justify-around items-center py-3 border-t" style={{ backgroundColor: theme.navBg, borderColor: theme.cardBorder }}>
        <button className="flex-1 p-3 flex flex-col items-center">
          <Home size={24} color={theme.textSecondary} />
          <span className="text-xs mt-1" style={{ color: theme.textSecondary }}>Все заказы</span>
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

// Компоненты иконок
const Home = ({ size, color }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const Settings = ({ size, color }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

export default OrderViewScreen; 