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
  const retryLimit = 7;
  let attempt = 0;
  do {
    attempt++;
    try {
      const data = await fetch(url, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        signal: AbortSignal.timeout(7000),
      });
      if (data.status === 200) {
        return (await data.json()) as T;
      }
    } catch (e) {}
  } while (true || attempt === retryLimit);
}

export async function execGetParallel<T>(url: string, authToken: string) {
  const parallelAmount = 10;
  const results: any[] = [];
  const promises = [];
  let response = [];

  let start = 0;
  do {
    const urls = Array.from({ length: parallelAmount }, (_, i) => i).map(() => {
      start++;
      return `${url}&per_page=100&page=${start}`;
    });
    for (const url of urls) {
      promises.push(execGet<any[]>(url, authToken));
    }
    response = (await Promise.all(promises)).flatMap((p) => p);
    results.push(...response);
    if (response.length === 0 || response.length < parallelAmount * 100) {
      break;
    }
  } while (true);

  return results;
}
