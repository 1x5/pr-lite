import express from 'express';
import { getOrders, getOrder, createOrder, updateOrder, deleteOrder } from './src/api/orders.js';
import { getOrderPhotos, uploadPhoto, deletePhoto } from './src/api/photos.js';
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
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Origin', 'X-Requested-With', 'Accept']
}));

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

// Создание директории uploads, если она не существует
import fs from 'fs';
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Статические файлы для загруженных фотографий
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

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
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 