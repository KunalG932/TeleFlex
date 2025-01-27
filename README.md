## Teleflex

A flexible Telegraf helper library for creating dynamic help menus and module management for Telegram bots.

[![npm version](https://img.shields.io/npm/v/teleflex.svg)](https://www.npmjs.com/package/teleflex)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 📚 Automatic module discovery and loading
- 📑 Paginated help menus with inline navigation
- 🎨 Fully customizable texts and appearance
- ⌨️ Dynamic inline keyboards
- 🔄 Easy navigation between modules
- 📦 TypeScript support
- 🛡️ Built-in flood control
- 🔄 Smart message update handling
- 🚦 Rate limiting for button clicks

## Installation

```bash
npm install teleflex
```

## Quick Start

```javascript
const { Telegraf } = require('telegraf');
const TeleFlex = require('teleflex');

// Initialize your bot
const bot = new Telegraf('YOUR_BOT_TOKEN');

// Initialize TeleFlex
const teleflex = new TeleFlex(bot, {
  modulesPath: './modules',
  buttonsPerPage: 6,
});

// Setup the handlers
teleflex.setupHandlers();

// Start the bot
bot.launch();
```

## Creating Help Modules

Create module files in your modules directory:

```javascript
// modules/admin.js
const MODULE = 'Admin';
const HELP = `
**Admin Commands**:
/ban - Ban a user
/unban - Unban a user
/mute - Mute a user
/unmute - Unmute a user
`;

module.exports = { MODULE, HELP };
```

## Configuration Options

```javascript
const options = {
  // Path to modules directory
  modulesPath: './modules',

  // Number of buttons per page
  buttonsPerPage: 6,

  // Module variable names
  helpVar: 'HELP',
  moduleVar: 'MODULE',

  // Flood control (ms between actions)
  floodWait: 1000,

  // Customizable texts
  texts: {
    helpMenuTitle: '**🛠 Help Menu**',
    helpMenuIntro: 'Available modules ({count}):\n{modules}\n\nTap a module to explore.',
    moduleHelpTitle: '**🔍 {moduleName} Commands**',
    moduleHelpIntro: '{helpText}',
    noModulesLoaded: '⚠️ No modules available.',
    backButton: '◀️ Back',
    prevButton: '⬅️ Previous',
    nextButton: '➡️ Next',
    floodMessage: '⚠️ Please wait a moment before clicking again'
  }
};
```

## Error Handling

TeleFlex includes built-in error handling for common scenarios:

- 🔄 Message modification errors
- ⏱️ Rate limiting for rapid clicks
- 🚫 Invalid module requests
- 📝 Message content validation

## Rate Limiting

To prevent spam and protect your bot:

```javascript
const teleflex = new TeleFlex(bot, {
  floodWait: 1000, // 1 second between actions
});
```

## API Reference

### TeleFlex Class

#### Constructor
```javascript
new TeleFlex(bot, options)
```

#### Methods

- `showHelpMenu(ctx, page = 1)` - Display the help menu
- `showModuleHelp(ctx, moduleName)` - Display help for a specific module
- `setupHandlers()` - Setup all necessary bot handlers

## Example Usage

### Basic Bot with Help Menu

```javascript
const { Telegraf } = require('telegraf');
const TeleFlex = require('teleflex');

const bot = new Telegraf(process.env.BOT_TOKEN);

const teleflex = new TeleFlex(bot, {
  modulesPath: __dirname + '/modules',
  buttonsPerPage: 6,
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
```

### Custom Module Examples

```javascript
// modules/utility.js
const MODULE = 'Utility';
const HELP = `
**Utility Commands**:
/search - Search in messages
/translate - Translate text
/calculate - Calculator
/weather - Get weather info
/remind - Set reminders
`;

module.exports = { MODULE, HELP };

// modules/media.js
const MODULE = 'Media';
const HELP = `
**Media Commands**:
/photo - Send or edit photos
/video - Send or compress videos
/audio - Send voice or music
/sticker - Create custom stickers
/gif - Search and send GIFs
`;

module.exports = { MODULE, HELP };
```

## TypeScript Support

TeleFlex includes TypeScript definitions out of the box:

```typescript
import TeleFlex from 'teleflex';
import { Telegraf } from 'telegraf';

const bot = new Telegraf('BOT_TOKEN');
const teleflex = new TeleFlex(bot, {
  modulesPath: './modules'
});
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature-feature`)
5. Open a Pull Request

## Testing

Run the test suite:

```bash
npm test
```

## License

MIT © [Kunal Gaikwad]

## Support

If you have any questions or need help, please:
1. Check the [documentation](https://github.com/kunalg932/teleflex#readme)
2. Open an [issue](https://github.com/kunalg932/teleflex/issues)

