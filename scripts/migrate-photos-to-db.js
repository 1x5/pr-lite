import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient();
const uploadsDir = path.join(__dirname, '..', 'uploads');

async function migratePhotos() {
  console.log('Starting photo migration to database...');
  
  if (!fs.existsSync(uploadsDir)) {
    console.error(`Uploads directory not found: ${uploadsDir}`);
    return;
  }
  
  // Получаем все файлы из директории uploads
  const files = fs.readdirSync(uploadsDir);
  console.log(`Found ${files.length} files in uploads directory.`);
  
  // Получаем все фотографии из базы данных для сопоставления
  const photos = await prisma.photo.findMany();
  console.log(`Found ${photos.length} photos in database.`);
  
  let successful = 0;
  let failed = 0;
  
  for (const photo of photos) {
    try {
      // Попробуем найти файл, который может соответствовать этой фотографии
      // Обычно файлы имеют формат processed_*.ext
      const files = fs.readdirSync(uploadsDir);
      const matchingFiles = files.filter(file => {
        return file.startsWith('processed_');
      });

      if (matchingFiles.length === 0) {
        console.error(`No processed files found for photo ID: ${photo.id}`);
        failed++;
        continue;
      }

      // Используем первый найденный файл - это не идеально, но лучшее, что можно сделать
      // без имени файла в базе данных
      const filePath = path.join(uploadsDir, matchingFiles[0]);
      
      // Читаем файл и сжимаем на 50%
      const imageBuffer = await sharp(filePath)
        .jpeg({ quality: 50 })
        .toBuffer();
      
      // Обновляем запись в базе данных
      await prisma.photo.update({
        where: { id: photo.id },
        data: {
          data: imageBuffer,
          size: imageBuffer.length,
        }
      });
      
      // Удаляем обработанный файл
      fs.unlinkSync(filePath);
      
      successful++;
      console.log(`Migrated photo ID: ${photo.id} (used file: ${matchingFiles[0]})`);
    } catch (error) {
      console.error(`Error migrating photo ID: ${photo.id}`, error);
      failed++;
    }
  }
  
  console.log(`Migration completed: ${successful} successful, ${failed} failed.`);
  
  // Проверяем, остались ли файлы в директории
  const remainingFiles = fs.readdirSync(uploadsDir);
  if (remainingFiles.length > 0) {
    console.log(`Warning: ${remainingFiles.length} files remain in uploads directory.`);
  } else {
    console.log('All files processed. Uploads directory is empty.');
  }
}

migratePhotos()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  }); 