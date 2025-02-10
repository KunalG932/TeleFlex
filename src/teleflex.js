// @ts-check
const fs = require('fs');
const path = require('path');
const { Markup } = require('telegraf');

/**
 * TeleFlex - A flexible Telegraf helper library for creating dynamic help menus
 * and module management for Telegram bots.
 * 
 * @typedef {import('./types').TeleflexOptions} TeleflexOptions
 * @typedef {import('./types').ModuleData} ModuleData
 * @typedef {import('./types').MediaConfig} MediaConfig
 * @typedef {import('telegraf').Context} Context
 * @typedef {import('telegraf').Telegraf} Telegraf
 */

class TeleFlex {
  /**
   * Creates a new instance of TeleFlex
   * @param {Telegraf} bot - The Telegraf bot instance
   * @param {TeleflexOptions} [options={}] - Configuration options
   */
  constructor(bot, options = {}) {
    /** @type {Telegraf} */
    this.bot = bot;
    
    /** @type {string} Path to modules directory */
    this.modulesPath = options.modulesPath || './modules';
    
    /** @type {number} Number of buttons per page */
    this.buttonsPerPage = options.buttonsPerPage || 6;
    
    /** @type {Map<number, number>} Store last action time for each user */
    this.floodControl = new Map();
    
    /** @type {number} Minimum time between actions (ms) */
    this.floodWait = options.floodWait || 1000;
    
    /** @type {string} Custom command prefix */
    this.commandPrefix = options.commandPrefix || '/';
    
    /** @type {Object.<string, string>} Customizable text messages */
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

    /** @type {string} Variable name for help text in modules */
    this.helpVar = options.helpVar || 'HELP';
    
    /** @type {string} Variable name for module name in modules */
    this.moduleVar = options.moduleVar || 'MODULE';
    
    /** @type {string} Variable name for media in modules */
    this.mediaVar = options.mediaVar || 'MEDIA';
    
    /** @type {Object.<string, ModuleData>} Loaded modules data */
    this.modules = {};

    // Load modules on initialization
    this._loadModules();
  }

  /**
   * Loads all modules from the modules directory
   * @private
   */
  _loadModules() {
    try {
      const files = fs.readdirSync(this.modulesPath);
      for (const file of files) {
        const filePath = path.join(this.modulesPath, file);
        try {
          const module = require(filePath);
          const moduleName = module[this.moduleVar];
          const helpText = module[this.helpVar];
          /** @type {MediaConfig} */
          const media = module[this.mediaVar];

          if (moduleName && helpText) {
            this.modules[moduleName] = {
              helpText,
              media,
              commands: this._processCommands(module.commands || {})
            };
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

  /**
   * Processes commands by adding the custom prefix
   * @private
   * @param {Object.<string, string>} commands - Raw commands object
   * @returns {Object.<string, string>} Processed commands with prefix
   */
  _processCommands(commands) {
    /** @type {Object.<string, string>} */
    const processed = {};
    for (const [cmd, desc] of Object.entries(commands)) {
      processed[this.commandPrefix + cmd] = desc;
    }
    return processed;
  }

  /**
   * Paginates an array into chunks
   * @private
   * @param {Array<any>} array - Array to paginate
   * @param {number} pageSize - Size of each page
   * @param {number} pageNumber - Page number to get
   * @returns {Array<any>} Paginated array chunk
   */
  _paginate(array, pageSize, pageNumber) {
    return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  }

  /**
   * Creates an inline keyboard for navigation
   * @private
   * @param {Array<string>} items - Items to create buttons for
   * @param {number} currentPage - Current page number
   * @param {number} totalPages - Total number of pages
   * @returns {import('telegraf').Markup} Markup object with inline keyboard
   */
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

    if (totalPages > 1) {
      if (currentPage > 1) {
        navigationButtons.push(
          Markup.button.callback(this.texts.prevButton, `page:${currentPage - 1}`)
        );
      }
      if (currentPage < totalPages) {
        navigationButtons.push(
          Markup.button.callback(this.texts.nextButton, `page:${currentPage + 1}`)
        );
      }
    }

    if (navigationButtons.length > 0) {
      moduleButtons.push(navigationButtons);
    }

    // Return the markup with inline keyboard
    return Markup.inlineKeyboard(moduleButtons);
  }

  /**
   * Checks if a user is rate limited
   * @private
   * @param {number} userId - User ID to check
   * @returns {boolean} True if user can proceed, false if rate limited
   */
  _checkFloodControl(userId) {
    const now = Date.now();
    const lastAction = this.floodControl.get(userId) || 0;
    
    if (now - lastAction < this.floodWait) {
      return false;
    }
    
    this.floodControl.set(userId, now);
    return true;
  }

  /**
   * Handles message editing with error handling
   * @private
   * @param {Context} ctx - Telegraf context
   * @param {string} message - Message to edit
   * @param {import('telegraf').Markup} keyboard - Keyboard markup
   */
  async _handleMessageEdit(ctx, message, keyboard) {
    try {
      await ctx.editMessageText(message, {
        parse_mode: 'Markdown',
        ...keyboard
      });
      if (ctx.callbackQuery) {
        await ctx.answerCbQuery();
      }
    } catch (error) {
      console.error('Error editing message:', error);
    }
  }

  /**
   * Gets the appropriate media method based on type
   * @private
   * @param {Context} ctx - Telegraf context
   * @param {'photo' | 'video' | 'animation' | 'document'} type - Media type
   * @returns {Function|undefined} Media method or undefined
   */
  _getMediaMethod(ctx, type) {
    /** @type {{ [key: string]: Function|undefined }} */
    const mediaMethods = {
      photo: ctx.replyWithPhoto?.bind(ctx),
      video: ctx.replyWithVideo?.bind(ctx),
      animation: ctx.replyWithAnimation?.bind(ctx),
      document: ctx.replyWithDocument?.bind(ctx)
    };
    return mediaMethods[type.toLowerCase()];
  }

  /**
   * Shows the help menu
   * @param {Context} ctx - Telegraf context
   * @param {number} [page=1] - Page number to display
   */
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
        .replace('{count}', String(totalModules))
        .replace('{modules}', modulesText);

    const keyboard = this._createKeyboard(currentPageModules, page, totalPages);

    if (ctx.callbackQuery) {
      await this._handleMessageEdit(ctx, helpMessage, keyboard);
    } else {
      await ctx.replyWithMarkdown(helpMessage, keyboard);
    }
  }

  /**
   * Shows help for a specific module
   * @param {Context} ctx - Telegraf context
   * @param {string} moduleName - Name of the module
   */
  async showModuleHelp(ctx, moduleName) {
    if (ctx.callbackQuery) {
      const userId = ctx.callbackQuery.from.id;
      if (!this._checkFloodControl(userId)) {
        return ctx.answerCbQuery(this.texts.floodMessage);
      }
    }

    const moduleData = this.modules[moduleName];

    if (!moduleData) {
      return ctx.answerCbQuery('Module not found!');
    }

    const helpMessage = this.texts.moduleHelpTitle
      .replace('{moduleName}', moduleName) +
      '\n' +
      this.texts.moduleHelpIntro.replace('{helpText}', moduleData.helpText);

    const keyboard = Markup.inlineKeyboard([
      Markup.button.callback(this.texts.backButton, 'back:help'),
    ]);

    // Handle media if present
    if (moduleData.media) {
      const { type, source, caption } = moduleData.media;
      const mediaMethod = this._getMediaMethod(ctx, type);
      
      if (mediaMethod) {
        await mediaMethod(source, {
          caption: caption || helpMessage,
          parse_mode: 'Markdown',
          reply_markup: keyboard.reply_markup
        });
        if (ctx.callbackQuery) {
          await ctx.answerCbQuery();
        }
        return;
      }
    }

    await this._handleMessageEdit(ctx, helpMessage, keyboard);
  }

  /**
   * Sets up the command and action handlers
   */
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
      await this.showHelpMenu(ctx, 1);
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
          .replace('{count}', String(totalModules))
          .replace('{modules}', modulesText);

      const keyboard = this._createKeyboard(currentPageModules, 1, totalPages);

      await ctx.replyWithMarkdown(helpMessage, keyboard);
    });
  }
}

module.exports = TeleFlex;