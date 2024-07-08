import { TreeItem } from '../service/tree-structure';

export const StringUtil = {
  randomId: (justLetters?: boolean) => {
    let text = '';
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' +
      (justLetters ? '' : '0123456789');
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  },
};

export const TreeItemUtil = {
  orderByName: (arr: TreeItem[]) => {
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

export async function execGet<T>(url: string, authToken: string) {
  do {
    const data = await fetch(url, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    if (data.status === 200) {
      return data.json() as T;
    }
  } while (true);
}
