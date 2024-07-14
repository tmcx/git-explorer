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
  IServer,
  IWebviewViewProvider,
} from '../interfaces/extension-configurator';
import { globalState } from '../extension';
import { ArrayUtil, StringUtil, validateToken } from '../utils/functions';
import { GLOBAL_STATE, LANG } from '../config/constant';
import { WEBVIEW_CONTENT } from './content';

const TEXT = LANG[env.language].WVP.SET_CONFIGURATION;

export enum EEvent {
  DELETE_SERVER = 'delete-server',
  ADD_SERVER = 'add-server',
}

export type SetConfigurationEvent =
  | {
      type: EEvent.ADD_SERVER;
      data: IServer;
    }
  | {
      type: EEvent.DELETE_SERVER;
      data: { id: string };
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

    this.webviewView.webview.onDidReceiveMessage(
      async (event: SetConfigurationEvent) => {
        if (event.type === EEvent.ADD_SERVER) {
          globalState.updateTokens(event.data);
        }
        if (event.type === EEvent.DELETE_SERVER) {
          globalState.deleteToken(event.data.id);
        }
        await WEBVIEW_CONTENT.instance?.loadView(event);
        await this.loadView();
      }
    );
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
            ${await this._getHtmlForListServers()}
            ${this._getHtmlForAddServer()}
            ${await this._getHtmlScript(webview, nonce)}
          </body>
              </html>
      `;
  }

  private _getHtmlForAddServer() {
    return `
      <h3>${TEXT.ADD_SERVER}</h3>
      <section class="new-server">
          <section class="selected">
            <span class="text" aria-default="true">${TEXT.SELECT_SERVER}</span>
            <span class="icon">></span>
          </section>
          <section class="options">
            ${Object.values(EServer)
              .map((server) => `<span value="${server}">${server}</span>`)
              .join('')}
          </section>
      </section>
      <input type="text" required placeholder="${TEXT.ALIAS}" id="alias">
      <input type="text" required placeholder="${TEXT.USERNAME}" id="username">
      <div class="password">
        <input type="password" required placeholder="${TEXT.TOKEN}" id="token">
        <a class="hidden" href="" title="${TEXT.GET_TOKEN_URL_TITLE}">i</a>
      </div>
      <span class="invalid-token">${TEXT.INVALID_TOKEN}</span>
      <button id="add-server" disabled>${TEXT.ADD}</button>
    `;
  }

  private async _getHtmlForListServers() {
    const tokens = Object.values(globalState.getTokens());

    const names = [];

    for (const { id, alias, server, token } of tokens) {
      let validToken = await validateToken(token, server.toLowerCase());
      let description = validToken ? '' : TEXT.INVALID_TOKEN;
      names.push({ name: `${alias}(${server})`, id, validToken, description });
    }

    ArrayUtil.sort(names, 'name');
    return `
      <h3>${TEXT.CONNECTIONS}</h3>
      <section id="list-servers">
        ${names
          .map(
            ({ name, id, validToken }) => `
            <span>
              ${`<span class="description invalid-token"> ${
                !validToken ? TEXT.INVALID_TOKEN : ''
              } </span>`}
              <span title="${name}">${name}</span>
              <button class="delete" id="delete-server" data-id="${id}">${
              TEXT.DELETE
            }</button>
            </span>
          `
          )
          .join('')}
        ${
          tokens.length === 0
            ? `<span class="no-content">${TEXT.NO_SERVERS_LOADED}</span>`
            : ''
        }
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

    const urls = Object.values(GLOBAL_STATE.PROVIDERS)
      .map((provider) => provider.VALIDATE_TOKEN_URL)
      .join(' ');

    const iconsUri = webview.asWebviewUri(
      Uri.joinPath(this.context.extensionUri, 'media', 'content', 'icons.css')
    );
    return `
      <head>
        <meta http-equiv="Content-Security-Policy" content="connect-src ${urls}; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
        <link href="${styleMainUri}" rel="stylesheet">
        <link href="${iconsUri}" rel="stylesheet">
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
