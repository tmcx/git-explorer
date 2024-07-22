import * as vscode from 'vscode';

import { ExtensionConfigurator } from './config/extension-configurator';
import { GlobalState } from './config/global-state';
import { STreeStructure } from './service/tree-structure';

export let globalState: GlobalState;

export async function activate(context: vscode.ExtensionContext) {
  globalState = new GlobalState(context);
  const extConf = new ExtensionConfigurator(context);
  await STreeStructure.get();
  const { WEBVIEW_CONTENT } = require('./web-views/content');
  extConf.registerWebviewViewProvider(WEBVIEW_CONTENT.id, WEBVIEW_CONTENT.wvp);

  const {
    WEBVIEW_SET_CONFIGURATION,
  } = require('./web-views/set-configuration');
  extConf.registerWebviewViewProvider(
    WEBVIEW_SET_CONFIGURATION.id,
    WEBVIEW_SET_CONFIGURATION.wvp
  );
}

export function deactivate() {}
