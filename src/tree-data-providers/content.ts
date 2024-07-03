import { Event, EventEmitter, TreeDataProvider, TreeItem } from 'vscode';
import {
  ContextValue,
  ITreeDataProvider,
} from '../interfaces/extension-configurator';
import { ContentItems, ContentTreeItem } from '../tree-items/content';
import { globalState } from '../extension';
import { ObjectUtil } from '../utils/functions';

export class ContentTreeDataProvider implements TreeDataProvider<unknown> {
  private allTreeItems: ContentTreeItem[];
  private filteredTreeItems: ContentTreeItem[];

  constructor() {
    this.filteredTreeItems = [];
    this.allTreeItems = [];
    this.refresh();
  }

  async getTreeItem(element: TreeItem): Promise<TreeItem> {
    return element;
  }

  async getChildren(element?: ContentTreeItem): Promise<TreeItem[]> {
    return element ? element.children : this.filteredTreeItems;
  }

  refresh(): void {
    this.filteredTreeItems = Object.values(globalState.getTokens()).map(
      ({ server, alias }) =>
        new ContentTreeItem(`${alias}(${server})`, 'Loading...')
    );

    new ContentItems().get().then((items) => {
      this.allTreeItems = items;
      this.filteredTreeItems = items;
      this._onDidChangeTreeData.fire();
    });
  }

  search(query: string): void {
    if (!query) {
      this.filteredTreeItems = ObjectUtil.clone(this.allTreeItems);
    } else {
      const filter = (level: ContentTreeItem) => {
        level.children = level.children.filter((item) => {
          if (item.children) {
            const res = filter(item).children.length > 0;
            if (res) {
              return true;
            }
          }
          const result = String(item.label)
            .trim()
            .toLowerCase()
            .includes(query.trim().toLowerCase());
          return result;
        });
        return level;
      };
      const reduceToAnLevel = (
        level: ContentTreeItem,
        path: string[],
        mainLevel?: boolean
      ): ContentTreeItem[] => {
        if (!mainLevel) {
          path.push(String(level.label));
        }
        const output = [];
        if (level.contextValue !== ContextValue.GROUP) {
          level.description = path.join(' > ');
          level.tooltip = String(level.label) + ' ● ' + path.join(' > ');
          output.push(level);
        }
        if (level.children.length > 0) {
          output.push(
            ...level.children
              .flatMap((item) => reduceToAnLevel(item, path))
              .filter((item) => item.contextValue !== ContextValue.GROUP)
          );
          return output;
        }
        return output;
      };

      this.filteredTreeItems = ObjectUtil.clone(this.allTreeItems)
        .map(filter)
        .flatMap((level) => {
          const ti = new ContentTreeItem(String(level.label) + ' ');
          const children = ObjectUtil.clone(reduceToAnLevel(level, [], true));
          ti.setContext(ContextValue.GROUP, true);
          ti.setChildren(children);
          ti.setUrls(level.urls);
          return ti;
        });
      globalState.setTemp('search', query);
    }
    this._onDidChangeTreeData.fire();
  }

  private _onDidChangeTreeData: EventEmitter<TreeItem | void> =
    new EventEmitter<TreeItem | void>();
  readonly onDidChangeTreeData: Event<TreeItem | void> =
    this._onDidChangeTreeData.event;
}

export const TDP = new ContentTreeDataProvider();
export const TDP_CONTENT: ITreeDataProvider = {
  id: 'tdp-content',
  tdp: TDP,
};
