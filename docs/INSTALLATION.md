# Установка Pachca Node для n8n

Подробные инструкции по установке и настройке кастомной ноды Pachca для n8n.

## 📋 Требования

- n8n версии 1.0.0 или выше
- Node.js 18+ (для локальной разработки)
- Docker (для Docker-установки)
- Доступ к API Pachca

## 🐳 Установка в Docker

### Метод 1: Автоматическая установка

1. **Скачайте архив с нодой:**
```bash
# Скачайте последний релиз
wget https://github.com/your-repo/n8n-nodes-pachca/releases/latest/download/pachca-node.tar.gz

# Или используйте curl
curl -L -o pachca-node.tar.gz https://github.com/your-repo/n8n-nodes-pachca/releases/latest/download/pachca-node.tar.gz
```

2. **Скопируйте архив на сервер:**
```bash
# Если у вас есть SSH доступ
scp pachca-node.tar.gz user@your-server:/tmp/

# Или загрузите через веб-интерфейс
```

3. **Подключитесь к серверу и установите:**
```bash
# Подключитесь к серверу
ssh user@your-server

# Распакуйте архив в директорию custom nodes
tar -xzf /tmp/pachca-node.tar.gz -C /path/to/n8n/custom-nodes/

# Перезапустите n8n контейнер
docker restart n8n-container-name
```

### Метод 2: Ручная установка

1. **Подключитесь к серверу:**
```bash
ssh user@your-server
```

2. **Найдите директорию n8n:**
```bash
# Обычно находится в одном из мест:
ls -la /home/user/n8n/
ls -la /opt/n8n/
ls -la /var/lib/docker/volumes/
```

3. **Создайте директорию custom nodes (если не существует):**
```bash
mkdir -p /path/to/n8n/custom-nodes/
```

4. **Скопируйте файлы ноды:**
```bash
# Если у вас есть исходники
cp -r /path/to/source/n8n-nodes-pachca /path/to/n8n/custom-nodes/

# Или распакуйте архив
tar -xzf pachca-node.tar.gz -C /path/to/n8n/custom-nodes/
```

5. **Установите права доступа:**
```bash
chown -R n8n:n8n /path/to/n8n/custom-nodes/
chmod -R 755 /path/to/n8n/custom-nodes/
```

6. **Перезапустите n8n:**
```bash
docker restart n8n-container-name
```

## 🖥️ Установка в локальной среде

### Предварительные требования

```bash
# Убедитесь, что у вас установлен Node.js 18+
node --version

# Установите npm (если не установлен)
npm --version
```

### Установка

1. **Клонируйте репозиторий:**
```bash
git clone https://github.com/your-repo/n8n-nodes-pachca.git
cd n8n-nodes-pachca
```

2. **Установите зависимости:**
```bash
npm install
```

3. **Соберите проект:**
```bash
npm run build
```

4. **Скопируйте в директорию n8n:**
```bash
# Найдите директорию n8n
npm list -g n8n

# Скопируйте собранные файлы
cp -r dist /path/to/n8n/custom-nodes/n8n-nodes-pachca
```

5. **Перезапустите n8n:**
```bash
# Если n8n запущен как сервис
sudo systemctl restart n8n

# Если запущен вручную
pkill n8n
n8n start
```

## 🔧 Настройка Docker Compose

Если вы используете Docker Compose, добавьте volume для custom nodes:

```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=password
    volumes:
      - n8n_data:/home/node/.n8n
      - ./custom-nodes:/home/node/.n8n/custom  # Добавьте эту строку
    networks:
      - n8n-network

volumes:
  n8n_data:

networks:
  n8n-network:
```

Затем скопируйте ноду в директорию `./custom-nodes/`:

```bash
mkdir -p ./custom-nodes/
tar -xzf pachca-node.tar.gz -C ./custom-nodes/
docker-compose restart n8n
```

## ⚙️ Настройка Credentials

После установки ноды необходимо настроить credentials для доступа к API Pachca:

### 1. Получение Access Token

1. Войдите в веб-версию Pachca
2. Перейдите в **Настройки** → **Интеграции**
3. Нажмите **Создать токен**
4. Выберите необходимые права доступа:
   - `users:read` - чтение пользователей
   - `users:write` - создание/изменение пользователей
   - `messages:read` - чтение сообщений
   - `messages:write` - отправка сообщений
   - `chats:read` - чтение чатов
   - `chats:write` - создание/изменение чатов
   - `files:write` - загрузка файлов
5. Скопируйте созданный токен

### 2. Создание Credentials в n8n

1. Откройте n8n в браузере
2. Перейдите в **Settings** → **Credentials**
3. Нажмите **Add Credential**
4. Найдите **Pachca API** в списке
5. Заполните поля:
   - **Name**: `Pachca API` (или любое другое имя)
   - **Base URL**: `https://api.pachca.com/api/shared/v1`
   - **Access Token**: вставьте ваш токен
6. Нажмите **Save**

### 3. Проверка подключения

1. Создайте новый workflow
2. Добавьте ноду **Pachca**
3. Выберите **User** → **Get All**
4. Выберите созданные credentials
5. Нажмите **Execute Node**
6. Если все настроено правильно, вы увидите список пользователей

## 🔍 Проверка установки

### Проверка файлов

Убедитесь, что все файлы ноды находятся в правильном месте:

```bash
# Проверьте структуру директории
ls -la /path/to/n8n/custom-nodes/n8n-nodes-pachca/

# Должны быть файлы:
# - package.json
# - nodes/
#   - Pachca/
#     - Pachca.node.js
#     - icons/
#       - Pachca_white_mark.png
```

### Проверка логов

Проверьте логи n8n на наличие ошибок:

```bash
# Docker
docker logs n8n-container-name

# Локальная установка
tail -f /var/log/n8n.log
```

Ищите сообщения типа:
- `Loaded custom node: Pachca` ✅
- `Error loading custom node: Pachca` ❌

### Проверка в интерфейсе

1. Откройте n8n в браузере
2. Создайте новый workflow
3. Нажмите **+** для добавления ноды
4. В поиске введите "Pachca"
5. Нода должна появиться в списке с иконкой

## 🚨 Устранение проблем

### Нода не появляется в списке

**Возможные причины:**
- Файлы не скопированы в правильную директорию
- Неправильные права доступа
- Ошибки в коде ноды

**Решение:**
```bash
# Проверьте права доступа
ls -la /path/to/n8n/custom-nodes/n8n-nodes-pachca/

# Установите правильные права
chown -R n8n:n8n /path/to/n8n/custom-nodes/
chmod -R 755 /path/to/n8n/custom-nodes/

# Перезапустите n8n
docker restart n8n-container-name
```

### Ошибка "Cannot find module"

**Возможные причины:**
- Отсутствуют зависимости
- Неправильная структура файлов

**Решение:**
```bash
# Пересоберите ноду
cd /path/to/source/n8n-nodes-pachca
npm install
npm run build

# Скопируйте заново
cp -r dist /path/to/n8n/custom-nodes/n8n-nodes-pachca
```

### Ошибка "Invalid credentials"

**Возможные причины:**
- Неправильный токен доступа
- Неправильный Base URL
- Истек срок действия токена

**Решение:**
1. Проверьте токен в настройках Pachca
2. Убедитесь, что Base URL: `https://api.pachca.com/api/shared/v1`
3. Создайте новый токен при необходимости

### Ошибка "Permission denied"

**Возможные причины:**
- Недостаточно прав у токена
- Токен не имеет доступа к ресурсу

**Решение:**
1. Проверьте права токена в настройках Pachca
2. Добавьте необходимые права доступа
3. Создайте новый токен с расширенными правами

## 📝 Обновление ноды

### Обновление до новой версии

1. **Скачайте новую версию:**
```bash
wget https://github.com/your-repo/n8n-nodes-pachca/releases/latest/download/pachca-node.tar.gz
```

2. **Сделайте резервную копию:**
```bash
cp -r /path/to/n8n/custom-nodes/n8n-nodes-pachca /path/to/n8n/custom-nodes/n8n-nodes-pachca.backup
```

3. **Установите новую версию:**
```bash
tar -xzf pachca-node.tar.gz -C /path/to/n8n/custom-nodes/
```

4. **Перезапустите n8n:**
```bash
docker restart n8n-container-name
```

### Откат к предыдущей версии

```bash
# Удалите текущую версию
rm -rf /path/to/n8n/custom-nodes/n8n-nodes-pachca

# Восстановите из резервной копии
mv /path/to/n8n/custom-nodes/n8n-nodes-pachca.backup /path/to/n8n/custom-nodes/n8n-nodes-pachca

# Перезапустите n8n
docker restart n8n-container-name
```

## 🔒 Безопасность

### Рекомендации по безопасности

1. **Ограничьте права токена:**
   - Предоставляйте только необходимые права
   - Регулярно обновляйте токены
   - Используйте отдельные токены для разных целей

2. **Защитите credentials:**
   - Не храните токены в открытом виде
   - Используйте переменные окружения
   - Ограничьте доступ к файлам конфигурации

3. **Мониторинг:**
   - Отслеживайте использование API
   - Проверяйте логи на подозрительную активность
   - Настройте уведомления об ошибках

### Переменные окружения

Для дополнительной безопасности используйте переменные окружения:

```bash
# В .env файле или docker-compose.yml
PACHCA_API_TOKEN=your_token_here
PACHCA_BASE_URL=https://api.pachca.com/api/shared/v1
```

Затем используйте в credentials:
- **Access Token**: `{{ $env.PACHCA_API_TOKEN }}`
- **Base URL**: `{{ $env.PACHCA_BASE_URL }}`

## 📞 Поддержка

Если у вас возникли проблемы с установкой:

1. **Проверьте логи n8n** на наличие ошибок
2. **Убедитесь в правильности** всех путей и прав доступа
3. **Создайте issue** в GitHub репозитории с подробным описанием проблемы
4. **Приложите логи** и информацию о вашей среде

---

**Удачной установки и использования!** 🚀
