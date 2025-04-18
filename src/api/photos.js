import prisma from '../lib/db.js';
import multer from 'multer';
import sharp from 'sharp';
import dotenv from 'dotenv';

// Загружаем переменные окружения, если это еще не сделано
dotenv.config();

// Максимальный размер файла из переменных окружения или по умолчанию 10MB
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || 10485760);

// Используем хранилище в памяти вместо файлового хранилища
const storage = multer.memoryStorage();

// Функция для фильтрации файлов (только изображения)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Разрешены только изображения!'), false);
  }
};

// Настройка загрузчика с ограничением размера
const upload = multer({
  storage: storage,
  limits: { fileSize: MAX_FILE_SIZE }, // Используем размер из переменной окружения
  fileFilter: fileFilter
});

// GET /api/orders/:orderId/photos
export const getOrderPhotos = async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    
    // Проверка корректности ID
    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID', details: 'Order ID must be a number' });
    }
    
    // Получаем фотографии без бинарных данных
    const photos = await prisma.photo.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        originalName: true,
        mimetype: true,
        size: true,
        createdAt: true,
        updatedAt: true,
        orderId: true
      }
    });
    
    // Добавляем URL для доступа к содержимому фотографии
    const photosWithUrls = photos.map(photo => ({
      ...photo,
      url: `/api/photos/${photo.id}/content`
    }));
    
    res.json(photosWithUrls);
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ error: 'Failed to fetch photos', details: error.message });
  }
};

// GET /api/photos/:photoId/content
export const getPhotoContent = async (req, res) => {
  try {
    const photoId = parseInt(req.params.photoId);
    
    if (isNaN(photoId)) {
      return res.status(400).json({ error: 'Invalid photo ID', details: 'Photo ID must be a number' });
    }
    
    const photo = await prisma.photo.findUnique({
      where: { id: photoId }
    });
    
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found', details: `No photo found with ID ${photoId}` });
    }
    
    if (!photo.data) {
      return res.status(404).json({ error: 'Photo content not found', details: 'Binary data is missing' });
    }
    
    // Устанавливаем заголовки и отправляем бинарные данные
    res.setHeader('Content-Type', photo.mimetype);
    res.setHeader('Content-Length', photo.size);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Кэшировать на 1 год
    res.send(photo.data);
  } catch (error) {
    console.error('Error fetching photo content:', error);
    res.status(500).json({ error: 'Failed to fetch photo content', details: error.message });
  }
};

// POST /api/orders/:orderId/photos
export const uploadPhoto = [
  // Middleware для загрузки нескольких файлов с именем 'photos'
  upload.array('photos', 10), // Максимум 10 файлов за один раз
  
  // Обработчик после загрузки файлов
  async (req, res) => {
    try {
      // Проверяем orderId
      const orderId = parseInt(req.params.orderId);
      
      if (isNaN(orderId)) {
        throw new Error('Invalid order ID');
      }
      
      // Проверяем, существует ли заказ
      const order = await prisma.order.findUnique({
        where: { id: orderId }
      });
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found', details: `No order found with ID ${orderId}` });
      }
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded', details: 'Photo files are required' });
      }
      
      const uploadedPhotos = [];
      
      // Обрабатываем каждый загруженный файл
      for (const file of req.files) {
        try {
          // Обрабатываем изображение с помощью sharp прямо в памяти
          const processedImageBuffer = await sharp(file.buffer)
            .resize({
              width: 1200,
              height: 1200,
              fit: sharp.fit.inside,
              withoutEnlargement: true
            })
            .jpeg({ quality: 50 }) // Сжимаем до 50% качества
            .toBuffer();
          
          // Создаем запись в базе данных
          const photo = await prisma.photo.create({
            data: {
              data: processedImageBuffer,
              originalName: file.originalname,
              mimetype: 'image/jpeg', // Всегда конвертируем в JPEG
              size: processedImageBuffer.length,
              orderId: orderId
            }
          });
          
          // Добавляем URL для доступа в ответ API
          const photoWithUrl = {
            ...photo,
            url: `/api/photos/${photo.id}/content`,
            data: undefined // Не включаем бинарные данные в ответ
          };
          
          uploadedPhotos.push(photoWithUrl);
        } catch (processingError) {
          console.error('Ошибка обработки изображения:', processingError);
          // Продолжаем с другими файлами
        }
      }
      
      res.status(201).json(uploadedPhotos);
    } catch (error) {
      console.error('Ошибка загрузки фотографий:', error);
      res.status(500).json({ error: 'Failed to upload photos', details: error.message });
    }
  }
];

// DELETE /api/photos/:photoId
export const deletePhoto = async (req, res) => {
  try {
    // Проверяем photoId
    const photoId = parseInt(req.params.photoId);
    
    if (isNaN(photoId)) {
      return res.status(400).json({ error: 'Invalid photo ID', details: 'Photo ID must be a number' });
    }
    
    // Находим фото в базе данных
    const photo = await prisma.photo.findUnique({
      where: { id: photoId }
    });
    
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found', details: `No photo found with ID ${photoId}` });
    }
    
    // Удаляем запись из базы данных
    await prisma.photo.delete({
      where: { id: photoId }
    });
    
    res.json({ success: true, message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ error: 'Failed to delete photo', details: error.message });
  }
}; 