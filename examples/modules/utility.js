const { Markup } = require('telegraf');

const MODULE = 'Utility';
const HELP = `
🛠 *Utility Commands*

/calc [expression] - Calculate mathematical expressions
Example: /calc 2 + 2 * 3

/time [timezone] - Get current time
Example: /time UTC

/weather [city] - Get weather information
Example: /weather London

/remind [time] [message] - Set a reminder
Example: /remind 30m Call mom

/translate [lang] [text] - Translate text
Example: /translate es Hello world
`;

// Command implementations
const commands = {
    calc: async (ctx) => {
        const expr = ctx.message.text.split(' ').slice(1).join(' ');
        if (!expr) {
            return ctx.reply('❌ Please provide an expression to calculate\nExample: /calc 2 + 2');
        }
        try {
            const result = eval(expr); // Note: In production, use a safe math evaluation library
            ctx.reply(`🔢 Result: ${result}`);
        } catch (err) {
            ctx.reply('❌ Invalid expression');
        }
    },

    time: async (ctx) => {
        const timezone = ctx.message.text.split(' ')[1] || 'UTC';
        try {
            const time = new Date().toLocaleString('en-US', { timeZone: timezone });
            ctx.reply(`🕒 Current time in ${timezone}:\n${time}`);
        } catch (err) {
            ctx.reply('❌ Invalid timezone');
        }
    },

    weather: async (ctx) => {
        const city = ctx.message.text.split(' ').slice(1).join(' ');
        if (!city) {
            return ctx.reply('❌ Please provide a city name\nExample: /weather London');
        }
        // In a real bot, you would integrate with a weather API
        ctx.reply(`🌤 Weather information for ${city}:\nTemperature: 22°C\nCondition: Sunny`);
    },

    remind: async (ctx) => {
        const [cmd, time, ...message] = ctx.message.text.split(' ');
        if (!time || message.length === 0) {
            return ctx.reply('❌ Please provide time and message\nExample: /remind 30m Call mom');
        }
        
        // Parse time (simple example)
        const match = time.match(/^(\d+)(m|h)$/);
        if (!match) {
            return ctx.reply('❌ Invalid time format. Use format: 30m or 2h');
        }
        
        const [_, duration, unit] = match;
        const ms = unit === 'm' ? duration * 60000 : duration * 3600000;
        
        ctx.reply(`⏰ I'll remind you about: "${message.join(' ')}" in ${time}`);
        
        // Set reminder
        setTimeout(() => {
            ctx.reply(`⏰ Reminder: ${message.join(' ')}`);
        }, ms);
    },

    translate: async (ctx) => {
        const [cmd, lang, ...text] = ctx.message.text.split(' ');
        if (!lang || text.length === 0) {
            return ctx.reply('❌ Please provide language and text\nExample: /translate es Hello world');
        }
        // In a real bot, you would integrate with a translation API
        ctx.reply(`🌐 Translation to ${lang.toUpperCase()}:\n"${text.join(' ')}"\n➡️ [Translated text would appear here]`);
    }
};

module.exports = { MODULE, HELP, commands };