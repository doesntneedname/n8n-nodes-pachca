// Простая и правильная логика кнопок для send операции
// Формируем массив кнопок
const buttonRows: any[] = [];
if (buttons) {
	// Получаем массив кнопок из разных форматов
	let buttonArray: any[] = [];
	
	// Старый формат: { "buttonRow": [...] }
	if (buttons.buttonRow && Array.isArray(buttons.buttonRow)) {
		buttonArray = buttons.buttonRow;
	}
	// Новый формат: { "button": [...] }
	else if (buttons.button && Array.isArray(buttons.button)) {
		buttonArray = buttons.button;
	}
	// Формат n8n: [{ "button": {...} }, { "button": {...} }]
	else if (Array.isArray(buttons)) {
		buttonArray = buttons.map(item => item.button).filter(Boolean);
	}
	
	// Обрабатываем кнопки в зависимости от layout
	if (buttonArray.length > 0) {
		if (buttonLayout === 'single_row') {
			// Все кнопки в одну строку
			const row: any[] = [];
			for (const button of buttonArray) {
				if (button.type === 'data') {
					row.push({ text: button.text, data: button.data });
				} else if (button.type === 'url') {
					row.push({ text: button.text, url: button.url });
				}
			}
			if (row.length > 0) {
				buttonRows.push(row);
			}
		} else if (buttonLayout === 'multiple_rows') {
			// Каждая кнопка в отдельную строку
			for (const button of buttonArray) {
				if (button.type === 'data') {
					buttonRows.push([{ text: button.text, data: button.data }]);
				} else if (button.type === 'url') {
					buttonRows.push([{ text: button.text, url: button.url }]);
				}
			}
		}
	}
}
