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
import { ArrayUtil, StringUtil } from '../utils/functions';
import { TreeItem, STreeStructure } from '../service/tree-structure';
import { goTo } from '../process/go-to';
import { gitClone } from '../process/git-clone';
import { LANG } from '../config/constant';
import { EEvent, SetConfigurationEvent } from './set-configuration';
import { globalState } from '../extension';

const TEXT = LANG[env.language].WVP.CONTENT;

export enum ECEvent {
  REFRESH_ALL_CONNECTION = 'refresh-all-connection',
  REFRESH_A_CONNECTION = 'refresh-a-connection',
  GIT_CLONE = 'git-clone',
  FIRST_LOAD = 'first-load',
  LOADING = 'loading',
  GO_TO = 'go-to',
}

export type ContentEvent =
  | {
      type: ECEvent.GIT_CLONE;
      data: { http: string; ssh: string };
    }
  | {
      type: ECEvent.GO_TO;
      data: { url: string };
    }
  | {
      type: ECEvent.REFRESH_ALL_CONNECTION;
    }
  | {
      type: ECEvent.REFRESH_A_CONNECTION;
      data: { id: string };
    }
  | {
      type: ECEvent.FIRST_LOAD;
    };

export type Events = SetConfigurationEvent | ContentEvent;

export class ContentView implements WebviewViewProvider {
  webviewView!: WebviewView;
  treeCache: TreeItem[];
  promises: Promise<void>[];

  constructor(private readonly context: ExtensionContext) {
    this.treeCache = [];
    this.promises = [];
  }

  async resolveWebviewView(
    webviewView: WebviewView,
    context: WebviewViewResolveContext,
    _token: CancellationToken
  ) {
    this.webviewView = webviewView;
    this.webviewView.webview.options = {
      localResourceRoots: [this.context.extensionUri],
      enableScripts: true,
    };
    await this.loadView({
      type: ECEvent.FIRST_LOAD,
    });

    this.webviewView.webview.onDidReceiveMessage(async (event) => {
      if (event.type === ECEvent.GO_TO) {
        goTo(event.data.url);
      }
      if (event.type === ECEvent.GIT_CLONE) {
        gitClone(event.data);
      }
      if (event.type === ECEvent.REFRESH_ALL_CONNECTION) {
        this.loadView(event);
      }
      if (event.type === ECEvent.REFRESH_A_CONNECTION) {
        this.loadView(event);
      }
    });
  }

  public async loadView(event?: Events) {
    await Promise.all(this.promises);
    const task = async () => {
      this.webviewView.title = TEXT.TITLE;
      const nonce = StringUtil.randomId();

      if (
        event?.type === ECEvent.FIRST_LOAD ||
        event?.type === ECEvent.REFRESH_ALL_CONNECTION
      ) {
        this.webviewView.webview.html =
          await this._getTempHtmlForFirstLoadWebview(
            this.webviewView.webview,
            nonce
          );
      }

      if (event?.type === ECEvent.REFRESH_A_CONNECTION) {
        this.webviewView.webview.html = await this._getHtmlForWebview(
          this.webviewView.webview,
          nonce,
          false,
          event
        );
      }

      if (event?.type === EEvent.ADD_SERVER) {
        this.webviewView.webview.html = await this._getHtmlForWebview(
          this.webviewView.webview,
          nonce,
          true,
          event
        );
      }

      this.webviewView.webview.html = await this._getHtmlForWebview(
        this.webviewView.webview,
        nonce,
        false,
        event
      );
    };

    this.promises.push(task());
  }

  private _getHtmlForHeader(loading = false) {
    return `
      <section class="header">
        <span>${TEXT.TITLE}</span>
        <span class="icon refresh ${loading ? 'disabled' : ''}" title="${
      TEXT.REFRESH_ALL
    }"></span>
      </section>`;
  }

  private async _getTempHtmlForFirstLoadWebview(
    webview: Webview,
    nonce: string
  ) {
    const tokens = globalState.getTokens();
    const names = Object.values(tokens).map(({ alias, server }) => ({
      name: `${alias}(${server})`,
    }));
    ArrayUtil.sort(names, 'name');
    const content = `
      <section class="temp-content">
        ${names
          .map(
            ({ name }) =>
              `<section class="level">
                <span class="icon refresh loading"></span>
                <span class="icon group"></span>
                <span>${name}</span>
              </section>
            `
          )
          .join('')}
      </section>`;

    return `
        <!DOCTYPE html>
              <html lang="en">
          ${this._getHtmlHead(webview, nonce)}
          <body>
            ${this._getHtmlForSearchBox()}
            ${this._getHtmlForHeader(true)}
            ${content}
            ${await this._getHtmlScript(webview, nonce)}
          </body>
              </html>
      `;
  }

  private async _getHtmlForWebview(
    webview: Webview,
    nonce: string,
    temp: boolean,
    event?: Events
  ) {
    const content = await this._getHtmlForTreeContent(temp, event);
    return `
        <!DOCTYPE html>
              <html lang="en">
          ${this._getHtmlHead(webview, nonce)}
          <body>
            ${this._getHtmlForSearchBox()}
            ${this._getHtmlForHeader()}
            ${content}
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

  private async _getHtmlForTreeContent(temp: boolean, event?: Events) {
    const basePadding = 15;
    await this.updateTreeCache(temp, event);

    const elsHTML = (element: TreeItem, padding: number) => {
      const isRepository = element.contextValue === ContextValue.REPOSITORY;
      const isGroup = element.contextValue === ContextValue.GROUP;
      const isParent = basePadding === padding;
      let { validToken } = element;
      validToken =
        validToken === undefined || validToken === true ? true : false;
      const isProviderLevel = !!element.tokenId;
      const type = isGroup ? 'group' : 'repository';

      let iconCollapsed =
        isGroup && validToken ? '<span class="expand">></span>' : '';

      if (element.loading) {
        iconCollapsed = '<span class="icon refresh loading"></span>';
      }

      let iconCreateChild = '';
      if (element.urls?.new) {
        iconCreateChild +=
          '<div class="create-child"><span>+</span><div class="options">';
        if (element.urls?.new?.repo) {
          iconCreateChild += `<span class="create-repo" data-url="${element.urls?.new?.repo}"><span class="icon repository"></span>${TEXT.REPOSITORY}</span>`;
        }
        if (element.urls?.new?.subgroup) {
          iconCreateChild += `<span class="create-group" data-url="${element.urls?.new?.subgroup}"><span class="icon group"></span>${TEXT.GROUP}</span>`;
        }
        iconCreateChild += '</div></div>';
      }

      const iconRefresh = isParent
        ? `<span class="parent icon refresh" data-id="${element.tokenId}"></span>`
        : '';

      const gitCloneIcon = isRepository
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
      let description = validToken ? element.description : TEXT.INVALID_TOKEN;

      description = `<span class="description">${description}</span>`;

      let text = `
        <button class="title ${type} ${!!element.loading ? 'disabled' : ''} ${
        !validToken ? 'invalid-token' : ''
      }" data-id="${element.id}" style="padding-left: ${padding}px">
          ${iconCollapsed}
          <span class="icon ${type}"></span>
          ${iconRefresh}
          ${goToIcon}
          ${gitCloneIcon}
          ${iconCreateChild}
          <span class="name" title="${element.label}">${description}${
        element.label
      }</span>
        </button>
      `;

      if (element.children.length > 0) {
        text += `
        <section class="children" id="${element.id}">
          <span class="line" style="margin-left: ${padding}px;"></span>
          ${element.children.map((e) => elsHTML(e, padding + 15)).join('')}
        </section>`;
      }

      if (isGroup && element.children.length === 0) {
        text += `
        <section class="children empty" id="${element.id}">
          <span style="margin-left: ${padding + 20}px;">${
          TEXT.EMPTY_GROUP
        }</span>
        </section>`;
      }

      return text;
    };

    return `
      <section class="tree-content">${this.treeCache
        .map((element) => elsHTML(element, basePadding))
        .join('')}</section>
    `;
  }

  async updateTreeCache(temp: boolean, event: Events | undefined) {
    switch (event?.type) {
      case EEvent.ADD_SERVER:
        if (temp) {
          const tempTreeItem = new TreeItem(
            `${event.data.alias}(${event.data.server})`
          );
          tempTreeItem.setContext(ContextValue.GROUP);
          tempTreeItem.tokenId = event.data.id;
          tempTreeItem.loading = true;
          this.treeCache = [...this.treeCache, tempTreeItem];
        } else {
          this.treeCache = this.treeCache.filter(
            (el) => el.tokenId !== event.data.id
          );
          const newServer = await STreeStructure.get({ id: event.data.id });
          this.treeCache = [...this.treeCache, ...newServer];
        }
        break;
      case ECEvent.REFRESH_A_CONNECTION:
        const newServer = await STreeStructure.get({ id: event.data.id });
        const idx = this.treeCache.findIndex(
          (el) => el.tokenId === event.data.id
        );
        this.treeCache[idx] = newServer[0];
        break;
      case EEvent.DELETE_SERVER:
        this.treeCache = this.treeCache.filter(
          (element) => element.tokenId !== event.data.id
        );
        break;
      case ECEvent.REFRESH_ALL_CONNECTION:
        this.treeCache = await STreeStructure.get();
      case ECEvent.FIRST_LOAD:
        this.treeCache = await STreeStructure.get({ refresh: false });
        break;
    }
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
