require("dotenv").config();
const TelegramBot = require('node-telegram-bot-api');
const questions = require('./questions');

// Use environment variable for security
const token = process.env.TELEGRAM_BOT_TOKEN;
console.log("Starting bot in polling mode...");

// Create bot instance (polling mode for local testing)
const bot = new TelegramBot(token, { polling: true });

// Greeting message
bot.onText(/\/start/, (msg) => {
    console.log("Received /start");
  const chatId = msg.chat.id;

  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: questions.map(q => [
        { text: q.question, callback_data: q.question }
      ])
    }
  };

  bot.sendMessage(chatId, "👋 Welcome to Solution Planets! Choose a question:", inlineKeyboard);
});

bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  const question = query.data;
  const found = questions.find(q => q.question === question);
  if (found) bot.sendMessage(chatId, found.answer);
});
/* 
  const message = "👋 Welcome to *Solution Planets*! Please select a question:";
  
  const options = {
    reply_markup: {
      keyboard: questions.map(q => [q.question]),
      resize_keyboard: true,
      one_time_keyboard: true
    },
    parse_mode: "Markdown"
  };

  bot.sendMessage(chatId, message, options);
}); */

// Handle question selection
/* bot.on('message', (msg) => {
    console.log("Received:", msg.text);
  const chatId = msg.chat.id;
  const userQuestion = msg.text;

  const found = questions.find(q => q.question === userQuestion);
  if (found) {
    bot.sendMessage(chatId, found.answer);
  }
});
 */