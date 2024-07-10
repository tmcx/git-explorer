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
    parent_id: number | null;
    web_url: string;
    name: string;
    id: number;
  };
  projects: {
    clone_http: string;
    clone_ssh: string;
    web_url: string;
    name: string;
    id: number;
  }[];
  subgroups: {
    [key: string]: IRawGXGitTree;
  };
}

export interface IGroup {
  group: IRawGXGitTree['group'];
  subgroups: { [key: number]: IRawGXGitTree };
  projects: IRawGXGitTree['projects'];
}

export interface IStructuredGroups {
  [groupId: string]: IGroup;
}

export enum EServer {
  GITLAB = 'GitLab',
  GITHUB = 'GitHub',
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
