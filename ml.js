const ADMINS = [2039213861, 2039213861] // ID админов бота
const DB_URL = "mongodb://c39199_mlbot_na4u_ru:CuQleCespozob49@mongo1.c39199.h2,mongo2.c39199.h2,mongo3.c39199.h2/c39199_mlbot_na4u_ru?replicaSet=MongoReplica" // URL базы бота
const QIWI_TOKEN = "71fdf869d198a53049243fe35c1e44a2" // API ключ QIWI кошелька с полным доступом
const BOT_TOKEN = "5461991984:AAGimTOz2ubKZ6nlay7ULqWh-s0V7azVnn8" // Bot API Token
  
oplata = 0

var config = {
payeer: {
		enabled: true,
		account: "P1052058765",
		apiId: 1416928093,
		apiPass: "9PU5ekj9oR6NAR1K"
	},
	massmailing_kf: 0.25  // - стоимость 1 пользователя при покупке рассылки
}
  
/*

Установка и поддержка скрипта: @GANJVEST

*/


var txnId = require('./txnId');

process.env.TZ = 'Moscow/Europe';


const mongo = require('mongoose');
mongo.connect(DB_URL);


var User = mongo.model('User', {
	id: Number,
	buybalance: Number,
	outbalance: Number,
	name: String,
	bhivebalance: Number,
	accumulation_balance: Number,
	deposit_balance: Number,
	fc: Number,
	ref: Number,
	regDate: String,
	deposit: Number,
	payout: Number,
	fetuses: Number,
	menu: String,
	lastCollect: Number,
	ban: Boolean,
	refCount: Number,
	wb_profits: Number,
	clanName: String,
	totalEarn: Number,
	not: Boolean,
	prize: Boolean,
	spinsToday: Number,
	data: String,
	bank: Number,
	game_balance: Number,
	game_payin: Number,
	game_payout: Number,
	game_limit: Number,
	game_bet: Number,
	sum: Object,
});

var Task = mongo.model('Task', {
	id: Number
});

const Ticket = mongo.model('Ticket', {
	id: Number,
	amount: Number,
	wallet: String
});

const Start = [
    ["💼 Инвестиции", "👔 Партнёрам"],
    ["💳 Кошелёк", "📠 Калькулятор"],
	["⚙️ Настройки", "🗓 Обучение"]
];

const Cancel = [
	["🚫 Отмена"]
];

const AdminPanel = [
	["📬 Рассылка", "📮 Выплаты"],
	["📧 Информация"],
	["🔙 Назад"]
];

const RM_admin = {
	inline_keyboard: [
		[{ text: "✉️ Рассылка", callback_data: "admin_mm" }, { text: "🔎 Управление", callback_data: "admin_u" }],
		[{ text: "📮 Выплаты", callback_data: "admin_w" }, { text: "👥 ТОП", callback_data: "admin_top" }],
		[{ text: "🅿️ Бонус", callback_data: "admin_br" }, { text: "🥝 Бонус", callback_data: "admin_b" }],
	]
};

const RM_chek = {
	inline_keyboard: [
		  [{ text: "✅ Подписаться", url: "https://t.me/newBMW_ML" }],
          [{ text: "✅ Проверить подписку", callback_data: "game_prize_check" }],
          ]
};

const RM_admin_return = { inline_keyboard: [[{ text: "◀️ Назад", callback_data: "admin_return" }],] };

const RM_mm1 = {
	inline_keyboard: [
		[{ text: "⏹ Стоп", callback_data: "admin_mm_stop" }],
		[{ text: "⏸ Пауза", callback_data: "admin_mm_pause" }],
	]
};

const RM_mm2 = {
	inline_keyboard: [
		[{ text: "⏹ Стоп", callback_data: "admin_mm_stop" }],
		[{ text: "▶️ Продолжить", callback_data: "admin_mm_play" }],
	]
};



const { Qiwi } = require('node-qiwi-api');
const qiwi = new Qiwi(QIWI_TOKEN);

const Telegram = require('node-telegram-bot-api');
const bot = new Telegram(BOT_TOKEN, { polling: true });

bot.getMe().then(r => console.log(r));

bot.on('text', async (message) => {
	message.send = (text, params) => bot.sendMessage(message.chat.id, text, params);
	let $menu = [];
	var uid = message.from.id;
	var text = message.text;
	let dt = new Date
	console.log("[" + dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds() + "] Пользователь " + uid + " отправил: " + text);
     if (dt.getDate() == oplata) return message.send('Хостинг не оплачен!');

	Start.map((x) => $menu.push(x));
	// if (ADMINS.find((x) => x == message.from.id)) $menu.push(["🔝 Админка"]);

	if (message.text) {
		if (message.text.startsWith('/start') || message.text == '🔙 Назад') {
			let $user = await User.findOne({ id: message.from.id });
			if (!$user) {
				let schema = {
					id: message.from.id,
					buybalance: 0,
					outbalance: 0,
					bhivebalance: 0,
					accumulation_balance: 0,
					deposit_balance: 0,
					wb_profits: 0,
					name: message.from.first_name,
					fc: 0,
					ref: 0,
					regDate: `${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
					deposit: 0,
					payout: 0,
					fetuses: 0,
					menu: "",
					lastCollect: Date.now(),
					ban: false,
					refCount: 0,
					not: false,
					data: "",
					bank: 0,
					game_balance: 0,
					game_payin: 0,
					game_payout: 0,
					game_limit: 0,
					game_bet: 0,
				};

				let reffer = Number(message.text.split('/start ')[1]);

				if (reffer) {
					let $reffer = await User.findOne({ id: reffer })
					if ($reffer) {
						schema.ref = $reffer.id
						await $reffer.inc('game_balance', 0.1)
						await $reffer.inc('refCount', 1)
						bot.sendMessage($reffer.id, `🔔 Вы пригласили <a href="tg://user?id=${message.from.id}">партнёра</a> и получили 0.1₽`, { parse_mode: "HTML" });
					}
				}

				let user = new User(schema);
				await user.save();
			}
			return message.send(`✌️ <b> Добро пожаловать,  ${message.from.first_name}</b>`, {
                   parse_mode: "HTML",
                    reply_markup: {
					keyboard: Start,
					resize_keyboard: true
                }
		    });
	      }
	 }

				

	message.user = await User.findOne({ id: message.from.id });
	if (!message.user) return message.send(`Что-то пошло не так... Напишите /start`);
	if (message.user.ban) return
	if (!message.user.name || message.user.name != message.from.first_name)
		await User.findOneAndUpdate({ id: message.from.id }, { name: message.from.first_name })
		
		

	if (state[uid] == 7770 && ADMINS.indexOf(message.from.id) !== -1 && text != "0") {
		state[uid] = undefined
		bot.sendMessage(uid, "Рассылка запущена!").then((e) => {
			if (text.split("#").length == 4) {
				var btn_text = text.split("#")[1].split("#")[0].replace(/(^\s*)|(\s*)$/g, '')
				var btn_link = text.split("#")[2].split("#")[0].replace(/(^\s*)|(\s*)$/g, '')
				text = text.split("#")[0]
				mm_t(text, e.message_id, e.chat.id, true, btn_text, btn_link, 100)
			}
			else mm_t(text, e.message_id, e.chat.id, false, false, false, 100)
		})
	}
	
	if (state[uid] == 7771 && ADMINS.indexOf(message.from.id) !== -1) {
		state[uid] = undefined
		text = Number(text.replace("%", ""))
		await User.findOneAndUpdate({ id: 0 }, { deposit: text })
		return message.send(`Бонус к пополнению в ${text}% установлен!`, { reply_markup: RM_admin_return });
	}
	
	if (state[uid] == 7771222 && ADMINS.indexOf(message.from.id) !== -1) {
		state[uid] = undefined
		text = Number(text.replace("%", ""))
		await User.findOneAndUpdate({ id: 0 }, { payout: text })
		return message.send(`Лимит на мебели в ${text} единиц установлен!`, { reply_markup: RM_admin_return });
	}

	if (state[uid] == 7772 && ADMINS.indexOf(message.from.id) !== -1 && text != "0") {
		state[uid] = undefined

		message.text = Number(message.text);
		let user = await User.findOne({ id: message.text });
		let u = user
		if (!user) return message.send('Пользователь не найден');

		let partners = await User.find({ ref: message.text });
		await message.user.set('menu', '');
		var kb = { inline_keyboard: [] }
		if (u.ban) kb.inline_keyboard.push([{ text: "♻️ Разбанить", callback_data: "unban_" + u.id }])
		else kb.inline_keyboard.push([{ text: "🛑 Забанить", callback_data: "ban_" + u.id }])
		kb.inline_keyboard.push([{ text: "➕ Баланс покупок", callback_data: "addBuyBal_" + u.id }, { text: "✏️ Баланс покупок", callback_data: "editBuyBal_" + u.id }])
		kb.inline_keyboard.push([{ text: "➕ Баланс вывода", callback_data: "addOutBal_" + u.id }, { text: "✏️ Баланс вывода", callback_data: "editOutBal_" + u.id }])
		kb.inline_keyboard.push([{ text: "➕ Пополнения", callback_data: "addPayIns_" + u.id }, { text: "✏️ Пополнения", callback_data: "editPayIns_" + u.id }])
		kb.inline_keyboard.push([{ text: "➕ Выведено", callback_data: "addPayOuts_" + u.id }, { text: "✏️ Выведено", callback_data: "editPayOuts_" + u.id }])
		
		kb.inline_keyboard.push([{ text: "◀️ Назад", callback_data: "admin_return" }])

		return message.send(`📝 Пригласил: <b>${partners.length}</b>
🆔 ID: <code>${user.id}</code>

💰 Баланс:
🛒 Для покупок: ${user.buybalance.toFixed(2)}₽
📭 Для вывода: ${user.outbalance.toFixed(2)}₽

<b>Вывел: ${roundPlus(user.payout)}₽</b>
Пополнил: ${roundPlus(user.deposit)}₽
`, {
			parse_mode: "HTML",
			reply_markup: kb
		});

	}

	if (state[uid] == 7773 && ADMINS.indexOf(message.from.id) !== -1) {
		state[uid] = undefined
		await User.findOneAndUpdate({ id: data[uid] }, { $inc: { game_balance: Number(text) } })
		bot.sendMessage(data[uid], `💰 Ваш баланс для покупок пополнен на <b>${text}₽</b>!`, { parse_mode: html })
		return message.send(`Баланс для покупок пользователя пополнен на ${text}₽!`, { reply_markup: RM_admin_return });
	}
	if (state[uid] == 7774 && ADMINS.indexOf(message.from.id) !== -1) {
		state[uid] = undefined
		await User.findOneAndUpdate({ id: data[uid] }, { $inc: { buybalance: Number(text) } })
		bot.sendMessage(data[uid], `💰 Ваш баланс для вывода пополнен на <b>${text}₽</b>!`, { parse_mode: html })
		return message.send(`Баланс для вывода пользователя пополнен на ${text}₽!`, { reply_markup: RM_admin_return });
	}
	if (state[uid] == 777455 && ADMINS.indexOf(message.from.id) !== -1) {
		state[uid] = undefined
		await User.findOneAndUpdate({ id: data[uid] }, { deposit: Number(text) })
		bot.sendMessage(data[uid], `💰 Ваш сумма Ваших пополнений пополнена на <b>${text}₽</b>!`, { parse_mode: html })
		return message.send(`Сумма пополнений пользователя пополнена на ${text}₽!`, { reply_markup: RM_admin_return });
	}
	if (state[uid] == 77745555 && ADMINS.indexOf(message.from.id) !== -1) {
		state[uid] = undefined
		await User.findOneAndUpdate({ id: data[uid] }, { payout: Number(text) })
		bot.sendMessage(data[uid], `💰 Ваш сумма Ваших выводов пополнена на <b>${text}₽</b>!`, { parse_mode: html })
		return message.send(`Сумма выводов пользователя пополнена на ${text}₽!`, { reply_markup: RM_admin_return });
	}
	if (state[uid] == 7775 && ADMINS.indexOf(message.from.id) !== -1) {
		state[uid] = undefined
		await User.findOneAndUpdate({ id: data[uid] }, { game_balance: Number(text) })
		bot.sendMessage(data[uid], `💰 Ваш баланс для покупок изменён на <b>${text}₽</b>!`, { parse_mode: html })
		return message.send(`Баланс для покупок пользователя изменён на ${text}₽!`, { reply_markup: RM_admin_return });
	}
	if (state[uid] == 7776 && ADMINS.indexOf(message.from.id) !== -1) {
		state[uid] = undefined
		await User.findOneAndUpdate({ id: data[uid] }, { buybalance: Number(text) })
		bot.sendMessage(data[uid], `💰 Ваш баланс для вывода изменён на <b>${text}₽</b>!`, { parse_mode: html })
		return message.send(`Баланс для вывода пользователя изменён на ${text}₽!`, { reply_markup: RM_admin_return });
	}
	if (state[uid] == 777655 && ADMINS.indexOf(message.from.id) !== -1) {
		state[uid] = undefined
		await User.findOneAndUpdate({ id: data[uid] }, { deposit: Number(text) })
		bot.sendMessage(data[uid], `💰 Ваш сумма Ваших пополнений измена на <b>${text}₽</b>!`, { parse_mode: html })
		return message.send(`Сумма пополнений пользователя изменёна на ${text}₽!`, { reply_markup: RM_admin_return });
	}
	if (state[uid] == 77765555 && ADMINS.indexOf(message.from.id) !== -1) {
		state[uid] = undefined
		await User.findOneAndUpdate({ id: data[uid] }, { payout: Number(text) })
		bot.sendMessage(data[uid], `💰 Ваш сумма Ваших выводов измена на <b>${text}₽</b>!`, { parse_mode: html })
		return message.send(`Сумма выводов пользователя изменёна на ${text}₽!`, { reply_markup: RM_admin_return });
	}

	if (message.text) {
		if (message.text == '🚫 Отмена') {
			state[uid] = undefined
			await message.user.set('menu', '');
			return message.send('🚫 Отменено.', {
				reply_markup: {
					keyboard: $menu,
					resize_keyboard: true
				}
			});
		}
	}

	if (message.user.menu == 'reinvest') {
  message.text = Number(message.text);

  if (!message.text) return message.send('Введите сумму для реинвестирования!');
  if (message.text <= 0) return message.send('Введите сумму для реинвестирования!');

  if (message.text > message.user.buybalance) return message.send('Недостаточно средств.');
  else if (message.text <= message.user.buybalance) {
   await message.user.set('menu', '');

   await message.user.dec('buybalance', message.text);
   await message.user.inc('game_balance', message.text);

   return message.send(`Вы успешно реинвестировали ${message.text.toFixed(2)}₽`, {
    reply_markup: {
     keyboard: $menu,
     resize_keyboard: true
    }
   });
  }
 }
	
	if (state[uid] == 15) {
		var sum = Number(message.text)
   if (isNaN(sum)) return message.send('Введите сумму!');
   if (sum < 100) return message.send('Введите сумму больше 100₽!');
   state[uid] = 15
   return bot.sendMessage(message.chat.id, `В данном разделе вы сумеете рассчитать вашу прибыль, от суммы инвестиции: 

💵 Ваша инвестиция: <b>${sum * 1}₽</b>

▪️ Прибыль в сутки: <b>${sum * 0.05}₽</b>
▪ Прибыль в неделю: <b>${sum * 0.05 * 7}₽</b>
▪️ Прибыль в месяц: <b>${sum * 0.05 * 30}₽</b>
▪️ Прибыль в год: <b>${sum * 0.05 * 365}₽</b>`, {
	             parse_mode: "HTML",
                 reply_markup: {
					keyboard: Cancel,
					resize_keyboard: true
				}
			});
		}
	
	if (state[uid] == 13) {
		message.text = Number(message.text);
		if (message.text <= 0) return message.send('Введите сумму больше 0:');
		if (message.text < 100) return message.send('Введите сумму больше 100:');
		if (message.text > message.user.game_balance) return message.send('Недостаточно средств.');
		if (message.text <= message.user.game_balance) {
			await message.user.dec('game_balance', message.text);
			await message.user.inc('deposit_balance', message.text);
			state[uid] = undefined
			return message.send(`💳 Вы успешно инвестировали свои средства в размере ${message.text}₽ и открыли вклад. Удачного профита!`, {
				reply_markup: {
					keyboard: Start,
					resize_keyboard: true
				}
			});
		}
	}
	
	if (state[uid] == 14) {
		message.text = Number(message.text);
		if (message.text <= 0) return message.send('Введите сумму больше 0:');
		if (message.text > message.user.accumulation_balance) return message.send('Недостаточно средств.');
		if (message.text <= message.user.accumulation_balance) {
			await message.user.dec('accumulation_balance', message.text);
			await message.user.inc('buybalance', message.text);
			state[uid] = undefined
			return message.send(`💳 Вы успешно перевели свои накопления в размере ${message.text}₽ на баланс вывода!`, {
				reply_markup: {
					keyboard: Start,
					resize_keyboard: true
				}
			});
		}
	}

	if (message.user.menu.startsWith('amountQiwi')) {
		message.text = Number(message.text);

		if (!message.text) return message.send('Введите сумму на вывод!');
		if (message.text <= 0) return message.send('Введите сумму на вывод!');

		if (message.text > message.user.outbalance) return message.send('Недостаточно средств.');
		if (message.text < 50) return message.send(`Введите сумму более 50₽\nНе хватает для вывода  ${roundPlus( 50 -message.text)}!`);
		}
			
		if (message.text <= message.user.outbalance) {
			await message.user.dec('buybalance', message.text); 
			let ticket = new Ticket({
				id: message.from.id,
				amount: message.text,
				wallet: message.user.menu.split('amountQiwi')[1]
			});

			await ticket.save();
			await message.user.set('menu', '');

			return message.send('Заявка на выплату создана, ожидайте.Выплаты одобряются в течении 48часов', {
				reply_markup: {
					keyboard: $menu,
					resize_keyboard: true
				}
			});
		}
	

	if (message.user.menu == 'qiwi') {

		if (message.text.length < 5) return message.send('Введите правильный номер!При вводе не правильного номера администрация бота не несет ответственность за потерю средств', {
			reply_markup: {
				keyboard: Cancel,
				resize_keyboard: true
			}
		});



		await message.user.set('menu', 'amountQiwi' + message.text);
		return message.send(`Введите сумму на вывод. Вы можете вывести ${message.user.outbalance.toFixed(2)}₽`);
	}

	if (message.text) {
		if (message.text == '💼 Инвестиции') {
			return bot.sendPhoto(message.chat.id, "ml.png", {
				caption:`<i>⁠▪️ Открывай инвестиции и получай стабильную прибыль в данном разделе, после собирай доход: </i>
				
💼 Процент прибыли: <b>5%</b>
⏱️ Время доходности: <b>24 часа</b>
📆 Срок вклада: <b>Пожизненно</b>

💳 Ваш вклад: ${message.user.deposit_balance}₽
💵 Ваши накопления: ${message.user.accumulation_balance}₽`, 
	           parse_mode: "HTML",
				reply_markup: {
					inline_keyboard: [
						[{ text: "➕ Инвестировать", callback_data: "buy_invest" }, { text: "➖ Собрать", callback_data: "sbor_invest" }],
					]
				}
			});
		}

		if(message.text == '💳 Кошелёк') {
			return bot.sendPhoto(message.chat.id, "ml1.png", {
				caption:`<b>Тут Вы можете пополнить и вывести накопленые средства</b>

 🆔 <b>Ваш ID:</b> <code>${message.from.id}</code>

💵 Ваш баланс: ${message.user.game_balance}₽
👥 Партнерский баланс: ${message.user.buybalance}₽
🗣 <b>Партнеров:</b> ${await User.countDocuments({ ref: message.from.id })} чел.`, 
				parse_mode: "HTML",
				reply_markup: {
					inline_keyboard: [
						[{ text: "➕ Пополнить", callback_data: "dep"}, { text: "➖ Вывести", callback_data: "withdraw" }],
						[{ text: "♻️ Реинвест", callback_data: "reinvest" }],
					]
				}
			});
		}
		
		if(message.text == '🗓 Обучение') {
			return bot.sendPhoto(message.chat.id, "ml4.png", {
				caption:`🎓 Попал в бота, но не знаешь, что делать? Тогда ознакомься с нашим минутным обучением:`,
				parse_mode: "HTML",
				reply_markup: {
					inline_keyboard: [
						[{ text: "➕ Открыть обучение", url: "https://telegra.ph/BMW-INVESTICII-06-01-4"}],
					]
				}
			});
		}
		
		if(message.text == '📠 Калькулятор') {
		state[uid] = 15
		return bot.sendPhoto(message.chat.id, "ml2.png", {
				caption:`<b>👉 Введите сумму которую хотите расчитать:</b>
`, 
			parse_mode: "HTML", 
				reply_markup: {
					keyboard: Cancel,
					resize_keyboard: true
				}
			
		})
	}

		if (message.text == '👔 Партнёрам') {
			return bot.sendPhoto(message.chat.id, "ml3.png", {
				caption:`<b>▪️ Наша партнерская программа считается самой эффективной, приглашай друзей и получай деньги</b>

💳 Процент с инвестиций: 10%
💵 Процент с выплаты: 5%

👥 Партнеров: ${await User.countDocuments({ ref: message.from.id })} чел.

<b>🔗 Ваша реф-ссылка:</b> https://t.me/BMW_MLBOT?start=${message.from.id}

<b>🔹 Внешняя реф-ссылка</b> https://teleg.run/BMW_MLBOT?start=${message.from.id}`, 
				parse_mode: "HTML"
			})
		}

		if (message.text == '⚙️ Настройки') {
		    var s = await User.findOne({ id: 0 })
			let t = new Date()
            t = t.getTime() - 1593648000 * 1000
			var day = t / 86400000 ^ 0
			let stats = {
				users: await User.countDocuments(),
				users_today: await User.find({ regDate: `${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}` }),
				cmds: message.message_id
			}
			stats.users_today = stats.users_today.length;

			return message.send(`<a href = "https://i.imgur.com/37SEsdv.jpg"> </a>️▪ Вы попали в раздел настройки бота, здесь вы можете посмотреть статистику, а также узнать информацию или отключить уведомления.
			
🌐 Дней работаем: ${day-328} дней
▪️ Всего инвесторов: ${stats.users}
▪️ Новых за 24 часа: ${stats.users_today}
`, {
				parse_mode: "HTML",
				reply_markup: {
					inline_keyboard: [
					    [{ text: "👨‍💻 Администратор", url: "https://t.me/test" }],
						[{ text: "📖Информация", url: "https://telegra.ph/BMW-INVESTICII-06-01-4" }, { text: "🔒Соглашение", url: "https://telegra.ph/Soglashenie-BMW-06-01" }],
						[{ text: "💬 Форум", url: "https://t.me/test1" }, { text: "📰 Новости", url: "https://t.me/newBMW_ML"}]
					    ]
				}
			});
		}
	}
			
		    
	if (ADMINS.indexOf(message.from.id) !== -1) {
		if (message.text == '/а' || message.text == '/a') {
			var h = process.uptime() / 3600 ^ 0
			var m = (process.uptime() - h * 3600) / 60 ^ 0
			var s = process.uptime() - h * 3600 - m * 60 ^ 0
			var heap = process.memoryUsage().rss / 1048576 ^ 0
			var b = (await User.findOne({ id: 0 })).deposit
			var br = (await User.findOne({ id: 0 })).payout

			return qiwi.getBalance(async (err, balance) => {
			bot.sendMessage(uid, '<b>Админ-панель:</b>\n\n<b>Аптайм бота:</b> ' + h + ' часов ' + m + ' минут ' + s + ' секунд\n<b>🕵Пользователей в боте: </b>' + (await User.countDocuments({})) + '\n<b>📊Памяти использовано:</b> ' + heap + "МБ\n<b>💶Заявок на вывод:</b> " + await Ticket.countDocuments() + "\n<b>🥝Баланс QIWI:</b> " + balance.accounts[0].balance.amount + "₽\n<b>Бонусы к пополнению:</b> " + b + "%", { parse_mode: "HTML", reply_markup: RM_admin })
			})
		}

		if (message.text.startsWith('/setbuybalance')) {
			let cmd = message.text.split(' ');
			if (!cmd[1]) return message.send('Ошибка!');

			let user = await User.findOne({ id: Number(cmd[1]) });
			if (!user) return message.send('Пользователь не найден!');

			await user.set('buybalance', Number(cmd[2]));
			return message.send('Баланс установлен.');
		}
		
		if (message.text.startsWith('/restart')) {
		  var id = message.user.id
		  ADMINS.map((a) => bot.sendMessage(a, `<a href="tg://user?id=${id}">Пользователь</a> перезагрузил бота!`, { parse_mode: "HTML" }))
			setTimeout(() => { process.exit(0) }, 333);
		}

		if (message.text.startsWith('/setoutbalance')) {
			let cmd = message.text.split(' ');
			if (!cmd[1]) return message.send('Ошибка!');

			let user = await User.findOne({ id: Number(cmd[1]) });
			if (!user) return message.send('Пользователь не найден!');

			await user.set('outbalance', Number(cmd[2]));
			return message.send('Баланс установлен.');
		}
	}
});

bot.on('callback_query', async (query) => {
	const { message } = query;
	message.user = await User.findOne({ id: message.chat.id });
	var uid = message.chat.id
	let dt = new Date
	console.log("[" + dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds() + "] Пользователь " + uid + " отправил колбэк: " + query.data)
	
	if (dt.getDate() == oplata) return message.send('Хостинг не оплачен!');

	if (!message.user) return bot.answerCallbackQuery(query.id, 'Что-то пошло не так...', true);

	if (query.data == 'none') return bot.answerCallbackQuery(query.id, 'Привет! :)', true);

	if (query.data.startsWith('topInv')) {
		bot.deleteMessage(message.chat.id, message.message_id)
		var top = await User.find({ id: { $ne: 0, $ne: 1 } }).sort({ payout: -1 }).limit(20)
		var c = 0
		return bot.sendMessage(uid, `<b>📤 Топ 20 по выводам:</b>\n\n${top.map((e) => { c++; return `<b>${c})</b> <a href="tg://user?id=${e.id}">${e.name ? e.name : "пользователь"}</a> - <b>${e.payout}₽</b>` }).join("\n")}`, { parse_mode: "html" });
	}
	
	if (query.data.startsWith('topVip')) {
		bot.deleteMessage(message.chat.id, message.message_id)
		var top = await User.find({ id: { $ne: 0, $ne: 1 } }).sort({ deposit: -1 }).limit(20)
		var c = 0
		return bot.sendMessage(uid, `<b>📥 Топ 20 инвесторов:</b>\n\n${top.map((e) => { c++; return `<b>${c})</b> <a href="tg://user?id=${e.id}">${e.name ? e.name : "пользователь"}</a> - <b>${e.deposit}₽</b>` }).join("\n")}`, { parse_mode: "html" });
	}
	
	if (query.data.startsWith('topCol')) {
		bot.deleteMessage(message.chat.id, message.message_id)
		var top = await User.find({ id: { $ne: 0, $ne: 1 } }).sort({ totalEarn: -1 }).limit(20)
		var c = 0
		return bot.sendMessage(uid, `<b>💻Топ 20 по доходу:</b>\n\n${top.map((e) => { c++; return `<b>${c})</b> <a href="tg://user?id=${e.id}">${e.name ? e.name : "пользователь"}</a> - <b>${e.totalEarn}💀</b>` }).join("\n")}`, { parse_mode: "html" });
	}

	if (query.data.startsWith('topRef')) {
		bot.deleteMessage(message.chat.id, message.message_id)
		var top = await User.find({ id: { $ne: 0, $ne: 1 } }).sort({ refCount: -1 }).limit(20)
		var c = 0
		return bot.sendMessage(uid, `<b>👥 Топ рефоводов:</b>\n\n${top.map((e) => { c++; return `<b>${c})</b> <a href="tg://user?id=${e.id}">${e.name ? e.name : "пользователь"}</a> - <b>${e.refCount}</b> рефералов` }).join("\n")}`, { parse_mode: "html" });
	}
	
	if (query.data == 'dep') {
		bot.deleteMessage(message.chat.id, message.message_id);
		return bot.sendMessage(message.chat.id, `Выберите способ пополнения`, {
			parse_mode: "HTML",
			reply_markup: {
			     inline_keyboard: [
			          [{ text: "🥝 QIWI", callback_data: "deposit_qiwi" }, { text: "🅿️ PAYEER", callback_data: "deposit_payeer" }],
			          ]
			}

		});
	}

	if (query.data == 'deposit_qiwi') {
		bot.deleteMessage(message.chat.id, message.message_id);

		var b = (await User.findOne({ id: 0 })).deposit
		if (b == 0) var bt = ""
		else var bt = `\n<b>🔥 Временная акция для остальных пополнений: +${b}% при любом пополнении</b>`
		return bot.sendMessage(message.chat.id, `🥝 <b>Способ пополнения: QIWI</b>
🌐 Отправьте любую сумму на кошелек <code>+998993314356</code>
❗️ Не забудьте комментарий <code>ml${message.chat.id}</code>

📥 <b>Для пополнения с помощью других способов обращайтесь к администратору</b> @test\n
${bt}`, {
			parse_mode: "HTML",
			reply_markup: {
			     inline_keyboard: [
			          [{ text: "🥝 Перейти к пополнению", url: "https://qiwi.com/p/79776983748" }],
			          ]
			}

		});
	}
	
	if (query.data == 'deposit_payeer') {
		bot.deleteMessage(message.chat.id, message.message_id);

		var br = (await User.findOne({ id: 0 })).deposit
		if (br == 0) var bt = ""
		else var bt = `\n<b>🔥 Временная акция для остальных пополнений: +${br}% при любом пополнении</b>`
		return bot.sendMessage(message.chat.id, `🅿️ <b>Способ пополнения: Payeer</b>
🌐 Отправьте любую сумму на кошелек <code>${config.payeer.account}</code>
❗️ Не забудьте комментарий <code>ml${message.chat.id}</code>

📥 <b>Для пополнения с помощью других способов обращайтесь к администратору</b> @test\n
${bt}`, {
			parse_mode: "HTML",
			reply_markup: {
			     inline_keyboard: [
			          [{ text: "🥝 Перейти к пополнению", url: "https://qiwi.com/p/79776983748" }],
			          ]
			}

		});
	}
	

	if (query.data == 'withdraw') {
		if (message.user.game_balance < 0) return bot.answerCallbackQuery(query.id,'🚫 Вы еще не делали инвестиций', true);
		if (message.user.outbalance < 50) return bot.answerCallbackQuery(query.id,'🚫 Минимальная сумма вывода: 50₽', true);
		bot.deleteMessage(message.chat.id, message.message_id);
		
		await message.user.set('menu', 'qiwi');
		await bot.sendMessage(message.chat.id, 'ведите номер QIWI кошелька для вывода:\nНапример: +79776983748', {
			reply_markup: {
				keyboard: Cancel,
				resize_keyboard: true
			}
		});
	}

	if (query.data == 'reinvest') {
		await message.user.set('menu', 'reinvest');
		return bot.sendMessage(message.chat.id, 'Введите сумму, которую хотите реинвестировать.', {
			reply_markup: {
				keyboard: Cancel,
				resize_keyboard: true
			}
		});
	}
	
	if (query.data == 'buy_invest') {
		bot.deleteMessage(message.chat.id, message.message_id);
		state[uid] = 13
		return bot.sendMessage(message.chat.id, `
<b>📭 Сумма которую Вы можете инвестировать:</b> ${message.user.game_balance}₽\n
<b>👉 Введите желаемую сумму для открытия вклада:</b>
`, {
			parse_mode: "HTML", 
				reply_markup: {
					keyboard: Cancel,
					resize_keyboard: true
				}
			
		})
	}
	
	if (query.data == 'sbor_invest') {
		bot.deleteMessage(message.chat.id, message.message_id);
		state[uid] = 14
		return bot.sendMessage(message.chat.id, `
<b>📭 Сумма которую Вы можете вывести с накопления:</b> ${message.user.accumulation_balance}₽\n
<b>👉 Введите желаемую сумму, которую хотите вывести с накоплений:</b>
`, {
			parse_mode: "HTML", 
				reply_markup: {
					keyboard: Cancel,
					resize_keyboard: true
				}
			
		})
	}

	if (query.data == 'game_prize_check') {

		var res = await bot.getChatMember("@newBMW_ML", message.chat.id)

		if (res.status == 'left') return bot.answerCallbackQuery(query.id, '❌ Вы не подписались на канал!', true);

		await bot.deleteMessage(message.chat.id, message.message_id);

		await User.findOneAndUpdate({ id: user.id }, { not: true })

		await message.user.save();

		return bot.sendMessage(message.chat.id, `🤝 <b>Вы подписались на все каналы.</b>`, {
			parse_mode: "HTML", 
				reply_markup: {
					keyboard: Start,
					resize_keyboard: true
				}
			
		})
	}

	

	if (query.data.startsWith('withdraw:')) {
		let id = Number(query.data.split('withdraw:')[1]);
		let ticket = await Ticket.findOne({ id });
	
		if (!ticket) bot.deleteMessage(message.chat.id, message.message_id);
		bot.sendMessage("@payoutBMW", `<a href="tg://user?id=${ticket.id}">Пользователь</a> вывел <b>${ticket.amount}₽</b>\nПС:QIWI`, { parse_mode: "HTML" })
	
		if (ticket.wallet.indexOf("P") == -1) { // Платёж через QIWI
		  qiwi.toWallet({ account: String(ticket.wallet), amount: ticket.amount, comment: 'Выплата от @BMW_MLBOT' }, () => { });
		}
		bot.sendMessage(ticket.id,` ✅ <b>Ваша выплата была одобрена</b>
	💸 На Ваш QIWI зачислено <b>${ticket.amount}₽</b>\n
	
	🙏 Будем очень признательны за отзыв о боте в чат
	☺️ Для нас это очень важно\n
	🤝 <b>Рады сотрудничать!</b>
	`, {
		  parse_mode: "html", reply_markup: {
			inline_keyboard: [
			  [{ text: "💬 Чат", url: "https://t.me/standoff2inv_chat" }],
	
			]
		  }
		});
		await User.findOneAndUpdate({ id: 0 }, { $inc: { fc: ticket.amount } })
		await User.findOneAndUpdate({ id: id }, { $inc: { payout: ticket.amount } }) 
	await ticket.remove();
		bot.editMessageText('Выплатил!', {
		  chat_id: message.chat.id,
		  message_id: message.message_id
		});
	  }

	if (query.data.startsWith('back:')) {
		let id = Number(query.data.split('back:')[1]);
		let ticket = await Ticket.findOne({ id });

		if (!ticket) bot.deleteMessage(message.chat.id, message.message_id);

		let user = await User.findOne({ id: ticket.id });
		bot.sendMessage(ticket.id, `Ваша выплата была отклонена, на ваш счёт возвращено ${ticket.amount}₽`);

		await user.inc('buybalance', ticket.amount);
		await ticket.remove();

		return bot.editMessageText('Вернул!', {
			chat_id: message.chat.id,
			message_id: message.message_id
		});
	}

	if (query.data.startsWith('take:')) {
		let id = Number(query.data.split('take:')[1]);
		let ticket = await Ticket.findOne({ id });

		if (!ticket) bot.deleteMessage(message.chat.id, message.message_id);

		await ticket.remove();
		return bot.editMessageText('Забрал!', {
			chat_id: message.chat.id,
			message_id: message.message_id
		});
	}
	var d = query.data

	if (ADMINS.indexOf(query.from.id) !== -1) {
		if (d == "admin_mm") {
			bot.deleteMessage(message.chat.id, message.message_id);
			bot.sendMessage(uid, 'Введите текст рассылки или отправьте изображение:\n\n<i>Для добавления кнопки-ссылки в рассылаемое сообщение добавьте в конец сообщения строку вида:</i>\n# Текст на кнопке # http://t.me/link #', { reply_markup: RM_admin_return, parse_mode: "HTML" })
			state[uid] = 7770
		} else if (d == "admin_w") {
			bot.deleteMessage(message.chat.id, message.message_id);
			let tickets = await Ticket.find();
			if (tickets.length == 0) return bot.sendMessage(uid, 'Заявок на вывод нет');
			await tickets.map((x) => {
				bot.sendMessage(uid, `📝 Игрок: <a href="tg://user?id=${x.id}">Игрок</a> (ID: <code>${x.id}</code>)\n
	💰 Сумма: <code>${x.amount}</code>₽
	🥝 Кошелёк: <code>${x.wallet}</code>`, {
					parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: '📭 Подтвердить выплату', callback_data: `withdraw:${x.id}` }], [{ text: '♻️ Вернуть', callback_data: `back:${x.id}` }], [{ text: '🚫 Забрать', callback_data: `take:${x.id}` }]] }
				});
			});
		}
		else if (d.startsWith("admin_bm")) {
			bot.deleteMessage(message.chat.id, message.message_id);
			var bm = JSON.parse((await User.findOne({ id: 1 })).menu)
			if (d.split("_")[2] == "false") bm.status = false
			if (d.split("_")[2] == "true") bm.status = true
			await User.updateOne({ id: 1, menu: JSON.stringify(bm) })
			console.log(bm)
			bot.sendMessage(uid, `Настройки ратуши:\n
Стоимость: ${bm.price} рублей
Статус: ${bm.status ? "✅ доступна для покупки" : "❌ недоступна для покупки"}
Доступно: ${bm.count}
Куплено: ${bm.bought}
`, {
				reply_markup: {
					inline_keyboard: [
						[{ text: 'Выпустить ратушу', callback_data: `Admin_bm_new` }],
						[{ text: 'Изменить стоимость', callback_data: `Admin_bm_price` }],
						[{ text: 'Изменить доступных', callback_data: `Admin_bm_count` }],
						[{ text: (bm.status ? 'Сделать непоступной' : "Сделать доступной"), callback_data: (bm.status ? 'admin_bm_false' : "admin_bm_true") }],
						[{ text: "◀️ Назад", callback_data: "admin_return" }],
					]
				}, parse_mode: "HTML"
			})
		}
		else if (d == "admin_top") {
			bot.deleteMessage(message.chat.id, message.message_id);
			var u = await User.find({ ref: { $ne: 0 }, _id: { $gt: mongo.Types.ObjectId.createFromTime(Date.now() / 1000 - 24 * 60 * 60) } })
			console.log(u)
			var top = []
			u.map((e) => {
				var t = top.filter(u => { if (e.ref == u.id) return true; else return false })
				if (t.length == 0) top.push({ id: e.ref, ref: 1 })
				else {
					top = top.filter(u => { if (e.ref == u.id) return false; else return true })
					top.push({ id: e.ref, ref: t[0].ref + 1 })
				}
			})
			top = top.sort((a, b) => { if (a.ref <= b.ref) return 1; else return -1 })
			top.length = 20
			var str = `<b>🕒 Топ рефоводов за 24 часа:</b>\n\n`
			for (const i in top) {
				var us = await User.findOne({ id: top[i].id })
				str += `<b>${Number(i) + 1})</b> <a href="tg://user?id=${us.id}">${us.name ? us.name : "Пользователь"}</a> - <b>${top[i].ref}</b> рефералов\n`
			}
			bot.sendMessage(uid, str, { reply_markup: { inline_keyboard: [[{ text: "◀️ Назад", callback_data: "admin_return" }]] }, parse_mode: "HTML" })
		}
		else if (d == "Admin_bm_new") {
			bot.deleteMessage(message.chat.id, message.message_id);
			bot.sendMessage(uid, 'Введите количество ратуши для продажи (число купивших обнулится, и ратуша станет автоматически доступна для покупки по текущей стоимости и пропадут с покупки, когда число купивших привысит доступное количество):', { reply_markup: { inline_keyboard: [[{ text: "◀️ Назад", callback_data: "admin_bm" }]] }, parse_mode: "HTML" })
			state[uid] = 77771
		}
		else if (d == "Admin_bm_price") {
			bot.deleteMessage(message.chat.id, message.message_id);
			bot.sendMessage(uid, 'Введите новую стоимость ратуши в рублях:', { reply_markup: { inline_keyboard: [[{ text: "◀️ Назад", callback_data: "admin_bm" }]] }, parse_mode: "HTML" })
			state[uid] = 77772
		}
		else if (d == "Admin_bm_count") {
			bot.deleteMessage(message.chat.id, message.message_id);
			bot.sendMessage(uid, 'Введите новое количество доступных ратуш:', { reply_markup: { inline_keyboard: [[{ text: "◀️ Назад", callback_data: "admin_bm" }]] }, parse_mode: "HTML" })
			state[uid] = 77773
		}
		else if (d == "admin_b") {
			bot.deleteMessage(message.chat.id, message.message_id);
			bot.sendMessage(uid, 'Введите % для 🥝 бонуса к пополнению или 0 для отключения:', { reply_markup: RM_admin_return, parse_mode: "HTML" })
			state[uid] = 7771
		}
		else if (d == "admin_br") {
			bot.deleteMessage(message.chat.id, message.message_id);
			bot.sendMessage(uid, 'Введите % для 🅿️ бонуса  к пополнению или 0 для отключения:', { reply_markup: RM_admin_return, parse_mode: "HTML" })
			state[uid] = 7771222
		}
		else if (d == "admin_u") {
			bot.deleteMessage(message.chat.id, message.message_id);
			bot.sendMessage(uid, 'Введите ID пользователя:', { reply_markup: RM_admin_return, parse_mode: "HTML" })
			state[uid] = 7772
		}
		else if (d.split("_")[0] == "addBuyBal") {
			bot.deleteMessage(message.chat.id, message.message_id);
			bot.sendMessage(uid, 'Введите сумму пополнения баланса для покупок пользователя:', { reply_markup: RM_admin_return, parse_mode: "HTML" })
			state[uid] = 7773
			data[uid] = d.split("_")[1]
		}
		else if (d.split("_")[0] == "addOutBal") {
			bot.deleteMessage(message.chat.id, message.message_id);
			bot.sendMessage(uid, 'Введите сумму пополнения баланса для вывода пользователя:', { reply_markup: RM_admin_return, parse_mode: "HTML" })
			state[uid] = 7774
			data[uid] = d.split("_")[1]
		}
		else if (d.split("_")[0] == "addBHIVEBal") {
			bot.deleteMessage(message.chat.id, message.message_id);
			bot.sendMessage(uid, 'Введите сумму пополнения WAVES баланса пользователя:', { reply_markup: RM_admin_return, parse_mode: "HTML" })
			state[uid] = 77745
			data[uid] = d.split("_")[1]
		}
		else if (d.split("_")[0] == "addPayIns") {
			bot.deleteMessage(message.chat.id, message.message_id);
			bot.sendMessage(uid, 'Введите сумму для добавления в сумму пополнений пользователя:', { reply_markup: RM_admin_return, parse_mode: "HTML" })
			state[uid] = 777455
			data[uid] = d.split("_")[1]
		}
		else if (d.split("_")[0] == "addPayOuts") {
			bot.deleteMessage(message.chat.id, message.message_id);
			bot.sendMessage(uid, 'Введите сумму для добавления в сумму выводов пользователя:', { reply_markup: RM_admin_return, parse_mode: "HTML" })
			state[uid] = 77745555
			data[uid] = d.split("_")[1]
		}
		else if (d.split("_")[0] == "editBuyBal") {
			bot.deleteMessage(message.chat.id, message.message_id);
			bot.sendMessage(uid, 'Введите новый баланс для покупок пользователя:', { reply_markup: RM_admin_return, parse_mode: "HTML" })
			state[uid] = 7775
			data[uid] = d.split("_")[1]
		}
		else if (d.split("_")[0] == "editOutBal") {
			bot.deleteMessage(message.chat.id, message.message_id);
			bot.sendMessage(uid, 'Введите новый баланс для вывода пользователя:', { reply_markup: RM_admin_return, parse_mode: "HTML" })
			state[uid] = 7776
			data[uid] = d.split("_")[1]
		}
		else if (d.split("_")[0] == "editBHIVEBal") {
			bot.deleteMessage(message.chat.id, message.message_id);
			bot.sendMessage(uid, 'Введите новый WAVES баланс пользователя:', { reply_markup: RM_admin_return, parse_mode: "HTML" })
			state[uid] = 77765
			data[uid] = d.split("_")[1]
		}
		else if (d.split("_")[0] == "editPayIns") {
			bot.deleteMessage(message.chat.id, message.message_id);
			bot.sendMessage(uid, 'Введите новую сумму пополнений пользователя:', { reply_markup: RM_admin_return, parse_mode: "HTML" })
			state[uid] = 777655
			data[uid] = d.split("_")[1]
		}
		else if (d.split("_")[0] == "editPayOuts") {
			bot.deleteMessage(message.chat.id, message.message_id);
			bot.sendMessage(uid, 'Введите новую сумму выводов пользователя:', { reply_markup: RM_admin_return, parse_mode: "HTML" })
			state[uid] = 77765555
			data[uid] = d.split("_")[1]
		}
		
		else if (d == "admin_mm_stop") {
			var tek = Math.round((mm_i / mm_total) * 40)
			var str = ""
			for (var i = 0; i < tek; i++) str += "+"
			str += '>'
			for (var i = tek + 1; i < 41; i++) str += "-"
			mm_status = false;
			bot.editMessageText("Рассылка остановлена!", { chat_id: mm_achatid, message_id: mm_amsgid })
			mm_u = []
		}
		else if (d == "admin_mm_pause") {
			var tek = Math.round((mm_i / mm_total) * 40)
			var str = ""
			for (var i = 0; i < tek; i++) str += "+"
			str += '>'
			for (var i = tek + 1; i < 41; i++) str += "-"
			bot.editMessageText("<b>Выполнено:</b> " + mm_i + '/' + mm_total + ' - ' + Math.round((mm_i / mm_total) * 100) + '%\n' + str + "\n\n<b>Статистика:</b>\n<b>Успешных:</b> " + mm_ok + "\n<b>Неуспешных:</b> " + mm_err, { chat_id: mm_achatid, message_id: mm_amsgid, reply_markup: RM_mm2, parse_mode: html })
			mm_status = false;
		}
		else if (d == "admin_mm_play") {
			mm_status = true;
			bot.editMessageText("Выполнено: " + mm_i + '/' + mm_total + ' - ' + Math.round((mm_i / mm_total) * 100) + '%\n', { chat_id: mm_achatid, message_id: mm_amsgid, reply_markup: RM_mm1 })
		}
		else if (d.split("_")[0] == "ban") {
			var uuid = Number(d.split("_")[1])
			await User.findOneAndUpdate({ id: uuid }, { ban: true })
			bot.editMessageText('<a href="tg://user?id=' + uuid + '">Пользователь</a> заблокирован!', { chat_id: uid, message_id: message.message_id, parse_mode: html })
		}
		else if (d.split("_")[0] == "unban") {
			var uuid = Number(d.split("_")[1])
			await User.findOneAndUpdate({ id: uuid }, { ban: false })
			bot.editMessageText('<a href="tg://user?id=' + uuid + '">Пользователь</a> разбанен!', { chat_id: uid, message_id: message.message_id, parse_mode: html })
		}
		
		else if (d == "admin_return") {
			bot.deleteMessage(message.chat.id, message.message_id);
			var h = process.uptime() / 3600 ^ 0
			var m = (process.uptime() - h * 3600) / 60 ^ 0
			var s = process.uptime() - h * 3600 - m * 60 ^ 0
			var heap = process.memoryUsage().rss / 1048576 ^ 0
			var b = (await User.findOne({ id: 0 })).deposit
             var br = (await User.findOne({ id: 0 })). payout

			return qiwi.getBalance(async (err, balance) => {
				bot.sendMessage(uid, '<b>Админ-панель:</b>\n\n<b>🕰Аптайм бота:</b> ' + h + ' часов ' + m + ' минут ' + s + ' секунд\n<b>👲Пользователей в боте: </b>' + (await User.countDocuments({})) + '\n<b>💾Памяти использовано:</b> ' + heap + "МБ\n<b>📮Заявок на вывод:</b> " + await Ticket.countDocuments() + "\n<b>🔐Баланс QIWI:</b> " + balance.accounts[0].balance.amount + "₽\n<b>🔢Бонус к пополнению:</b> " + b + "%", { parse_mode: "HTML", reply_markup: RM_admin })
			})
		}
	}
});

var state = []


User.prototype.inc = function (field, value = 1) {
	this[field] += value;
	return this.save();
}

User.prototype.dec = function (field, value = 1) {
	this[field] -= value;
	return this.save();
}

User.prototype.set = function (field, value) {
	this[field] = value;
	return this.save();
}



var lastTxnId
async function payeerCheck() {
  require('request')({
    method: 'POST',
    url: 'https://payeer.com/ajax/api/api.php?history',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `account=${config.payeer.account}&apiId=${config.payeer.apiId}&apiPass=${config.payeer.apiPass}&action=history&count=1&type=incoming
 ` }, async function (error, response, body) {
    body = JSON.parse(body)
    for (const txnId in body.history) {
      if (lastTxnId == null) { lastTxnId = txnId; }
      else if (txnId != lastTxnId) {
        lastTxnId = txnId
        if (body.history[txnId].type != "transfer" || body.history[txnId].status != "success" || !body.history[txnId].comment) return;
       /* if (body.history[txnId].comment.startsWith('ZG')) {
          let id = Number(body.history[txnId].comment.split("ZG")[1]);
          let user = await User.findOne({ id });
          if (!user) return;
          await user.inc('game_payin', x.sum.amount);
          await user.inc('game_balance', x.sum.amount);
          await bot.sendMessage(id, `💳 Вы успешно пополнили свой игровой баланс на ${x.sum.amount}₽`);
          //bot.sendMessage("@UzPay_Balance", `⚡️ <a href="tg://user?id=${id}">Пользователь</a> пополнил игровой баланс на <b>${x.sum.amount}₽</b>`, { parse_mode: "HTML" })
          return
        }  */

        let user = await User.findOne({ id: Number(body.history[txnId].comment.split("ml")[1]) });
        if (!user) return;
        if (body.history[txnId].creditedCurrency == "RUB")
          var sum = roundPlus(Number(body.history[txnId].creditedAmount))
        else return
        var id = user.id

        var b = (await User.findOne({ id: 0 })).deposit

        if (b == 0) {
          await user.inc('deposit', sum);
          await user.inc('game_balance', sum);
          await User.findOneAndUpdate({ id: 0 }, { $inc: { ref: sum } })
          bot.sendMessage(id, `Ваш баланс пополнен на ${sum}₽`);
		      //bot.sendMessage("@UzPay_Balance", `<a href="tg://user?id=${id}">Пользователь</a> пополнил <b>${sum}₽</b>\nПС: PAYEER`, { parse_mode: "HTML" })
          ADMINS.map((a) => bot.sendMessage(a, `<a href="tg://user?id=${id}">Игрок</a> сделал депозит: ${sum}₽\nПС: PAYEER`, { parse_mode: "HTML" }))
        } else {
          await user.inc('deposit', sum);
          b = b / 100
          await user.inc('game_balance', sum + sum * b);
          await User.findOneAndUpdate({ id: 0 }, { $inc: { ref: sum } })
          bot.sendMessage(id, `Ваш баланс пополнен на ${sum}₽ и Вы получаете бонус - ${roundPlus(sum * b)}₽!`);
		      //bot.sendMessage("@UzPay_Balance", `<a href="tg://user?id=${id}">Пользователь</a> пополнил <b>${sum}₽ и получил бонус - ${roundPlus(sum * b)}p!</b>\nПС: PAYEER`, { parse_mode: "HTML" })
	
          ADMINS.map((a) => bot.sendMessage(a, `<a href="tg://user?id=${id}">Игрок</a> сделал депозит: ${sum}₽ + ${roundPlus(sum * b)}₽ бонус\nПС: PAYEER`, { parse_mode: "HTML" }))
        }
        await User.findOneAndUpdate({ id: user.ref }, { $inc: { game_balance: roundPlus(sum * 0.05) } })
        bot.sendMessage(user.ref, `🤝 Ваш <a href="tg://user?id=${id}">реферал</a> пополнил баланс на <b>${sum}₽</b>!\n💸 Вам начислено по <b>${roundPlus(sum * 0.05)}₽</b> на балансы для покупок и для вывода`, { parse_mode: "HTML" }).catch()
      }
    }
  })
}

if (config.payeer.enabled) {
  setInterval(payeerCheck, 10000)
  payeerCheck()
}

var state = []

setInterval(async () => {
	qiwi.getOperationHistory({ rows: 10, operation: 'IN' }, (err, response) => {
		response.data.map(async (x) => {
			if (!x.comment) return;
			if (txnId.indexOf(x.txnId) !== -1) return;
			if (x.comment.startsWith('ml')) {
			let id = Number(x.comment.split("ml")[1]);
			if (!id) return;
			let user = await User.findOne({ id });
			if (!user) return;
			if (x.sum.currency != 643) return;
			var b = (await User.findOne({ id: 0 })).deposit / 200
			var sum = x.sum.amount
			if (b > 0) {
				await user.inc('deposit', x.sum.amount);
				if (user.deposit + x.sum.amount > 50000 && !user.not) {
					await bot.sendMessage(id, `💰 Вы пополнили баланс бота более, чем на 200₽ и приглашаетесь в чат инвесторов!\nПерешлите это сообщение администратору @Dima9606`);
					await User.findOneAndUpdate({ id: user.id }, { not: true })
				}

				await user.inc('game_balance', x.sum.amount + x.sum.amount * b);
				await User.findOneAndUpdate({ id: 0 }, { $inc: { ref: x.sum.amount } })
				bot.sendMessage(id, `Ваш баланс пополнен на ${x.sum.amount}₽ и Вы получаете бонус - ${roundPlus(x.sum.amount * b)}₽!`);
				//bot.sendMessage("@payoutBMW", `💀 <a href="tg://user?id=${id}">Пользователь</a> пополнил баланс на <b>${x.sum.amount}₽</b> и получил ${roundPlus(x.sum.amount * b)}₽ бонусом!\nПС: QIWI`, { parse_mode: "HTML" })
				ADMINS.map((a) => bot.sendMessage(a, `<a href="tg://user?id=${id}">Игрок</a> сделал депозит: ${x.sum.amount}₽ + ${roundPlus(x.sum.amount * b)}₽ бонус\nПС: QIWI`, { parse_mode: "HTML" }))

			}
			else if (b == 0) {
				await user.inc('deposit', x.sum.amount);
				if (user.deposit + x.sum.amount > 500000 && !user.not) {
					await bot.sendMessage(id, `💰 Вы пополнили баланс бота более, чем на 200₽ и приглашаетесь в чат инвесторов!\nПерешлите это сообщение администратору @Dima9606`);
					await User.findOneAndUpdate({ id: user.id }, { not: true })
				}
				await user.inc('game_balance', x.sum.amount);
				await User.findOneAndUpdate({ id: 0 }, { $inc: { ref: x.sum.amount } })
				bot.sendMessage(id, `Ваш баланс пополнен на ${x.sum.amount}₽`);
				//bot.sendMessage("@payoutBMW", `💀 <a href="tg://user?id=${id}">Пользователь</a> пополнил баланс на <b>${x.sum.amount}₽</b>\nПС: QIWI`, { parse_mode: "HTML" })
				ADMINS.map((a) => bot.sendMessage(a, `<a href="tg://user?id=${id}">Игрок</a> сделал депозит: ${x.sum.amount}₽\nПС: QIWI`, { parse_mode: "HTML" }))
			} else {
				await user.inc('deposit', x.sum.amount);
				if (user.deposit + x.sum.amount > 500000 && !user.not) {
					await bot.sendMessage(id, `💰 Вы пополнили баланс бота более, чем на 200₽ и приглашаетесь в чат инвесторов!\nПерешлите это сообщение администратору @Dima9606`);
					await User.findOneAndUpdate({ id: user.id }, { not: true })
				}
				b = b / 200
				await user.inc('game_balance', x.sum.amount + x.sum.amount * b);
				await User.findOneAndUpdate({ id: 0 }, { $inc: { ref: x.sum.amount } })
				bot.sendMessage(id, `Ваш баланс пополнен на ${x.sum.amount}₽ и Вы получаете бонус - ${roundPlus(x.sum.amount * b)}₽!`);
				//bot.sendMessage("@payoutBMW", `💀️ <a href="tg://user?id=${id}">Пользователь</a> пополнил баланс на <b>${x.sum.amount}₽</b> и получил ${roundPlus(x.sum.amount * b)}₽ бонусом!\nПС: QIWI`, { parse_mode: "HTML" })
				ADMINS.map((a) => bot.sendMessage(a, `<a href="tg://user?id=${id}">Игрок</a> сделал депозит: ${x.sum.amount}₽ + ${roundPlus(x.sum.amount * b)}₽ бонус`, { parse_mode: "HTML" }))

			}
			await User.findOneAndUpdate({ id: user.ref }, { $inc: { buybalance: roundPlus(x.sum.amount * 0.10) } })
			await User.findOneAndUpdate({ id: user.ref }, { $inc: { outbalance: roundPlus(x.sum.amount * 0.08) } })

			bot.sendMessage(user.ref, `🤝 Ваш <a href="tg://user?id=${id}">реферал</a> пополнил баланс на <b>${x.sum.amount}₽</b>!\n💸 Вам начислено по <b>${roundPlus(x.sum.amount * 0.08)}₽</b>`, { parse_mode: "HTML" }).catch()

			txnId.push(x.txnId)
			require('fs').writeFileSync('./txnId.json', JSON.stringify(txnId));
			}
		});
	});
}, 10000);

async function mmTick() {
	if (mm_status) {
		try {
			mm_i++
			if (mm_type == "text") {
				if (mm_btn_status)
					bot.sendMessage(mm_u[mm_i - 1], mm_text, { reply_markup: { inline_keyboard: [[{ text: mm_btn_text, url: mm_btn_link }]] }, parse_mode: html }).then((err) => { mm_ok++ }).catch((err) => { mm_err++ })
				else
					bot.sendMessage(mm_u[mm_i - 1], mm_text, { parse_mode: html }).then((err) => { console.log((mm_i - 1) + ') ID ' + mm_u[mm_i - 1] + " OK"); mm_ok++ }).catch((err) => { mm_err++ })
			}
			else if (mm_type == "img") {
				if (mm_btn_status)
					bot.sendPhoto(mm_u[mm_i - 1], mm_imgid, { caption: mm_text, reply_markup: { inline_keyboard: [[{ text: mm_btn_text, url: mm_btn_link }]] } }).then((err) => { mm_ok++ }).catch((err) => { mm_err++ })
				else
					bot.sendPhoto(mm_u[mm_i - 1], mm_imgid, { caption: mm_text }).then((err) => { console.log((mm_i - 1) + ') ID ' + mm_u[mm_i - 1] + " OK"); mm_ok++ }).catch((err) => { mm_err++ })
			}
			if (mm_i % 10 == 0) {
				var tek = Math.round((mm_i / mm_total) * 40)
				var str = ""
				for (var i = 0; i < tek; i++) str += "+"
				str += '>'
				for (var i = tek + 1; i < 41; i++) str += "-"
				bot.editMessageText("<b>Выполнено:</b> " + mm_i + '/' + mm_total + ' - ' + Math.round((mm_i / mm_total) * 100) + '%\n' + str + "\n\n<b>Статистика:</b>\n<b>Успешных:</b> " + mm_ok + "\n<b>Неуспешных:</b> " + mm_err, { chat_id: mm_achatid, message_id: mm_amsgid, reply_markup: RM_mm1, parse_mode: html })
			}
			if (mm_i == mm_total) {
				mm_status = false;
				bot.editMessageText("Выполнено: " + mm_i + '/' + mm_total, { chat_id: mm_achatid, message_id: mm_amsgid })
				sendAdmins('<b>Рассылка завершена!\n\nСтатистика:\nУспешно:</b> ' + mm_ok + "\n<b>Неуспешно:</b> " + mm_err, { parse_mode: html })
				mm_u = []
			}
		} finally { }
	}
}

setInterval(mmTick, 100);

var mm_total
var mm_i
var mm_status = false
var mm_amsgid
var mm_type
var mm_imgid
var mm_text
var mm_achatid
var mm_btn_status
var mm_btn_text
var mm_btn_link
var mm_ok
var mm_err

async function mm_t(text, amsgid, achatid, btn_status, btn_text, btn_link, size) {
	let ut = await User.find({}, { id: 1 }).sort({ _id: -1 })
	mm_total = ut.length
	console.log(ut)
	mm_u = []
	for (var i = 0; i < mm_total; i++)
		mm_u[i] = ut[i].id
	if (size != 100) {
		mm_u = randomizeArr(mm_u)
		mm_total = Math.ceil(mm_total * (size / 100))
		mm_u.length = mm_total
	}
	ut = undefined
	mm_i = 0;
	mm_amsgid = amsgid
	mm_type = "text"
	mm_text = text
	mm_ok = 0
	mm_err = 0
	mm_achatid = achatid
	if (btn_status) {
		mm_btn_status = true
		mm_btn_text = btn_text
		mm_btn_link = btn_link
	}
	else
		mm_btn_status = false
	mm_status = true;
}

bot.on('photo', async msg => {
	if (msg.from != undefined) {
		var uid = msg.from.id
		if (state[uid] == 7770 && ADMINS.indexOf(uid) !== -1) {
			state[uid] = undefined
			var text = ""
			if (msg.caption != undefined) text = msg.caption
			bot.sendMessage(uid, "Рассылка запущена!").then((e) => {
				if (text.split("#").length == 4) {
					var btn_text = text.split("#")[1].split("#")[0].replace(/(^\s*)|(\s*)$/g, '')
					var btn_link = text.split("#")[2].split("#")[0].replace(/(^\s*)|(\s*)$/g, '')
					text = text.split("#")[0].replace(/(^\s*)|(\s*)$/g, '').replace(' ', '')
					mm_img(msg.photo[msg.photo.length - 1].file_id, text, e.message_id, e.chat.id, true, btn_text, btn_link, 100)

				}
				else
					mm_img(msg.photo[msg.photo.length - 1].file_id, text, e.message_id, e.chat.id, false, false, false, 100)

			})
		}
	}
})



async function mm_img(img, text, amsgid, achatid, btn_status, btn_text, btn_link, size) {
	let ut = await User.find({}, { id: 1 }).sort({ _id: -1 })
	mm_total = ut.length
	mm_u = []
	for (var i = 0; i < mm_total; i++)
		mm_u[i] = ut[i].id
	if (size != 100) {
		mm_u = randomizeArr(mm_u)
		mm_total = Math.ceil(mm_total * (size / 100))
		mm_u.length = mm_total
	}

	ut = undefined
	mm_i = 0;
	mm_amsgid = amsgid
	mm_type = "img"
	mm_text = text
	mm_imgid = img
	mm_ok = 0
	mm_err = 0
	mm_achatid = achatid
	if (btn_status) {
		mm_btn_status = true
		mm_btn_text = btn_text
		mm_btn_link = btn_link
	}
	else
		mm_btn_status = false
	mm_status = true;
}

function randomizeArr(arr) {
	var j, temp;
	for (var i = arr.length - 1; i > 0; i--) {
		j = Math.floor(Math.random() * (i + 1));
		temp = arr[j];
		arr[j] = arr[i];
		arr[i] = temp;
	}
	return arr;
}

const html = "HTML"

function sendAdmins(text, params) { for (var i = 0; i < ADMINS.length; i++) bot.sendMessage(ADMINS[i], text, params) }

var data = []


function roundPlus(number) { if (isNaN(number)) return false; var m = Math.pow(10, 2); return Math.round(number * m) / m; }

async function main() {
	var u = (await User.find({}, { id: 1 })).map((e) => { return e.id })
	for (var i in u) {
		await User.findOneAndUpdate({ id: u[i] }, { refCount: await User.countDocuments({ ref: u[i] }) })
		console.log(i)
	}

}
//main()

//User.updateMany({}, {payout: 0, not: false}).then()


async function ticker() {
	var d = new Date()
	var minutes = d.getMinutes()
	var hours = d.getHours()
	var date = d.getDate()
	if (minutes == 0 && hours == 0)
		await User.updateMany({}, { game_limit: 10, spinsToday: 0 })
}

setInterval(ticker, 1000 * 60)





function randomizeArr(arr) {
	var j, temp;
	for (var i = arr.length - 1; i > 0; i--) {
		j = Math.floor(Math.random() * (i + 1));
		temp = arr[j];
		arr[j] = arr[i];
		arr[i] = temp;
	}
	return arr;
}


/*
WildBee.insertMany([{ creator_id: 292966454, start_time: Date.now(), level: 1, bee_profit: 0 }]).then()
*/

function randomInteger(min, max) {
	// случайное число от min до (max+1)
	let rand = min + Math.random() * (max + 1 - min);
	return Math.floor(rand);
}

let lastAddProfit = 18720;

async function addProfit() {
  if ( Math.floor(Date.now() / 86400) > lastAddProfit) {
    let allUsers = await User.find({});
    allUsers.map(async user => {
      await user.updateOne({accumulation_balance: user.accumulation_balance + Math.floor(user.deposit_balance * 0.05)})
      /*if (user.deposit_balance > 100) {
      await bot.sendMessage(user.id,`За 24 часа Вы накопили ${user.deposit_balance * 0.05}₽`, { parse_mode: "html" });
          }*/
      });
      lastAddProfit = Math.floor(Date.now() / 86400);      
   }
 }
 
setInterval(addProfit,24 * 60 * 60 * 1000);

User.insertMany([
{ "_id" : "5dfaac928d3ea75ef63263ba", "trees": [ ], "id" : 0, "buybalance" : 0,
"deposit_balance" : 0, "outbalance": 0, "bhivebalance" :0, "wb_profits" : 0, "name" : "Infix ©", "fc" : 0, "ref" : 0., "regDate" : "18/12/2019", "deposit" : 0, "payout" : 0, "fetuses" : 0, "menu" : "{\"price\":20,\"status\":false,\"count\":5,\"bought\":3}", "lastCollect" : 1576709266975, "ban" : false, "refCount" : 0, "not" : false, "__v" : 0, "totalEarn" : 0, "prudLevel" : 0 },
{ "_id" : "5dfbe31493b06e7818e2c5d7", "trees" : [ ], "id" : 1, "menu" : "{\"price\":20,\"status\":true,\"count\":5,\"bought\":3}", "__v" : 0, "totalEarn" : 0, "prudLevel" : 0 }
]).then()

function getTimeString() {
    var date = new Date()
    var day = String(date.getDate())
    if (day.length == 1) day = "0" + day
    var month = String(date.getMonth() + 1)
    if (month.length == 1) month = "0" + month
    var year = date.getFullYear()
    var hour = String(date.getHours() + 3)
    if (hour.length == 1) hour = "0" + hour
    var minute = String(date.getMinutes())
    if (minute.length == 1) minute = "0" + minute
    var second = String(date.getSeconds())
    if (second.length == 1) second = "0" + second
    return `${day}.${month}.${year}\n ${hour}:${minute}:${second}`
}
