import express from 'express';
import { getOrders, getOrder, createOrder, updateOrder, deleteOrder } from './src/api/orders.js';
import { getOrderPhotos, uploadPhoto, deletePhoto, getPhotoContent } from './src/api/photos.js';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Настройка CORS
app.use(cors({
  origin: '*', // Разрешаем запросы с любого хоста
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Origin', 'X-Requested-With', 'Accept']
}));

// Middleware для проверки IP-адреса
const ipRestriction = (req, res, next) => {
  // Получаем IP клиента (с учетом прокси)
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  
  // Список разрешенных IP-адресов
  const allowedIps = [
    '188.243.182.233', // VPN IP
    '192.168.3.42',    // локальная сеть
    '192.168.3.83',    // локальная сеть
    '127.0.0.1',       // localhost
    '::1',             // localhost IPv6
    '::ffff:127.0.0.1' // localhost IPv4 mapped в IPv6
  ];
  
  // Проверяем, разрешен ли IP
  if (allowedIps.some(ip => clientIp.includes(ip))) {
    next(); // Разрешаем доступ
  } else {
    // Запрещаем доступ
    console.log(`Доступ запрещен для IP: ${clientIp}`);
    res.status(403).send('Доступ запрещен');
  }
};

// Применяем middleware для ограничения доступа
app.use(ipRestriction);

// Логирование запросов только в режиме разработки
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    next();
  });
} else {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// API routes для заказов
app.get('/api/orders', getOrders);
app.get('/api/orders/:id', getOrder);
app.post('/api/orders', createOrder);
app.put('/api/orders/:id', updateOrder);
app.delete('/api/orders/:id', deleteOrder);

// API routes для фотографий
app.get('/api/orders/:orderId/photos', getOrderPhotos);
app.post('/api/orders/:orderId/photos', uploadPhoto);
app.delete('/api/photos/:photoId', deletePhoto);
app.get('/api/photos/:photoId/content', getPhotoContent);

// Обработка ошибок при загрузке файлов
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Размер файла превышает 10 МБ' });
  }
  if (err.message === 'Разрешены только изображения!') {
    return res.status(415).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Ошибка сервера', details: err.message });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Обслуживание статических файлов из директории build
  app.use(express.static('build'));
  
  // Обслуживание SPA - все неизвестные маршруты перенаправляются на index.html
  app.get('*', (req, res) => {
    // Не перенаправляем API-запросы
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 