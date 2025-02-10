import { Telegraf, Context, Markup } from 'telegraf';

/**
 * Media configuration for module help menus
 */
export interface MediaConfig {
  /** Type of media to display */
  type: 'photo' | 'video' | 'animation' | 'document';
  /** Source path or URL for the media */
  source: string;
  /** Optional caption to display with the media */
  caption?: string;
}

/**
 * Command definitions with descriptions
 */
export interface CommandDefinitions {
  [command: string]: string;
}

/**
 * Module data structure
 */
export interface ModuleData {
  /** Help text for the module */
  helpText: string;
  /** Optional media configuration */
  media?: MediaConfig;
  /** Processed commands with prefixes */
  commands: CommandDefinitions;
}

/**
 * Custom text configurations
 */
export interface TextConfig {
  /** Title of the help menu */
  helpMenuTitle?: string;
  /** Introduction text for help menu */
  helpMenuIntro?: string;
  /** Title format for module help */
  moduleHelpTitle?: string;
  /** Introduction format for module help */
  moduleHelpIntro?: string;
  /** Message when no modules are loaded */
  noModulesLoaded?: string;
  /** Text for back button */
  backButton?: string;
  /** Text for previous page button */
  prevButton?: string;
  /** Text for next page button */
  nextButton?: string;
  /** Message for flood control */
  floodMessage?: string;
}

/**
 * TeleFlex configuration options
 */
export interface TeleflexOptions {
  /** Path to modules directory */
  modulesPath?: string;
  /** Number of buttons per page in help menu */
  buttonsPerPage?: number;
  /** Minimum time between actions in milliseconds */
  floodWait?: number;
  /** Custom command prefix (default: '/') */
  commandPrefix?: string;
  /** Variable name for help text in modules */
  helpVar?: string;
  /** Variable name for module name in modules */
  moduleVar?: string;
  /** Variable name for media in modules */
  mediaVar?: string;
  /** Custom text configurations */
  texts?: TextConfig;
}

/**
 * TeleFlex class - A flexible Telegraf helper library for creating dynamic help menus
 * and module management for Telegram bots
 */
declare class TeleFlex {
  /**
   * Creates a new instance of TeleFlex
   * @param bot - The Telegraf bot instance
   * @param options - Configuration options
   */
  constructor(bot: Telegraf, options?: TeleflexOptions);

  /**
   * The Telegraf bot instance
   */
  readonly bot: Telegraf;

  /**
   * Path to modules directory
   */
  readonly modulesPath: string;

  /**
   * Number of buttons per page
   */
  readonly buttonsPerPage: number;

  /**
   * Minimum time between actions (ms)
   */
  readonly floodWait: number;

  /**
   * Custom command prefix
   */
  readonly commandPrefix: string;

  /**
   * Customizable text messages
   */
  readonly texts: Required<TextConfig>;

  /**
   * Variable name for help text in modules
   */
  readonly helpVar: string;

  /**
   * Variable name for module name in modules
   */
  readonly moduleVar: string;

  /**
   * Variable name for media in modules
   */
  readonly mediaVar: string;

  /**
   * Loaded modules data
   */
  readonly modules: Record<string, ModuleData>;

  /**
   * Shows the help menu
   * @param ctx - Telegraf context
   * @param page - Page number to display (default: 1)
   */
  showHelpMenu(ctx: Context, page?: number): Promise<void>;

  /**
   * Shows help for a specific module
   * @param ctx - Telegraf context
   * @param moduleName - Name of the module
   */
  showModuleHelp(ctx: Context, moduleName: string): Promise<void>;

  /**
   * Sets up the command and action handlers
   */
  setupHandlers(): void;

  /**
   * Loads all modules from the modules directory
   * @private
   */
  private _loadModules(): void;

  /**
   * Processes commands by adding the custom prefix
   * @private
   */
  private _processCommands(commands: CommandDefinitions): CommandDefinitions;

  /**
   * Paginates an array into chunks
   * @private
   */
  private _paginate<T>(array: T[], pageSize: number, pageNumber: number): T[];

  /**
   * Creates an inline keyboard for navigation
   * @private
   */
  private _createKeyboard(items: string[], currentPage: number, totalPages: number): Markup;

  /**
   * Checks if a user is rate limited
   * @private
   */
  private _checkFloodControl(userId: number): boolean;

  /**
   * Handles message editing with error handling
   * @private
   */
  private _handleMessageEdit(ctx: Context, message: string, keyboard: Markup): Promise<void>;

  /**
   * Gets the appropriate media method based on type
   * @private
   */
  private _getMediaMethod(ctx: Context, type: string): Function | undefined;
}

export = TeleFlex;