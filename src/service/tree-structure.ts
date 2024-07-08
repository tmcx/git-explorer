import { join } from 'path';
import {
  ContextValue,
  EServer,
  IGroup,
  IStructuredGroups,
} from '../interfaces/extension-configurator';
import { globalState } from '../extension';
import { TreeItemUtil } from '../utils/functions';
import { GitlabService } from './providers/gitlab';
import { GithubService } from './providers/github';

export class TreeStructure {
  gitlabService: GitlabService;
  githubService: GithubService;

  constructor() {
    this.gitlabService = new GitlabService();
    this.githubService = new GithubService();
  }

  async get(): Promise<TreeItem[]> {
    const elements: TreeItem[] = [];
    let projects: IStructuredGroups;
    let children: TreeItem[];

    const tokens = globalState.getTokens();
    for (const key in tokens) {
      let serverCTI: TreeItem;
      const { token, server, alias } = tokens[key];
      switch (server) {
        case EServer.GITLAB:
          projects = await this.gitlabService.getNested(token);
          children = this.convertToTreeStructure(projects);

          serverCTI = new TreeItem(`${alias}(${server})`);
          serverCTI.setContext(ContextValue.GROUP);
          serverCTI.setChildren(children);
          elements.push(serverCTI);
          break;
        case EServer.GITHUB:
          projects = await this.githubService.getNested(token);
          children = this.convertToTreeStructure(projects);

          serverCTI = new TreeItem(`${alias}(${server})`);
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

  convertToTreeStructure(structureGroups: IStructuredGroups): TreeItem[] {
    const parsedGroupsToContentTreeItems = (group: IGroup): TreeItem => {
      const children: TreeItem[] = [];
      if (group.subgroups) {
        for (const key in group.subgroups) {
          children.push(parsedGroupsToContentTreeItems(group.subgroups[key]));
        }
        TreeItemUtil.orderByName(children);
      }
      if (group.projects) {
        const pChildren: TreeItem[] = [];
        group.projects.forEach((project) => {
          const pCTT = new TreeItem(project.name);
          pCTT.setContext(ContextValue.REPOSITORY);
          pCTT.setUrls({
            webUrl: project.web_url,
            http: project.clone_http,
            ssh: project.clone_ssh,
          });
          pChildren.push(pCTT);
        });
        TreeItemUtil.orderByName(pChildren);
        children.push(...pChildren);
      }

      const ctt = new TreeItem(group.group.name);
      ctt.setContext(ContextValue.GROUP);
      ctt.setChildren(children);
      ctt.setUrls({
        webUrl: group.group.web_url,
        http: '',
        ssh: '',
      });

      return ctt;
    };

    const contentTreeItems: TreeItem[] = [];
    for (const key in structureGroups) {
      const group = structureGroups[key];
      contentTreeItems.push(parsedGroupsToContentTreeItems(group));
    }
    TreeItemUtil.orderByName(contentTreeItems);
    return contentTreeItems;
  }
}

export class TreeItem {
  contextValue: string;
  description: string;
  iconPath: string;
  label: string;
  children: TreeItem[] = [];
  urls?: {
    webUrl: string;
    http: string;
    ssh: string;
  };

  constructor(
    label?: string,
    description?: string,
    iconPath?: string,
    contextValue?: string
  ) {
    this.contextValue = contextValue || '';
    this.description = description || '';
    this.iconPath = iconPath || '';
    this.label = label || '';
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

  setContext(ctxValue: ContextValue, expanded: boolean = false) {
    this.contextValue = ctxValue;
    this.setIcon();
  }

  setChildren(children: TreeItem[]) {
    this.children = children;
  }
}
