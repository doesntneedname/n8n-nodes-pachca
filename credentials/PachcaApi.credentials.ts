import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class PachcaApi implements ICredentialType {
	name = 'pachcaApi';
	displayName = 'Pachca API';
	documentationUrl = 'https://crm.pachca.com/dev/getting-started/requests-and-responses/';
	properties: INodeProperties[] = [
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'Токен доступа к API Пачки. Получить можно в настройках разработчика.',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.pachca.com/api/shared/v1',
			description: 'Базовый URL API Пачки',
		},
		{
			displayName: 'Token Type',
			name: 'tokenType',
			type: 'options',
			options: [
				{
					name: 'Bot Token',
					value: 'bot',
					description: 'Токен бота - доступ к основным методам API',
				},
				{
					name: 'Admin Token',
					value: 'admin',
					description: 'Токен администратора - доступ к управлению пользователями и тегами',
				},
				{
					name: 'Owner Token',
					value: 'owner',
					description: 'Токен владельца - полный доступ включая экспорт',
				},
			],
			default: 'bot',
			description: 'Тип токена определяет доступные методы API',
		},
		{
			displayName: 'User ID',
			name: 'userId',
			type: 'number',
			default: '',
			description: 'ID пользователя/бота, которому принадлежит токен (опционально)',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.accessToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/profile',
		},
	};
}
