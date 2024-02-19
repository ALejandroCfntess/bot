const TelegramBot = require('node-telegram-bot-api');

/**
 * Instancia del bot de Telegram.
 * @type {TelegramBot}
 */
const bot = new TelegramBot('6976381525:AAE94YjxtgiXLiisU1FQE4ZlRBdDfnJxUZU', { polling: true });

/**
 * Manejador de estados para controlar en qué punto está el usuario.
 * @type {Object.<string, Object>}
 */
const state = {};

/**
 * Maneja el comando /start y muestra un teclado con opciones al usuario.
 * @param {Object} msg - Objeto que representa el mensaje recibido.
 */
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Selecciona una operación:', {
        reply_markup: {
            keyboard: [
                [{ text: 'Sumar' }, { text: 'Restar' }],
                [{ text: 'Multiplicar' }, { text: 'Dividir' }]
            ],
            resize_keyboard: true
        }
    });

    // Reiniciar el estado
    state[chatId] = {};
});

/**
 * Maneja los mensajes del usuario para seleccionar la operación.
 * @param {Object} msg - Objeto que representa el mensaje recibido.
 */
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;

    switch (messageText) {
        case 'Sumar':
        case 'Restar':
        case 'Multiplicar':
        case 'Dividir':
            state[chatId].operation = messageText;
            bot.sendMessage(chatId, 'Introduce el primer número:');
            break;
        default:
            bot.sendMessage(chatId, 'Por favor, selecciona una opción válida.');
            break;
    }
});

/**
 * Maneja los mensajes del usuario para introducir los números y realizar la operación.
 * @param {Object} msg - Objeto que representa el mensaje recibido.
 */
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;

    // Verificar si el chat tiene un estado y si se ha definido una operación
    if (state[chatId] && state[chatId].operation) {
        const operation = state[chatId].operation;

        // Convertir el mensaje a un número
        const number = parseFloat(messageText);

        if (isNaN(number)) {
            bot.sendMessage(chatId, 'Por favor, introduce un número válido.');
            return;
        }

        // Agregar el número al estado del chat
        if (!state[chatId].numbers) {
            state[chatId].numbers = [];
        }
        state[chatId].numbers.push(number);

        // Solicitar el próximo número o realizar la operación
        if (state[chatId].numbers.length < 2) {
            bot.sendMessage(chatId, `Introduce el siguiente número para ${operation}:`);
        } else {
            const numbers = state[chatId].numbers;

            // Realizar la operación correspondiente
            let result;
            switch (operation) {
                case 'Sumar':
                    result = numbers.reduce((acc, curr) => acc + curr);
                    break;
                case 'Restar':
                    result = numbers.reduce((acc, curr) => acc - curr);
                    break;
                case 'Multiplicar':
                    result = numbers.reduce((acc, curr) => acc * curr);
                    break;
                case 'Dividir':
                    if (numbers[1] === 0) {
                        bot.sendMessage(chatId, 'No puedes dividir por cero.');
                        return;
                    }
                    result = numbers.reduce((acc, curr) => acc / curr);
                    break;
            }

            // Enviar el resultado al usuario
            bot.sendMessage(chatId, `El resultado de ${operation} es: ${result}`);

            // Reiniciar el estado
            state[chatId] = {};
        }
    }
});
