const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const questions = require('./questions');

const app = express();
app.use(bodyParser.json());

const token = process.env.TELEGRAM_BOT_TOKEN;
const PORT = process.env.PORT || 8080;
const webhookUrl = `${process.env.CLOUD_RUN_SERVICE_URL}/bot${token}`;

// Initialize bot with webhook configuration
const bot = new TelegramBot(token);

// Set webhook (do this after server starts, or handle the promise)
bot.setWebHook(webhookUrl).then(() => {
  console.log('Webhook set successfully');
}).catch(err => {
  console.error('Error setting webhook:', err);
});

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

// Handle all messages
bot.on('message', (msg) => {
  // Ignore /start command as it's already handled
  if (msg.text === '/start') return;
  
  const chatId = msg.chat.id;
  const userMessage = msg.text;
  const question = questions.find(q => q.question === userMessage);
  if (question) {
    bot.sendMessage(chatId, question.answer);
  }else {
    // Send typing indicator
    bot.sendChatAction(chatId, 'typing');
    
    // Get AI-generated response for non-predefined questions
    //const aiResponse = await getAIResponse(userMessage);
    bot.sendMessage(chatId, 'I am not trained to answer this question yet. Our experts at Solution Planets can help you.');
  }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




