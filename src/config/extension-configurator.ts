import { ExtensionContext, commands, window } from 'vscode';
import {
  ITreeDataProvider,
  IWebviewViewProvider,
  TCallback,
} from '../interfaces/extension-configurator';

export class ExtensionConfigurator {
  constructor(private context: ExtensionContext) {}

  registerCommand(id: string, callback: TCallback) {
    const cmd = commands.registerCommand(id, callback);
    this.context.subscriptions.push(cmd);
  }

  registerWebviewViewProvider(
    id: string,
    wvp: IWebviewViewProvider<any>['wvp']
  ) {
    this.context.subscriptions.push(
      window.registerWebviewViewProvider(id, wvp(this.context))
    );
  }

  registerTreeDataProvider(id: string, tdp: ITreeDataProvider['tdp']) {
    window.registerTreeDataProvider(id, tdp);
  }
}
