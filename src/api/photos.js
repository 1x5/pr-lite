import prisma from '../lib/db.js';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

// Получаем путь к текущему файлу и директории
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Создаем путь к директории загрузок (если не существует)
const uploadsDir = path.join(path.dirname(__dirname), '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Настройка хранилища для multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Генерируем уникальное имя файла с использованием UUID
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

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
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 МБ
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
    
    const photos = await prisma.photo.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(photos);
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ error: 'Failed to fetch photos', details: error.message });
  }
};

// POST /api/orders/:orderId/photos
export const uploadPhoto = [
  // Middleware для загрузки одного файла с именем 'photo'
  upload.single('photo'),
  
  // Обработчик после загрузки файла
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
        // Если файл был загружен, удаляем его
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({ error: 'Order not found', details: `No order found with ID ${orderId}` });
      }
      
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded', details: 'Photo file is required' });
      }
      
      let processedFilename, processedPath;
      
      try {
        // Обрабатываем изображение с помощью sharp
        // Изменяем размер до максимум 1200px по ширине или высоте с сохранением пропорций
        processedFilename = `processed_${req.file.filename}`;
        processedPath = path.join(uploadsDir, processedFilename);
        
        await sharp(req.file.path)
          .resize({
            width: 1200,
            height: 1200,
            fit: sharp.fit.inside,
            withoutEnlargement: true
          })
          .jpeg({ quality: 85 })
          .toFile(processedPath);

        // Удаляем оригинальный файл после обработки
        fs.unlinkSync(req.file.path);
      } catch (imageProcessingError) {
        console.error('Error processing image:', imageProcessingError);
        
        // Если произошла ошибка при обработке, используем оригинальный файл
        processedFilename = req.file.filename;
        processedPath = req.file.path;
      }
      
      // Создаем запись в базе данных
      const photo = await prisma.photo.create({
        data: {
          filename: processedFilename,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: fs.statSync(processedPath).size,
          url: `/api/uploads/${processedFilename}`,
          orderId: orderId
        }
      });
      
      res.status(201).json(photo);
    } catch (error) {
      // Если файл был загружен, удаляем его в случае ошибки
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (err) {
          console.error('Error removing file after failed upload:', err);
        }
      }
      
      console.error('Error uploading photo:', error);
      res.status(500).json({ error: 'Failed to upload photo', details: error.message });
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
    
    // Удаляем файл из файловой системы
    const photoPath = path.join(uploadsDir, photo.filename);
    
    try {
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    } catch (fileError) {
      console.error('Error deleting photo file:', fileError);
      // Продолжаем выполнение даже при ошибке удаления файла
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