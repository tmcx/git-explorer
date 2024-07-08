import {
  WebviewViewResolveContext,
  WebviewViewProvider,
  CancellationToken,
  ExtensionContext,
  WebviewView,
  Webview,
  Uri,
  env,
} from 'vscode';
import {
  EServer,
  IWebviewViewProvider,
} from '../interfaces/extension-configurator';
import { globalState } from '../extension';
import { StringUtil } from '../utils/functions';
import { LANG } from '../config/constant';

const TEXT = LANG[env.language].WVP.SET_CONFIGURATION;

const EVENT = {
  DELETE_SERVER: 'delete-server',
  ADD_SERVER: 'add-server',
};

export class SetConfigurationView implements WebviewViewProvider {
  webviewView!: WebviewView;

  constructor(private readonly context: ExtensionContext) {}

  async resolveWebviewView(
    webviewView: WebviewView,
    context: WebviewViewResolveContext,
    _token: CancellationToken
  ) {
    this.webviewView = webviewView;
    await this.loadView();

    this.webviewView.webview.options = {
      localResourceRoots: [this.context.extensionUri],
      enableScripts: true,
    };

    this.webviewView.webview.onDidReceiveMessage(async (event) => {
      if (event.type === EVENT.ADD_SERVER) {
        globalState.updateTokens(event.data);
      }
      if (event.type === EVENT.DELETE_SERVER) {
        globalState.deleteToken(event.data.id);
      }
      await this.loadView();
    });
  }

  public async loadView() {
    this.webviewView.title = TEXT.TITLE;
    this.webviewView.webview.html = await this._getHtmlForWebview(
      this.webviewView.webview
    );
  }

  private async _getHtmlForWebview(webview: Webview) {
    const nonce = StringUtil.randomId();

    return `
        <!DOCTYPE html>
              <html lang="en">
          ${this._getHtmlHead(webview, nonce)}
          <body>
            ${this._getHtmlForListServers()}
            ${this._getHtmlForAddServer()}
            ${await this._getHtmlScript(webview, nonce)}
          </body>
              </html>
      `;
  }

  private _getHtmlForAddServer() {
    return `
      <h3>${TEXT.ADD_SERVER}</h3>
      <select id="select-server">
          <option disabled selected value="-99">${TEXT.SELECT_SERVER}</option>
          ${Object.values(EServer)
            .map((server) => `<option value="${server}">${server}</option>`)
            .join('')}
      </select>
      <input type="text" required placeholder="${TEXT.ALIAS}" id="alias">
      <input type="text" required placeholder="${TEXT.TOKEN}" id="token">
      <button id="add-server" disabled>${TEXT.ADD}</button>
    `;
  }

  private _getHtmlForListServers() {
    const tokens = Object.values(globalState.getTokens());
    return `
      <h3>${TEXT.CONNECTIONS}</h3>
      <section id="list-servers">
        ${tokens
          .map(
            ({ alias, server, id }) => `
            <span>
              <span title="${alias}(${server})">${alias}(${server})</span>
              <button class="delete" id="delete-server" data-id="${id}">${TEXT.DELETE}</button>
            </span>
          `
          )
          .join('')}
        ${tokens.length === 0 ? `<span>${TEXT.NO_SERVERS_LOADED}</span>` : ''}
      </section>
    `;
  }

  private _getHtmlHead(webview: Webview, nonce: String) {
    const styleMainUri = webview.asWebviewUri(
      Uri.joinPath(
        this.context.extensionUri,
        'media',
        'set-configuration',
        'main.css'
      )
    );
    return `
      <head>
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
        <link href="${styleMainUri}" rel="stylesheet">
      </head>
      `;
  }

  private _getHtmlScript(webview: Webview, nonce: String) {
    const scriptUri = webview.asWebviewUri(
      Uri.joinPath(
        this.context.extensionUri,
        'media',
        'set-configuration',
        'main.js'
      )
    );
    return `<script nonce="${nonce}" src="${scriptUri}"></script>`;
  }
}

export const WEBVIEW_SET_CONFIGURATION: IWebviewViewProvider<SetConfigurationView> =
  {
    wvp: (context: ExtensionContext) => {
      WEBVIEW_SET_CONFIGURATION.instance = new SetConfigurationView(context);
      return WEBVIEW_SET_CONFIGURATION.instance;
    },
    instance: undefined,
    id: 'set-configuration',
  };
