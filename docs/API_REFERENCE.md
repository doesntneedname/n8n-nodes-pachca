# API Reference - Pachca Node для n8n

Подробная документация по всем операциям и параметрам ноды Pachca.

## 🔐 Аутентификация

Все запросы к API Pachca требуют аутентификации через Access Token.

### Настройка Credentials

```json
{
  "baseUrl": "https://api.pachca.com/api/shared/v1",
  "accessToken": "your_access_token_here"
}
```

## 👥 User Resource

### Get All Users
**Операция**: `getAll`  
**Метод**: `GET /users`

**Параметры:**
- `query` (string, optional) - Поисковая фраза для фильтрации
- `per` (number, default: 25) - Количество записей на страницу
- `page` (number, default: 1) - Номер страницы

**Пример ответа:**
```json
{
  "data": [
    {
      "id": 12,
      "first_name": "Олег",
      "last_name": "Петров",
      "email": "olegp@example.com",
      "role": "admin"
    }
  ]
}
```

### Get User By ID
**Операция**: `getById`  
**Метод**: `GET /users/{id}`

**Параметры:**
- `userId` (number, required) - ID пользователя

### Create User
**Операция**: `create`  
**Метод**: `POST /users`

**Параметры:**
- `firstName` (string, required) - Имя
- `lastName` (string, required) - Фамилия
- `email` (string, required) - Email
- `nickname` (string, optional) - Никнейм
- `phoneNumber` (string, optional) - Телефон
- `department` (string, optional) - Департамент
- `title` (string, optional) - Должность
- `role` (options, default: "user") - Роль: admin, user, multi_guest
- `listTags` (string, optional) - Теги через запятую
- `customProperties` (object, optional) - Дополнительные поля

### Update User
**Операция**: `update`  
**Метод**: `PUT /users/{id}`

**Параметры:**
- `userId` (number, required) - ID пользователя
- `firstName` (string, optional) - Имя
- `lastName` (string, optional) - Фамилия
- `email` (string, optional) - Email
- `nickname` (string, optional) - Никнейм
- `phoneNumber` (string, optional) - Телефон
- `department` (string, optional) - Департамент
- `title` (string, optional) - Должность
- `role` (options, optional) - Роль
- `suspended` (boolean, optional) - Деактивация
- `listTags` (string, optional) - Теги через запятую
- `customProperties` (object, optional) - Дополнительные поля

### Delete User
**Операция**: `delete`  
**Метод**: `DELETE /users/{id}`

**Параметры:**
- `userId` (number, required) - ID пользователя

## 💬 Message Resource

### Send Message
**Операция**: `send`  
**Метод**: `POST /messages`

**Параметры:**
- `chatId` (number, required) - ID чата
- `content` (string, required) - Текст сообщения
- `attachments` (array, optional) - Вложения

**Пример запроса:**
```json
{
  "message": {
    "chat_id": 12345,
    "content": "Привет!",
    "attachments": [
      "attaches/files/12345/file.pdf"
    ]
  }
}
```

### Get All Messages By Chat
**Операция**: `getAllByChat`  
**Метод**: `GET /messages`

**Параметры:**
- `chatId` (number, required) - ID чата
- `per` (number, default: 25) - Количество на страницу
- `page` (number, default: 1) - Номер страницы

### Get Message By ID
**Операция**: `getById`  
**Метод**: `GET /messages/{id}`

**Параметры:**
- `messageId` (number, required) - ID сообщения

### Update Message
**Операция**: `update`  
**Метод**: `PUT /messages/{id}`

**Параметры:**
- `messageId` (number, required) - ID сообщения
- `content` (string, required) - Новый текст

### Delete Message
**Операция**: `delete`  
**Метод**: `DELETE /messages/{id}`

**Параметры:**
- `messageId` (number, required) - ID сообщения

### Get Read Members
**Операция**: `getReadMembers`  
**Метод**: `GET /messages/{id}/read_member_ids`

**Параметры:**
- `messageId` (number, required) - ID сообщения
- `per` (number, default: 300) - Количество на страницу
- `page` (number, default: 1) - Номер страницы

## 🏠 Chat Resource

### Get All Chats
**Операция**: `getAll`  
**Метод**: `GET /chats`

**Параметры:**
- `per` (number, default: 25) - Количество на страницу
- `page` (number, default: 1) - Номер страницы

### Get Chat By ID
**Операция**: `getById`  
**Метод**: `GET /chats/{id}`

**Параметры:**
- `chatId` (number, required) - ID чата

### Create Chat
**Операция**: `create`  
**Метод**: `POST /chats`

**Параметры:**
- `chatName` (string, required) - Название чата
- `channel` (boolean, default: false) - Канал (true) или беседа (false)
- `public` (boolean, default: false) - Открытый (true) или закрытый (false)

**Пример запроса:**
```json
{
  "chat": {
    "name": "Новый проект",
    "channel": true,
    "public": false
  }
}
```

### Update Chat
**Операция**: `update`  
**Метод**: `PUT /chats/{id}`

**Параметры:**
- `chatId` (number, required) - ID чата
- `chatName` (string, required) - Новое название

### Archive Chat
**Операция**: `archive`  
**Метод**: `PUT /chats/{id}/archive`

**Параметры:**
- `chatId` (number, required) - ID чата

### Unarchive Chat
**Операция**: `unarchive`  
**Метод**: `PUT /chats/{id}/unarchive`

**Параметры:**
- `chatId` (number, required) - ID чата

## 🏷️ Group Tag Resource

### Get All Group Tags
**Операция**: `getAll`  
**Метод**: `GET /group_tags`

**Параметры:**
- `per` (number, default: 25) - Количество на страницу
- `page` (number, default: 1) - Номер страницы

### Get Group Tag By ID
**Операция**: `getById`  
**Метод**: `GET /group_tags/{id}`

**Параметры:**
- `groupTagId` (number, required) - ID тега

### Create Group Tag
**Операция**: `create`  
**Метод**: `POST /group_tags`

**Параметры:**
- `groupTagName` (string, required) - Название тега
- `groupTagColor` (string, required) - Цвет тега

### Update Group Tag
**Операция**: `update`  
**Метод**: `PUT /group_tags/{id}`

**Параметры:**
- `groupTagId` (number, required) - ID тега
- `groupTagName` (string, required) - Новое название
- `groupTagColor` (string, required) - Новый цвет

### Delete Group Tag
**Операция**: `delete`  
**Метод**: `DELETE /group_tags/{id}`

**Параметры:**
- `groupTagId` (number, required) - ID тега

### Add Tags to Chat
**Операция**: `addTags`  
**Метод**: `POST /chats/{id}/group_tags`

**Параметры:**
- `chatId` (number, required) - ID чата
- `groupTagIds` (array, required) - Массив ID тегов

### Remove Tag from Chat
**Операция**: `removeTag`  
**Метод**: `DELETE /chats/{id}/group_tags/{tag_id}`

**Параметры:**
- `chatId` (number, required) - ID чата
- `tagId` (number, required) - ID тега

## 📁 File Resource

### Upload File
**Операция**: `upload`  
**Метод**: `POST /uploads` + `POST direct_url`

**Параметры:**
- `fileSource` (options, required) - Источник файла: url, binary
- `fileUrl` (string, conditional) - URL файла (если fileSource = "url")
- `binaryProperty` (string, conditional) - Свойство с бинарными данными (если fileSource = "binary")
- `fileName` (string, optional) - Имя файла
- `contentType` (string, optional) - MIME тип

**Процесс загрузки:**
1. Получение параметров загрузки: `POST /uploads`
2. Загрузка файла: `POST direct_url` с multipart/form-data

### Get Upload Params
**Операция**: `getUploadParams`  
**Метод**: `POST /uploads`

Возвращает параметры для загрузки файла на S3-совместимое хранилище.

## 🎯 Custom Fields Resource

### Get Custom Properties
**Операция**: `getCustomProperties`  
**Метод**: `GET /fields`

**Параметры:**
- `entityType` (string, required) - Тип сущности: user, chat, message

## ✅ Task Resource

### Create Task
**Операция**: `create`  
**Метод**: `POST /tasks`

**Параметры:**
- `taskKind` (string, required) - Тип задачи
- `taskContent` (string, required) - Содержание задачи
- `taskDueAt` (string, optional) - Срок выполнения (ISO-8601)
- `taskPriority` (string, optional) - Приоритет
- `performerIds` (array, optional) - ID исполнителей
- `customProperties` (object, optional) - Дополнительные поля

## 🤖 Bot Resource

### Update Bot
**Операция**: `update`  
**Метод**: `PUT /bots/{id}`

**Параметры:**
- `botId` (number, required) - ID бота
- `webhookUrl` (string, required) - URL webhook

## 👤 Status Resource

### Get Profile
**Операция**: `getProfile`  
**Метод**: `GET /profile`

Возвращает информацию о текущем пользователе.

### Get Status
**Операция**: `getStatus`  
**Метод**: `GET /profile/status`

Возвращает текущий статус пользователя.

### Update Status
**Операция**: `updateStatus`  
**Метод**: `PUT /profile/status`

**Параметры:**
- `statusEmoji` (string, required) - Emoji статуса
- `statusTitle` (string, required) - Текст статуса
- `statusExpiresAt` (string, optional) - Срок действия (ISO-8601)

### Delete Status
**Операция**: `deleteStatus`  
**Метод**: `DELETE /profile/status`

Удаляет текущий статус пользователя.

## 🧵 Thread Resource

### Create Thread
**Операция**: `createThread`  
**Метод**: `POST /messages/{id}/thread`

**Параметры:**
- `threadMessageId` (number, required) - ID сообщения для создания потока

### Get Thread
**Операция**: `getThread`  
**Метод**: `GET /threads/{id}`

**Параметры:**
- `threadThreadId` (number, required) - ID потока

## 👍 Reactions Resource

### Add Reaction
**Операция**: `addReaction`  
**Метод**: `POST /messages/{id}/reactions`

**Параметры:**
- `reactionsMessageId` (number, required) - ID сообщения
- `reactionsReactionCode` (string, required) - Код реакции

### Delete Reaction
**Операция**: `deleteReaction`  
**Метод**: `DELETE /messages/{id}/reactions`

**Параметры:**
- `reactionsMessageId` (number, required) - ID сообщения
- `reactionsReactionCode` (string, required) - Код реакции

### Get Reactions
**Операция**: `getReactions`  
**Метод**: `GET /messages/{id}/reactions`

**Параметры:**
- `reactionsMessageId` (number, required) - ID сообщения
- `reactionsPer` (number, default: 25) - Количество на страницу
- `reactionsPage` (number, default: 1) - Номер страницы

## 📊 Коды ошибок

| Код | Описание | Решение |
|-----|----------|---------|
| 400 | Bad Request | Проверьте параметры запроса |
| 401 | Unauthorized | Проверьте токен доступа |
| 403 | Forbidden | Недостаточно прав доступа |
| 404 | Not Found | Ресурс не найден |
| 422 | Unprocessable Entity | Ошибка валидации данных |
| 429 | Too Many Requests | Превышен лимит запросов |
| 500 | Internal Server Error | Ошибка сервера Pachca |

## 🔄 Пагинация

Большинство операций `getAll` поддерживают пагинацию:

- `per` - количество записей на страницу (максимум 300)
- `page` - номер страницы (начиная с 1)

**Пример:**
```json
{
  "per": 50,
  "page": 2
}
```

## 📝 Форматы данных

### ISO-8601 даты
Все даты должны быть в формате ISO-8601 UTC:
```
2024-01-20T13:40:07.000Z
```

### Custom Properties
Дополнительные поля передаются в формате:
```json
{
  "custom_properties": [
    {
      "id": 1678,
      "value": "Санкт-Петербург"
    }
  ]
}
```

### List Tags
Теги передаются как массив строк:
```json
{
  "list_tags": ["Product", "Design", "Backend"]
}
```
