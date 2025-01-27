const fs = require('fs');
const path = require('path');
const { Markup } = require('telegraf');

class TeleFlex {
  constructor(bot, options = {}) {
    this.bot = bot;
    this.modulesPath = options.modulesPath || './modules';
    this.buttonsPerPage = options.buttonsPerPage || 6;
    this.floodControl = new Map(); // Store last action time for each user
    this.floodWait = options.floodWait || 1000; // Minimum time between actions (ms)
    this.texts = {
      helpMenuTitle: '**🛠 Help Menu**',
      helpMenuIntro: 'Available modules ({count}):\n{modules}\n\nTap a module to explore.',
      moduleHelpTitle: '**🔍 {moduleName} Commands**',
      moduleHelpIntro: '{helpText}',
      noModulesLoaded: '⚠️ No modules available.',
      backButton: '◀️ Back',
      prevButton: '⬅️ Previous',
      nextButton: '➡️ Next',
      floodMessage: '⚠️ Please wait a moment before clicking again',
      ...options.texts,
    };
    this.helpVar = options.helpVar || 'HELP';
    this.moduleVar = options.moduleVar || 'MODULE';
    this.modules = {};

    this._loadModules();
  }

  _loadModules() {
    try {
      const files = fs.readdirSync(this.modulesPath);
      for (const file of files) {
        const filePath = path.join(this.modulesPath, file);
        try {
          const module = require(filePath);
          const moduleName = module[this.moduleVar];
          const helpText = module[this.helpVar];

          if (moduleName && helpText) {
            this.modules[moduleName] = helpText;
          }
        } catch (error) {
          console.error(`Failed to load module: ${file} - ${error.message}`);
        }
      }
    } catch (error) {
      console.error(`Failed to access modules directory: ${this.modulesPath} - ${error.message}`);
      this.modules = {};
    }
  }

  _paginate(array, pageSize, pageNumber) {
    return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  }

  _createKeyboard(items, currentPage, totalPages) {
    // Create module buttons in pairs (2 columns)
    const moduleButtons = [];
    for (let i = 0; i < items.length; i += 2) {
      const row = [Markup.button.callback(items[i], `module:${items[i]}`)];
      if (i + 1 < items.length) {
        row.push(Markup.button.callback(items[i + 1], `module:${items[i + 1]}`));
      }
      moduleButtons.push(row);
    }

    // Create navigation row
    const navigationButtons = [];

    if (currentPage > 1) {
      navigationButtons.push(Markup.button.callback(this.texts.prevButton, `page:${currentPage - 1}`));
    }

    if (currentPage < totalPages) {
      navigationButtons.push(Markup.button.callback(this.texts.nextButton, `page:${currentPage + 1}`));
    }

    // Add navigation row if there are navigation buttons
    if (navigationButtons.length > 0) {
      moduleButtons.push(navigationButtons);
    }

    return Markup.inlineKeyboard(moduleButtons);
  }

  _checkFloodControl(userId) {
    const now = Date.now();
    const lastAction = this.floodControl.get(userId) || 0;
    
    if (now - lastAction < this.floodWait) {
      return false;
    }
    
    this.floodControl.set(userId, now);
    return true;
  }

  async _handleMessageEdit(ctx, message, keyboard) {
    try {
      await ctx.editMessageText(message, { 
        parse_mode: 'Markdown', 
        reply_markup: keyboard.reply_markup 
      });
      await ctx.answerCbQuery();
    } catch (error) {
      if (error.description?.includes('message is not modified')) {
        await ctx.answerCbQuery('Content hasn\'t changed');
      } else {
        await ctx.answerCbQuery('An error occurred');
        throw error;
      }
    }
  }

  async showHelpMenu(ctx, page = 1) {
    if (ctx.callbackQuery) {
      const userId = ctx.callbackQuery.from.id;
      if (!this._checkFloodControl(userId)) {
        return ctx.answerCbQuery(this.texts.floodMessage);
      }
    }

    const moduleNames = Object.keys(this.modules);
    const totalModules = moduleNames.length;

    if (totalModules === 0) {
      return ctx.callbackQuery ? 
        ctx.editMessageText(this.texts.noModulesLoaded) : 
        ctx.reply(this.texts.noModulesLoaded);
    }

    const totalPages = Math.ceil(totalModules / this.buttonsPerPage);
    const currentPageModules = this._paginate(moduleNames, this.buttonsPerPage, page);
    const modulesText = currentPageModules.join('\n');

    const helpMessage = this.texts.helpMenuTitle + '\n' +
      this.texts.helpMenuIntro
        .replace('{count}', totalModules)
        .replace('{modules}', modulesText);

    const keyboard = this._createKeyboard(currentPageModules, page, totalPages);

    if (ctx.callbackQuery) {
      try {
        await ctx.editMessageText(helpMessage, { 
          parse_mode: 'Markdown', 
          reply_markup: keyboard.reply_markup 
        });
        await ctx.answerCbQuery();
      } catch (error) {
        if (error.description?.includes('message is not modified')) {
          await ctx.answerCbQuery('You are already on this page');
        } else {
          await ctx.answerCbQuery('An error occurred');
          throw error;
        }
      }
    } else {
      await ctx.replyWithMarkdown(helpMessage, keyboard);
    }
  }

  async showModuleHelp(ctx, moduleName) {
    if (ctx.callbackQuery) {
      const userId = ctx.callbackQuery.from.id;
      if (!this._checkFloodControl(userId)) {
        return ctx.answerCbQuery(this.texts.floodMessage);
      }
    }

    const helpText = this.modules[moduleName];

    if (!helpText) {
      return ctx.answerCbQuery('Module not found!');
    }

    const helpMessage = this.texts.moduleHelpTitle
      .replace('{moduleName}', moduleName) +
      '\n' +
      this.texts.moduleHelpIntro.replace('{helpText}', helpText);

    const keyboard = Markup.inlineKeyboard([
      Markup.button.callback(this.texts.backButton, 'back:help'),
    ]);

    await this._handleMessageEdit(ctx, helpMessage, keyboard);
  }

  setupHandlers() {
    this.bot.action(/module:(.+)/, async (ctx) => {
      const moduleName = ctx.match[1];
      await this.showModuleHelp(ctx, moduleName);
    });

    this.bot.action(/page:(\d+)/, async (ctx) => {
      const page = parseInt(ctx.match[1], 10);
      await this.showHelpMenu(ctx, page);
    });

    this.bot.action('back:help', async (ctx) => {
      await this.showHelpMenu(ctx);
    });

    this.bot.command('help', async (ctx) => {
      const moduleNames = Object.keys(this.modules);
      const totalModules = moduleNames.length;

      if (totalModules === 0) {
        return ctx.reply(this.texts.noModulesLoaded);
      }

      const totalPages = Math.ceil(totalModules / this.buttonsPerPage);
      const currentPageModules = this._paginate(moduleNames, this.buttonsPerPage, 1);
      const modulesText = currentPageModules.join('\n');

      const helpMessage = this.texts.helpMenuTitle + '\n' +
        this.texts.helpMenuIntro
          .replace('{count}', totalModules)
          .replace('{modules}', modulesText);

      const keyboard = this._createKeyboard(currentPageModules, 1, totalPages);

      await ctx.replyWithMarkdown(helpMessage, keyboard);
    });
  }
}

module.exports = TeleFlex; 