import { TreeItem, TreeItemCollapsibleState } from 'vscode';
import { GitlabService } from '../service/gitlab';
import { join } from 'path';
import {
  IGroup,
  IStructuredGroups,
} from '../interfaces/extension-configurator';

enum ContextValue {
  GROUP = 'group',
  REPOSITORY = 'repository',
}

function orderByName(arr: ContentTreeItem[]) {
  arr.sort((a, b) =>
    String(a.label).localeCompare(String(b.label), undefined, {
      sensitivity: 'base',
    })
  );
}

export class ContentItems {
  gitlabService: GitlabService;

  constructor() {
    this.gitlabService = new GitlabService();
  }

  async get(): Promise<ContentTreeItem[]> {
    const projects = await this.gitlabService.getNested();
    return this.convertToTreeStructure(projects);
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

  constructor(label: string) {
    super(label);
  }

  private setIcon() {
    this.iconPath = join(
      __dirname,
      '..',
      '..',
      'media',
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
