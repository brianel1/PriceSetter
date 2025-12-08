# Ubuntu VPS Deployment Guide

## Prerequisites
- Ubuntu 20.04+ VPS
- Node.js 18+
- MySQL/MariaDB
- Nginx
- PM2

## 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Install Nginx & PM2
sudo apt install -y nginx
sudo npm install -g pm2
```

## 2. Clone Repository

```bash
cd /var/www
sudo git clone https://github.com/brianel1/PriceSetter.git
sudo chown -R $USER:$USER PriceSetter
cd PriceSetter
```

## 3. Setup Database

```bash
# Login to MySQL
sudo mysql -u root -p

# Run these SQL commands:
CREATE DATABASE pricer_setter;
CREATE USER 'pricer_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON pricer_setter.* TO 'pricer_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import schema
mysql -u pricer_user -p pricer_setter < backend/config/schema.sql
```

## 4. Configure Backend

```bash
cd /var/www/PriceSetter/backend

# Create .env file
cat > .env << EOF
OPENAI_API_KEY=your_openai_api_key
DB_HOST=localhost
DB_USER=pricer_user
DB_PASSWORD=your_secure_password
DB_NAME=pricer_setter
PORT=5000
EOF

# Install dependencies
npm install

# Setup default user (username: echomedia, password: Echomedia@1337)
node scripts/setup-user.js

# Start with PM2
pm2 start server.js --name pricer-backend
pm2 save
```

## 5. Build Frontend

```bash
cd /var/www/PriceSetter/frontend

# Update API URL for production
# Edit src/api.js - change localhost to your domain
sed -i "s|http://localhost:5000/api|https://yourdomain.com/api|g" src/api.js

npm install
npm run build
```

## 6. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/pricesetter
```

Paste this config:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/PriceSetter/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/pricesetter /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 7. SSL with Certbot (Optional)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## 8. PM2 Auto-start

```bash
pm2 startup
pm2 save
```

## Quick Commands

```bash
# View logs
pm2 logs pricer-backend

# Restart backend
pm2 restart pricer-backend

# Update from git
cd /var/www/PriceSetter
git pull
cd backend && npm install && pm2 restart pricer-backend
cd ../frontend && npm install && npm run build
```
