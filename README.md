# TeleFlex 🤖

A powerful and flexible Telegram bot framework built on top of [Telegraf](https://github.com/telegraf/telegraf). TeleFlex makes it easy to create modular, interactive Telegram bots with dynamic help menus, module management, and more.

[![npm version](https://badge.fury.io/js/teleflex.svg)](https://www.npmjs.com/package/teleflex)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features ✨

- 📚 **Dynamic Help Menus**: Automatically generate interactive help menus from your modules
- 🧩 **Module Management**: Organize your bot commands into modular components
- 📱 **Interactive Commands**: Built-in support for inline keyboards and command pagination
- 🚦 **Rate Limiting**: Protect your bot with built-in flood control
- 🎨 **Customizable**: Easy to customize text messages, buttons, and behaviors
- 📸 **Media Support**: Built-in support for photos, stickers, GIFs, and media albums
- 🎮 **Game Support**: Create interactive games with state management
- 🛠 **Utility Commands**: Common utility commands ready to use

## Installation 📦

```bash
npm install teleflex
```

## Quick Start 🚀

1. Create a new bot with [@BotFather](https://t.me/botfather) and get your bot token
2. Create a new project and install TeleFlex:

```bash
mkdir my-telegram-bot
cd my-telegram-bot
npm init -y
npm install teleflex dotenv
```

3. Create a basic bot (index.js):

```javascript
const { Telegraf } = require('telegraf');
const TeleFlex = require('teleflex');
require('dotenv').config();

// Initialize your bot
const bot = new Telegraf(process.env.BOT_TOKEN);

// Initialize TeleFlex
const teleflex = new TeleFlex(bot, {
    modulesPath: './modules',
    buttonsPerPage: 5,
    texts: {
        helpMenuTitle: '🤖 Bot Commands',
        helpMenuIntro: 'Available modules ({count}):\n{modules}'
    }
});

// Set up handlers
teleflex.setupHandlers();

// Add basic commands
bot.command('start', ctx => {
    ctx.reply('Welcome! Use /help to see available commands.');
});

// Launch the bot
bot.launch();

// Enable graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
```

## Creating Modules 🧩

Create modules in your modules directory. Each module should export `MODULE`, `HELP`, and `commands`:

```javascript
// modules/utility.js
const MODULE = 'Utility';
const HELP = `
🛠 *Utility Commands*

/calc [expression] - Calculate mathematical expressions
/time [timezone] - Get current time
/weather [city] - Get weather information
`;

const commands = {
    calc: async (ctx) => {
        const expr = ctx.message.text.split(' ').slice(1).join(' ');
        try {
            const result = eval(expr);
            ctx.reply(`🔢 Result: ${result}`);
        } catch (err) {
            ctx.reply('❌ Invalid expression');
        }
    },
    // ... other command implementations
};

module.exports = { MODULE, HELP, commands };
```

## Media Support 📸

TeleFlex provides built-in support for handling media files. Define your media assets in your module:

```javascript
// modules/media.js
const MEDIA = {
    photos: [
        {
            file: 'welcome.jpg',
            caption: '👋 Welcome!'
        }
    ],
    stickers: ['sticker_file_id'],
    gifs: ['gif_url'],
    albumPhotos: [
        {
            file: 'album1.jpg',
            caption: 'Photo 1'
        }
    ]
};

const commands = {
    photo: async (ctx) => {
        const photo = MEDIA.photos[0];
        await ctx.replyWithPhoto(
            { source: photo.file },
            { caption: photo.caption }
        );
    }
    // ... other media commands
};

module.exports = { MODULE, HELP, commands, MEDIA };
```

## Configuration Options ⚙️

```javascript
const options = {
    // Path to modules directory
    modulesPath: './modules',
    
    // Number of buttons per page in menus
    buttonsPerPage: 6,
    
    // Minimum time between actions (ms)
    floodWait: 1000,
    
    // Custom command prefix
    commandPrefix: '/',
    
    // Customizable text messages
    texts: {
        helpMenuTitle: '🤖 Help Menu',
        helpMenuIntro: 'Available modules ({count}):\n{modules}',
        moduleHelpTitle: '📚 {moduleName} Commands',
        moduleHelpIntro: '{helpText}',
        noModulesLoaded: '⚠️ No modules available',
        backButton: '◀️ Back',
        prevButton: '⬅️ Previous',
        nextButton: '➡️ Next',
        floodMessage: '⏳ Please wait'
    }
};
```

## Examples 📝

Check out the [examples](./examples) directory for more examples including:
- Basic bot setup
- Utility commands
- Interactive games
- Media handling
- And more!

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support 💬

- Create an [issue](https://github.com/KunalG932/TeleFlex/issues) for bug reports and feature requests
- Star ⭐ the repo if you find it useful!

## Author ✍️

KunalG932 - [GitHub](https://github.com/KunalG932)
