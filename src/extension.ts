import * as vscode from 'vscode';

import { ExtensionConfigurator } from './config/extension-configurator';
import { TDP_CONTENT } from './tree-data-providers/content';
import { CMD_REFRESH_CONTENT } from './commands/refresh-content';
import { CMD_GO_TO } from './commands/go-to';
import { CMD_GIT_CLONE } from './commands/git-clone';

export function activate(context: vscode.ExtensionContext) {
  const extConf = new ExtensionConfigurator(context);

  extConf.registerTreeDataProvider(TDP_CONTENT.id, TDP_CONTENT.tdp);
  extConf.registerCommand(CMD_REFRESH_CONTENT.id, CMD_REFRESH_CONTENT.callback);
  extConf.registerCommand(CMD_GIT_CLONE.id, CMD_GIT_CLONE.callback);
  extConf.registerCommand(CMD_GO_TO.id, CMD_GO_TO.callback);
}

export function deactivate() {}
