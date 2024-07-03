import { ExtensionContext } from 'vscode';
import { GLOBAL_STATE } from './constant';
import { IServer } from '../interfaces/extension-configurator';

export class GlobalState {
  private tempValues: { [key: string]: string };

  constructor(private context: ExtensionContext) {
    this.tempValues = {};
  }

  getTokens(): {
    [key: string]: IServer;
  } {
    return JSON.parse(
      this.context.globalState.get(GLOBAL_STATE.KEY.TOKENS) || '{}'
    );
  }

  updateTokens(serverConfig: IServer) {
    this.context.globalState.setKeysForSync([GLOBAL_STATE.KEY.TOKENS]);
    const tokens = this.getTokens();
    tokens[serverConfig.id] = serverConfig;
    this.context.globalState.update(
      GLOBAL_STATE.KEY.TOKENS,
      JSON.stringify(tokens)
    );
  }

  deleteToken(id: string) {
    const tokens = this.getTokens();
    delete tokens[id];
    this.context.globalState.update(
      GLOBAL_STATE.KEY.TOKENS,
      JSON.stringify(tokens)
    );
  }

  getTemp(key: string): string {
    return this.tempValues[key];
  }

  setTemp(key: string, value: string) {
    this.tempValues[key] = value;
  }
}
