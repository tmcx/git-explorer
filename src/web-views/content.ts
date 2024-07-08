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
  ContextValue,
  IWebviewViewProvider,
} from '../interfaces/extension-configurator';
import { StringUtil } from '../utils/functions';
import { TreeItem, TreeStructure } from '../service/tree-structure';
import { goTo } from '../process/go-to';
import { gitClone } from '../process/git-clone';
import { LANG } from '../config/constant';

const TEXT = LANG[env.language].WVP.CONTENT;

const EVENT = {
  GIT_CLONE: 'git-clone',
  GO_TO: 'go-to',
};

export class ContentView implements WebviewViewProvider {
  treeStructure: TreeStructure;
  webviewView!: WebviewView;

  constructor(private readonly context: ExtensionContext) {
    this.treeStructure = new TreeStructure();
  }

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
      if (event.type === EVENT.GO_TO) {
        goTo(event.data.url);
      }
      if (event.type === EVENT.GIT_CLONE) {
        gitClone(event.data.urls);
      }
      // await this.loadView();
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
            ${await this._getHtmlForSearchBox()}
            ${await this._getHtmlForTreeContent()}
            ${await this._getHtmlScript(webview, nonce)}
          </body>
              </html>
      `;
  }

  private _getHtmlForSearchBox() {
    return `
      <section class="search-bar">
      <input type="text" id="search" placeholder="${TEXT.SEARCH}" />
      <span class="icon clear-all" title="${TEXT.CLEAR_ALL}"></span>
      </section>
    `;
  }

  private async _getHtmlForTreeContent() {
    const elements = await this.treeStructure.get();
    const elsHTML = (
      element: TreeItem,
      spaces: number,
      isProviderLevel?: boolean
    ) => {
      const id = StringUtil.randomId(true);
      const type =
        element.contextValue === ContextValue.GROUP ? 'group' : 'repository';

      const iconCollapsed =
        type === ContextValue.GROUP ? '<span class="expand">></span>' : '';

      const gitCloneIcon =
        element.contextValue === ContextValue.REPOSITORY
          ? `<span
              class="icon git-clone"
              data-http="${element.urls?.http}"
              data-ssh="${element.urls?.ssh}"
              title="${TEXT.GIT_CLONE}"
            ></span>`
          : '';

      const goToIcon = isProviderLevel
        ? ''
        : `<span class="icon go-to" data-url="${element.urls?.webUrl}" title="${TEXT.GO_TO}"></span>`;

      let text = `
        <button class="title ${type}" data-id="${id}" style="padding-left: ${spaces}px">
          ${iconCollapsed}
          <span class="icon ${type}"></span>
          <span class="name" title="${element.label}">${element.label}</span>
          ${gitCloneIcon}
          ${goToIcon}
        </button>
      `;

      if (element.children.length > 0) {
        text += `
        <section class="children" id="${id}">
          <span class="line" style="margin-left: ${spaces}px;"></span>
          ${element.children.map((e) => elsHTML(e, spaces + 15)).join('')}
        </section>`;
      }

      if (type === ContextValue.GROUP && element.children.length === 0) {
        text += `
        <section class="children empty" id="${id}">
          <span style="margin-left: ${
            spaces + 20
          }px;">${TEXT.EMPTY_GROUP}</span>
        </section>`;
      }

      return text;
    };

    return `
      <section class="tree-content">${elements
        .map((element) => elsHTML(element, 15, true))
        .join('')}</section>
    `;
  }

  private _getHtmlHead(webview: Webview, nonce: String) {
    const styleMainUri = webview.asWebviewUri(
      Uri.joinPath(this.context.extensionUri, 'media', 'content', 'main.css')
    );
    const iconsUri = webview.asWebviewUri(
      Uri.joinPath(this.context.extensionUri, 'media', 'content', 'icons.css')
    );
    return `
      <head>
        <meta http-equiv="Content-Security-Policy" content="style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
        <link href="${styleMainUri}" rel="stylesheet">
        <link href="${iconsUri}" rel="stylesheet">
      </head>
      `;
  }

  private _getHtmlScript(webview: Webview, nonce: String) {
    const scriptUri = webview.asWebviewUri(
      Uri.joinPath(this.context.extensionUri, 'media', 'content', 'main.js')
    );
    return `
    <script nonce="${nonce}" src="${scriptUri}"></script>
    `;
  }
}

export const WEBVIEW_CONTENT: IWebviewViewProvider<ContentView> = {
  wvp: (context: ExtensionContext) => {
    WEBVIEW_CONTENT.instance = new ContentView(context);
    return WEBVIEW_CONTENT.instance;
  },
  instance: undefined,
  id: 'content',
};
