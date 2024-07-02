import * as vscode from 'vscode';

import { ExtensionConfigurator } from './config/extension-configurator';
import { GlobalState } from './config/global-state';

export let globalState: GlobalState;

export function activate(context: vscode.ExtensionContext) {
  globalState = new GlobalState(context);
  const extConf = new ExtensionConfigurator(context);

  const { TDP_CONTENT } = require('./tree-data-providers/content');
  extConf.registerTreeDataProvider(TDP_CONTENT.id, TDP_CONTENT.tdp);

  const { CMD_REFRESH_CONTENT } = require('./commands/refresh-content');
  extConf.registerCommand(CMD_REFRESH_CONTENT.id, CMD_REFRESH_CONTENT.callback);

  const { CMD_GIT_CLONE } = require('./commands/git-clone');
  extConf.registerCommand(CMD_GIT_CLONE.id, CMD_GIT_CLONE.callback);

  const { CMD_GO_TO } = require('./commands/go-to');
  extConf.registerCommand(CMD_GO_TO.id, CMD_GO_TO.callback);

  const {
    WEBVIEW_SET_CONFIGURATION,
  } = require('./web-views/set-configuration');
  extConf.registerWebviewViewProvider(
    WEBVIEW_SET_CONFIGURATION.id,
    WEBVIEW_SET_CONFIGURATION.wvp
  );
}

export function deactivate() {}
