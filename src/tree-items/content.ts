import { TreeItem, TreeItemCollapsibleState } from 'vscode';
import { GitlabService } from '../service/gitlab';
import { join } from 'path';
import {
  ContextValue,
  EServer,
  IGroup,
  IStructuredGroups,
} from '../interfaces/extension-configurator';
import { globalState } from '../extension';
import { orderByName } from '../utils/string';

export class ContentItems {
  gitlabService: GitlabService;

  constructor() {
    this.gitlabService = new GitlabService();
  }

  async get(): Promise<ContentTreeItem[]> {
    const elements: ContentTreeItem[] = [];
    const tokens = globalState.getTokens();
    for (const key in tokens) {
      const { token, server, alias } = tokens[key];
      switch (server) {
        case EServer.GITLAB:
          const projects = await this.gitlabService.getNested(token);
          const children = this.convertToTreeStructure(projects);

          const serverCTI = new ContentTreeItem(`${alias}(${server})`);
          serverCTI.setContext(ContextValue.GROUP);
          serverCTI.setChildren(children);
          elements.push(serverCTI);
          break;

        default:
          break;
      }
    }
    return elements;
  }

  convertToTreeStructure(
    structureGroups: IStructuredGroups
  ): ContentTreeItem[] {
    const parsedGroupsToContentTreeItems = (group: IGroup): ContentTreeItem => {
      const children: ContentTreeItem[] = [];
      if (group.subgroups) {
        for (const key in group.subgroups) {
          children.push(parsedGroupsToContentTreeItems(group.subgroups[key]));
        }
        orderByName(children);
      }
      if (group.projects) {
        const pChildren: ContentTreeItem[] = [];
        group.projects.forEach((project) => {
          const pCTT = new ContentTreeItem(project.name);
          pCTT.setContext(ContextValue.REPOSITORY);
          pCTT.setUrls({
            webUrl: group.group.web_url,
            http: project.http_url_to_repo,
            ssh: project.ssh_url_to_repo,
          });
          pChildren.push(pCTT);
        });
        orderByName(pChildren);
        children.push(...pChildren);
      }

      const ctt = new ContentTreeItem(group.group.name);
      ctt.setContext(ContextValue.GROUP);
      ctt.setChildren(children);
      ctt.setUrls({
        webUrl: group.group.web_url,
        http: '',
        ssh: '',
      });

      return ctt;
    };

    const contentTreeItems: ContentTreeItem[] = [];
    for (const key in structureGroups) {
      const group = structureGroups[key];
      contentTreeItems.push(parsedGroupsToContentTreeItems(group));
    }
    orderByName(contentTreeItems);
    return contentTreeItems;
  }
}

export class ContentTreeItem extends TreeItem {
  children: ContentTreeItem[] = [];
  urls?: {
    webUrl: string;
    http: string;
    ssh: string;
  };

  constructor(label: string, description?: string) {
    super(label);
    this.description = description;
  }

  private setIcon() {
    this.iconPath = join(
      __dirname,
      '..',
      '..',
      'media',
      'icons',
      `${this.contextValue}.svg`
    );
  }

  setUrls(urls: typeof this.urls) {
    this.urls = urls;
  }

  setContext(ctxValue: ContextValue) {
    this.collapsibleState =
      ctxValue === ContextValue.GROUP
        ? TreeItemCollapsibleState.Collapsed
        : TreeItemCollapsibleState.None;
    this.contextValue = ctxValue;
    this.setIcon();
  }

  setChildren(children: ContentTreeItem[]) {
    this.children = children;
  }
}
