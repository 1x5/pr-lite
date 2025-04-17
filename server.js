import express from 'express';
import { getOrders, getOrder, createOrder, updateOrder, deleteOrder } from './src/api/orders.js';
import { getOrderPhotos, uploadPhoto, deletePhoto } from './src/api/photos.js';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Настройка CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Origin', 'X-Requested-With', 'Accept']
}));

// Логирование всех запросов
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

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
  app.use(express.static('build'));
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 