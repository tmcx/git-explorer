import { Event, EventEmitter, TreeDataProvider, TreeItem } from 'vscode';
import { ITreeDataProvider } from '../interfaces/extension-configurator';
import { ContentItems, ContentTreeItem } from '../tree-items/content';

export class ContentTreeDataProvider implements TreeDataProvider<unknown> {
  private contentTreeItems: ContentTreeItem[];

  constructor() {
    this.contentTreeItems = [];
    this.refresh();
  }

  async getTreeItem(element: TreeItem): Promise<TreeItem> {
    return element;
  }

  async getChildren(element?: ContentTreeItem): Promise<TreeItem[]> {
    return element ? element.children : this.contentTreeItems;
  }

  refresh(): void {
    new ContentItems().get().then((items) => {
      this.contentTreeItems = items;
      this._onDidChangeTreeData.fire(undefined);
    });
  }

  private _onDidChangeTreeData: EventEmitter<TreeItem | undefined> =
    new EventEmitter<TreeItem | undefined>();

  readonly onDidChangeTreeData: Event<TreeItem | undefined> =
    this._onDidChangeTreeData.event;
}

export const TDP = new ContentTreeDataProvider();
export const TDP_CONTENT: ITreeDataProvider = {
  id: 'tdp-content',
  tdp: TDP,
};
