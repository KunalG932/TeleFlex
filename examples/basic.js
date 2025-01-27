const { Telegraf } = require('telegraf');
const TeleFlex = require('../src/teleflex');

// Replace with your bot token
const bot = new Telegraf(process.env.BOT_TOKEN || '7804333993:AAF0SUsGa7SViu5-HH7fcKinqHjQtrFokJo');

const teleflex = new TeleFlex(bot, {
  modulesPath: __dirname + '/modules',
  floodWait: 2000,
  helpMenuTitle: "HII ITS A TEST MESSAGE",
  buttonsPerPage: 5,
});

teleflex.setupHandlers();

// Add some basic commands
bot.command('start', (ctx) => {
  ctx.reply('Welcome! Use /help to see available commands.');
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM')); 