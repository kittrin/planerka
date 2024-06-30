const TelegramApi = require('node-telegram-bot-api');
const connection = require("../planerka/db");
const userController = require('./user.controller');

const token = '7178279731:AAFUBlvF5M0j_JKKBA8R87g4paeQqTZezfA';

const bot = new TelegramApi(token, {polling: true});

const msgText = {
    start: 'Добрый день, вас приветствует бот Администрации МО г-к Анапа.\n' +
        'Здесь вы сможете получить информацию о дате проведения совещания.'
}


const admin1 = 865390883;
const admin2 = 5799806003;
const admin3 = 433526068;


const sendProgerError = async (text) => {
    if (admin1) {
        await bot.sendMessage(admin1, text);
    }
}
const check_registr = async (chatid) => {
    const result = await userController.checkUserByTgId(chatid);
    return result[0][0]['COUNT(1)']
}
const sendMessageAll = (users, msg_text) => {
    users[0].map(async el => {
        try {
            await bot.sendMessage(el.chat_id, msg_text);
        }
        catch (e){
            console.log("Не отправилось сообщение: " + el.chat_id)
        }
    })
}
const start =  async () => {
    try {
        await connection.getConnection()
    } catch (e) {
        console.log('Подключение к бд сломалось', e)
    }
    bot.on('message', async msg => {
        const text = msg.text
        const chatId = msg.chat.id;
        if (text === '/start') {
            const user = {
                id: msg.from.id,
                first_name: msg.from.first_name,
                last_name: msg.from.last_name,
                username: msg.from.username,
                chat_id: chatId
            }
            if (!user.first_name) {
                user.first_name = ""
            }
            if (!user.last_name) {
                user.last_name = ""
            }
            const check = await check_registr(user.id)
            if (check <= 0) {
                try {
                    const newPerson = await userController.createUser({id: msg.from.id,
                        first_name: msg.from.first_name,
                        last_name: msg.from.last_name,
                        username: msg.from.username,
                        chat_id: chatId})
                    if (newPerson) {
                        return bot.sendMessage(chatId, msgText.start)
                    } else {
                        await sendProgerError(`Не записался в бд юзер:\n ${JSON.stringify(user)}`);
                        return bot.sendMessage(chatId, 'Что-то пошло не по плану. Напишите о своей проблеме сюда -> @kristofin')
                    }
                } catch (e) {
                    await sendProgerError(`произошла ошибка:\n ${JSON.stringify(user)}` + e);
                    return bot.sendMessage(chatId, 'Что-то пошло не по плану. Напишите о своей проблеме сюда -> @kristofin')
                }
            }
            return bot.sendMessage(chatId, msgText.start)
        }
        if (text === "/send_all_message") {
            if (chatId == admin1 || chatId == admin2 || chatId == admin3) {
                const enter_msg = await bot.sendMessage(chatId, 'Введите сообщени, которое будет адресовано всем:', {reply_markup: {force_reply: true}});
                const users = await userController.getUsers();
                bot.onReplyToMessage(chatId, enter_msg.message_id, async (msg) => {
                    const msg_text = msg.text;
                    await sendMessageAll(users, msg_text)
                })
            }
        }
    })
}

start()