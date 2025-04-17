import prisma from '../lib/db.js';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import dotenv from 'dotenv';

// Загружаем переменные окружения, если это еще не сделано
dotenv.config();

// Получаем путь к текущему файлу и директории
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Создаем путь к директории загрузок (если не существует)
const uploadsDir = path.join(path.dirname(__dirname), '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Максимальный размер файла из переменных окружения или по умолчанию 10MB
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || 10485760);

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
  limits: { fileSize: MAX_FILE_SIZE }, // Используем размер из переменной окружения
  fileFilter: fileFilter
});

// Функция для проверки размера директории uploads
// Эта функция добавлена для возможного будущего использования
const checkUploadsSize = async () => {
  try {
    let totalSize = 0;
    const files = fs.readdirSync(uploadsDir);
    
    for (const file of files) {
      const stats = fs.statSync(path.join(uploadsDir, file));
      if (stats.isFile()) {
        totalSize += stats.size;
      }
    }
    
    // Максимальный размер директории (например, 500MB)
    const MAX_DIR_SIZE = 500 * 1024 * 1024;
    
    if (totalSize > MAX_DIR_SIZE) {
      console.warn(`Внимание: размер директории uploads превышает ${MAX_DIR_SIZE / (1024 * 1024)}MB`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Ошибка при проверке размера директории uploads:', error);
    return true; // В случае ошибки продолжаем работу
  }
};

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
  // Middleware для загрузки нескольких файлов с именем 'photos'
  upload.array('photos', 10), // Максимум 10 файлов за один раз
  
  // Обработчик после загрузки файлов
  async (req, res) => {
    try {
      // Проверка размера директории uploads (опционально)
      // await checkUploadsSize(); 

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
        // Если файлы были загружены, удаляем их
        if (req.files && req.files.length > 0) {
          req.files.forEach(file => {
            try {
              fs.unlinkSync(file.path);
            } catch (err) {
              console.error(`Ошибка при удалении файла ${file.path}:`, err);
            }
          });
        }
        return res.status(404).json({ error: 'Order not found', details: `No order found with ID ${orderId}` });
      }
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded', details: 'Photo files are required' });
      }
      
      const uploadedPhotos = [];
      
      // Обрабатываем каждый загруженный файл
      for (const file of req.files) {
        let processedFilename, processedPath;
        
        try {
          // Обрабатываем изображение с помощью sharp
          processedFilename = `processed_${file.filename}`;
          processedPath = path.join(uploadsDir, processedFilename);
          
          await sharp(file.path)
            .resize({
              width: 1200,
              height: 1200,
              fit: sharp.fit.inside,
              withoutEnlargement: true
            })
            .jpeg({ quality: 85 })
            .toFile(processedPath);

          // Удаляем оригинальный файл после обработки
          fs.unlinkSync(file.path);
          
          // Создаем запись в базе данных
          const photo = await prisma.photo.create({
            data: {
              filename: processedFilename,
              originalName: file.originalname,
              mimetype: file.mimetype,
              size: fs.statSync(processedPath).size,
              url: `/api/uploads/${processedFilename}`,
              orderId: orderId
            }
          });
          
          uploadedPhotos.push(photo);
          
        } catch (imageProcessingError) {
          console.error('Ошибка обработки изображения:', imageProcessingError);
          
          // Если произошла ошибка при обработке, используем оригинальный файл
          try {
            const photo = await prisma.photo.create({
              data: {
                filename: file.filename,
                originalName: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
                url: `/api/uploads/${file.filename}`,
                orderId: orderId
              }
            });
            
            uploadedPhotos.push(photo);
          } catch (dbError) {
            console.error('Ошибка создания записи фото:', dbError);
            // Продолжаем с другими файлами
          }
        }
      }
      
      res.status(201).json(uploadedPhotos);
    } catch (error) {
      // Если файлы были загружены, удаляем их в случае общей ошибки
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          try {
            fs.unlinkSync(file.path);
          } catch (err) {
            console.error(`Ошибка при удалении файла ${file.path}:`, err);
          }
        });
      }
      
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