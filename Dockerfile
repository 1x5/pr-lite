FROM node:16-alpine

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Устанавливаем Prisma и генерируем клиент
RUN npx prisma generate

# Собираем React приложение
RUN npm run build

# Создаем директорию для загрузок
RUN mkdir -p uploads && chmod -R 777 uploads

# Устанавливаем переменные окружения для production
ENV NODE_ENV=production
ENV PORT=3001

# Открываем порт
EXPOSE 3001

# Запускаем приложение
CMD ["npm", "start"] 