import { ContentTreeItem } from '../tree-items/content';

export const StringUtil = {
  getNonce: () => {
    let text = '';
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  },
};

export const ContentTreeItemUtil = {
  orderByName: (arr: ContentTreeItem[]) => {
    arr.sort((a, b) =>
      String(a.label).localeCompare(String(b.label), undefined, {
        sensitivity: 'base',
      })
    );
  },
};

export const ObjectUtil = {
  clone: <T>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj));
  },
};
