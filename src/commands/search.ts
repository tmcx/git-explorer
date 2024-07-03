import { ICommand } from '../interfaces/extension-configurator';
import * as vscode from 'vscode';
import { TDP_CONTENT } from '../tree-data-providers/content';
import { globalState } from '../extension';

const MESSAGE = {
  SEARCH: 'Buscar...',
};

export const CMD_SEARCH: ICommand = {
  id: 'cmd-search',
  callback: async () => {
    const quickPick = vscode.window.createQuickPick();
    const query = globalState.getTemp('search') || MESSAGE.SEARCH;
    if (query) {
      quickPick.placeholder = query;
    }
    let debounceTimeout: NodeJS.Timeout | undefined;
    quickPick.onDidChangeValue((value) => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      debounceTimeout = setTimeout(() => {
        TDP_CONTENT.tdp.search(value);
      }, 1000);
      TDP_CONTENT.tdp.search(value);
    });
    quickPick.onDidHide(() => {
      quickPick.dispose();
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    });
    quickPick.show();
  },
};
