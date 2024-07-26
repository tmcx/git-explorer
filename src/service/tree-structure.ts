import { join } from 'path';
import {
  ContextValue,
  EServer,
  IGroup,
  IStructuredGroups,
} from '../interfaces/extension-configurator';
import { globalState } from '../extension';
import { StringUtil, ArrayUtil, validateToken } from '../utils/functions';
import { GitlabService } from './providers/gitlab';
import { GithubService } from './providers/github';
import { BitbucketService } from './providers/bitbucket';

class TreeStructure {
  cache: Map<string, TreeItem>;
  bitbucketService: BitbucketService;
  gitlabService: GitlabService;
  githubService: GithubService;

  constructor() {
    this.bitbucketService = new BitbucketService();
    this.gitlabService = new GitlabService();
    this.githubService = new GithubService();
    this.cache = new Map();
  }

  async get(
    opts: {
      id?: string;
      refresh?: boolean;
    } = {
      refresh: true,
    }
  ): Promise<TreeItem[]> {
    let { id, refresh } = opts;
    const elements: TreeItem[] = [];
    let children: TreeItem[];
    const services = {
      [EServer.GITLAB]: this.gitlabService,
      [EServer.GITHUB]: this.githubService,
      [EServer.BITBUCKET]: this.bitbucketService,
    };

    let tokens = globalState.getTokens();
    if (id) {
      tokens = { [id]: tokens[id] };
      refresh = true;
    }

    if (refresh) {
      if (!id) {
        this.cache.clear();
      }
      this.cache.clear();
      for (const key in tokens) {
        let serverCTI: TreeItem;
        const { token, server, alias, id } = tokens[key];

        serverCTI = new TreeItem(`${alias}(${server})`);
        serverCTI.setContext(ContextValue.GROUP);
        serverCTI.tokenId = id;

        const valid = await validateToken(token, server.toLowerCase());
        serverCTI.validToken = valid;
        if (valid) {
          const projects = await services[server].getNested(token);
          children = this.convertToTreeStructure(projects);
          serverCTI.setChildren(children);
        }
        elements.push(serverCTI);
        this.cache.set(id, serverCTI);
      }
    } else {
      for (const el of this.cache.entries()) {
        elements.push(el[1]);
      }
    }
    ArrayUtil.sort(elements, 'label');
    return elements;
  }

  convertToTreeStructure(structureGroups: IStructuredGroups): TreeItem[] {
    const parsedGroupsToContentTreeItems = (group: IGroup): TreeItem => {
      const children: TreeItem[] = [];
      if (group.subgroups) {
        for (const key in group.subgroups) {
          children.push(parsedGroupsToContentTreeItems(group.subgroups[key]));
        }
        ArrayUtil.sort(children, 'label');
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
        ArrayUtil.sort(pChildren, 'label');
        children.push(...pChildren);
      }

      const ctt = new TreeItem(group.group.name);
      ctt.setContext(ContextValue.GROUP);
      ctt.setChildren(children);
      ctt.setUrls({
        new: {
          subgroup: group.group.create_subgroup_url,
          repo: group.group.create_repo_url,
        },
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
    ArrayUtil.sort(contentTreeItems, 'label');
    return contentTreeItems;
  }
}

export class TreeItem {
  id: string;
  contextValue: string;
  validToken?: boolean;
  loading?: boolean;
  tokenId?: string;
  description: string;
  iconPath: string;
  label: string;
  children: TreeItem[] = [];
  urls?: {
    new?: {
      subgroup: string;
      repo: string;
    };
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
    this.id = StringUtil.randomId(true);
    this.contextValue = contextValue || '';
    this.description = description || '';
    this.iconPath = iconPath || '';
    this.label = label || '';
    this.children = [];
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

export const STreeStructure = new TreeStructure();
