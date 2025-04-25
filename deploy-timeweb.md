# Инструкция по деплою на Timeweb

## Подготовка

1. Создайте VPS на Timeweb с Ubuntu или Debian
2. Установите Node.js и npm:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
3. Установите PM2 глобально:
   ```bash
   sudo npm install -g pm2
   ```
4. Установите PostgreSQL:
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   ```

## Настройка базы данных

1. Войдите в PostgreSQL:
   ```bash
   sudo -u postgres psql
   ```
2. Создайте пользователя и базу данных:
   ```sql
   CREATE USER prliteuser WITH PASSWORD 'ваш_пароль';
   CREATE DATABASE prlite OWNER prliteuser;
   \q
   ```
3. Настройте доступ к базе данных в файле `.env`

## Деплой приложения

1. Клонируйте репозиторий:
   ```bash
   git clone https://github.com/yourusername/pr-lite.git
   cd pr-lite
   ```

2. Создайте файл `.env` на основе `.env.timeweb`:
   ```bash
   cp .env.timeweb .env
   ```

3. Отредактируйте `.env` и укажите правильные параметры подключения к базе данных

4. Установите зависимости и настройте базу данных:
   ```bash
   npm run timeweb:setup
   ```

5. Запустите приложение с PM2:
   ```bash
   npm run timeweb:start
   ```

6. Настройте автозапуск PM2 при перезагрузке:
   ```bash
   pm2 startup
   pm2 save
   ```

## Настройка Nginx (если нужно)

1. Установите Nginx:
   ```bash
   sudo apt install nginx
   ```

2. Создайте конфигурацию сайта:
   ```bash
   sudo nano /etc/nginx/sites-available/pr-lite
   ```

3. Добавьте следующую конфигурацию:
   ```nginx
   server {
       listen 80;
       server_name ваш-домен.ru www.ваш-домен.ru;

       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. Активируйте конфигурацию и перезапустите Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/pr-lite /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

5. Настройте SSL с помощью Certbot:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru
   ```

## Обновление приложения

Для обновления приложения:

1. Перейдите в директорию проекта:
   ```bash
   cd /путь/к/pr-lite
   ```

2. Получите последние изменения:
   ```bash
   git pull
   ```

3. Установите зависимости и перезапустите:
   ```bash
   npm run timeweb:setup
   npm run timeweb:restart
   ```

## Полезные команды

- Проверка логов: `pm2 logs pr-lite`
- Перезапуск приложения: `pm2 restart pr-lite`
- Остановка приложения: `pm2 stop pr-lite`
- Запуск приложения: `pm2 start pr-lite`
- Информация о приложении: `pm2 info pr-lite` 