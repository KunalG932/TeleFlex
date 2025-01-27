import { Telegraf, Context } from 'telegraf';

interface TeleflexOptions {
  modulesPath?: string;
  buttonsPerPage?: number;
  helpVar?: string;
  moduleVar?: string;
  floodWait?: number;
  texts?: {
    helpMenuTitle?: string;
    helpMenuIntro?: string;
    moduleHelpTitle?: string;
    moduleHelpIntro?: string;
    noModulesLoaded?: string;
    backButton?: string;
    prevButton?: string;
    nextButton?: string;
    floodMessage?: string;
  };
}

declare class TeleFlex {
  constructor(bot: Telegraf, options?: TeleflexOptions);
  
  showHelpMenu(ctx: Context, page?: number): Promise<void>;
  showModuleHelp(ctx: Context, moduleName: string): Promise<void>;
  setupHandlers(): void;
  
  private _loadModules(): void;
  private _paginate(array: any[], pageSize: number, pageNumber: number): any[];
  private _createKeyboard(items: string[], currentPage: number, totalPages: number): any;
  private _checkFloodControl(userId: number): boolean;
  private _handleMessageEdit(ctx: Context, message: string, keyboard: any): Promise<void>;
}

export = TeleFlex; 