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

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// Set webhook (do this after server starts, or handle the promise)
bot.setWebHook(webhookUrl).then(() => {
  console.log('Webhook set successfully');
}).catch(err => {
  console.error('Error setting webhook:', err);
});

// Function to get AI-generated response
async function getAIResponse(userMessage) {
  try {
    const prompt = `You are a helpful assistant for Solution Planets company. 
    A user asked: "${userMessage}"
    
    Please provide a helpful, professional, and concise response. If the question is about Solution Planets 
    and you don't have specific information, politely let them know they can contact the company directly for detailed information.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return "I apologize, but I'm having trouble processing your question right now. Please try again later or contact our support team directly.";
  }
}

// Webhook endpoint
app.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Bot is running!');
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
bot.on('message', async (msg) => {
  // Ignore /start command as it's already handled
  if (msg.text === '/start') return;
  
  const chatId = msg.chat.id;
  const userMessage = msg.text;
  
  // Check if it's a predefined question
  const question = questions.find(q => q.question === userMessage);
  
  if (question) {
    // Send predefined answer
    bot.sendMessage(chatId, question.answer);
  } else {
    // Send typing indicator
    bot.sendChatAction(chatId, 'typing');
    
    // Get AI-generated response for non-predefined questions
    const aiResponse = await getAIResponse(userMessage);
    bot.sendMessage(chatId, aiResponse);
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));





