import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, Link as LinkIcon, Camera, Save, X, Edit } from 'lucide-react';

const emptyOrder = (() => {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear().toString().slice(-2);
  const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const dayName = days[now.getDay()];

  // Дата окончания через 7 дней
  const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return {
    name: `Заявка от ${day}.${month}.${year} (${dayName})`,
    phone: '',
    messenger: 'WhatsApp',
    startDate: now.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    price: '',
    prepayment: '',
    cost: '',
    expenses: [],
    profit: 0,
    profitPercent: 0,
    status: 'pending',
    notes: ''
  };
})();

const OrderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(id === 'new');
  const [order, setOrder] = useState(id === 'new' ? {...emptyOrder} : null);
  const [animatingExpenseId, setAnimatingExpenseId] = useState(null);

  const fetchOrder = useCallback(async () => {
    try {
      const response = await fetch(`/api/orders/${id}`);
      const data = await response.json();
      
      // Форматируем даты в формат yyyy-MM-dd для input type="date"
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      const formattedData = {
        ...data,
        startDate: formatDateForInput(data.startDate),
        endDate: formatDateForInput(data.endDate),
        expenses: data.expenses || []
      };
      setOrder(formattedData);
    } catch (error) {
      console.error('Error fetching order:', error);
      navigate('/');
    }
  }, [id, navigate]);

  useEffect(() => {
    if (id === 'new') {
      setOrder({...emptyOrder});
    } else {
      fetchOrder();
    }
  }, [id, fetchOrder]);

  const statusOptions = {
    pending: { text: 'Ожидает', class: 'bg-yellow-400' },
    inProgress: { text: 'В работе', class: 'bg-blue-500' },
    completed: { text: 'Выполнен', class: 'bg-green-500' }
  };

  const handleStatusChange = (status) => {
    setOrder(prev => ({ ...prev, status }));
  };

  const handleMessengerClick = () => {
    if (!order?.phone || !order?.messenger) return;
    
    const phone = order.phone.replace(/\D/g, '');
    let url = '';
    
    if (order.messenger === 'WhatsApp') {
      url = `https://wa.me/${phone}`;
    } else if (order.messenger === 'Telegram') {
      url = `https://t.me/+${phone}`;
    }
    
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleLinkPaste = async (expenseId) => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setAnimatingExpenseId(expenseId);
      setOrder(prev => ({
        ...prev,
        expenses: prev.expenses.map(exp => 
          exp.id === expenseId ? { ...exp, link: clipboardText } : exp
        )
      }));
      setTimeout(() => setAnimatingExpenseId(null), 500);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const handleSave = async () => {
    try {
      // Валидация обязательных полей
      if (!order.name) {
        alert('Название заказа обязательно');
        return;
      }

      // Форматируем данные перед отправкой
      const formattedOrder = {
        name: order.name,
        phone: order.phone || '',
        messenger: order.messenger || 'WhatsApp',
        startDate: order.startDate ? new Date(order.startDate).toISOString() : null,
        endDate: order.endDate ? new Date(order.endDate).toISOString() : null,
        price: parseFloat(order.price) || 0,
        prepayment: parseFloat(order.prepayment) || 0,
        cost: parseFloat(order.cost) || 0,
        profit: parseFloat(order.profit) || 0,
        profitPercent: parseFloat(order.profitPercent) || 0,
        status: order.status || 'pending',
        notes: order.notes || '',
        expenses: (order.expenses || []).map(exp => ({
          name: exp.name || '',
          amount: parseFloat(exp.amount) || 0,
          link: exp.link || ''
        }))
      };

      console.log('Sending order data:', formattedOrder);
      
      const method = id === 'new' ? 'POST' : 'PUT';
      const url = id === 'new' ? '/api/orders' : `/api/orders/${id}`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedOrder),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to save order');
      }

      const savedOrder = await response.json();
      console.log('Saved order:', savedOrder);
      
      // Форматируем даты перед обновлением состояния
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      const orderWithFormattedDates = {
        ...savedOrder,
        startDate: formatDateForInput(savedOrder.startDate),
        endDate: formatDateForInput(savedOrder.endDate)
      };
      
      setOrder(orderWithFormattedDates);
      setIsEditing(false);
      
      if (id === 'new') {
        navigate(`/order/${savedOrder.id}`);
      }
    } catch (error) {
      console.error('Error saving order:', error);
      alert(`Не удалось сохранить заказ: ${error.message}`);
    }
  };

  const handleCancel = () => {
    if (id === 'new') {
      navigate('/');
    } else {
      setIsEditing(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить этот заказ?')) {
      try {
        await fetch(`/api/orders/${id}`, { method: 'DELETE' });
        navigate('/');
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Не удалось удалить заказ');
      }
    }
  };

  const addExpense = () => {
    setOrder(prev => ({
      ...prev,
      expenses: [...(prev.expenses || []), { id: Date.now(), name: '', amount: '', link: '' }]
    }));
  };

  const updateExpense = (id, field, value) => {
    if (id === 'new') {
      // Если это пустая строка, создаем новый расход
      const newExpense = { id: Date.now(), name: '', amount: '', link: '' };
      newExpense[field] = value;
      setOrder(prev => ({
        ...prev,
        expenses: [...(prev.expenses || []), newExpense]
      }));
    } else {
      setOrder(prev => ({
        ...prev,
        expenses: (prev.expenses || []).map(exp => 
          exp.id === id ? { ...exp, [field]: value } : exp
        )
      }));
    }
  };

  const removeExpense = (id) => {
    if (id === 'new') return; // Не удаляем пустую строку
    setOrder(prev => ({
      ...prev,
      expenses: (prev.expenses || []).filter(exp => exp.id !== id)
    }));
  };

  const calculateDaysLeft = () => {
    if (!order?.startDate || !order?.endDate) return 0;
    const start = new Date(order.startDate);
    const end = new Date(order.endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const expenses = useMemo(() => {
    return order?.expenses || [];
  }, [order?.expenses]);

  const displayExpenses = useMemo(() => {
    return expenses.length === 0 ? [{ id: 'new', name: '', amount: '' }] : expenses;
  }, [expenses]);

  const totalExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
  const remaining = (order?.price || 0) - (order?.prepayment || 0);
  const profit = (order?.price || 0) - totalExpenses;
  const profitPercent = order?.price > 0 ? Math.round((profit / order.price) * 100) : 0;

  // Обновляем profit и profitPercent при изменении расходов или цены
  useEffect(() => {
    if (order?.price !== undefined) {
      const price = parseFloat(order.price) || 0;
      const currentExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
      const newProfit = price - currentExpenses;
      const newProfitPercent = price > 0 ? Math.round((newProfit / price) * 100) : 0;

      // Проверяем, изменились ли значения перед обновлением
      if (newProfit !== order.profit || newProfitPercent !== order.profitPercent) {
        setOrder(prev => ({
          ...prev,
          profit: newProfit,
          profitPercent: newProfitPercent
        }));
      }
    }
  }, [expenses, order?.price, order?.profit, order?.profitPercent]);  // Добавляем зависимости

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    const day = localDate.getDate().toString().padStart(2, '0');
    const month = (localDate.getMonth() + 1).toString().padStart(2, '0');
    const year = localDate.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  if (!order) {
    return <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Шапка */}
      <div className="px-2 sm:px-4 py-3 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <span className="text-xl">{isEditing ? 'Редактирование' : 'Просмотр'}</span>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button 
                onClick={handleCancel}
                className="w-10 h-10 flex items-center justify-center bg-red-500 rounded-full"
              >
                <X size={20} className="text-white" />
              </button>
              <button 
                onClick={handleSave}
                className="w-10 h-10 flex items-center justify-center bg-green-500 rounded-full"
              >
                <Save size={20} className="text-white" />
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleDelete}
                className="w-10 h-10 flex items-center justify-center bg-red-500 rounded-full"
              >
                <Trash2 size={20} className="text-white" />
              </button>
              <button 
                onClick={handleEdit}
                className="w-10 h-10 flex items-center justify-center bg-gray-900 rounded-full"
              >
                <Edit size={20} className="text-white" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-1 p-2 sm:p-4 space-y-4">
        {/* Информация */}
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-4">
          <div className="flex justify-between items-start pb-2 border-b">
            <h2 className="text-lg font-medium text-gray-900">Информация</h2>
            {isEditing ? (
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-3 py-1 text-white rounded-full text-sm appearance-none cursor-pointer"
                style={{ backgroundColor: statusOptions[order.status]?.class.replace('bg-', '#').replace('yellow-400', 'eab308').replace('blue-500', '3b82f6').replace('green-500', '22c55e') }}
              >
                {Object.entries(statusOptions).map(([value, { text }]) => (
                  <option key={value} value={value}>{text}</option>
                ))}
              </select>
            ) : (
              <div className={`px-3 py-1 text-white rounded-full text-sm ${statusOptions[order.status]?.class}`}>
                {statusOptions[order.status]?.text}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div>
              <div className="text-gray-500 text-sm">Название:</div>
              {isEditing ? (
                <input
                  type="text"
                  value={order.name}
                  onChange={(e) => setOrder(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-1.5 sm:p-2 mt-0.5 sm:mt-1 bg-white border rounded-md"
                />
              ) : (
                <div 
                  className={`text-gray-900 py-1 sm:p-2 ${order.phone && order.messenger ? 'cursor-pointer' : ''}`}
                  onClick={handleMessengerClick}
                >
                  {order.name}
                </div>
              )}
            </div>

            {isEditing && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-500 text-sm">Телефон:</div>
                  <input
                    type="tel"
                    value={order.phone}
                    onChange={(e) => setOrder(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+7 (___) ___-__-__"
                    className="w-full p-1.5 sm:p-2 bg-white border rounded-md"
                  />
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Мессенджер:</div>
                  <select
                    value={order.messenger}
                    onChange={(e) => setOrder(prev => ({ ...prev, messenger: e.target.value }))}
                    className="w-full p-1.5 sm:p-2 bg-white border rounded-md"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Telegram">Telegram</option>
                  </select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div>
                  <div className="text-gray-500 text-sm">Стоимость:</div>
                  {isEditing ? (
                    <input
                      type="number"
                      value={order.price}
                      onChange={(e) => setOrder(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full p-1.5 sm:p-2 mt-0.5 sm:mt-1 bg-white border rounded-md"
                      placeholder="0"
                    />
                  ) : (
                    <div className="text-gray-900 py-1 sm:p-2">{parseFloat(order.price) || 0} ₽</div>
                  )}
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Себестоимость:</div>
                  <div className="text-gray-900 py-1 sm:p-2">{totalExpenses} ₽</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Прибыль:</div>
                  <div className="text-green-500 py-1 sm:p-2">{profit} ₽</div>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="text-gray-500 text-sm">Предоплата:</div>
                  {isEditing ? (
                    <input
                      type="number"
                      value={order.prepayment}
                      onChange={(e) => setOrder(prev => ({ ...prev, prepayment: e.target.value }))}
                      className="w-full p-1.5 sm:p-2 mt-0.5 sm:mt-1 bg-white border rounded-md"
                      placeholder="0"
                    />
                  ) : (
                    <div className="text-gray-900 py-1 sm:p-2">{parseFloat(order.prepayment) || 0} ₽</div>
                  )}
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Остаток:</div>
                  <div className="text-red-500 py-1 sm:p-2">{remaining} ₽</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Процент:</div>
                  <div className="text-gray-900 py-1 sm:p-2">{profitPercent}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Расходы */}
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <h2 className="text-lg font-medium text-gray-900">Расходы: {totalExpenses}₽</h2>
              {isEditing && (
                <button
                  onClick={addExpense}
                  className="w-8 h-8 flex items-center justify-center bg-gray-900 rounded-full"
                >
                  <Plus size={20} className="text-white" />
                </button>
              )}
            </div>
            {displayExpenses.map(expense => (
              <div key={expense.id} className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={expense.name || ''}
                      onChange={(e) => updateExpense(expense.id, 'name', e.target.value)}
                      className="flex-1 p-1.5 sm:p-2 bg-white border rounded-md"
                      placeholder="Название"
                    />
                    <button 
                      className="p-1.5 hover:text-blue-600 transition-transform"
                      onClick={() => handleLinkPaste(expense.id)}
                    >
                      <LinkIcon 
                        size={18} 
                        className={`text-gray-400 transition-all duration-500 ${
                          animatingExpenseId === expense.id ? 'scale-125 text-green-500' : ''
                        }`}
                      />
                    </button>
                    <input
                      type="number"
                      value={expense.amount || ''}
                      onChange={(e) => updateExpense(expense.id, 'amount', e.target.value)}
                      className="w-16 p-1.5 sm:p-2 bg-white border rounded-md"
                      placeholder="0"
                    />
                    {expense.id !== 'new' && (
                      <button
                        onClick={() => removeExpense(expense.id)}
                        className="p-1.5 hover:text-red-700"
                      >
                        <Trash2 size={18} className="text-red-500" />
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex-1 flex items-center gap-2">
                      {expense.link ? (
                        <a 
                          href={expense.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-gray-900 hover:underline cursor-pointer"
                        >
                          {expense.name || ''}
                        </a>
                      ) : (
                        <span className="text-gray-900">{expense.name || ''}</span>
                      )}
                      {expense.link && (
                        <LinkIcon size={16} className="text-gray-400" />
                      )}
                    </div>
                    <span className="text-gray-900">{expense.amount || 0} ₽</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Заметки */}
        {(!isEditing && !order.notes) ? null : (
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            <div className="pb-2 border-b mb-3">
              <h2 className="text-lg font-medium text-gray-900">Заметки</h2>
            </div>
            {isEditing ? (
              <textarea
                value={order.notes}
                onChange={(e) => setOrder(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full p-1.5 sm:p-2 bg-white border rounded-md min-h-[100px]"
                placeholder="Введите заметки..."
              />
            ) : (
              <p className="text-gray-700">{order.notes}</p>
            )}
          </div>
        )}

        {/* Даты */}
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <h2 className="text-lg font-medium text-gray-900">Даты</h2>
              <span className="text-gray-500">{calculateDaysLeft()} дней</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div>
                <div className="text-gray-500 text-sm">Начало:</div>
                {isEditing ? (
                  <input
                    type="date"
                    value={formatDateForInput(order.startDate)}
                    onChange={(e) => setOrder(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full p-1.5 sm:p-2 bg-white border rounded-md"
                  />
                ) : (
                  <div className="text-gray-900 py-1 sm:p-2">{formatDate(order.startDate)}</div>
                )}
              </div>
              <div>
                <div className="text-gray-500 text-sm">Окончание:</div>
                {isEditing ? (
                  <input
                    type="date"
                    value={formatDateForInput(order.endDate)}
                    onChange={(e) => setOrder(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full p-1.5 sm:p-2 bg-white border rounded-md"
                  />
                ) : (
                  <div className="text-gray-900 py-1 sm:p-2">{formatDate(order.endDate)}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Фотографии */}
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
          <div className="pb-2 border-b mb-3">
            <h2 className="text-lg font-medium text-gray-900">Фотографии</h2>
          </div>
          {isEditing ? (
            <div className="space-y-4">
              <button 
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-gray-400 transition-colors"
              >
                <Camera size={24} className="mb-2" />
                <span>Загрузить фотографии</span>
              </button>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {/* Здесь будут отображаться загруженные фотографии */}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <div className="text-center text-gray-500 col-span-full py-4">
                Нет фотографий
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderPage; 