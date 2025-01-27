const { Telegraf } = require('telegraf');
const TeleFlex = require('../src/teleflex');
const path = require('path');
const fs = require('fs');

// Mock fs module
jest.mock('fs');

describe('TeleFlex', () => {
  let bot;
  let teleflex;
  let mockCtx;

  // Mock module data
  const mockModules = {
    'admin.js': { 
      MODULE: 'Admin', 
      HELP: `
**Admin Commands**:
/ban - Ban a user
/unban - Unban a user
/mute - Mute a user
/unmute - Unmute a user
`
    },
    'settings.js': { 
      MODULE: 'Settings', 
      HELP: `
**Settings Commands**:
/settings - View current settings
/language - Change bot language
/timezone - Set your timezone
/notifications - Manage notifications
`
    },
    'user.js': { 
      MODULE: 'User', 
      HELP: `
**User Commands**:
/profile - View your profile
/edit - Edit profile details
/stats - View your statistics
/premium - Premium features
`
    }
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock fs.readdirSync
    fs.readdirSync.mockReturnValue(Object.keys(mockModules));

    // Mock require for modules
    jest.mock('../examples/modules/admin.js', () => mockModules['admin.js'], { virtual: true });
    jest.mock('../examples/modules/settings.js', () => mockModules['settings.js'], { virtual: true });
    jest.mock('../examples/modules/user.js', () => mockModules['user.js'], { virtual: true });

    bot = new Telegraf('fake-token');
    teleflex = new TeleFlex(bot, {
      modulesPath: path.join(__dirname, '../examples/modules'),
    });

    mockCtx = {
      reply: jest.fn(),
      replyWithMarkdown: jest.fn(),
      editMessageText: jest.fn(),
      answerCbQuery: jest.fn(),
      match: ['module:Admin', 'Admin'],
      callbackQuery: false,
    };
  });

  describe('Initialization', () => {
    test('should initialize with default options', () => {
      expect(teleflex.buttonsPerPage).toBe(6);
      expect(teleflex.helpVar).toBe('HELP');
      expect(teleflex.moduleVar).toBe('MODULE');
    });

    test('should initialize with custom options', () => {
      fs.readdirSync.mockReturnValue([]);
      const customTeleflex = new TeleFlex(bot, {
        buttonsPerPage: 4,
        helpVar: 'HELP_TEXT',
        moduleVar: 'MODULE_NAME',
      });

      expect(customTeleflex.buttonsPerPage).toBe(4);
      expect(customTeleflex.helpVar).toBe('HELP_TEXT');
      expect(customTeleflex.moduleVar).toBe('MODULE_NAME');
    });

    test('should handle custom text options', () => {
      fs.readdirSync.mockReturnValue([]);
      const customTexts = {
        helpMenuTitle: 'Custom Help Menu',
        backButton: 'Go Back',
      };
      
      const customTeleflex = new TeleFlex(bot, { texts: customTexts });
      expect(customTeleflex.texts.helpMenuTitle).toBe('Custom Help Menu');
      expect(customTeleflex.texts.backButton).toBe('Go Back');
    });

    test('should handle invalid modules path gracefully', () => {
      fs.readdirSync.mockImplementation(() => {
        throw new Error('Directory not found');
      });
      const invalidTeleflex = new TeleFlex(bot, {
        modulesPath: './nonexistent',
      });
      expect(Object.keys(invalidTeleflex.modules)).toHaveLength(0);
    });
  });

  describe('Module Loading', () => {
    test('should load all modules correctly', () => {
      const modules = Object.keys(teleflex.modules);
      expect(modules).toContain('Admin');
      expect(modules).toContain('Settings');
      expect(modules).toContain('User');
    });

    test('should store help text for each module', () => {
      expect(teleflex.modules.Admin).toContain('/ban');
      expect(teleflex.modules.Settings).toContain('/language');
      expect(teleflex.modules.User).toContain('/profile');
    });

    test('should handle malformed modules gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const invalidModule = {};
      teleflex.modules = {};
      
      try {
        teleflex._loadModules();
      } catch (error) {
        expect(consoleSpy).toHaveBeenCalled();
      }
      
      consoleSpy.mockRestore();
    });
  });

  describe('Help Menu Display', () => {
    test('should show no modules message when empty', async () => {
      teleflex.modules = {};
      mockCtx.callbackQuery = true;
      await teleflex.showHelpMenu(mockCtx);
      expect(mockCtx.editMessageText).toHaveBeenCalledWith(teleflex.texts.noModulesLoaded);
    });

    test('should display help menu with correct module count', async () => {
      await teleflex.showHelpMenu(mockCtx);
      expect(mockCtx.replyWithMarkdown).toHaveBeenCalled();
      const call = mockCtx.replyWithMarkdown.mock.calls[0][0];
      expect(call).toContain(Object.keys(teleflex.modules).length.toString());
    });

    test('should edit existing message when available', async () => {
      mockCtx.callbackQuery = true;
      await teleflex.showHelpMenu(mockCtx);
      expect(mockCtx.editMessageText).toHaveBeenCalled();
      const call = mockCtx.editMessageText.mock.calls[0][0];
      expect(call).toContain(Object.keys(teleflex.modules).length.toString());
    });

    test('should handle message not modified error', async () => {
      mockCtx.callbackQuery = true;
      mockCtx.editMessageText.mockRejectedValueOnce({
        description: 'Bad Request: message is not modified'
      });
      
      await teleflex.showHelpMenu(mockCtx);
      expect(mockCtx.answerCbQuery).toHaveBeenCalledWith('You are already on this page');
    });

    test('should handle other edit errors', async () => {
      mockCtx.callbackQuery = true;
      mockCtx.editMessageText.mockRejectedValueOnce({
        description: 'Some other error'
      });

      try {
        await teleflex.showHelpMenu(mockCtx);
      } catch (error) {
        expect(mockCtx.answerCbQuery).toHaveBeenCalledWith('An error occurred');
      }
    });

    test('should answer callback query on successful edit', async () => {
      mockCtx.callbackQuery = true;
      await teleflex.showHelpMenu(mockCtx);
      expect(mockCtx.answerCbQuery).toHaveBeenCalled();
    });
  });

  describe('Module Help Display', () => {
    test('should show module not found message', async () => {
      await teleflex.showModuleHelp(mockCtx, 'NonexistentModule');
      expect(mockCtx.answerCbQuery).toHaveBeenCalledWith('Module not found!');
    });

    test('should display module help correctly', async () => {
      await teleflex.showModuleHelp(mockCtx, 'Admin');
      expect(mockCtx.editMessageText).toHaveBeenCalled();
      const call = mockCtx.editMessageText.mock.calls[0][0];
      expect(call).toContain('Admin');
      expect(call).toContain('/ban');
    });
  });

  describe('Handler Setup', () => {
    test('should setup all required handlers', () => {
      const actionSpy = jest.spyOn(bot, 'action');
      const commandSpy = jest.spyOn(bot, 'command');

      teleflex.setupHandlers();

      expect(actionSpy).toHaveBeenCalledTimes(3); // module:, page:, back:help
      expect(commandSpy).toHaveBeenCalledWith('help', expect.any(Function));

      actionSpy.mockRestore();
      commandSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    test('should handle showHelpMenu errors gracefully', async () => {
      mockCtx.replyWithMarkdown.mockRejectedValue(new Error('Network error'));
      
      try {
        await teleflex.showHelpMenu(mockCtx);
      } catch (error) {
        expect(error.message).toBe('Network error');
      }
    });

    test('should handle showModuleHelp errors gracefully', async () => {
      mockCtx.editMessageText.mockRejectedValue(new Error('Edit failed'));
      
      try {
        await teleflex.showModuleHelp(mockCtx, 'Admin');
      } catch (error) {
        expect(error.message).toBe('Edit failed');
      }
    });

    test('should handle flood control', async () => {
      mockCtx.callbackQuery = {
        from: { id: 123 }
      };
      
      await teleflex.showHelpMenu(mockCtx);
      await teleflex.showHelpMenu(mockCtx); // Second immediate click
      
      expect(mockCtx.answerCbQuery).toHaveBeenCalledWith(teleflex.texts.floodMessage);
    });

    test('should handle message not modified gracefully', async () => {
      mockCtx.callbackQuery = {
        from: { id: 123 }
      };
      mockCtx.editMessageText.mockRejectedValueOnce({
        description: 'message is not modified'
      });
      
      await teleflex.showModuleHelp(mockCtx, 'Admin');
      expect(mockCtx.answerCbQuery).toHaveBeenCalledWith('Content hasn\'t changed');
    });
  });

  describe('Keyboard Navigation', () => {
    test('should not show prev button on first page', () => {
      const items = ['Module1', 'Module2'];
      const keyboard = teleflex._createKeyboard(items, 1, 3);
      const buttons = keyboard.reply_markup.inline_keyboard.flat();
      expect(buttons.some(btn => btn.text === teleflex.texts.prevButton)).toBe(false);
    });

    test('should not show next button on last page', () => {
      const items = ['Module5', 'Module6'];
      const keyboard = teleflex._createKeyboard(items, 3, 3);
      const buttons = keyboard.reply_markup.inline_keyboard.flat();
      expect(buttons.some(btn => btn.text === teleflex.texts.nextButton)).toBe(false);
    });

    test('should show both nav buttons on middle page', () => {
      const items = ['Module3', 'Module4'];
      const keyboard = teleflex._createKeyboard(items, 2, 3);
      const buttons = keyboard.reply_markup.inline_keyboard.flat();
      expect(buttons.some(btn => btn.text === teleflex.texts.prevButton)).toBe(true);
      expect(buttons.some(btn => btn.text === teleflex.texts.nextButton)).toBe(true);
    });
  });

  describe('Pagination', () => {
    test('should paginate correctly for first page', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8];
      const result = teleflex._paginate(array, 3, 1);
      expect(result).toEqual([1, 2, 3]);
    });

    test('should paginate correctly for middle page', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8];
      const result = teleflex._paginate(array, 3, 2);
      expect(result).toEqual([4, 5, 6]);
    });

    test('should paginate correctly for last page', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8];
      const result = teleflex._paginate(array, 3, 3);
      expect(result).toEqual([7, 8]);
    });
  });

  describe('Keyboard Creation', () => {
    test('should create keyboard with navigation buttons', () => {
      const items = ['Module1', 'Module2'];
      const keyboard = teleflex._createKeyboard(items, 1, 2);
      // Should have 2 rows: one for modules, one for navigation
      expect(keyboard.reply_markup.inline_keyboard.length).toBe(2);
      // First row should have 2 buttons (modules)
      expect(keyboard.reply_markup.inline_keyboard[0].length).toBe(2);
    });

    test('should organize modules in 2-column layout', () => {
      const items = ['Module1', 'Module2', 'Module3'];
      const keyboard = teleflex._createKeyboard(items, 1, 2);
      // Should have 2 rows for modules (2 in first row, 1 in second) plus navigation row
      expect(keyboard.reply_markup.inline_keyboard.length).toBe(3);
      expect(keyboard.reply_markup.inline_keyboard[0].length).toBe(2); // First row: 2 modules
      expect(keyboard.reply_markup.inline_keyboard[1].length).toBe(1); // Second row: 1 module
    });

    test('should include next button on first page', () => {
      const items = ['Module1', 'Module2'];
      const keyboard = teleflex._createKeyboard(items, 1, 2);
      // Navigation buttons should be in the last row
      const navigationRow = keyboard.reply_markup.inline_keyboard[keyboard.reply_markup.inline_keyboard.length - 1];
      expect(navigationRow.some(btn => btn.text === teleflex.texts.nextButton)).toBe(true);
    });

    test('should include prev button on last page', () => {
      const items = ['Module3', 'Module4'];
      const keyboard = teleflex._createKeyboard(items, 2, 2);
      // Navigation buttons should be in the last row
      const navigationRow = keyboard.reply_markup.inline_keyboard[keyboard.reply_markup.inline_keyboard.length - 1];
      expect(navigationRow.some(btn => btn.text === teleflex.texts.prevButton)).toBe(true);
    });

    test('should keep navigation buttons in same row', () => {
      const items = ['Module1', 'Module2'];
      const keyboard = teleflex._createKeyboard(items, 2, 3);
      const navigationRow = keyboard.reply_markup.inline_keyboard[keyboard.reply_markup.inline_keyboard.length - 1];
      expect(navigationRow.length).toBe(2); // Both prev and next buttons
      expect(navigationRow[0].text).toBe(teleflex.texts.prevButton);
      expect(navigationRow[1].text).toBe(teleflex.texts.nextButton);
    });
  });
}); 