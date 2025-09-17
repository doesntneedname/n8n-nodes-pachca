# Примеры Workflow - Pachca Node

Коллекция готовых workflow для автоматизации работы с Pachca через n8n.

## 📋 Содержание

- [Уведомления](#уведомления)
- [Управление пользователями](#управление-пользователями)
- [Автоматизация чатов](#автоматизация-чатов)
- [Обработка файлов](#обработка-файлов)
- [Интеграции](#интеграции)

## 🔔 Уведомления

### 1. Уведомление о новом пользователе

**Описание**: Автоматически создает пользователя в Pachca и отправляет приветственное сообщение.

**Триггер**: Webhook (получение данных о новом сотруднике)

**Workflow:**
```
Webhook → Pachca: Create User → Pachca: Create Chat → Pachca: Send Message
```

**Настройки нод:**

1. **Webhook** - получает данные:
```json
{
  "firstName": "Иван",
  "lastName": "Петров", 
  "email": "ivan.petrov@company.com",
  "department": "Разработка"
}
```

2. **Pachca: Create User**:
   - Resource: `user`
   - Operation: `create`
   - First Name: `{{ $json.firstName }}`
   - Last Name: `{{ $json.lastName }}`
   - Email: `{{ $json.email }}`
   - Department: `{{ $json.department }}`

3. **Pachca: Create Chat**:
   - Resource: `chat`
   - Operation: `create`
   - Chat Name: `Привет, {{ $json.firstName }}!`
   - Channel: `false`
   - Public: `false`

4. **Pachca: Send Message**:
   - Resource: `message`
   - Operation: `send`
   - Chat ID: `{{ $('Pachca: Create Chat').item.json.data.id }}`
   - Content: `Добро пожаловать в команду, {{ $json.firstName }}! 🎉`

### 2. Ежедневный отчет в чат

**Описание**: Отправляет ежедневный отчет о задачах в общий чат.

**Триггер**: Cron (каждый день в 9:00)

**Workflow:**
```
Cron → Code (подготовка отчета) → Pachca: Send Message
```

**Настройки нод:**

1. **Cron**:
   - Trigger Interval: `0 9 * * *` (каждый день в 9:00)

2. **Code** (подготовка отчета):
```javascript
// Получаем данные о задачах (пример)
const tasks = [
  { title: "Задача 1", status: "Выполнено" },
  { title: "Задача 2", status: "В работе" },
  { title: "Задача 3", status: "Новая" }
];

const report = `📊 Ежедневный отчет - ${new Date().toLocaleDateString('ru-RU')}

✅ Выполнено: ${tasks.filter(t => t.status === 'Выполнено').length}
🔄 В работе: ${tasks.filter(t => t.status === 'В работе').length}
📋 Новые: ${tasks.filter(t => t.status === 'Новая').length}

Детали:
${tasks.map(t => `• ${t.title} - ${t.status}`).join('\n')}`;

return [{ json: { report } }];
```

3. **Pachca: Send Message**:
   - Resource: `message`
   - Operation: `send`
   - Chat ID: `12345` (ID общего чата)
   - Content: `{{ $json.report }}`

## 👥 Управление пользователями

### 3. Синхронизация пользователей с HR системой

**Описание**: Синхронизирует данные пользователей между HR системой и Pachca.

**Триггер**: Webhook (обновление данных сотрудника)

**Workflow:**
```
Webhook → Pachca: Get User By ID → IF (пользователь существует) → Pachca: Update User
                                    → ELSE → Pachca: Create User
```

**Настройки нод:**

1. **Webhook** - получает данные:
```json
{
  "employeeId": "12345",
  "firstName": "Анна",
  "lastName": "Сидорова",
  "email": "anna.sidorova@company.com",
  "department": "Маркетинг",
  "title": "Маркетинг-менеджер",
  "status": "active"
}
```

2. **Pachca: Get User By ID**:
   - Resource: `user`
   - Operation: `getById`
   - User ID: `{{ $json.employeeId }}`

3. **IF** (проверка существования):
   - Condition: `{{ $json.data.id }}` exists

4. **Pachca: Update User** (если существует):
   - Resource: `user`
   - Operation: `update`
   - User ID: `{{ $json.employeeId }}`
   - First Name: `{{ $('Webhook').item.json.firstName }}`
   - Last Name: `{{ $('Webhook').item.json.lastName }}`
   - Department: `{{ $('Webhook').item.json.department }}`
   - Title: `{{ $('Webhook').item.json.title }}`

5. **Pachca: Create User** (если не существует):
   - Resource: `user`
   - Operation: `create`
   - First Name: `{{ $json.firstName }}`
   - Last Name: `{{ $json.lastName }}`
   - Email: `{{ $json.email }}`
   - Department: `{{ $json.department }}`
   - Title: `{{ $json.title }}`

### 4. Автоматическое назначение тегов по департаменту

**Описание**: Автоматически назначает теги пользователям в зависимости от департамента.

**Триггер**: Webhook (создание/обновление пользователя)

**Workflow:**
```
Webhook → Code (определение тегов) → Pachca: Update User
```

**Настройки нод:**

1. **Code** (определение тегов):
```javascript
const department = $input.first().json.department;
let tags = [];

switch(department) {
  case 'Разработка':
    tags = ['Backend', 'Frontend', 'DevOps'];
    break;
  case 'Маркетинг':
    tags = ['Marketing', 'Content', 'SEO'];
    break;
  case 'Продажи':
    tags = ['Sales', 'CRM', 'Lead'];
    break;
  default:
    tags = ['General'];
}

return [{
  json: {
    ...$input.first().json,
    listTags: tags.join(', ')
  }
}];
```

2. **Pachca: Update User**:
   - Resource: `user`
   - Operation: `update`
   - User ID: `{{ $json.userId }}`
   - List Tags: `{{ $json.listTags }}`

## 💬 Автоматизация чатов

### 5. Создание чата для нового проекта

**Описание**: Автоматически создает чат и добавляет участников при создании нового проекта.

**Триггер**: Webhook (создание проекта)

**Workflow:**
```
Webhook → Pachca: Create Chat → Pachca: Add Users to Chat → Pachca: Send Message
```

**Настройки нод:**

1. **Webhook** - получает данные:
```json
{
  "projectName": "Новый проект",
  "projectManager": 123,
  "developers": [456, 789],
  "designers": [321, 654]
}
```

2. **Pachca: Create Chat**:
   - Resource: `chat`
   - Operation: `create`
   - Chat Name: `{{ $json.projectName }}`
   - Channel: `true`
   - Public: `false`

3. **Pachca: Add Users to Chat**:
   - Resource: `chatMember`
   - Operation: `addUsers`
   - Chat ID: `{{ $('Pachca: Create Chat').item.json.data.id }}`
   - Member IDs: `{{ $json.projectManager }},{{ $json.developers.join(',') }},{{ $json.designers.join(',') }}`

4. **Pachca: Send Message**:
   - Resource: `message`
   - Operation: `send`
   - Chat ID: `{{ $('Pachca: Create Chat').item.json.data.id }}`
   - Content: `🚀 Проект "{{ $json.projectName }}" создан! Добро пожаловать в команду!`

### 6. Автоматическая архивация неактивных чатов

**Описание**: Архивирует чаты, в которых не было активности более 30 дней.

**Триггер**: Cron (еженедельно)

**Workflow:**
```
Cron → Pachca: Get All Chats → Code (фильтрация) → Pachca: Archive Chat
```

**Настройки нод:**

1. **Cron**:
   - Trigger Interval: `0 0 * * 1` (каждый понедельник)

2. **Pachca: Get All Chats**:
   - Resource: `chat`
   - Operation: `getAll`
   - Per Page: `100`

3. **Code** (фильтрация неактивных чатов):
```javascript
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const inactiveChats = $input.all().filter(item => {
  const lastActivity = new Date(item.json.last_activity_at);
  return lastActivity < thirtyDaysAgo && !item.json.archived;
});

return inactiveChats.map(chat => ({
  json: {
    chatId: chat.json.id,
    chatName: chat.json.name,
    lastActivity: chat.json.last_activity_at
  }
}));
```

4. **Pachca: Archive Chat**:
   - Resource: `chat`
   - Operation: `archive`
   - Chat ID: `{{ $json.chatId }}`

## 📁 Обработка файлов

### 7. Автоматическая загрузка файлов из email

**Описание**: Загружает вложения из email в Pachca и отправляет ссылку в чат.

**Триггер**: Email (новое письмо с вложениями)

**Workflow:**
```
Email → IF (есть вложения) → Pachca: Upload File → Pachca: Send Message
```

**Настройки нод:**

1. **Email**:
   - Trigger: `New Email`
   - Include Attachments: `true`

2. **IF** (проверка вложений):
   - Condition: `{{ $json.attachments.length }} > 0`

3. **Pachca: Upload File**:
   - Resource: `file`
   - Operation: `upload`
   - File Source: `binary`
   - Binary Property: `{{ $json.attachments[0].propertyName }}`

4. **Pachca: Send Message**:
   - Resource: `message`
   - Operation: `send`
   - Chat ID: `12345` (ID чата для файлов)
   - Content: `📎 Получен файл: {{ $json.attachments[0].filename }} от {{ $json.from }}`

### 8. Обработка документов из Google Drive

**Описание**: Мониторит папку в Google Drive и загружает новые документы в Pachca.

**Триггер**: Google Drive (новый файл)

**Workflow:**
```
Google Drive → IF (документ) → Pachca: Upload File → Pachca: Send Message
```

**Настройки нод:**

1. **Google Drive**:
   - Trigger: `File Uploaded`
   - Folder ID: `your_folder_id`

2. **IF** (проверка типа файла):
   - Condition: `{{ $json.mimeType }}` contains `document`

3. **Pachca: Upload File**:
   - Resource: `file`
   - Operation: `upload`
   - File Source: `binary`
   - Binary Property: `data`

4. **Pachca: Send Message**:
   - Resource: `message`
   - Operation: `send`
   - Chat ID: `12345`
   - Content: `📄 Новый документ: {{ $json.name }} загружен в Pachca`

## 🔗 Интеграции

### 9. Интеграция с Jira

**Описание**: Отправляет уведомления о новых задачах Jira в соответствующие чаты Pachca.

**Триггер**: Jira (новая задача)

**Workflow:**
```
Jira → Code (определение чата) → Pachca: Send Message
```

**Настройки нод:**

1. **Jira**:
   - Trigger: `Issue Created`

2. **Code** (определение чата по проекту):
```javascript
const project = $input.first().json.fields.project.key;
let chatId;

switch(project) {
  case 'DEV':
    chatId = 11111; // ID чата разработчиков
    break;
  case 'DESIGN':
    chatId = 22222; // ID чата дизайнеров
    break;
  case 'MARKETING':
    chatId = 33333; // ID чата маркетинга
    break;
  default:
    chatId = 44444; // ID общего чата
}

return [{
  json: {
    ...$input.first().json,
    chatId: chatId
  }
}];
```

3. **Pachca: Send Message**:
   - Resource: `message`
   - Operation: `send`
   - Chat ID: `{{ $json.chatId }}`
   - Content: `🎯 Новая задача: {{ $json.fields.summary }}
   Проект: {{ $json.fields.project.name }}
   Приоритет: {{ $json.fields.priority.name }}
   Исполнитель: {{ $json.fields.assignee?.displayName || 'Не назначен' }}
   
   Ссылка: {{ $json.self }}`

### 10. Интеграция с GitHub

**Описание**: Уведомляет команду о новых Pull Request в соответствующие чаты.

**Триггер**: GitHub (новый Pull Request)

**Workflow:**
```
GitHub → Code (анализ изменений) → Pachca: Send Message
```

**Настройки нод:**

1. **GitHub**:
   - Trigger: `Pull Request Opened`

2. **Code** (анализ изменений):
```javascript
const pr = $input.first().json;
const changedFiles = pr.changed_files || [];
const additions = pr.additions || 0;
const deletions = pr.deletions || 0;

// Определяем тип изменений
let changeType = 'Общие изменения';
if (changedFiles.some(f => f.includes('.js') || f.includes('.ts'))) {
  changeType = 'Frontend изменения';
} else if (changedFiles.some(f => f.includes('.py') || f.includes('.java'))) {
  changeType = 'Backend изменения';
} else if (changedFiles.some(f => f.includes('.css') || f.includes('.scss'))) {
  changeType = 'Стили';
}

// Определяем чат
let chatId = 55555; // Общий чат по умолчанию
if (changeType.includes('Frontend')) chatId = 66666;
if (changeType.includes('Backend')) chatId = 77777;

return [{
  json: {
    ...pr,
    changeType: changeType,
    chatId: chatId,
    stats: `+${additions} -${deletions}`
  }
}];
```

3. **Pachca: Send Message**:
   - Resource: `message`
   - Operation: `send`
   - Chat ID: `{{ $json.chatId }}`
   - Content: `🔀 Новый Pull Request: {{ $json.title }}
   Автор: {{ $json.user.login }}
   Репозиторий: {{ $json.head.repo.full_name }}
   Тип изменений: {{ $json.changeType }}
   Статистика: {{ $json.stats }}
   
   {{ $json.html_url }}`

## 🛠️ Полезные советы

### Использование выражений n8n

- `{{ $json.field }}` - доступ к полю из текущего элемента
- `{{ $('Node Name').item.json.field }}` - доступ к полю из другой ноды
- `{{ $json.array[0].field }}` - доступ к элементу массива
- `{{ $json.field || 'default' }}` - значение по умолчанию

### Обработка ошибок

Добавляйте ноду **Error Trigger** для обработки ошибок:

```
Main Workflow → Error Trigger → Pachca: Send Message (уведомление об ошибке)
```

### Оптимизация производительности

- Используйте пагинацию для больших списков
- Кэшируйте часто используемые данные
- Группируйте похожие операции

### Безопасность

- Храните токены доступа в credentials
- Используйте переменные окружения для конфиденциальных данных
- Ограничивайте права доступа токенов

---

**Создавайте свои workflow на основе этих примеров и адаптируйте их под ваши потребности!** 🚀
