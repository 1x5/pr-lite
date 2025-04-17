import express from 'express';
import { getOrders, getOrder, createOrder, updateOrder, deleteOrder } from './src/api/orders.js';
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
  allowedHeaders: ['Content-Type']
}));

// Логирование всех запросов
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Статические файлы для загруженных фотографий
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.get('/api/orders', getOrders);
app.get('/api/orders/:id', getOrder);
app.post('/api/orders', createOrder);
app.put('/api/orders/:id', updateOrder);
app.delete('/api/orders/:id', deleteOrder);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('build'));
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 