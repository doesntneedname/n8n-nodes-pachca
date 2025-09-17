import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';

// Шаблоны форм для Pachca
const FORM_TEMPLATES: { [key: string]: any } = {
	'timeoff_request': {
		title: 'Уведомление об отпуске',
		close_text: 'Закрыть',
		submit_text: 'Отправить заявку',
		blocks: [
			{
				type: 'plain_text',
				text: 'Заполните форму для подачи заявки на отпуск. После отправки формы в общий чат будет отправлено уведомление.'
			},
			{
				type: 'header',
				text: 'Основная информация'
			},
			{
				type: 'date',
				name: 'date_start',
				label: 'Дата начала отпуска',
				required: true,
				hint: 'Выберите дату начала отпуска'
			},
			{
				type: 'date',
				name: 'date_end',
				label: 'Дата окончания отпуска',
				required: true,
				hint: 'Выберите дату окончания отпуска'
			},
			{
				type: 'input',
				name: 'reason',
				label: 'Причина отпуска',
				placeholder: 'Опишите причину отпуска',
				multiline: true,
				hint: 'Необязательное поле для дополнительной информации'
			},
			{
				type: 'divider'
			},
			{
				type: 'header',
				text: 'Доступность'
			},
			{
				type: 'radio',
				name: 'accessibility',
				label: 'Доступность во время отпуска',
				options: [
					{
						text: 'Полностью недоступен',
						value: 'unavailable',
						description: 'Не буду отвечать на сообщения и звонки',
						checked: true
					},
					{
						text: 'Только телефон',
						value: 'phone_only',
						description: 'Буду отвечать только на срочные звонки'
					},
					{
						text: 'Телефон и ноутбук',
						value: 'phone_laptop',
						description: 'Буду доступен для важных вопросов'
					}
				],
				required: true
			}
		]
	},
	'feedback_form': {
		title: 'Обратная связь',
		close_text: 'Отмена',
		submit_text: 'Отправить отзыв',
		blocks: [
			{
				type: 'plain_text',
				text: 'Поделитесь своим мнением о работе команды или проекте. Ваш отзыв поможет нам стать лучше.'
			},
			{
				type: 'header',
				text: 'Оценка'
			},
			{
				type: 'select',
				name: 'rating',
				label: 'Общая оценка',
				options: [
					{ text: '⭐ Отлично (5)', value: '5' },
					{ text: '👍 Хорошо (4)', value: '4' },
					{ text: '😐 Нормально (3)', value: '3' },
					{ text: '👎 Плохо (2)', value: '2' },
					{ text: '💩 Ужасно (1)', value: '1' }
				],
				required: true,
				hint: 'Выберите оценку от 1 до 5'
			},
			{
				type: 'divider'
			},
			{
				type: 'header',
				text: 'Комментарии'
			},
			{
				type: 'input',
				name: 'comment',
				label: 'Ваш отзыв',
				placeholder: 'Опишите, что понравилось или что можно улучшить',
				multiline: true,
				required: true,
				hint: 'Чем подробнее, тем лучше для нас'
			},
			{
				type: 'checkbox',
				name: 'categories',
				label: 'Категории отзыва',
				options: [
					{
						text: 'Работа команды',
						value: 'team_work',
						description: 'Взаимодействие в команде'
					},
					{
						text: 'Процессы',
						value: 'processes',
						description: 'Организация рабочих процессов'
					},
					{
						text: 'Инструменты',
						value: 'tools',
						description: 'Используемые инструменты и технологии'
					},
					{
						text: 'Коммуникация',
						value: 'communication',
						description: 'Качество общения и информирования'
					}
				]
			}
		]
	},
	'task_request': {
		title: 'Запрос задачи',
		close_text: 'Отмена',
		submit_text: 'Создать задачу',
		blocks: [
			{
				type: 'plain_text',
				text: 'Создайте новую задачу для команды. Укажите все необходимые детали для эффективной работы.'
			},
			{
				type: 'header',
				text: 'Описание задачи'
			},
			{
				type: 'input',
				name: 'title',
				label: 'Название задачи',
				placeholder: 'Краткое описание задачи',
				required: true,
				max_length: 100,
				hint: 'Максимум 100 символов'
			},
			{
				type: 'input',
				name: 'description',
				label: 'Подробное описание',
				placeholder: 'Опишите задачу подробно',
				multiline: true,
				required: true,
				hint: 'Включите все важные детали и требования'
			},
			{
				type: 'divider'
			},
			{
				type: 'header',
				text: 'Приоритет и сроки'
			},
			{
				type: 'select',
				name: 'priority',
				label: 'Приоритет',
				options: [
					{ text: '🔥 Критический', value: 'critical' },
					{ text: '⚡ Высокий', value: 'high' },
					{ text: '📋 Обычный', value: 'normal', selected: true },
					{ text: '📌 Низкий', value: 'low' }
				],
				required: true
			},
			{
				type: 'date',
				name: 'due_date',
				label: 'Срок выполнения',
				hint: 'Когда должна быть выполнена задача'
			},
			{
				type: 'divider'
			},
			{
				type: 'header',
				text: 'Исполнители'
			},
			{
				type: 'input',
				name: 'assignee_emails',
				label: 'Email исполнителей',
				placeholder: 'user1@company.com, user2@company.com',
				hint: 'Укажите email исполнителей через запятую'
			},
			{
				type: 'select',
				name: 'team',
				label: 'Команда',
				options: [
					{ text: 'Frontend', value: 'frontend' },
					{ text: 'Backend', value: 'backend' },
					{ text: 'Design', value: 'design' },
					{ text: 'QA', value: 'qa' },
					{ text: 'DevOps', value: 'devops' },
					{ text: 'Product', value: 'product' }
				]
			}
		]
	},
	'survey_form': {
		title: 'Опрос сотрудников',
		close_text: 'Отмена',
		submit_text: 'Отправить ответы',
		blocks: [
			{
				type: 'header',
				text: 'Анкета обратной связи'
			},
			{
				type: 'plain_text',
				text: 'Пожалуйста, честно ответьте на вопросы. Ваши ответы помогут улучшить работу компании.'
			},
			{
				type: 'radio',
				name: 'satisfaction',
				label: 'Насколько вы довольны работой в компании?',
				options: [
					{ text: 'Очень доволен', value: 'very_satisfied' },
					{ text: 'Доволен', value: 'satisfied' },
					{ text: 'Нейтрально', value: 'neutral' },
					{ text: 'Не доволен', value: 'dissatisfied' },
					{ text: 'Очень не доволен', value: 'very_dissatisfied' }
				],
				required: true
			},
			{
				type: 'checkbox',
				name: 'improvements',
				label: 'Что бы вы хотели улучшить?',
				options: [
					{ text: 'Зарплата', value: 'salary' },
					{ text: 'Рабочие условия', value: 'work_conditions' },
					{ text: 'Команда', value: 'team' },
					{ text: 'Проекты', value: 'projects' },
					{ text: 'Обучение', value: 'training' },
					{ text: 'Карьерный рост', value: 'career_growth' }
				]
			},
			{
				type: 'input',
				name: 'suggestions',
				label: 'Ваши предложения',
				placeholder: 'Поделитесь идеями по улучшению',
				multiline: true
			}
		]
	},
	'access_request': {
		title: 'Запрос доступа',
		close_text: 'Отмена',
		submit_text: 'Отправить запрос',
		blocks: [
			{
				type: 'header',
				text: 'Запрос доступа к ресурсам'
			},
			{
				type: 'input',
				name: 'employee_name',
				label: 'ФИО сотрудника',
				placeholder: 'Иванов Иван Иванович',
				required: true
			},
			{
				type: 'input',
				name: 'department',
				label: 'Отдел',
				placeholder: 'IT отдел',
				required: true
			},
			{
				type: 'checkbox',
				name: 'access_types',
				label: 'Тип доступа',
				options: [
					{ text: 'Корпоративная почта', value: 'email' },
					{ text: 'Внутренние системы', value: 'internal_systems' },
					{ text: 'База данных', value: 'database' },
					{ text: 'Файловый сервер', value: 'file_server' },
					{ text: 'VPN доступ', value: 'vpn' },
					{ text: 'Административные права', value: 'admin_rights' }
				],
				required: true
			},
			{
				type: 'date',
				name: 'access_start',
				label: 'Дата начала доступа',
				required: true
			},
			{
				type: 'date',
				name: 'access_end',
				label: 'Дата окончания доступа'
			},
			{
				type: 'input',
				name: 'justification',
				label: 'Обоснование',
				placeholder: 'Объясните необходимость предоставления доступа',
				multiline: true,
				required: true
			},
			{
				type: 'file_input',
				name: 'approval_doc',
				label: 'Документ-основание',
				filetypes: ['pdf', 'doc', 'docx'],
				max_files: 1,
				hint: 'Загрузите документ, подтверждающий необходимость доступа'
			}
		]
	}
};

// Правила валидации для форм
const FORM_VALIDATION_RULES: { [key: string]: any } = {
	timeoff_request: {
		date_end: (value: string, formData: any) => {
			if (new Date(value) <= new Date(formData.date_start)) {
				return 'Дата окончания должна быть позже даты начала отпуска';
			}
			return null;
		}
	},
	feedback_form: {
		comment: (value: string) => {
			if (value && value.length < 10) {
				return 'Комментарий должен содержать минимум 10 символов';
			}
			return null;
		}
	},
	custom_form: {
		text: (value: string) => {
			if (!value || value.trim().length === 0) {
				return 'Поле текста не может быть пустым';
			}
			return null;
		}
	},
	task_request: {
		title: (value: string) => {
			if (value && value.length < 5) {
				return 'Название задачи должно содержать минимум 5 символов';
			}
			return null;
		},
		description: (value: string) => {
			if (value && value.length < 20) {
				return 'Описание должно содержать минимум 20 символов';
			}
			return null;
		}
	}
};

export class Pachca implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Pachca',
		name: 'pachca',
		icon: 'file:Pachca_white_mark.png',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Интеграция с мессенджером Пачка',
		defaults: {
			name: 'Pachca',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'pachcaApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.baseUrl}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Message',
						value: 'message',
					},
					{
						name: 'Thread',
						value: 'thread',
					},
					{
						name: 'Reactions',
						value: 'reactions',
					},
					{
						name: 'Chat',
						value: 'chat',
					},
					{
						name: 'User',
						value: 'user',
					},
					{
						name: 'Group Tag',
						value: 'groupTag',
					},
					{
						name: 'Status',
						value: 'status',
					},
					{
						name: 'Custom Fields',
						value: 'customFields',
					},
					{
						name: 'Task',
						value: 'task',
					},
					{
						name: 'Bot',
						value: 'bot',
					},
					{
						name: 'File',
						value: 'file',
					},
					{
						name: 'Form',
						value: 'form',
					},
				],
				default: 'message',
			},
			// User operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['user'],
					},
				},
				options: [
					{
						name: 'Get all users',
						value: 'getAll',
						action: 'Get all users',
						description: 'Получить список всех пользователей',
					},
					{
						name: 'Get a user',
						value: 'getById',
						action: 'Get a user',
						description: 'Получить пользователя по ID',
					},
					{
						name: 'Create a user',
						value: 'create',
						action: 'Create a user',
						description: 'Создать нового пользователя (только для Admin/Owner токенов)',
					},
					{
						name: 'Update a user',
						value: 'update',
						action: 'Update a user',
						description: 'Обновить пользователя (только для Admin/Owner токенов)',
					},
					{
						name: 'Delete a user',
						value: 'delete',
						action: 'Delete a user',
						description: 'Удалить пользователя (только для Admin/Owner токенов)',
					},
				],
				default: 'getAll',
			},
			// Message operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['message'],
					},
				},
				options: [
					{
						name: 'Send a message',
						value: 'send',
						action: 'Send a message',
						description: 'Отправить сообщение',
					},
					{
						name: 'Get a message',
						value: 'getById',
						action: 'Get a message',
						description: 'Получить сообщение по ID',
					},
					{
						name: 'Get messages from a chat',
						value: 'getAll',
						action: 'Get messages from a chat',
						description: 'Получить сообщения чата',
					},
					{
						name: 'Update a message',
						value: 'update',
						action: 'Update a message',
						description: 'Редактировать сообщение',
					},
					{
						name: 'Delete a message',
						value: 'delete',
						action: 'Delete a message',
						description: 'Удалить сообщение (только для Admin/Owner токенов)',
					},
					{
						name: 'Pin a message',
						value: 'pin',
						action: 'Pin a message',
						description: 'Закрепить сообщение',
					},
					{
						name: 'Unpin a message',
						value: 'unpin',
						action: 'Unpin a message',
						description: 'Открепить сообщение',
					},
					{
						name: 'Get message readers',
						value: 'getReadMembers',
						action: 'Get message readers',
						description: 'Получить список прочитавших сообщение',
					},
					{
						name: 'Unfurl message links',
						value: 'unfurl',
						action: 'Unfurl message links',
						description: 'Создать предпросмотры ссылок в сообщении (unfurl)',
					},
				],
				default: 'send',
			},
			// Chat operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['chat'],
					},
				},
				options: [
					{
						name: 'Get all chats',
						value: 'getAll',
						action: 'Get all chats',
						description: 'Получить список всех чатов',
					},
					{
						name: 'Get a chat',
						value: 'getById',
						action: 'Get a chat',
						description: 'Получить чат по ID',
					},
					{
						name: 'Create a chat',
						value: 'create',
						action: 'Create a chat',
						description: 'Создать новый чат',
					},
					{
						name: 'Update a chat',
						value: 'update',
						action: 'Update a chat',
						description: 'Обновить чат',
					},
					{
						name: 'Archive a chat',
						value: 'archive',
						action: 'Archive a chat',
						description: 'Архивировать чат',
					},
					{
						name: 'Unarchive a chat',
						value: 'unarchive',
						action: 'Unarchive a chat',
						description: 'Разархивировать чат',
					},
					{
						name: 'Get chat members',
						value: 'getMembers',
						action: 'Get chat members',
						description: 'Получить список участников чата',
					},
					{
						name: 'Add users to chat',
						value: 'addUsers',
						action: 'Add users to chat',
						description: 'Добавить пользователей в чат',
					},
					{
						name: 'Remove user from chat',
						value: 'removeUser',
						action: 'Remove user from chat',
						description: 'Исключить пользователя из чата',
					},
					{
						name: 'Update user role in chat',
						value: 'updateRole',
						action: 'Update user role in chat',
						description: 'Изменить роль пользователя в чате',
					},
					{
						name: 'Leave a chat',
						value: 'leaveChat',
						action: 'Leave a chat',
						description: 'Выйти из чата',
					},
				],
				default: 'getAll',
			},
			// Group Tag operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['groupTag'],
					},
				},
				options: [
					{
						name: 'Get all group tags',
						value: 'getAll',
						action: 'Get all group tags',
						description: 'Получить список всех групповых тегов',
					},
					{
						name: 'Get a group tag',
						value: 'getById',
						action: 'Get a group tag',
						description: 'Получить групповой тег по ID',
					},
					{
						name: 'Create a group tag',
						value: 'create',
						action: 'Create a group tag',
						description: 'Создать новый групповой тег',
					},
					{
						name: 'Update a group tag',
						value: 'update',
						action: 'Update a group tag',
						description: 'Обновить групповой тег',
					},
					{
						name: 'Delete a group tag',
						value: 'delete',
						action: 'Delete a group tag',
						description: 'Удалить групповой тег',
					},
					{
						name: 'Get users in group tag',
						value: 'getUsers',
						action: 'Get users in group tag',
						description: 'Получить пользователей в групповом теге',
					},
					{
						name: 'Add tags to chat',
						value: 'addTags',
						action: 'Add tags to chat',
						description: 'Добавить теги в чат',
					},
					{
						name: 'Remove tag from chat',
						value: 'removeTag',
						action: 'Remove tag from chat',
						description: 'Исключить тег из чата',
					},
				],
				default: 'getAll',
			},
			// File operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['file'],
					},
				},
				options: [
					{
						name: 'Upload a file',
						value: 'upload',
						action: 'Upload a file',
						description: 'Загрузить файл (полный флоу: получение параметров + загрузка)',
					},
				],
				default: 'upload',
			},
			// Custom Fields operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['customFields'],
					},
				},
				options: [
					{
						name: 'Get custom properties',
						value: 'getCustomProperties',
						action: 'Get custom properties',
						description: 'Получить список дополнительных полей для сущности',
					},
				],
				default: 'getCustomProperties',
			},
			// Task operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['task'],
					},
				},
				options: [
					{
						name: 'Create a task',
						value: 'create',
						action: 'Create a task',
						description: 'Создать новое напоминание',
					},
				],
				default: 'create',
			},
			// Bot operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['bot'],
					},
				},
				options: [
					{
						name: 'Update a bot',
						value: 'update',
						action: 'Update a bot',
						description: 'Редактировать настройки бота',
					},
				],
				default: 'update',
			},
			// Status operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['status'],
					},
				},
				options: [
					{
						name: 'Get my profile',
						value: 'getProfile',
						action: 'Get my profile',
						description: 'Получить информацию о своем профиле',
					},
					{
						name: 'Get my status',
						value: 'getStatus',
						action: 'Get my status',
						description: 'Получить информацию о своем статусе',
					},
					{
						name: 'Set my status',
						value: 'updateStatus',
						action: 'Set my status',
						description: 'Установить новый статус',
					},
					{
						name: 'Clear my status',
						value: 'deleteStatus',
						action: 'Clear my status',
						description: 'Удалить свой статус',
					},
				],
				default: 'getProfile',
			},
			// Reactions operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['reactions'],
					},
				},
				options: [
					{
						name: 'Add a reaction',
						value: 'addReaction',
						action: 'Add a reaction',
						description: 'Добавить реакцию на сообщение',
					},
					{
						name: 'Remove a reaction',
						value: 'deleteReaction',
						action: 'Remove a reaction',
						description: 'Удалить реакцию с сообщения',
					},
					{
						name: 'Get message reactions',
						value: 'getReactions',
						action: 'Get message reactions',
						description: 'Получить список реакций на сообщение',
					},
				],
				default: 'addReaction',
			},
			// Thread operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['thread'],
					},
				},
				options: [
					{
						name: 'Create a thread',
						value: 'createThread',
						action: 'Create a thread',
						description: 'Создать тред к сообщению',
					},
					{
						name: 'Get a thread',
						value: 'getThread',
						action: 'Get a thread',
						description: 'Получить информацию о треде',
					},
				],
				default: 'createThread',
			},
			// Form operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['form'],
					},
				},
				options: [
					{
						name: 'Create a form',
						value: 'createView',
						action: 'Create a form',
						description: 'Создать и открыть модальное окно с формой',
					},
					{
						name: 'Process form submission',
						value: 'processSubmission',
						action: 'Process form submission',
						description: 'Обработать отправку формы и отправить ответ',
					},
					{
						name: 'Get form templates',
						value: 'getTemplates',
						action: 'Get form templates',
						description: 'Получить список доступных шаблонов форм',
					},
				],
				default: 'createView',
			},
			// Message parameters
			{
				displayName: 'Entity Type',
				name: 'entityType',
				type: 'options',
				options: [
					{
						name: 'Discussion',
						value: 'discussion',
						description: 'Беседа или канал',
					},
					{
						name: 'User',
						value: 'user',
						description: 'Личное сообщение пользователю',
					},
					{
						name: 'Thread',
						value: 'thread',
						description: 'Комментарий в треде',
					},
				],
				default: 'discussion',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send'],
					},
				},
				description: 'Тип сущности для отправки сообщения',
			},
			{
				displayName: 'Entity ID',
				name: 'entityId',
				type: 'number',
				default: '',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send'],
					},
				},
				description: 'ID чата, пользователя или треда',
			},
			{
				displayName: 'Content',
				name: 'content',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send', 'update'],
					},
				},
				description: 'Текст сообщения',
			},
			{
				displayName: 'Buttons',
				name: 'buttons',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: [],
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send'],
					}
				},
				options: [
					{
						name: 'buttonRow',
						displayName: 'Button Row',
						values: [
							{
								displayName: 'Button Text',
								name: 'text',
								type: 'string',
								default: '',
								description: 'Текст кнопки'
							},
							{
								displayName: 'Button Type',
								name: 'type',
								type: 'options',
								options: [
									{
										name: 'Data Button (for forms)',
										value: 'data'
									},
									{
										name: 'URL Button',
										value: 'url'
									}
								],
								default: 'data'
							},
							{
								displayName: 'Data Value',
								name: 'data',
								type: 'string',
								default: '',
								displayOptions: {
									show: {
										type: ['data']
									}
								},
								description: 'Значение для Data-кнопки (будет отправлено в вебхуке)'
							},
							{
								displayName: 'URL',
								name: 'url',
								type: 'string',
								default: '',
								displayOptions: {
									show: {
										type: ['url']
									}
								},
								description: 'URL для перехода'
							}
						]
					}
				],
				description: 'Кнопки для сообщения (Data-кнопки для форм, URL-кнопки для ссылок)'
			},
			{
				displayName: 'Message ID',
				name: 'messageId',
				type: 'number',
				default: '',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['getById', 'update', 'delete', 'pin', 'unpin', 'getReadMembers'],
					},
				},
				description: 'ID сообщения',
			},
			{
				displayName: 'Chat ID',
				name: 'chatId',
				type: 'number',
				default: '',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['getAll'],
					},
				},
				description: 'ID чата для получения сообщений',
			},
			{
				displayName: 'Per Page',
				name: 'per',
				type: 'number',
				default: 25,
				displayOptions: {
					show: {
						resource: ['message', 'user', 'chat', 'groupTag', 'customFields'],
						operation: ['getAll', 'getUsers'],
					},
				},
				description: 'Количество элементов на странице (максимум 50)',
			},
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				default: 1,
				displayOptions: {
					show: {
						resource: ['message', 'user', 'chat', 'groupTag', 'customFields'],
						operation: ['getAll', 'getUsers'],
					},
				},
				description: 'Номер страницы',
			},
			// User parameters
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['getById', 'update', 'delete'],
					},
				},
				default: 1,
				description: 'ID пользователя',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'Email пользователя',
			},
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'Имя пользователя',
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'Фамилия пользователя',
			},
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['getAll'],
					},
				},
				default: '',
				description: 'Поисковая фраза для фильтрации пользователей',
			},
			{
				displayName: 'Nickname',
				name: 'nickname',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'Имя пользователя (nickname)',
			},
			{
				displayName: 'Phone Number',
				name: 'phoneNumber',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'Номер телефона',
			},
			{
				displayName: 'Department',
				name: 'department',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'Департамент',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'Должность',
			},
			{
				displayName: 'Role',
				name: 'role',
				type: 'options',
				options: [
					{
						name: 'Admin',
						value: 'admin',
						description: 'Администратор',
					},
					{
						name: 'User',
						value: 'user',
						description: 'Сотрудник',
					},
					{
						name: 'Multi Guest',
						value: 'multi_guest',
						description: 'Мульти-гость',
					},
				],
				default: 'user',
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['create', 'update'],
					},
				},
				description: 'Уровень доступа',
			},
			{
				displayName: 'Suspended',
				name: 'suspended',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['update'],
					},
				},
				description: 'Деактивация пользователя',
			},
			{
				displayName: 'List Tags',
				name: 'listTags',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['create', 'update'],
					},
				},
				description: 'Теги пользователя (через запятую)',
			},
			{
				displayName: 'Custom Properties',
				name: 'customProperties',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['create', 'update'],
					},
				},
				options: [
					{
						name: 'property',
						displayName: 'Property',
						values: [
							{
								displayName: 'Field ID',
								name: 'id',
								type: 'number',
								default: 0,
								description: 'Идентификатор дополнительного поля',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Значение поля',
							},
						],
					},
				],
				description: 'Дополнительные поля пользователя',
			},
			// Chat parameters
			{
				displayName: 'Chat ID',
				name: 'chatId',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['chat'],
						operation: ['getById', 'update', 'archive', 'unarchive', 'getMembers', 'addUsers', 'removeUser', 'updateRole', 'leaveChat'],
					},
				},
				default: 1,
				description: 'ID чата',
			},
			{
				displayName: 'Chat Name',
				name: 'chatName',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['chat'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'Название чата',
			},
			{
				displayName: 'Channel',
				name: 'channel',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['chat'],
						operation: ['create'],
					},
				},
				description: 'Создать канал (true) или беседу (false)',
			},
			{
				displayName: 'Public',
				name: 'public',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['chat'],
						operation: ['create'],
					},
				},
				description: 'Открытый (true) или закрытый (false) доступ',
			},
			{
				displayName: 'Per Page',
				name: 'per',
				type: 'number',
				default: 25,
				displayOptions: {
					show: {
						resource: ['chat'],
						operation: ['getAll'],
					},
				},
				description: 'Количество элементов на странице (максимум 50)',
			},
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				default: 1,
				displayOptions: {
					show: {
						resource: ['chat'],
						operation: ['getAll'],
					},
				},
				description: 'Номер страницы',
			},
			// Chat Members parameters
			{
				displayName: 'Role',
				name: 'role',
				type: 'options',
				options: [
					{
						name: 'All',
						value: 'all',
						description: 'Любая роль',
					},
					{
						name: 'Owner',
						value: 'owner',
						description: 'Создатель',
					},
					{
						name: 'Admin',
						value: 'admin',
						description: 'Администратор',
					},
					{
						name: 'Editor',
						value: 'editor',
						description: 'Редактор',
					},
					{
						name: 'Member',
						value: 'member',
						description: 'Участник/подписчик',
					},
				],
				default: 'all',
				displayOptions: {
					show: {
						resource: ['chat'],
						operation: ['getMembers'],
					},
				},
				description: 'Роль в чате для фильтрации',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 50,
				displayOptions: {
					show: {
						resource: ['chat'],
						operation: ['getMembers'],
					},
				},
				description: 'Количество возвращаемых участников (максимум 50)',
			},
			{
				displayName: 'Cursor',
				name: 'cursor',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['chat'],
						operation: ['getMembers'],
					},
				},
				description: 'Курсор для пагинации (из meta.paginate.next_page)',
			},
			{
				displayName: 'Member IDs',
				name: 'memberIds',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['chat'],
						operation: ['addUsers'],
					},
				},
				description: 'Массив ID пользователей через запятую (например: 186,187)',
			},
			{
				displayName: 'Silent',
				name: 'silent',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['chat'],
						operation: ['addUsers'],
					},
				},
				description: 'Не создавать системное сообщение о добавлении участника',
			},
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'number',
				default: 1,
				displayOptions: {
					show: {
						resource: ['chat'],
						operation: ['removeUser', 'updateRole'],
					},
				},
				description: 'ID пользователя',
			},
			{
				displayName: 'New Role',
				name: 'newRole',
				type: 'options',
				options: [
					{
						name: 'Admin',
						value: 'admin',
						description: 'Администратор',
					},
					{
						name: 'Editor',
						value: 'editor',
						description: 'Редактор (только для каналов)',
					},
					{
						name: 'Member',
						value: 'member',
						description: 'Участник/подписчик',
					},
				],
				default: 'member',
				displayOptions: {
					show: {
						resource: ['chat'],
						operation: ['updateRole'],
					},
				},
				description: 'Новая роль пользователя',
			},
			// Group Tag parameters
			{
				displayName: 'Group Tag ID',
				name: 'groupTagId',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['groupTag'],
						operation: ['getById', 'update', 'delete', 'getUsers', 'removeTag'],
					},
				},
				default: 1,
				description: 'ID группового тега',
			},
			{
				displayName: 'Group Tag Name',
				name: 'groupTagName',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['groupTag'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'Название группового тега',
			},
			{
				displayName: 'Group Tag Color',
				name: 'groupTagColor',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['groupTag'],
						operation: ['create', 'update'],
					},
				},
				default: '#000000',
				description: 'Цвет группового тега (hex код)',
			},
			{
				displayName: 'Chat ID',
				name: 'groupTagChatId',
				type: 'number',
				default: 1,
				displayOptions: {
					show: {
						resource: ['groupTag'],
						operation: ['addTags', 'removeTag'],
					},
				},
				description: 'ID чата для работы с тегами',
			},
			{
				displayName: 'Group Tag IDs',
				name: 'groupTagIds',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['groupTag'],
						operation: ['addTags'],
					},
				},
				description: 'Массив ID тегов через запятую (например: 86,18)',
			},
			{
				displayName: 'Tag ID',
				name: 'tagId',
				type: 'number',
				default: 1,
				displayOptions: {
					show: {
						resource: ['groupTag'],
						operation: ['removeTag'],
					},
				},
				description: 'ID тега для исключения',
			},
			// File parameters
			{
				displayName: 'File Source',
				name: 'fileSource',
				type: 'options',
				options: [
					{
						name: 'URL',
						value: 'url',
						description: 'Скачать файл по URL',
					},
					{
						name: 'Binary Data',
						value: 'binary',
						description: 'Использовать бинарные данные из предыдущего узла',
					},
				],
				default: 'url',
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['upload'],
					},
				},
				description: 'Источник файла для загрузки',
			},
			{
				displayName: 'File URL',
				name: 'fileUrl',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['upload'],
						fileSource: ['url'],
					},
				},
				default: '',
				description: 'URL файла для скачивания и загрузки в Pachca',
			},
			{
				displayName: 'Binary Property',
				name: 'binaryProperty',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['upload'],
						fileSource: ['binary'],
					},
				},
				default: 'data',
				description: 'Имя свойства с бинарными данными из предыдущего узла',
			},
			{
				displayName: 'File Name',
				name: 'fileName',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['upload'],
					},
				},
				default: '',
				description: 'Имя файла (если не указано, будет взято из URL или бинарных данных)',
			},
			{
				displayName: 'Content Type',
				name: 'contentType',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['upload'],
					},
				},
				default: 'application/octet-stream',
				description: 'MIME тип файла (если не указан, будет определен автоматически)',
			},
			// Field parameters
			{
				displayName: 'Entity Type',
				name: 'entityType',
				type: 'options',
				options: [
					{
						name: 'User',
						value: 'User',
						description: 'Участник',
					},
					{
						name: 'Task',
						value: 'Task',
						description: 'Напоминание',
					},
				],
				default: 'User',
				displayOptions: {
					show: {
						resource: ['customFields'],
						operation: ['getCustomProperties'],
					},
				},
				description: 'Тип сущности для получения дополнительных полей',
			},
			// Task parameters
			{
				displayName: 'Task Kind',
				name: 'taskKind',
				type: 'options',
				options: [
					{
						name: 'Call',
						value: 'call',
						description: 'Позвонить контакту',
					},
					{
						name: 'Meeting',
						value: 'meeting',
						description: 'Встреча',
					},
					{
						name: 'Reminder',
						value: 'reminder',
						description: 'Простое напоминание',
					},
					{
						name: 'Event',
						value: 'event',
						description: 'Событие',
					},
					{
						name: 'Email',
						value: 'email',
						description: 'Написать письмо',
					},
				],
				default: 'reminder',
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['create'],
					},
				},
				description: 'Тип напоминания',
			},
			{
				displayName: 'Content',
				name: 'taskContent',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '',
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['create'],
					},
				},
				description: 'Описание напоминания (если не указано, будет использовано название типа)',
			},
			{
				displayName: 'Due At',
				name: 'taskDueAt',
				type: 'dateTime',
				default: '',
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['create'],
					},
				},
				description: 'Срок выполнения напоминания (ISO-8601 формат)',
			},
			{
				displayName: 'Priority',
				name: 'taskPriority',
				type: 'options',
				options: [
					{
						name: 'Normal',
						value: 1,
						description: 'Обычный приоритет',
					},
					{
						name: 'Important',
						value: 2,
						description: 'Важно',
					},
					{
						name: 'Very Important',
						value: 3,
						description: 'Очень важно',
					},
				],
				default: 1,
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['create'],
					},
				},
				description: 'Приоритет напоминания',
			},
			{
				displayName: 'Performer IDs',
				name: 'performerIds',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['create'],
					},
				},
				description: 'ID ответственных пользователей через запятую (если не указано, ответственным назначаетесь вы)',
			},
			{
				displayName: 'Custom Properties',
				name: 'customProperties',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: [],
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['create'],
					},
				},
				options: [
					{
						name: 'property',
						displayName: 'Property',
						values: [
							{
								displayName: 'Field ID',
								name: 'id',
								type: 'number',
								default: 0,
								description: 'ID дополнительного поля',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Значение поля',
							},
						],
					},
				],
				description: 'Дополнительные поля напоминания',
			},
			// Bot parameters
			{
				displayName: 'Bot ID',
				name: 'botId',
				type: 'number',
				default: 1,
				displayOptions: {
					show: {
						resource: ['bot'],
						operation: ['update'],
					},
				},
				description: 'ID бота для редактирования',
			},
			{
				displayName: 'Webhook URL',
				name: 'webhookUrl',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['bot'],
						operation: ['update'],
					},
				},
				description: 'URL исходящего вебхука',
			},
			{
				displayName: 'Per Page',
				name: 'readMembersPer',
				type: 'number',
				default: 300,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['getReadMembers'],
					},
				},
				description: 'Количество возвращаемых пользователей (максимум 300)',
			},
			{
				displayName: 'Page',
				name: 'readMembersPage',
				type: 'number',
				default: 1,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['getReadMembers'],
					},
				},
				description: 'Страница выборки прочитавших',
			},
			// Link Preview parameters
			{
				displayName: 'Message ID',
				name: 'messageId',
				type: 'number',
				default: '',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['unfurl'],
					},
				},
				description: 'ID сообщения для создания предпросмотров ссылок (unfurl)',
			},
			{
				displayName: 'Link Previews',
				name: 'linkPreviews',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['unfurl'],
					},
				},
				options: [
					{
						name: 'preview',
						displayName: 'Preview',
						values: [
							{
								displayName: 'URL',
								name: 'url',
								type: 'string',
								default: '',
								description: 'URL ссылки для создания предпросмотра (unfurl)',
								required: true,
							},
							{
								displayName: 'Title',
								name: 'title',
								type: 'string',
								default: '',
								description: 'Заголовок предпросмотра ссылки',
								required: true,
							},
							{
								displayName: 'Description',
								name: 'description',
								type: 'string',
								default: '',
								description: 'Описание предпросмотра ссылки',
								required: true,
							},
							{
								displayName: 'Image URL',
								name: 'imageUrl',
								type: 'string',
								default: '',
								description: 'Публичная ссылка на изображение (если не указан файл, то используется эта ссылка)',
							},
							{
								displayName: 'Binary Property',
								name: 'image',
								type: 'string',
								default: '',
								description: 'Бинарное свойство с изображением (имеет приоритет над Image URL)',
							},
						],
					},
				],
				description: 'Предпросмотры ссылок для создания (unfurl). Каждый URL должен быть из сообщения, для которого создается предпросмотр.',
			},
			// Profile parameters
			{
				displayName: 'Status Emoji',
				name: 'statusEmoji',
				type: 'string',
				default: '🎮',
				displayOptions: {
					show: {
						resource: ['status'],
						operation: ['updateStatus'],
					},
				},
				description: 'Emoji символ статуса',
			},
			{
				displayName: 'Status Title',
				name: 'statusTitle',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['status'],
						operation: ['updateStatus'],
					},
				},
				description: 'Текст статуса',
			},
			{
				displayName: 'Status Expires At',
				name: 'statusExpiresAt',
				type: 'dateTime',
				default: '',
				displayOptions: {
					show: {
						resource: ['status'],
						operation: ['updateStatus'],
					},
				},
				description: 'Срок жизни статуса (опционально)',
			},
			// Reactions parameters
			{
				displayName: 'Message ID',
				name: 'reactionsMessageId',
				type: 'number',
				default: '',
				displayOptions: {
					show: {
						resource: ['reactions'],
						operation: ['addReaction', 'deleteReaction', 'getReactions'],
					},
				},
				description: 'ID сообщения',
			},
			{
				displayName: 'Reaction Code',
				name: 'reactionsReactionCode',
				type: 'string',
				default: '👍',
				displayOptions: {
					show: {
						resource: ['reactions'],
						operation: ['addReaction', 'deleteReaction'],
					},
				},
				description: 'Emoji символ реакции (например: 👍, 🔥, ⭐)',
			},
			{
				displayName: 'Per Page',
				name: 'reactionsPer',
				type: 'number',
				default: 50,
				displayOptions: {
					show: {
						resource: ['reactions'],
						operation: ['getReactions'],
					},
				},
				description: 'Количество возвращаемых реакций (максимум 50)',
			},
			{
				displayName: 'Page',
				name: 'reactionsPage',
				type: 'number',
				default: 1,
				displayOptions: {
					show: {
						resource: ['reactions'],
						operation: ['getReactions'],
					},
				},
				description: 'Страница выборки реакций',
			},
			// Thread parameters
			{
				displayName: 'Message ID',
				name: 'threadMessageId',
				type: 'number',
				default: '',
				displayOptions: {
					show: {
						resource: ['thread'],
						operation: ['createThread'],
					},
				},
				description: 'ID сообщения для создания треда',
			},
			{
				displayName: 'Thread ID',
				name: 'threadThreadId',
				type: 'number',
				default: '',
				displayOptions: {
					show: {
						resource: ['thread'],
						operation: ['getThread'],
					},
				},
				description: 'ID треда для получения информации',
			},
			// Form parameters
			{
				displayName: 'Form Builder Mode',
				name: 'formBuilderMode',
				type: 'options',
				options: [
					{
						name: '📋 Use Template',
						value: 'template',
						description: 'Использовать готовый шаблон'
					},
					{
						name: '🎨 Visual Builder',
						value: 'builder',
						description: 'Визуальный конструктор форм'
					},
					{
						name: '🔧 Raw JSON',
						value: 'json',
						description: 'Редактировать JSON напрямую'
					}
				],
				default: 'template',
				displayOptions: {
					show: {
						resource: ['form'],
						operation: ['createView']
					}
				},
				description: 'Выберите способ создания формы'
			},
			{
				displayName: 'Form Template',
				name: 'formTemplate',
				type: 'options',
				options: [
					{
						name: '📋 Timeoff Request',
						value: 'timeoff_request',
						description: 'Форма заявки на отпуск'
					},
					{
						name: '💬 Feedback Form',
						value: 'feedback_form',
						description: 'Форма обратной связи'
					},
					{
						name: '📝 Task Request',
						value: 'task_request',
						description: 'Форма создания задачи'
					},
					{
						name: '📊 Survey Form',
						value: 'survey_form',
						description: 'Форма опроса'
					},
					{
						name: '🔐 Access Request',
						value: 'access_request',
						description: 'Форма запроса доступа'
					}
				],
				default: 'timeoff_request',
				displayOptions: {
					show: {
						resource: ['form'],
						operation: ['createView'],
						formBuilderMode: ['template']
					}
				},
				description: 'Выберите готовый шаблон формы'
			},
			// Настройки формы для визуального конструктора
			{
				displayName: 'Form Title',
				name: 'formTitle',
				type: 'string',
				default: 'Моя форма',
				displayOptions: {
					show: {
						resource: ['form'],
						operation: ['createView'],
						formBuilderMode: ['builder']
					}
				},
				description: 'Заголовок формы (максимум 24 символа)'
			},
			{
				displayName: 'Close Button Text',
				name: 'closeText',
				type: 'string',
				default: 'Отмена',
				displayOptions: {
					show: {
						resource: ['form'],
						operation: ['createView'],
						formBuilderMode: ['builder']
					}
				},
				description: 'Текст кнопки закрытия (максимум 24 символа)'
			},
			{
				displayName: 'Submit Button Text',
				name: 'submitText',
				type: 'string',
				default: 'Отправить',
				displayOptions: {
					show: {
						resource: ['form'],
						operation: ['createView'],
						formBuilderMode: ['builder']
					}
				},
				description: 'Текст кнопки отправки (максимум 24 символа)'
			},
			{
				displayName: 'Form Blocks',
				name: 'formBlocks',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					sortable: true
				},
				default: [],
				displayOptions: {
					show: {
						resource: ['form'],
						operation: ['createView'],
						formBuilderMode: ['builder']
					}
				},
				options: [
					{
						name: 'block',
						displayName: 'Block',
						values: [
							{
								displayName: 'Block Type',
								name: 'type',
								type: 'options',
								options: [
									{ name: '📝 Header', value: 'header', description: 'Заголовок секции' },
									{ name: '📄 Plain Text', value: 'plain_text', description: 'Обычный текст' },
									{ name: '📝 Markdown Text', value: 'markdown', description: 'Форматированный текст' },
									{ name: '➖ Divider', value: 'divider', description: 'Разделитель' },
									{ name: '📝 Text Input', value: 'input', description: 'Поле ввода текста' },
									{ name: '📋 Select Dropdown', value: 'select', description: 'Выпадающий список' },
									{ name: '🔘 Radio Buttons', value: 'radio', description: 'Радиокнопки' },
									{ name: '☑️ Checkboxes', value: 'checkbox', description: 'Чекбоксы' },
									{ name: '📅 Date Picker', value: 'date', description: 'Выбор даты' },
									{ name: '🕐 Time Picker', value: 'time', description: 'Выбор времени' },
									{ name: '📎 File Upload', value: 'file_input', description: 'Загрузка файлов' }
								],
								default: 'header'
							},
							// Общие параметры для всех блоков
							{
								displayName: 'Text Content',
								name: 'text',
								type: 'string',
								default: '',
								displayOptions: {
									show: {
										type: ['header', 'plain_text', 'markdown']
									}
								},
								description: 'Текст для отображения'
							},
							// Параметры для полей ввода
							{
								displayName: 'Field Name',
								name: 'name',
								type: 'string',
								default: '',
								displayOptions: {
									show: {
										type: ['input', 'select', 'radio', 'checkbox', 'date', 'time', 'file_input']
									}
								},
								description: 'Имя поля (будет передано в вебхуке)'
							},
							{
								displayName: 'Field Label',
								name: 'label',
								type: 'string',
								default: '',
								displayOptions: {
									show: {
										type: ['input', 'select', 'radio', 'checkbox', 'date', 'time', 'file_input']
									}
								},
								description: 'Подпись к полю'
							},
							{
								displayName: 'Required',
								name: 'required',
								type: 'boolean',
								default: false,
								displayOptions: {
									show: {
										type: ['input', 'select', 'radio', 'checkbox', 'date', 'time', 'file_input']
									}
								},
								description: 'Обязательное поле'
							},
							{
								displayName: 'Hint',
								name: 'hint',
								type: 'string',
								default: '',
								displayOptions: {
									show: {
										type: ['input', 'select', 'radio', 'checkbox', 'date', 'time', 'file_input']
									}
								},
								description: 'Подсказка под полем'
							},
							// Специфичные параметры для input
							{
								displayName: 'Placeholder',
								name: 'placeholder',
								type: 'string',
								default: '',
								displayOptions: {
									show: {
										type: ['input']
									}
								},
								description: 'Подсказка внутри поля'
							},
							{
								displayName: 'Multiline',
								name: 'multiline',
								type: 'boolean',
								default: false,
								displayOptions: {
									show: {
										type: ['input']
									}
								},
								description: 'Многострочное поле'
							},
							{
								displayName: 'Initial Value',
								name: 'initial_value',
								type: 'string',
								default: '',
								displayOptions: {
									show: {
										type: ['input']
									}
								},
								description: 'Начальное значение'
							},
							{
								displayName: 'Min Length',
								name: 'min_length',
								type: 'number',
								default: 0,
								displayOptions: {
									show: {
										type: ['input']
									}
								},
								description: 'Минимальная длина текста'
							},
							{
								displayName: 'Max Length',
								name: 'max_length',
								type: 'number',
								default: 3000,
								displayOptions: {
									show: {
										type: ['input']
									}
								},
								description: 'Максимальная длина текста'
							},
							// Параметры для select, radio, checkbox
							{
								displayName: 'Options',
								name: 'options',
								type: 'fixedCollection',
								typeOptions: {
									multipleValues: true
								},
								default: [],
								displayOptions: {
									show: {
										type: ['select', 'radio', 'checkbox']
									}
								},
								options: [
									{
										name: 'option',
										displayName: 'Option',
										values: [
											{
												displayName: 'Text',
												name: 'text',
												type: 'string',
												default: '',
												description: 'Отображаемый текст'
											},
											{
												displayName: 'Value',
												name: 'value',
												type: 'string',
												default: '',
												description: 'Значение для отправки'
											},
											{
												displayName: 'Description',
												name: 'description',
												type: 'string',
												default: '',
												description: 'Описание опции (для radio/checkbox)'
											},
											{
												displayName: 'Selected',
												name: 'selected',
												type: 'boolean',
												default: false,
												description: 'Выбрано по умолчанию (для select/radio)'
											},
											{
												displayName: 'Checked',
												name: 'checked',
												type: 'boolean',
												default: false,
												description: 'Отмечено по умолчанию (для checkbox)'
											}
										]
									}
								],
								description: 'Варианты выбора'
							},
							// Параметры для date
							{
								displayName: 'Initial Date',
								name: 'initial_date',
								type: 'string',
								default: '',
								displayOptions: {
									show: {
										type: ['date']
									}
								},
								description: 'Начальная дата (YYYY-MM-DD)'
							},
							// Параметры для time
							{
								displayName: 'Initial Time',
								name: 'initial_time',
								type: 'string',
								default: '',
								displayOptions: {
									show: {
										type: ['time']
									}
								},
								description: 'Начальное время (HH:mm)'
							},
							// Параметры для file_input
							{
								displayName: 'File Types',
								name: 'filetypes',
								type: 'string',
								default: '',
								displayOptions: {
									show: {
										type: ['file_input']
									}
								},
								description: 'Разрешенные типы файлов (через запятую, например: pdf,jpg,png)'
							},
							{
								displayName: 'Max Files',
								name: 'max_files',
								type: 'number',
								default: 10,
								displayOptions: {
									show: {
										type: ['file_input']
									}
								},
								description: 'Максимальное количество файлов'
							}
						]
					}
				],
				description: 'Блоки формы - добавляйте элементы для создания формы'
			},
			// JSON редактор для продвинутых пользователей
			{
				displayName: 'Custom Form JSON',
				name: 'customFormJson',
				type: 'json',
				default: '{\n  "title": "Моя форма",\n  "close_text": "Отмена",\n  "submit_text": "Отправить",\n  "blocks": [\n    {\n      "type": "header",\n      "text": "Заголовок формы"\n    },\n    {\n      "type": "input",\n      "name": "field1",\n      "label": "Поле ввода",\n      "placeholder": "Введите текст",\n      "required": true\n    },\n    {\n      "type": "select",\n      "name": "choice",\n      "label": "Выберите вариант",\n      "options": [\n        {"text": "Вариант 1", "value": "option1", "selected": true},\n        {"text": "Вариант 2", "value": "option2"}\n      ],\n      "required": true\n    }\n  ]\n}',
				displayOptions: {
					show: {
						resource: ['form'],
						operation: ['createView'],
						formBuilderMode: ['json']
					}
				},
				description: 'JSON структура кастомной формы. Используйте блоки: header, plain_text, markdown, divider, input, select, radio, checkbox, date, time, file_input'
			},
			{
				displayName: 'Trigger ID',
				name: 'triggerId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['form'],
						operation: ['createView']
					}
				},
				description: 'Уникальный идентификатор события (полученный из вебхука кнопки)'
			},
			{
				displayName: 'Private Metadata',
				name: 'privateMetadata',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['form'],
						operation: ['createView']
					}
				},
				description: 'Дополнительные данные, которые будут отправлены при отправке формы (JSON строка)'
			},
			{
				displayName: 'Callback ID',
				name: 'callbackId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['form'],
						operation: ['createView']
					}
				},
				description: 'Идентификатор для распознавания формы при получении результатов'
			},
			{
				displayName: 'Form Type',
				name: 'formType',
				type: 'options',
				options: [
					{
						name: '🤖 Auto-detect (рекомендуется)',
						value: 'auto'
					},
					{
						name: '📋 Timeoff Request',
						value: 'timeoff_request'
					},
					{
						name: '💬 Feedback Form',
						value: 'feedback_form'
					},
					{
						name: '📝 Task Request',
						value: 'task_request'
					}
				],
				default: 'auto',
				displayOptions: {
					show: {
						resource: ['form'],
						operation: ['processSubmission']
					}
				},
				description: 'Тип формы для обработки данных'
			},
			{
				displayName: 'Validation Errors',
				name: 'validationErrors',
				type: 'json',
				default: '{}',
				displayOptions: {
					show: {
						resource: ['form'],
						operation: ['processSubmission']
					}
				},
				description: 'Ошибки валидации для отправки пользователю (JSON объект с полями и сообщениями)'
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		console.log('🔍 Pachca node executing...');
		console.log('📁 Current working directory:', process.cwd());
		console.log('📂 Node path:', __dirname);
		
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				
				console.log(`🎯 Processing: ${resource} -> ${operation}`);
				const credentials = await this.getCredentials('pachcaApi');

				let responseData: any;

				// Выполнение операций через HTTP запросы
				switch (resource) {
					case 'user':
						switch (operation) {
							case 'getAll':
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'GET',
									url: `${credentials?.baseUrl}/users`,
									qs: {
										per: this.getNodeParameter('per', i, 25),
										page: this.getNodeParameter('page', i, 1),
										query: this.getNodeParameter('query', i, ''),
									},
								});
								break;
							case 'getById':
								const userId = this.getNodeParameter('userId', i) as number;
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'GET',
									url: `${credentials?.baseUrl}/users/${userId}`,
								});
								break;
							case 'create':
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'POST',
									url: `${credentials?.baseUrl}/users`,
									body: {
									user: {
											email: this.getNodeParameter('email', i),
											first_name: this.getNodeParameter('firstName', i),
											last_name: this.getNodeParameter('lastName', i),
										},
									},
								});
								break;
							case 'update':
								const updateUserId = this.getNodeParameter('userId', i) as number;
								const firstName = this.getNodeParameter('firstName', i) as string;
								const lastName = this.getNodeParameter('lastName', i) as string;
								const email = this.getNodeParameter('email', i) as string;
								const nickname = this.getNodeParameter('nickname', i) as string;
								const phoneNumber = this.getNodeParameter('phoneNumber', i) as string;
								const department = this.getNodeParameter('department', i) as string;
								const title = this.getNodeParameter('title', i) as string;
								const role = this.getNodeParameter('role', i) as string;
								const suspended = this.getNodeParameter('suspended', i) as boolean;
								const listTags = this.getNodeParameter('listTags', i) as string;
								const customProperties = this.getNodeParameter('customProperties', i) as any;
								
								// Подготавливаем объект пользователя
								const userData: any = {};
								
								// Добавляем поля только если они не пустые
								if (firstName) userData.first_name = firstName;
								if (lastName) userData.last_name = lastName;
								if (email) userData.email = email;
								if (nickname) userData.nickname = nickname;
								if (phoneNumber) userData.phone_number = phoneNumber;
								if (department) userData.department = department;
								if (title) userData.title = title;
								if (role) userData.role = role;
								if (suspended !== undefined) userData.suspended = suspended;
								
								// Обрабатываем теги
								if (listTags) {
									userData.list_tags = listTags.split(',').map(tag => tag.trim()).filter(tag => tag);
								}
								
								// Обрабатываем дополнительные поля
								if (customProperties && customProperties.property) {
									userData.custom_properties = customProperties.property.map((prop: any) => ({
										id: prop.id,
										value: prop.value,
									}));
								}
								
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'PUT',
									url: `${credentials?.baseUrl}/users/${updateUserId}`,
									body: {
										user: userData,
									},
								});
								break;
							case 'delete':
								const deleteUserId = this.getNodeParameter('userId', i) as number;
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'DELETE',
									url: `${credentials?.baseUrl}/users/${deleteUserId}`,
								});
								break;
						}
						break;

					case 'message':
						switch (operation) {
							case 'send':
								const entityType = this.getNodeParameter('entityType', i);
								const entityId = this.getNodeParameter('entityId', i);
								const content = this.getNodeParameter('content', i);
								const buttons = this.getNodeParameter('buttons', i) as any;
								
								// Валидация параметров
								if (!entityId || entityId === '') {
									throw new NodeOperationError(this.getNode(), 'Entity ID is required for sending messages');
								}
								if (!content || content === '') {
									throw new NodeOperationError(this.getNode(), 'Content is required for sending messages');
								}
								
								// Формируем массив кнопок
								const buttonRows: any[] = [];
								if (buttons) {
									// Проверяем, если buttons - это объект с buttonRow (одиночная строка кнопок)
									if (buttons.buttonRow && Array.isArray(buttons.buttonRow)) {
										const row: any[] = [];
										for (const button of buttons.buttonRow) {
											if (button.type === 'data') {
												row.push({
													text: button.text,
													data: button.data
												});
											} else if (button.type === 'url') {
												row.push({
													text: button.text,
													url: button.url
												});
											}
										}
										if (row.length > 0) {
											buttonRows.push(row);
										}
									}
									// Проверяем, если buttons - это массив строк кнопок
									else if (Array.isArray(buttons) && buttons.length > 0) {
										for (const buttonRow of buttons) {
											const row: any[] = [];
											if (buttonRow.buttonRow && Array.isArray(buttonRow.buttonRow)) {
												for (const button of buttonRow.buttonRow) {
													if (button.type === 'data') {
														row.push({
															text: button.text,
															data: button.data
														});
													} else if (button.type === 'url') {
														row.push({
															text: button.text,
															url: button.url
														});
													}
												}
											}
											if (row.length > 0) {
												buttonRows.push(row);
											}
										}
									}
								}
								
								// Отладочная информация
								const debugInfo = {
									timestamp: new Date().toISOString(),
									rawButtons: buttons,
									processedButtonRows: buttonRows,
									buttonRowsLength: buttonRows.length,
									entityType,
									entityId,
									content
								};
								
								console.log('=== SENDING MESSAGE DEBUG ===');
								console.log(JSON.stringify(debugInfo, null, 2));
								
								// Также записываем в файл для отладки
								const fs = require('fs');
								const logFile = '/tmp/pachca-debug.log';
								fs.appendFileSync(logFile, JSON.stringify(debugInfo) + '\n');
								
								const messageBody: any = {
									message: {
										entity_type: entityType,
										entity_id: entityId,
										content: content,
									}
								};

								if (buttonRows.length > 0) {
									messageBody.message.buttons = buttonRows;
									console.log('Added buttons to message body');
									fs.appendFileSync(logFile, 'BUTTONS ADDED TO MESSAGE BODY\n');
								} else {
									console.log('No buttons to add');
									fs.appendFileSync(logFile, 'NO BUTTONS TO ADD\n');
								}
								
								console.log('Final message body:', JSON.stringify(messageBody, null, 2));
								fs.appendFileSync(logFile, 'FINAL MESSAGE BODY: ' + JSON.stringify(messageBody) + '\n');
								
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'POST',
									url: `${credentials?.baseUrl}/messages`,
									body: messageBody,
								});
								break;
							case 'getById':
								const messageId = this.getNodeParameter('messageId', i) as number;
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'GET',
									url: `${credentials?.baseUrl}/messages/${messageId}`,
								});
								break;
							case 'getAll':
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'GET',
									url: `${credentials?.baseUrl}/messages`,
									qs: {
										chat_id: this.getNodeParameter('chatId', i),
										per: this.getNodeParameter('per', i, 25),
										page: this.getNodeParameter('page', i, 1),
									},
								});
								break;
							case 'update':
								const updateMessageId = this.getNodeParameter('messageId', i) as number;
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'PUT',
									url: `${credentials?.baseUrl}/messages/${updateMessageId}`,
									body: {
										message: {
											content: this.getNodeParameter('content', i),
										},
									},
								});
								break;
							case 'delete':
								const deleteMessageId = this.getNodeParameter('messageId', i) as number;
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'DELETE',
									url: `${credentials?.baseUrl}/messages/${deleteMessageId}`,
								});
								break;
							case 'pin':
								const pinMessageId = this.getNodeParameter('messageId', i) as number;
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'POST',
									url: `${credentials?.baseUrl}/messages/${pinMessageId}/pin`,
								});
								break;
							case 'unpin':
								const unpinMessageId = this.getNodeParameter('messageId', i) as number;
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'DELETE',
									url: `${credentials?.baseUrl}/messages/${unpinMessageId}/pin`,
								});
								break;
							case 'getReadMembers':
								const getReadMembersMessageId = this.getNodeParameter('messageId', i) as number;
								const readMembersPer = this.getNodeParameter('readMembersPer', i) as number;
								const readMembersPage = this.getNodeParameter('readMembersPage', i) as number;
								
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'GET',
									url: `${credentials?.baseUrl}/messages/${getReadMembersMessageId}/read_member_ids`,
									qs: {
										per: readMembersPer,
										page: readMembersPage,
									},
								});
								break;
							case 'unfurl':
								const linkPreviewMessageId = this.getNodeParameter('messageId', i) as number;
								const linkPreviews = this.getNodeParameter('linkPreviews', i) as any;
								
								// Валидация параметров
								if (!linkPreviewMessageId) {
									throw new NodeOperationError(this.getNode(), 'Message ID is required for unfurling links');
								}
								
								if (!linkPreviews || !linkPreviews.preview || !Array.isArray(linkPreviews.preview) || linkPreviews.preview.length === 0) {
									throw new NodeOperationError(this.getNode(), 'At least one link preview is required for unfurling');
								}
								
								// Формируем объект link_previews
								const linkPreviewsObject: any = {};
								
								for (const preview of linkPreviews.preview) {
									const url = preview.url;
									const title = preview.title;
									const description = preview.description;
									const imageUrl = preview.imageUrl;
									const image = preview.image;
									
									// Валидация обязательных полей
									if (!url || !title || !description) {
										throw new NodeOperationError(this.getNode(), 'URL, title and description are required for each link preview');
									}
									
									const previewObject: any = {
										title: title,
										description: description,
									};
									
									// Добавляем изображение (приоритет у загруженного файла)
									if (image && image !== '') {
										// Обработка загруженного файла
										const binaryData = await this.helpers.getBinaryDataBuffer(i, image);
										if (!binaryData) {
											throw new NodeOperationError(this.getNode(), `No binary data found in property "${image}"`);
										}
										
										const fileData = binaryData;
										const item = this.getInputData()[i];
										let fileName = 'image.jpg';
										let contentType = 'image/jpeg';
										
										if (item.binary && item.binary[image]) {
											const binaryInfo = item.binary[image];
											fileName = binaryInfo.fileName || 'image.jpg';
											contentType = binaryInfo.mimeType || 'image/jpeg';
										}
										
										// Получаем параметры загрузки
										const uploadParams = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
											method: 'POST',
											url: `${credentials?.baseUrl}/uploads`,
											body: {
												filename: fileName,
												content_type: contentType,
											},
										});
										
										// Загружаем файл на сервер
										const uploadResponse = await this.helpers.httpRequest.call(this, {
											method: 'POST',
											url: uploadParams.upload_url,
											body: fileData,
											headers: uploadParams.upload_headers,
										});
										
										previewObject.image = {
											key: uploadParams.key,
											name: fileName,
											size: fileData.length.toString(),
										};
									} else if (imageUrl) {
										previewObject.image_url = imageUrl;
									}
									
									linkPreviewsObject[url] = previewObject;
								}
								
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'POST',
									url: `${credentials?.baseUrl}/messages/${linkPreviewMessageId}/link_previews`,
									body: {
										link_previews: linkPreviewsObject,
									},
								});
								break;
						}
						break;

					case 'chat':
						switch (operation) {
							case 'getAll':
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'GET',
									url: `${credentials?.baseUrl}/chats`,
									qs: {
										per: this.getNodeParameter('per', i, 25),
										page: this.getNodeParameter('page', i, 1),
									},
								});
								break;
							case 'getById':
								const chatId = this.getNodeParameter('chatId', i) as number;
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'GET',
									url: `${credentials?.baseUrl}/chats/${chatId}`,
								});
								break;
							case 'create':
								const chatName = this.getNodeParameter('chatName', i) as string;
								const channel = this.getNodeParameter('channel', i) as boolean;
								const publicChat = this.getNodeParameter('public', i) as boolean;
								
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'POST',
									url: `${credentials?.baseUrl}/chats`,
									body: {
									chat: {
										name: chatName,
											channel: channel,
											public: publicChat,
										},
									},
								});
								break;
							case 'update':
								const updateChatId = this.getNodeParameter('chatId', i) as number;
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'PUT',
									url: `${credentials?.baseUrl}/chats/${updateChatId}`,
									body: {
										chat: {
											name: this.getNodeParameter('chatName', i),
										},
									},
								});
								break;
							case 'archive':
								const archiveChatId = this.getNodeParameter('chatId', i) as number;
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'PUT',
									url: `${credentials?.baseUrl}/chats/${archiveChatId}/archive`,
								});
								break;
							case 'unarchive':
								const unarchiveChatId = this.getNodeParameter('chatId', i) as number;
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'PUT',
									url: `${credentials?.baseUrl}/chats/${unarchiveChatId}/unarchive`,
								});
								break;
							case 'getMembers':
								const membersChatId = this.getNodeParameter('chatId', i) as number;
								const role = this.getNodeParameter('role', i) as string;
								const limit = this.getNodeParameter('limit', i) as number;
								const cursor = this.getNodeParameter('cursor', i) as string;
								
								const membersQuery: any = {};
								if (role && role !== 'all') {
									membersQuery.role = role;
								}
								if (limit) {
									membersQuery.limit = limit;
								}
								if (cursor) {
									membersQuery.cursor = cursor;
								}
								
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'GET',
									url: `${credentials?.baseUrl}/chats/${membersChatId}/members`,
									qs: membersQuery,
								});
						break;
							case 'addUsers':
								const addUsersChatId = this.getNodeParameter('chatId', i) as number;
								const memberIds = this.getNodeParameter('memberIds', i) as string;
								const silent = this.getNodeParameter('silent', i) as boolean;
								
								const userIdsArray = memberIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
								
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'POST',
									url: `${credentials?.baseUrl}/chats/${addUsersChatId}/members`,
									body: {
										member_ids: userIdsArray,
										silent: silent,
									},
								});
								break;
							case 'removeUser':
								const removeUserChatId = this.getNodeParameter('chatId', i) as number;
								const userId = this.getNodeParameter('userId', i) as number;
								
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'DELETE',
									url: `${credentials?.baseUrl}/chats/${removeUserChatId}/members/${userId}`,
								});
								break;
							case 'updateRole':
								const updateRoleChatId = this.getNodeParameter('chatId', i) as number;
								const updateUserId = this.getNodeParameter('userId', i) as number;
								const newRole = this.getNodeParameter('newRole', i) as string;
								
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'PUT',
									url: `${credentials?.baseUrl}/chats/${updateRoleChatId}/members/${updateUserId}`,
									body: {
										role: newRole,
									},
								});
								break;
							case 'leaveChat':
								const leaveChatId = this.getNodeParameter('chatId', i) as number;
								
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'DELETE',
									url: `${credentials?.baseUrl}/chats/${leaveChatId}/leave`,
								});
								break;
						}
						break;

					case 'groupTag':
						switch (operation) {
							case 'getAll':
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'GET',
									url: `${credentials?.baseUrl}/group_tags`,
									qs: {
										per: this.getNodeParameter('per', i, 25),
										page: this.getNodeParameter('page', i, 1),
									},
								});
								break;
							case 'getById':
								const groupTagId = this.getNodeParameter('groupTagId', i) as number;
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'GET',
									url: `${credentials?.baseUrl}/group_tags/${groupTagId}`,
								});
								break;
							case 'create':
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'POST',
									url: `${credentials?.baseUrl}/group_tags`,
									body: {
										group_tag: {
											name: this.getNodeParameter('groupTagName', i),
											color: this.getNodeParameter('groupTagColor', i),
										},
									},
								});
								break;
							case 'update':
								const updateGroupTagId = this.getNodeParameter('groupTagId', i) as number;
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'PUT',
									url: `${credentials?.baseUrl}/group_tags/${updateGroupTagId}`,
									body: {
										group_tag: {
											name: this.getNodeParameter('groupTagName', i),
											color: this.getNodeParameter('groupTagColor', i),
										},
									},
								});
								break;
							case 'delete':
								const deleteGroupTagId = this.getNodeParameter('groupTagId', i) as number;
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'DELETE',
									url: `${credentials?.baseUrl}/group_tags/${deleteGroupTagId}`,
								});
								break;
							case 'getUsers':
								const getUsersGroupTagId = this.getNodeParameter('groupTagId', i) as number;
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'GET',
									url: `${credentials?.baseUrl}/group_tags/${getUsersGroupTagId}/users`,
									qs: {
										per: this.getNodeParameter('per', i, 25),
										page: this.getNodeParameter('page', i, 1),
									},
								});
								break;
							case 'addTags':
								const addTagsChatId = this.getNodeParameter('groupTagChatId', i) as number;
								const groupTagIds = this.getNodeParameter('groupTagIds', i) as string;
								
								const tagIdsArray = groupTagIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
								
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'POST',
									url: `${credentials?.baseUrl}/chats/${addTagsChatId}/group_tags`,
									body: {
										group_tag_ids: tagIdsArray,
									},
								});
								break;
							case 'removeTag':
								const removeTagChatId = this.getNodeParameter('groupTagChatId', i) as number;
								const tagId = this.getNodeParameter('tagId', i) as number;
								
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'DELETE',
									url: `${credentials?.baseUrl}/chats/${removeTagChatId}/group_tags/${tagId}`,
								});
								break;
						}
						break;

					case 'file':
						switch (operation) {
							case 'upload':
								const fileSource = this.getNodeParameter('fileSource', i) as string;
								let fileName = this.getNodeParameter('fileName', i) as string;
								let contentType = this.getNodeParameter('contentType', i) as string;
								let fileData: Buffer;
								
								if (fileSource === 'url') {
									// Загружаем файл по URL
									const fileUrl = this.getNodeParameter('fileUrl', i) as string;
									if (!fileUrl) {
										throw new NodeOperationError(this.getNode(), 'File URL is required when using URL source');
									}
									
									// Скачиваем файл
									const fileResponse = await this.helpers.httpRequest.call(this, {
										method: 'GET',
										url: fileUrl,
									});
									
									fileData = Buffer.from(fileResponse);
									
									// Определяем имя файла из URL если не указано
									if (!fileName) {
										const urlPath = new URL(fileUrl).pathname;
										fileName = urlPath.split('/').pop() || 'file';
									}
									
									// Определяем content type если не указан
									if (contentType === 'application/octet-stream') {
										const extension = fileName.split('.').pop()?.toLowerCase();
										const mimeTypes: { [key: string]: string } = {
											'jpg': 'image/jpeg',
											'jpeg': 'image/jpeg',
											'png': 'image/png',
											'gif': 'image/gif',
											'pdf': 'application/pdf',
											'doc': 'application/msword',
											'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
											'txt': 'text/plain',
											'csv': 'text/csv',
											'json': 'application/json',
										};
										contentType = mimeTypes[extension || ''] || 'application/octet-stream';
									}
								} else {
									// Используем бинарные данные из предыдущего узла
									const binaryProperty = this.getNodeParameter('binaryProperty', i) as string;
									const binaryData = await this.helpers.getBinaryDataBuffer(i, binaryProperty);
									
									if (!binaryData) {
										throw new NodeOperationError(this.getNode(), `No binary data found in property "${binaryProperty}"`);
									}
									
									fileData = binaryData;
									
									// Получаем метаданные бинарных данных
									const item = this.getInputData()[i];
									if (item.binary && item.binary[binaryProperty]) {
										const binaryInfo = item.binary[binaryProperty];
										
										// Используем имя файла из бинарных данных если не указано
										if (!fileName && binaryInfo.fileName) {
											fileName = binaryInfo.fileName;
										}
										
										// Используем content type из бинарных данных если не указан
										if (contentType === 'application/octet-stream' && binaryInfo.mimeType) {
											contentType = binaryInfo.mimeType;
										}
									}
								}
								
								if (!fileName) {
									fileName = 'file';
								}
								
								// Получаем параметры загрузки
								console.log('=== FILE UPLOAD DEBUG START ===');
								console.log('File info:', {
									fileName,
									contentType,
									fileSize: fileData.length,
									fileSource
								});
								
								console.log('Credentials info:', {
									baseUrl: credentials?.baseUrl,
									tokenType: credentials?.tokenType,
									hasToken: !!credentials?.accessToken
								});
								
								const requestUrl = `${credentials?.baseUrl}/uploads`;
								const requestBody = {
									filename: fileName,
									content_type: contentType,
								};
								
								console.log('Request details:', {
									url: requestUrl,
									method: 'POST',
									body: requestBody
								});
								
								let uploadParams;
								try {
									uploadParams = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
										method: 'POST',
										url: requestUrl,
										body: requestBody,
									});
									console.log('Upload params request SUCCESS');
								} catch (error) {
									console.error('Upload params request FAILED:', error);
									console.error('Error details:', {
										status: (error as any).status,
										statusText: (error as any).statusText,
										message: (error as any).message,
										response: (error as any).response,
										responseData: (error as any).response?.data
									});
									
									// Попробуем без body
									console.log('Trying without body...');
									try {
										uploadParams = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
											method: 'POST',
											url: requestUrl,
										});
										console.log('Upload params request SUCCESS (without body)');
									} catch (error2) {
										console.error('Upload params request FAILED (without body):', error2);
										throw error; // Бросаем первую ошибку
									}
								}
								
								console.log('Upload params received:', uploadParams);
								console.log('Upload params structure:', JSON.stringify(uploadParams, null, 2));
								
								// Проверяем структуру ответа - возможно данные приходят напрямую
								const params = uploadParams?.data || uploadParams;
								
								if (!params) {
									throw new NodeOperationError(this.getNode(), 'No upload params in response');
								}
								
								if (!params.direct_url) {
									throw new NodeOperationError(this.getNode(), 'No direct_url in upload params response. Response structure: ' + JSON.stringify(params));
								}
								
								// Загружаем файл на direct_url
								console.log('Uploading file to:', params.direct_url);
								
								// Формируем multipart/form-data для S3
								// S3 требует, чтобы файл был последним параметром
								const formData = {
									'Content-Disposition': params['Content-Disposition'],
									'acl': params.acl,
									'policy': params.policy,
									'x-amz-credential': params['x-amz-credential'],
									'x-amz-algorithm': params['x-amz-algorithm'],
									'x-amz-date': params['x-amz-date'],
									'x-amz-signature': params['x-amz-signature'],
									'key': params.key,
									'file': fileData, // Просто Buffer, без дополнительных опций
								};
								
								// Загружаем файл (без авторизации, как указано в документации)
								console.log('=== FILE UPLOAD TO DIRECT_URL ===');
								console.log('Direct URL:', params.direct_url);
								console.log('Form data keys:', Object.keys(formData));
								
								try {
									// Попробуем использовать правильный формат для S3
									const FormData = require('form-data');
									const form = new FormData();
									
									// Добавляем параметры в правильном порядке
									form.append('Content-Disposition', params['Content-Disposition']);
									form.append('acl', params.acl);
									form.append('policy', params.policy);
									form.append('x-amz-credential', params['x-amz-credential']);
									form.append('x-amz-algorithm', params['x-amz-algorithm']);
									form.append('x-amz-date', params['x-amz-date']);
									form.append('x-amz-signature', params['x-amz-signature']);
									form.append('key', params.key);
									form.append('file', fileData, {
										filename: fileName,
										contentType: contentType,
									});
									
									responseData = await this.helpers.httpRequest.call(this, {
										method: 'POST',
										url: params.direct_url,
										body: form,
										headers: {
											...form.getHeaders(),
										},
									});
									console.log('File upload to direct_url SUCCESS');
								} catch (error) {
									console.error('File upload to direct_url FAILED:', error);
									console.error('Upload error details:', {
										status: (error as any).status,
										statusText: (error as any).statusText,
										message: (error as any).message,
										response: (error as any).response,
										responseData: (error as any).response?.data
									});
									throw error;
								}
								
								// Формируем итоговую ссылку на файл
								const fileKey = params.key.replace('${filename}', fileName);
								
								console.log('File upload completed. File key:', fileKey);
								
								// Возвращаем информацию о загруженном файле
								responseData = {
									success: true,
									file_key: fileKey,
									file_name: fileName,
									content_type: contentType,
									upload_params: params,
								};
								break;
						}
						break;

					case 'customFields':
						switch (operation) {
							case 'getCustomProperties':
								const entityType = this.getNodeParameter('entityType', i) as string;
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'GET',
									url: `${credentials?.baseUrl}/custom_properties`,
									qs: {
										entity_type: entityType,
									},
								});
								break;
						}
						break;

					case 'task':
						switch (operation) {
							case 'create':
								const taskKind = this.getNodeParameter('taskKind', i) as string;
								const taskContent = this.getNodeParameter('taskContent', i) as string;
								const taskDueAt = this.getNodeParameter('taskDueAt', i) as string;
								const taskPriority = this.getNodeParameter('taskPriority', i) as number;
								const performerIds = this.getNodeParameter('performerIds', i) as string;
								const customProperties = this.getNodeParameter('customProperties', i) as any;

								const taskData: any = {
									kind: taskKind,
								};

								if (taskContent) {
									taskData.content = taskContent;
								}

								if (taskDueAt) {
									taskData.due_at = taskDueAt;
								}

								if (taskPriority) {
									taskData.priority = taskPriority;
								}

								if (performerIds) {
									const performerIdsArray = performerIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
									if (performerIdsArray.length > 0) {
										taskData.performer_ids = performerIdsArray;
									}
								}

								if (customProperties && customProperties.length > 0) {
									taskData.custom_properties = customProperties;
								}

								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'POST',
									url: `${credentials?.baseUrl}/tasks`,
									body: {
										task: taskData,
									},
								});
								break;
						}
						break;

					case 'bot':
						switch (operation) {
							case 'update':
								const botId = this.getNodeParameter('botId', i) as number;
								const webhookUrl = this.getNodeParameter('webhookUrl', i) as string;

								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'PUT',
									url: `${credentials?.baseUrl}/bots/${botId}`,
									body: {
										bot: {
											webhook: {
												outgoing_url: webhookUrl,
											},
										},
									},
								});
								break;
						}
						break;

					case 'status':
						switch (operation) {
							case 'getProfile':
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'GET',
									url: `${credentials?.baseUrl}/profile`,
								});
								break;
							case 'getStatus':
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'GET',
									url: `${credentials?.baseUrl}/profile/status`,
								});
								break;
							case 'updateStatus':
								const statusEmoji = this.getNodeParameter('statusEmoji', i) as string;
								const statusTitle = this.getNodeParameter('statusTitle', i) as string;
								const statusExpiresAt = this.getNodeParameter('statusExpiresAt', i) as string;

								const statusData: any = {
									emoji: statusEmoji,
									title: statusTitle,
								};

								if (statusExpiresAt) {
									statusData.expires_at = statusExpiresAt;
								}

								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'PUT',
									url: `${credentials?.baseUrl}/profile/status`,
									body: {
										status: statusData,
									},
								});
								break;
							case 'deleteStatus':
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'DELETE',
									url: `${credentials?.baseUrl}/profile/status`,
								});
								break;
						}
						break;

					case 'reactions':
						switch (operation) {
							case 'addReaction':
								const addReactionMessageId = this.getNodeParameter('reactionsMessageId', i) as number;
								const reactionCode = this.getNodeParameter('reactionsReactionCode', i) as string;
								
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'POST',
									url: `${credentials?.baseUrl}/messages/${addReactionMessageId}/reactions`,
									body: {
										code: reactionCode,
									},
								});
								break;
							case 'deleteReaction':
								const deleteReactionMessageId = this.getNodeParameter('reactionsMessageId', i) as number;
								const deleteReactionCode = this.getNodeParameter('reactionsReactionCode', i) as string;
								
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'DELETE',
									url: `${credentials?.baseUrl}/messages/${deleteReactionMessageId}/reactions`,
									body: {
										code: deleteReactionCode,
									},
								});
								break;
							case 'getReactions':
								const getReactionsMessageId = this.getNodeParameter('reactionsMessageId', i) as number;
								const reactionsPer = this.getNodeParameter('reactionsPer', i) as number;
								const reactionsPage = this.getNodeParameter('reactionsPage', i) as number;
								
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'GET',
									url: `${credentials?.baseUrl}/messages/${getReactionsMessageId}/reactions`,
									qs: {
										per: reactionsPer,
										page: reactionsPage,
									},
								});
								break;
						}
						break;

					case 'thread':
						switch (operation) {
							case 'createThread':
								const createThreadMessageId = this.getNodeParameter('threadMessageId', i) as number;
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'POST',
									url: `${credentials?.baseUrl}/messages/${createThreadMessageId}/thread`,
								});
								break;
							case 'getThread':
								const threadId = this.getNodeParameter('threadThreadId', i) as number;
								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'GET',
									url: `${credentials?.baseUrl}/threads/${threadId}`,
								});
								break;
						}
						break;

					case 'form':
						switch (operation) {
							case 'createView':
								const formBuilderMode = this.getNodeParameter('formBuilderMode', i) as string;
								const triggerId = this.getNodeParameter('triggerId', i) as string;
								const privateMetadata = this.getNodeParameter('privateMetadata', i) as string;
								const callbackId = this.getNodeParameter('callbackId', i) as string;

								if (!triggerId) {
									throw new NodeOperationError(this.getNode(), 'Trigger ID is required for creating form view');
								}

								let viewData: any;

								if (formBuilderMode === 'template') {
									// Использование готового шаблона
									const formTemplate = this.getNodeParameter('formTemplate', i) as string;
									viewData = FORM_TEMPLATES[formTemplate];
									if (!viewData) {
										throw new NodeOperationError(this.getNode(), `Form template "${formTemplate}" not found`);
									}
								} else if (formBuilderMode === 'builder') {
									// Визуальный конструктор
									const formTitle = this.getNodeParameter('formTitle', i) as string;
									const closeText = this.getNodeParameter('closeText', i) as string;
									const submitText = this.getNodeParameter('submitText', i) as string;
									const formBlocks = this.getNodeParameter('formBlocks', i) as any;

									// Преобразуем блоки из визуального конструктора в формат API
									const blocks: any[] = [];
									console.log('=== FORM BUILDER DEBUG ===');
									console.log('formBlocks:', formBlocks);
									console.log('formBlocks type:', typeof formBlocks);
									console.log('formBlocks is array:', Array.isArray(formBlocks));
									
									// Обрабатываем formBlocks в разных форматах
									let blocksToProcess: any[] = [];
									
									if (Array.isArray(formBlocks)) {
										// Если это массив блоков
										blocksToProcess = formBlocks;
									} else if (formBlocks && typeof formBlocks === 'object') {
										// Если это объект с одним блоком {block: {...}}
										if (formBlocks.block) {
											blocksToProcess = [formBlocks];
										}
									}
									
									console.log('blocksToProcess:', blocksToProcess);
									console.log('blocksToProcess length:', blocksToProcess.length);
									
									if (blocksToProcess.length > 0) {
										for (const blockData of blocksToProcess) {
											console.log('Processing blockData:', blockData);
											console.log('blockData keys:', Object.keys(blockData));
											
											// Пробуем разные способы получения блока
											let block = blockData.block || blockData;
											console.log('Processing block:', block);
											console.log('block keys:', Object.keys(block));
											console.log('block is array:', Array.isArray(block));
											console.log('block type:', typeof block);
											
											// Если block это массив, проверяем что это - готовые блоки или fixedCollection
											if (Array.isArray(block)) {
												console.log('Block is array, checking format...');
												console.log('Array values:', block);
												
												// Проверяем первый элемент - если это объект с type, то это готовые блоки
												if (block.length > 0 && typeof block[0] === 'object' && block[0].type) {
													console.log('Array contains ready blocks, processing...');
													// Это массив готовых блоков - обрабатываем каждый блок
													for (const readyBlock of block) {
														console.log('Processing ready block type:', readyBlock.type);
														console.log('Ready block before processing:', JSON.stringify(readyBlock, null, 2));
														
														// Исправляем формат options если нужно
														if (readyBlock.options && readyBlock.options.option && Array.isArray(readyBlock.options.option)) {
															console.log('Fixing options format for block:', readyBlock.type);
															readyBlock.options = readyBlock.options.option;
														}
														
														// Исправляем поля selected/checked в options
														if (readyBlock.options && Array.isArray(readyBlock.options)) {
															for (const option of readyBlock.options) {
																// Очищаем опции от лишних полей и приводим к правильному формату
																const cleanOption: any = {
																	text: option.text,
																	value: option.value
																};
																
																// Добавляем description только если оно есть и отличается от text
																if (option.description && option.description !== option.text && option.description.trim() !== '') {
																	cleanOption.description = option.description;
																}
																
																// Правильно обрабатываем выбранные элементы
																if (readyBlock.type === 'select') {
																	// В select используется selected
																	if (option.selected === true) {
																		cleanOption.selected = true;
																	}
																} else if (readyBlock.type === 'radio') {
																	// В radio используется checked
																	if (option.checked === true) {
																		cleanOption.checked = true;
																	}
																} else if (readyBlock.type === 'checkbox') {
																	// В checkbox используется checked
																	if (option.checked === true) {
																		cleanOption.checked = true;
																	}
																}
																
																// Заменяем опцию на очищенную версию
																const optionIndex = readyBlock.options.indexOf(option);
																readyBlock.options[optionIndex] = cleanOption;
															}
														}
														
														// Убираем пустые поля перед добавлением блока
														const cleanBlock = { ...readyBlock };
														if (cleanBlock.hint === '') {
															delete cleanBlock.hint;
														}
														if (cleanBlock.placeholder === '') {
															delete cleanBlock.placeholder;
														}
														if (cleanBlock.initial_value === '') {
															delete cleanBlock.initial_value;
														}
														
														console.log('Final clean block:', JSON.stringify(cleanBlock, null, 2));
														console.log('Adding block to final array, type:', cleanBlock.type);
														blocks.push(cleanBlock);
													}
													continue; // Переходим к следующему блоку
												}
												
												console.log('Array is fixedCollection format, parsing...');
												
												// В fixedCollection данные приходят как массив значений в порядке полей
												// Нужно сопоставить с нашими полями в правильном порядке
												const blockObj: any = {
													type: block[0] || '', // Block Type
													text: block[1] || '', // Text Content
													name: block[2] || '', // Field Name
													label: block[3] || '', // Field Label
													required: block[4] || false, // Required
													hint: block[5] || '', // Hint
													placeholder: block[6] || '', // Placeholder
													multiline: block[7] || false, // Multiline
													initial_value: block[8] || '', // Initial Value
													min_length: block[9] || 0, // Min Length
													max_length: block[10] || 3000, // Max Length
													options: block[11] || [], // Options
													initial_date: block[12] || '', // Initial Date
													initial_time: block[13] || '', // Initial Time
													filetypes: block[14] || '', // File Types
													max_files: block[15] || 10 // Max Files
												};
												
												console.log('Raw block array:', block);
												console.log('Parsed blockObj:', blockObj);
												
												console.log('Converted block object:', blockObj);
												
												// Обрабатываем блок сразу
												const finalBlockObj: any = {
													type: blockObj.type
												};
												
												console.log('Creating finalBlockObj with type:', blockObj.type);
												
												// Обрабатываем разные типы блоков
												if (['header', 'plain_text', 'markdown'].includes(blockObj.type)) {
													finalBlockObj.text = blockObj.text;
												} else if (blockObj.type === 'divider') {
													// Разделитель не требует дополнительных параметров
												} else if (['input', 'select', 'radio', 'checkbox', 'date', 'time', 'file_input'].includes(blockObj.type)) {
													finalBlockObj.name = blockObj.name;
													finalBlockObj.label = blockObj.label;
													if (blockObj.required) finalBlockObj.required = blockObj.required;
													if (blockObj.hint) finalBlockObj.hint = blockObj.hint;

													// Специфичные параметры для input
													if (blockObj.type === 'input') {
														if (blockObj.placeholder) finalBlockObj.placeholder = blockObj.placeholder;
														if (blockObj.multiline) finalBlockObj.multiline = blockObj.multiline;
														if (blockObj.initial_value) finalBlockObj.initial_value = blockObj.initial_value;
														if (blockObj.min_length) finalBlockObj.min_length = blockObj.min_length;
														if (blockObj.max_length) finalBlockObj.max_length = blockObj.max_length;
													}

													// Параметры для select, radio, checkbox
													if (['select', 'radio', 'checkbox'].includes(blockObj.type) && blockObj.options) {
														finalBlockObj.options = blockObj.options.map((opt: any) => {
															const option: any = {
																text: opt.option.text,
																value: opt.option.value
															};
															if (opt.option.description) option.description = opt.option.description;
															if (blockObj.type === 'select' || blockObj.type === 'radio') {
																if (opt.option.selected) option.selected = opt.option.selected;
															} else if (blockObj.type === 'checkbox') {
																if (opt.option.checked) option.checked = opt.option.checked;
															}
															return option;
														});
													}

													// Параметры для date
													if (blockObj.type === 'date' && blockObj.initial_date) {
														finalBlockObj.initial_date = blockObj.initial_date;
													}

													// Параметры для time
													if (blockObj.type === 'time' && blockObj.initial_time) {
														finalBlockObj.initial_time = blockObj.initial_time;
													}

													// Параметры для file_input
													if (blockObj.type === 'file_input') {
														if (blockObj.filetypes) {
															finalBlockObj.filetypes = blockObj.filetypes.split(',').map((t: string) => t.trim());
														}
														if (blockObj.max_files) finalBlockObj.max_files = blockObj.max_files;
													}
												}
												
												console.log('Final block object to push:', finalBlockObj);
												blocks.push(finalBlockObj);
												continue; // Переходим к следующему блоку
											} else if (block && typeof block === 'object') {
												// Проверяем, есть ли в объекте готовые блоки
												console.log('Block is object, checking for ready blocks...');
												
												// Ищем первый блок с полем type
												for (const [key, value] of Object.entries(block)) {
													if (value && typeof value === 'object' && (value as any).type) {
														console.log(`Found ready block in key '${key}':`, value);
														blocks.push(value);
														break; // Берем только первый найденный блок
													}
												}
												continue; // Переходим к следующему блоку
											}
											
											console.log('block.type:', block.type);
											
											if (!block.type) {
												console.log('ERROR: block.type is undefined!');
												continue; // Пропускаем блоки без типа
											}
											
											const blockObj: any = {
												type: block.type
											};

											// Обрабатываем разные типы блоков
											if (['header', 'plain_text', 'markdown'].includes(block.type)) {
												blockObj.text = block.text;
											} else if (block.type === 'divider') {
												// Разделитель не требует дополнительных параметров
											} else if (['input', 'select', 'radio', 'checkbox', 'date', 'time', 'file_input'].includes(block.type)) {
												blockObj.name = block.name;
												blockObj.label = block.label;
												if (block.required) blockObj.required = block.required;
												if (block.hint) blockObj.hint = block.hint;

												// Специфичные параметры для input
												if (block.type === 'input') {
													if (block.placeholder) blockObj.placeholder = block.placeholder;
													if (block.multiline) blockObj.multiline = block.multiline;
													if (block.initial_value) blockObj.initial_value = block.initial_value;
													if (block.min_length) blockObj.min_length = block.min_length;
													if (block.max_length) blockObj.max_length = block.max_length;
												}

												// Параметры для select, radio, checkbox
												if (['select', 'radio', 'checkbox'].includes(block.type) && block.options) {
													blockObj.options = block.options.map((opt: any) => {
														const option: any = {
															text: opt.option.text,
															value: opt.option.value
														};
														if (opt.option.description) option.description = opt.option.description;
														if (block.type === 'select' || block.type === 'radio') {
															if (opt.option.selected) option.selected = opt.option.selected;
														} else if (block.type === 'checkbox') {
															if (opt.option.checked) option.checked = opt.option.checked;
														}
														return option;
													});
												}

												// Параметры для date
												if (block.type === 'date' && block.initial_date) {
													blockObj.initial_date = block.initial_date;
												}

												// Параметры для time
												if (block.type === 'time' && block.initial_time) {
													blockObj.initial_time = block.initial_time;
												}

												// Параметры для file_input
												if (block.type === 'file_input') {
													if (block.filetypes) {
														blockObj.filetypes = block.filetypes.split(',').map((t: string) => t.trim());
													}
													if (block.max_files) blockObj.max_files = block.max_files;
												}
											}

											blocks.push(blockObj);
										}
									}

									console.log('Final blocks array:', blocks);
									console.log('Blocks length:', blocks.length);
									
									// Валидация: минимум 1 блок
									if (blocks.length === 0) {
										console.log('ERROR: No blocks found!');
										if (blocksToProcess.length === 0) {
											throw new NodeOperationError(this.getNode(), 'Form must contain at least one block. Please add blocks using the "Add Block" button in the Form Blocks section.');
										} else {
											throw new NodeOperationError(this.getNode(), 'Form must contain at least one block');
										}
									}

									viewData = {
										title: formTitle,
										close_text: closeText,
										submit_text: submitText,
										blocks: blocks
									};
								} else if (formBuilderMode === 'json') {
									// JSON редактор
									const customFormJson = this.getNodeParameter('customFormJson', i) as string;
									try {
										viewData = JSON.parse(customFormJson);
										
										// Валидация: минимум 1 блок
										if (!viewData.blocks || !Array.isArray(viewData.blocks) || viewData.blocks.length === 0) {
											throw new NodeOperationError(this.getNode(), 'Form must contain at least one block in blocks array');
										}
									} catch (error) {
										if (error instanceof NodeOperationError) {
											throw error;
										}
										throw new NodeOperationError(this.getNode(), 'Invalid JSON format in Custom Form JSON field');
									}
								} else {
									throw new NodeOperationError(this.getNode(), `Unknown form builder mode: ${formBuilderMode}`);
								}

								const requestBody: any = {
									trigger_id: triggerId,
									type: 'modal',
									view: viewData
								};

								if (privateMetadata) {
									requestBody.private_metadata = privateMetadata;
								}
								if (callbackId) {
									requestBody.callback_id = callbackId;
								}

								console.log('=== FINAL REQUEST BODY ===');
								console.log(JSON.stringify(requestBody, null, 2));

								responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'pachcaApi', {
									method: 'POST',
									url: `${credentials?.baseUrl}/views/open`,
									body: requestBody,
								});
								break;

							case 'processSubmission':
								// Получаем данные формы из вебхука Pachca
								const webhookData = this.getInputData();
								let formData = webhookData[i]?.json || {};
								const formType = this.getNodeParameter('formType', i) as string;
								const validationErrors = this.getNodeParameter('validationErrors', i) as any;

								console.log('=== PROCESSING FORM SUBMISSION ===');
								console.log('Webhook data:', webhookData);
								console.log('Form data:', formData);
								console.log('Form type:', formType);
								console.log('Validation errors:', validationErrors);

								// Проверяем режим выполнения
								const executionMode = this.getInputData()[i]?.json?.executionMode;
								console.log('Execution mode:', executionMode);
								
								// В режиме тестирования пропускаем проверку данных
								if (executionMode === 'test') {
									console.log('Test mode detected - skipping form data validation');
									// В тестовом режиме создаем тестовые данные
									if (!formData || Object.keys(formData).length === 0 || formData.success === true) {
										formData = {
											text: 'Test form submission',
											select: 'test_value',
											checkbox: ['test_option']
										};
										console.log('Using test form data:', formData);
									}
								} else {
									// Проверяем, что это действительно отправка формы
									if (!formData || Object.keys(formData).length === 0 || formData.success === true) {
										console.log('No form data received - this might be a button click, not form submission');
										responseData = {
											status: 400,
											message: 'No form data received. This operation is for processing form submissions, not button clicks.',
											receivedData: formData
										};
										break;
									}
								}

								// Автоматическое определение типа формы по полям
								let detectedFormType = formType;
								if (!formType || formType === 'auto') {
									// Автоматическое определение типа формы
									if (!formData || typeof formData !== 'object') {
										detectedFormType = 'unknown';
									} else {
										const fields = Object.keys(formData);
										
										if (fields.includes('date_start') && fields.includes('date_end')) {
											detectedFormType = 'timeoff_request';
										} else if (fields.includes('rating') && fields.includes('comment')) {
											detectedFormType = 'feedback_form';
										} else if (fields.includes('task_title') && fields.includes('priority')) {
											detectedFormType = 'task_request';
										} else if (fields.includes('checkbox') || fields.includes('select') || fields.includes('text')) {
											detectedFormType = 'custom_form';
										} else {
											detectedFormType = 'unknown';
										}
									}
									console.log('Auto-detected form type:', detectedFormType);
								}

								// Валидация данных формы
								const errors: any = {};
								if (validationErrors && typeof validationErrors === 'object' && Object.keys(validationErrors).length > 0) {
									Object.assign(errors, validationErrors);
								} else if (validationErrors && typeof validationErrors === 'string' && validationErrors !== '{}') {
									try {
										const parsedErrors = JSON.parse(validationErrors);
										if (typeof parsedErrors === 'object') {
											Object.assign(errors, parsedErrors);
										}
									} catch (e) {
										console.log('Failed to parse validation errors:', validationErrors);
									}
								}

								// Применяем правила валидации для конкретного типа формы
								if (FORM_VALIDATION_RULES[detectedFormType]) {
									const rules = FORM_VALIDATION_RULES[detectedFormType];
									for (const [field, validator] of Object.entries(rules)) {
										if (formData[field] && typeof validator === 'function') {
											const error = validator(formData[field], formData);
											if (error) {
												errors[field] = error;
											}
										}
									}
								}

								// Если есть ошибки валидации, возвращаем их
								if (Object.keys(errors).length > 0) {
									console.log('Validation errors found:', errors);
									// Возвращаем 400 с ошибками для Pachca
									responseData = {
										status: 400,
										errors: errors,
										formType: detectedFormType
									};
								} else {
									// Успешная обработка - возвращаем 200 для закрытия формы
									console.log('Form processed successfully');
									responseData = {
										status: 200,
										message: 'Form processed successfully',
										formType: detectedFormType,
										processedData: formData
									};
								}
								break;

							case 'getTemplates':
								responseData = {
									templates: Object.keys(FORM_TEMPLATES).map(key => ({
										value: key,
										title: FORM_TEMPLATES[key].title,
										description: `Готовый шаблон формы: ${FORM_TEMPLATES[key].title}`
									}))
								};
								break;
						}
						break;

					default:
						throw new NodeOperationError(this.getNode(), `Resource "${resource}" not implemented yet`);
				}

				// Для processSubmission возвращаем HTTP ответ для Pachca
				if (resource === 'form' && operation === 'processSubmission') {
					// Возвращаем HTTP ответ для Pachca
				returnData.push({
						json: responseData || {},
					pairedItem: { item: i },
				});
				} else {
					// Для остальных операций возвращаем данные как обычно
					returnData.push({
						json: responseData?.data || responseData || {},
						pairedItem: { item: i },
					});
				}
			} catch (error) {
				console.error('Error in Pachca node:', error);
				if (this.continueOnFail()) {
					returnData.push({
						json: { 
							error: (error as Error).message,
							details: String(error)
						},
						pairedItem: { item: i },
					});
				} else {
					throw error;
				}
			}
		}

		return [returnData];
}

}