const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const questions = require('./questions');

const app = express();
app.use(bodyParser.json());

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token);
//const webhookUrl = `${process.env.GCP_URL}/bot${token}`;

// Set webhook URL
//bot.setWebHook(webhookUrl);

// Webhook endpoint
app.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Handle Telegram commands and messages
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const options = {
    reply_markup: {
      keyboard: questions.map(q => [q.question]),
      resize_keyboard: true,
      one_time_keyboard: true
    }
  };
  bot.sendMessage(chatId, "👋 Welcome to Solution Planets! Choose a question:", options);
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const question = questions.find(q => q.question === msg.text);
  if (question) {
    bot.sendMessage(chatId, question.answer);
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

