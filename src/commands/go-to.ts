import { ICommand } from '../interfaces/extension-configurator';
import * as vscode from 'vscode';
import { ContentTreeItem } from '../tree-items/content';

export const CMD_GO_TO: ICommand = {
  id: 'cmd-go-to',
  callback: (content: ContentTreeItem) => {
    vscode.env.openExternal(vscode.Uri.parse(content.urls?.webUrl || ''));
  },
};
