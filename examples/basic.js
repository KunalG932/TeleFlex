const { Telegraf } = require('telegraf');
const TeleFlex = require('../src/teleflex');
require('dotenv').config();

// Get bot token from environment variables
const bot = new Telegraf(process.env.BOT_TOKEN);

// Initialize TeleFlex with custom options
const teleflex = new TeleFlex(bot, {
    // Path to modules directory (relative to this file)
    modulesPath: __dirname + '/modules',
    
    // Customize flood control (rate limiting)
    floodWait: 2000,
    
    // Number of buttons per page in menus
    buttonsPerPage: 5,
    
    // Customize text messages
    texts: {
        helpMenuTitle: '🤖 Bot Commands Menu',
        helpMenuIntro: 'Here are all available modules ({count}):\n{modules}\n\nSelect a module to see its commands.',
        moduleHelpTitle: '📚 {moduleName} Help',
        moduleHelpIntro: 'Available commands:\n{helpText}',
        noModulesLoaded: '⚠️ No modules are currently available.',
        backButton: '◀️ Back to Menu',
        prevButton: '⬅️ Previous',
        nextButton: '➡️ Next',
        floodMessage: '⏳ Please wait a moment before clicking again'
    }
});

// Set up TeleFlex handlers
teleflex.setupHandlers();

// Basic bot commands
bot.command('start', async (ctx) => {
    await ctx.reply(
        '👋 Welcome to the TeleFlex Demo Bot!\n\n' +
        'This bot demonstrates the features of the TeleFlex library.\n\n' +
        'Use /help to see all available commands and modules.'
    );
});

bot.command('about', (ctx) => {
    ctx.reply(
        '🔍 *About This Bot*\n\n' +
        'This is a demo bot showcasing TeleFlex features:\n' +
        '• Dynamic help menus\n' +
        '• Module management\n' +
        '• Pagination\n' +
        '• Rate limiting\n\n' +
        'Visit [GitHub](https://github.com/KunalG932/TeleFlex) for more info!',
        { parse_mode: 'Markdown' }
    );
});

// Error handling
bot.catch((err, ctx) => {
    console.error('Bot error:', err);
    ctx.reply('❌ An error occurred while processing your request.');
});

// Start the bot
console.log('🚀 Starting TeleFlex Demo Bot...');
bot.launch().then(() => {
    console.log('✅ Bot is running!');
}).catch(err => {
    console.error('Failed to start bot:', err);
    process.exit(1);
});

// Enable graceful shutdown
const shutdown = () => {
    console.log('🛑 Shutting down bot...');
    bot.stop('SIGTERM');
    process.exit(0);
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);