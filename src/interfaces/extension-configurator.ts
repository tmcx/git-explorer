import {
  ExtensionContext,
  TreeDataProvider,
  WebviewViewProvider,
} from 'vscode';

interface CustomTreeDataProvider extends TreeDataProvider<unknown> {
  search(query: string): void;
  refresh(): void;
}

export type TCallback = (...args: any[]) => any;

export interface ICommand {
  callback: TCallback;
  id: string;
}

export interface ITreeDataProvider {
  tdp: CustomTreeDataProvider;
  id: string;
}

export interface IWebviewViewProvider<T> {
  wvp: (context: ExtensionContext) => WebviewViewProvider;
  instance?: T;
  id: string;
}

export interface IRawGXGitTree {
  group: {
    create_subgroup_url: string;
    create_repo_url: string;
    parent_id: number | string | null;
    web_url: string;
    name: string;
    id: number | string;
    description: string;
  };
  projects: {
    clone_http: string;
    clone_ssh: string;
    web_url: string;
    name: string;
    id: number | string;
    description: string;
  }[];
  subgroups: {
    [key: string]: IRawGXGitTree;
  };
}

export interface IGroup {
  group: IRawGXGitTree['group'];
  subgroups: { [key: number | string]: IRawGXGitTree };
  projects: IRawGXGitTree['projects'];
}

export interface IStructuredGroups {
  [groupId: string]: IGroup;
}

export enum EServer {
  GITLAB = 'GitLab',
  GITHUB = 'GitHub',
  BITBUCKET = 'BitBucket',
}

export interface IServer {
  server: EServer;
  alias: string;
  token: string;
  id: string;
}

export enum ContextValue {
  GROUP = 'group',
  REPOSITORY = 'repository',
}

export enum PROTOCOL {
  SSH = 'SSH',
  HTTP = 'HTTP',
}
