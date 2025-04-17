# PR Lite

Приложение для управления заказами с возможностью загрузки фотографий.

## Требования

- Node.js 16 или выше
- PostgreSQL 12 или выше
- NPM или Yarn

## Локальная разработка

### Установка

```bash
git clone https://github.com/yourusername/pr-lite.git
cd pr-lite
npm install
```

### Настройка базы данных

1. Создайте копию файла `.env.sample` и назовите его `.env`
2. Отредактируйте файл `.env`, указав настройки вашей базы данных PostgreSQL

```
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"
```

3. Запустите миграции:

```bash
npm run prisma:migrate
```

4. (Опционально) Заполните базу данных тестовыми данными:

```bash
npm run db:seed
```

### Запуск приложения

```bash
npm run dev
```

После запуска:
- Сервер API будет доступен по адресу http://localhost:3001
- Клиентское приложение будет доступен по адресу http://localhost:3000

## Деплой

### Подготовка к деплою

1. Соберите приложение для продакшена:

```bash
npm run deploy
```

Это создаст оптимизированную сборку в директории `build/` и применит миграции базы данных.

### Варианты деплоя

#### Heroku

1. Установите [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Создайте новое приложение на Heroku:

```bash
heroku create your-app-name
```

3. Добавьте базу данных PostgreSQL:

```bash
heroku addons:create heroku-postgresql:hobby-dev
```

4. Отправьте код в Heroku:

```bash
git push heroku main
```

#### Docker

1. Соберите Docker образ:

```bash
docker build -t pr-lite .
```

2. Запустите контейнер:

```bash
docker run -p 3001:3001 --env-file .env.production pr-lite
```

#### Render.com

1. Создайте новый веб-сервис, связанный с вашим репозиторием
2. Укажите настройки:
   - Build Command: `npm install && npm run deploy`
   - Start Command: `npm start`
   - План: минимум 512 МБ RAM
3. Добавьте PostgreSQL базу данных
4. Укажите переменные окружения (DATABASE_URL будет добавлен автоматически)

## Переменные окружения

Список всех доступных переменных окружения:

| Переменная | Описание | По умолчанию |
| --- | --- | --- |
| DATABASE_URL | Строка подключения к PostgreSQL | - |
| NODE_ENV | Окружение (development, production) | development |
| PORT | Порт для запуска сервера | 3001 |
| CORS_ORIGIN | Разрешенный источник для CORS | http://localhost:3000 |
| MAX_FILE_SIZE | Максимальный размер загружаемого файла (в байтах) | 10485760 (10MB) |

## Лицензия

MIT 