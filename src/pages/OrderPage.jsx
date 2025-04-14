import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, Link as LinkIcon, Camera, Save, X, Edit } from 'lucide-react';

const OrderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [order, setOrder] = useState({
    id: parseInt(id),
    name: 'Кухонный гарнитур',
    phone: '',
    messenger: 'WhatsApp',
    startDate: '2025-04-10',
    endDate: '2025-04-25',
    price: 85000,
    prepayment: 0,
    cost: 42000,
    expenses: [
      { id: 1, name: 'Материалы', amount: 30000, link: '' },
      { id: 2, name: 'Столешница', amount: 12000, link: '' }
    ],
    profit: 43000,
    profitPercent: 50.6,
    status: 'pending',
    notes: 'Кухня угловая, со встроенной техникой.',
    photos: []
  });
  const [animatingExpenseId, setAnimatingExpenseId] = useState(null);

  const statusOptions = {
    pending: { text: 'Ожидает', class: 'bg-yellow-400' },
    inProgress: { text: 'В работе', class: 'bg-blue-500' },
    completed: { text: 'Выполнен', class: 'bg-green-500' }
  };

  const handleStatusChange = (status) => {
    setOrder(prev => ({ ...prev, status }));
    setShowStatusDropdown(false);
  };

  const handleMessengerClick = () => {
    if (!order.phone || !order.messenger) return;
    
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

  const handleSave = () => {
    // Здесь будет логика сохранения
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDelete = () => {
    if (window.confirm('Вы уверены, что хотите удалить этот заказ?')) {
      navigate('/');
    }
  };

  const addExpense = () => {
    setOrder(prev => ({
      ...prev,
      expenses: [...prev.expenses, { id: Date.now(), name: '', amount: 0, link: '' }]
    }));
  };

  const updateExpense = (id, field, value) => {
    setOrder(prev => ({
      ...prev,
      expenses: prev.expenses.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExpense = (id) => {
    setOrder(prev => ({
      ...prev,
      expenses: prev.expenses.filter(exp => exp.id !== id)
    }));
  };

  const calculateDaysLeft = () => {
    const start = new Date(order.startDate);
    const end = new Date(order.endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const totalExpenses = order.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remaining = order.price - order.prepayment;
  const profit = order.profit;
  const profitPercentage = order.profitPercent;

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
              <div className="text-gray-500 text-xs">Название:</div>
              {isEditing ? (
                <input
                  type="text"
                  value={order.name}
                  onChange={(e) => setOrder(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-1.5 sm:p-2 mt-0.5 sm:mt-1 bg-white border rounded-md text-sm"
                />
              ) : (
                <div 
                  className={`text-gray-900 py-1 sm:p-2 text-sm text-sm ${order.phone && order.messenger ? 'cursor-pointer' : ''}`}
                  onClick={handleMessengerClick}
                >
                  {order.name}
                </div>
              )}
            </div>

            {isEditing && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-500 text-xs">Телефон:</div>
                  <input
                    type="tel"
                    value={order.phone}
                    onChange={(e) => setOrder(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+7 (___) ___-__-__"
                    className="w-full p-1.5 sm:p-2 bg-white border rounded-md text-sm"
                  />
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Мессенджер:</div>
                  <select
                    value={order.messenger}
                    onChange={(e) => setOrder(prev => ({ ...prev, messenger: e.target.value }))}
                    className="w-full p-1.5 sm:p-2 bg-white border rounded-md text-sm"
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
                  <div className="text-gray-500 text-xs">Стоимость:</div>
                  <div className="text-gray-900 py-1 sm:p-2 text-sm">{order.cost} ₽</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Себестоимость:</div>
                  <div className="text-gray-900 py-1 sm:p-2 text-sm">{totalExpenses} ₽</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Прибыль:</div>
                  <div className="text-green-500 py-1 sm:p-2 text-sm">{profit} ₽</div>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="text-gray-500 text-xs">Предоплата:</div>
                  <div className="text-gray-900 py-1 sm:p-2 text-sm">{order.prepayment} ₽</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Остаток:</div>
                  <div className="text-red-500 py-1 sm:p-2 text-sm">{remaining} ₽</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Процент:</div>
                  <div className="text-gray-900 py-1 sm:p-2 text-sm">{profitPercentage}%</div>
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
            {order.expenses.map(expense => (
              <div key={expense.id} className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={expense.name}
                      onChange={(e) => updateExpense(expense.id, 'name', e.target.value)}
                      className="flex-1 p-1.5 sm:p-2 bg-white border rounded-md"
                      placeholder="Название"
                    />
                    <button 
                      className="p-2 hover:text-blue-600 transition-transform"
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
                      value={expense.amount}
                      onChange={(e) => updateExpense(expense.id, 'amount', Number(e.target.value))}
                      className="w-16 p-1.5 sm:p-2 bg-white border rounded-md"
                    />
                    <button
                      onClick={() => removeExpense(expense.id)}
                      className="p-1 hover:text-red-700"
                    >
                      <Trash2 size={18} className="text-red-500" />
                    </button>
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
                          {expense.name}
                        </a>
                      ) : (
                        <span className="text-gray-900">{expense.name}</span>
                      )}
                      {expense.link && (
                        <LinkIcon size={16} className="text-gray-400" />
                      )}
                    </div>
                    <span className="text-gray-900">{expense.amount} ₽</span>
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
              <p className="text-gray-700 text-sm">{order.notes}</p>
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
                <div className="text-gray-500 text-xs">Начало:</div>
                {isEditing ? (
                  <input
                    type="date"
                    value={order.startDate}
                    onChange={(e) => setOrder(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full p-1.5 sm:p-2 mt-0.5 sm:mt-1 bg-white border rounded-md"
                  />
                ) : (
                  <div className="text-gray-900 py-1 sm:p-2 text-sm">{order.startDate}</div>
                )}
              </div>
              <div>
                <div className="text-gray-500 text-xs">Окончание:</div>
                {isEditing ? (
                  <input
                    type="date"
                    value={order.endDate}
                    onChange={(e) => setOrder(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full p-1.5 sm:p-2 mt-0.5 sm:mt-1 bg-white border rounded-md"
                  />
                ) : (
                  <div className="text-gray-900 py-1 sm:p-2 text-sm">{order.endDate}</div>
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
            <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500">
              <Camera size={24} className="mb-2" />
              <span>Загрузить фотографии</span>
            </button>
          ) : (
            order.photos.length === 0 && (
              <div className="text-center text-gray-500 mt-4">
                Нет фотографий
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderPage; 