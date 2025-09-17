# Конфигурация Pachca Node

Руководство по настройке и конфигурации ноды Pachca для различных сценариев использования.

## 📋 Содержание

- [Базовые настройки](#базовые-настройки)
- [Настройка Credentials](#настройка-credentials)
- [Конфигурация ресурсов](#конфигурация-ресурсов)
- [Переменные окружения](#переменные-окружения)
- [Безопасность](#безопасность)
- [Мониторинг](#мониторинг)

## ⚙️ Базовые настройки

### Структура проекта

```
n8n-nodes-pachca/
├── nodes/
│   └── Pachca/
│       ├── Pachca.node.ts
│       └── icons/
│           └── Pachca_white_mark.png
├── credentials/
│   └── PachcaApi.credentials.ts
├── docs/
│   ├── API_REFERENCE.md
│   ├── WORKFLOW_EXAMPLES.md
│   └── INSTALLATION.md
├── package.json
├── tsconfig.json
└── README.md
```

### Основные параметры

```typescript
// Основные настройки ноды
{
  "displayName": "Pachca",
  "name": "pachca",
  "icon": "file:Pachca_white_mark.png",
  "group": ["transform"],
  "version": 1,
  "description": "Интеграция с API мессенджера Pachca",
  "defaults": {
    "name": "Pachca"
  }
}
```

## 🔐 Настройка Credentials

### Структура Credentials

```typescript
interface PachcaApiCredentials {
  baseUrl: string;
  accessToken: string;
}
```

### Примеры конфигурации

#### 1. Базовая конфигурация
```json
{
  "name": "Pachca API",
  "baseUrl": "https://api.pachca.com/api/shared/v1",
  "accessToken": "your_access_token_here"
}
```

#### 2. Конфигурация с переменными окружения
```json
{
  "name": "Pachca API Production",
  "baseUrl": "{{ $env.PACHCA_BASE_URL }}",
  "accessToken": "{{ $env.PACHCA_ACCESS_TOKEN }}"
}
```

#### 3. Конфигурация для разных сред
```json
{
  "name": "Pachca API Development",
  "baseUrl": "https://api-dev.pachca.com/api/shared/v1",
  "accessToken": "{{ $env.PACHCA_DEV_TOKEN }}"
}
```

### Получение Access Token

#### Через веб-интерфейс Pachca
1. Войдите в Pachca
2. Перейдите в **Настройки** → **Интеграции**
3. Нажмите **Создать токен**
4. Выберите права доступа:
   - `users:read` - чтение пользователей
   - `users:write` - создание/изменение пользователей
   - `messages:read` - чтение сообщений
   - `messages:write` - отправка сообщений
   - `chats:read` - чтение чатов
   - `chats:write` - создание/изменение чатов
   - `files:write` - загрузка файлов

#### Через API (для администраторов)
```bash
curl -X POST "https://api.pachca.com/api/shared/v1/auth/token" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_username",
    "password": "your_password"
  }'
```

## 🎯 Конфигурация ресурсов

### User Resource

#### Настройки для создания пользователя
```json
{
  "resource": "user",
  "operation": "create",
  "firstName": "Иван",
  "lastName": "Петров",
  "email": "ivan.petrov@company.com",
  "nickname": "ivan_petrov",
  "phoneNumber": "+7-xxx-xxx-xxxx",
  "department": "Разработка",
  "title": "Senior Developer",
  "role": "user",
  "listTags": "Backend, Senior, Python",
  "customProperties": {
    "property": [
      {
        "id": 1678,
        "value": "Москва"
      },
      {
        "id": 1679,
        "value": "5 лет"
      }
    ]
  }
}
```

#### Настройки для обновления пользователя
```json
{
  "resource": "user",
  "operation": "update",
  "userId": 123,
  "department": "Продукт",
  "title": "Product Manager",
  "suspended": false,
  "listTags": "Product, Management, Strategy"
}
```

### Message Resource

#### Настройки для отправки сообщения
```json
{
  "resource": "message",
  "operation": "send",
  "chatId": 12345,
  "content": "Привет! Это автоматическое сообщение от n8n.",
  "attachments": [
    "attaches/files/12345/document.pdf"
  ]
}
```

#### Настройки для получения сообщений
```json
{
  "resource": "message",
  "operation": "getAllByChat",
  "chatId": 12345,
  "per": 50,
  "page": 1
}
```

### Chat Resource

#### Настройки для создания чата
```json
{
  "resource": "chat",
  "operation": "create",
  "chatName": "Новый проект",
  "channel": true,
  "public": false
}
```

#### Настройки для архивирования чата
```json
{
  "resource": "chat",
  "operation": "archive",
  "chatId": 12345
}
```

### File Resource

#### Настройки для загрузки файла по URL
```json
{
  "resource": "file",
  "operation": "upload",
  "fileSource": "url",
  "fileUrl": "https://example.com/document.pdf",
  "fileName": "document.pdf",
  "contentType": "application/pdf"
}
```

#### Настройки для загрузки бинарного файла
```json
{
  "resource": "file",
  "operation": "upload",
  "fileSource": "binary",
  "binaryProperty": "data",
  "fileName": "image.jpg",
  "contentType": "image/jpeg"
}
```

## 🌍 Переменные окружения

### Настройка в Docker

#### docker-compose.yml
```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    environment:
      # Pachca API настройки
      - PACHCA_BASE_URL=https://api.pachca.com/api/shared/v1
      - PACHCA_ACCESS_TOKEN=your_access_token_here
      - PACHCA_DEV_TOKEN=your_dev_token_here
      
      # n8n настройки
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=password
    volumes:
      - n8n_data:/home/node/.n8n
      - ./custom-nodes:/home/node/.n8n/custom
```

#### .env файл
```bash
# Pachca API
PACHCA_BASE_URL=https://api.pachca.com/api/shared/v1
PACHCA_ACCESS_TOKEN=your_access_token_here
PACHCA_DEV_TOKEN=your_dev_token_here

# n8n
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=password
```

### Использование в n8n

#### В Credentials
```json
{
  "baseUrl": "{{ $env.PACHCA_BASE_URL }}",
  "accessToken": "{{ $env.PACHCA_ACCESS_TOKEN }}"
}
```

#### В параметрах ноды
```json
{
  "chatId": "{{ $env.DEFAULT_CHAT_ID }}",
  "content": "Сообщение от {{ $env.APP_NAME }}"
}
```

## 🔒 Безопасность

### Рекомендации по безопасности

#### 1. Управление токенами
```bash
# Создание токена с ограниченными правами
curl -X POST "https://api.pachca.com/api/shared/v1/auth/token" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "service_account",
    "password": "secure_password",
    "scopes": ["messages:write", "chats:read"]
  }'
```

#### 2. Ротация токенов
```bash
#!/bin/bash
# Скрипт для автоматической ротации токенов

# Получение нового токена
NEW_TOKEN=$(curl -s -X POST "https://api.pachca.com/api/shared/v1/auth/token" \
  -H "Content-Type: application/json" \
  -d '{"username": "service_account", "password": "secure_password"}' \
  | jq -r '.access_token')

# Обновление переменной окружения
echo "PACHCA_ACCESS_TOKEN=$NEW_TOKEN" > .env.new
mv .env.new .env

# Перезапуск n8n
docker-compose restart n8n
```

#### 3. Ограничение доступа
```yaml
# docker-compose.yml с ограничениями сети
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    networks:
      - internal
    environment:
      - PACHCA_ACCESS_TOKEN=${PACHCA_ACCESS_TOKEN}

networks:
  internal:
    driver: bridge
    internal: true
```

### Аудит и логирование

#### Настройка логирования
```json
{
  "logging": {
    "level": "info",
    "format": "json",
    "destination": "/var/log/n8n/pachca.log"
  }
}
```

#### Мониторинг API вызовов
```typescript
// Добавление в ноду для логирования
console.log('Pachca API Call:', {
  method: 'POST',
  url: `${credentials?.baseUrl}/messages`,
  timestamp: new Date().toISOString(),
  userId: this.getNodeParameter('userId', i)
});
```

## 📊 Мониторинг

### Метрики производительности

#### Настройка мониторинга
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'n8n-pachca'
    static_configs:
      - targets: ['n8n:5678']
    metrics_path: '/metrics'
```

#### Дашборд Grafana
```json
{
  "dashboard": {
    "title": "Pachca Node Metrics",
    "panels": [
      {
        "title": "API Calls per Minute",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(pachca_api_calls_total[1m])"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "singlestat",
        "targets": [
          {
            "expr": "rate(pachca_api_errors_total[5m])"
          }
        ]
      }
    ]
  }
}
```

### Алерты

#### Настройка алертов
```yaml
# alertmanager.yml
groups:
  - name: pachca-alerts
    rules:
      - alert: PachcaAPIHighErrorRate
        expr: rate(pachca_api_errors_total[5m]) > 0.1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High error rate in Pachca API calls"
          description: "Error rate is {{ $value }} errors per second"
```

## 🔧 Расширенная конфигурация

### Кастомные параметры

#### Добавление новых параметров
```typescript
// В Pachca.node.ts
{
  displayName: 'Custom Parameter',
  name: 'customParam',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['user'],
      operation: ['create', 'update'],
    },
  },
  default: '',
  description: 'Кастомный параметр для специфических нужд',
}
```

### Интеграция с внешними системами

#### Webhook конфигурация
```json
{
  "webhook": {
    "url": "https://your-app.com/webhook/pachca",
    "secret": "your_webhook_secret",
    "events": [
      "user.created",
      "message.sent",
      "chat.created"
    ]
  }
}
```

#### API Gateway настройки
```yaml
# nginx.conf
upstream pachca_api {
    server api.pachca.com:443;
}

server {
    listen 80;
    server_name pachca-proxy.local;
    
    location /api/ {
        proxy_pass https://pachca_api;
        proxy_set_header Host api.pachca.com;
        proxy_set_header Authorization $http_authorization;
    }
}
```

---

**Настройте ноду под ваши потребности и обеспечьте безопасность ваших данных!** 🔒
