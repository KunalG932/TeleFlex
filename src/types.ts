import { Context, Telegraf } from 'telegraf';

/**
 * Media configuration for module help menus
 */
export interface MediaConfig {
  /** Type of media to display (photo, video, animation, document) */
  type: 'photo' | 'video' | 'animation' | 'document';
  /** Source path or URL for the media */
  source: string;
  /** Optional caption to display with the media */
  caption?: string;
}

/**
 * Module command definitions
 */
export interface CommandDefinitions {
  [command: string]: string;
}

/**
 * Module structure definition
 */
export interface TeleflexModule {
  /** Module name identifier */
  MODULE: string;
  /** Help text for the module */
  HELP: string;
  /** Optional media configuration */
  MEDIA?: MediaConfig;
  /** Optional command definitions */
  commands?: CommandDefinitions;
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
  /** Custom command prefix */
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
 * TeleFlex class type definition
 */
export declare class TeleFlex {
  constructor(bot: Telegraf, options?: TeleflexOptions);
  
  /**
   * Shows the help menu for all modules
   * @param ctx Telegraf context
   * @param page Page number to display
   */
  showHelpMenu(ctx: Context, page?: number): Promise<void>;
  
  /**
   * Shows help for a specific module
   * @param ctx Telegraf context
   * @param moduleName Name of the module to show help for
   */
  showModuleHelp(ctx: Context, moduleName: string): Promise<void>;
  
  /**
   * Sets up the command and action handlers
   */
  setupHandlers(): void;
}
