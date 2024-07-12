import { GLOBAL_STATE } from '../config/constant';
import {
  IGroup,
  IRawGXGitTree,
  IStructuredGroups,
} from '../interfaces/extension-configurator';

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

export const ArrayUtil = {
  sort: (arr: { [key: string]: any }[], field: string) => {
    arr.sort((a, b) => {
      return a[field].trim().localeCompare(b[field].trim(), undefined, {
        sensitivity: 'base',
      });
    });
  },
};

export async function execGet<T>(
  url: string,
  authToken: string,
  basic: boolean = false
) {
  const retryLimit = 7;
  let attempt = 0;
  const authType = basic ? 'Basic' : 'Bearer';
  do {
    attempt++;
    try {
      const data = await fetch(url, {
        headers: {
          Authorization: `${authType} ${authToken}`,
        },
        signal: AbortSignal.timeout(7000),
      });
      if (data.status === 200) {
        const response = await data.json();
        return response as T;
      }
    } catch (e) {
      console.log(e);
    }
  } while (true || attempt === retryLimit);
}

export async function execGetParallel<T>(
  url: string,
  authToken: string,
  basic: boolean = false
) {
  const isBitbucket =
    url.search(GLOBAL_STATE.PROVIDERS.BITBUCKET.API_URL) !== -1;
  const parallelAmount = 10;
  const results: any[] = [];
  const promises = [];
  let response = [];

  let start = 0;
  do {
    const urls = Array.from({ length: parallelAmount }, (_, i) => i).map(() => {
      start++;
      return `${url}&per_page=100&page=${start}&size=100`;
    });
    for (const url of urls) {
      promises.push(execGet<any[]>(url, authToken, basic));
    }
    const responses = await Promise.all(promises);

    response = isBitbucket
      ? responses.flatMap((p) => p['values'])
      : responses.flatMap((p) => p);
    results.push(...response);
    if (
      (isBitbucket &&
        responses.flatMap((p: any) => p['next'] ?? p).length === 0) ||
      response.length === 0 ||
      response.length < parallelAmount * 100
    ) {
      break;
    }
  } while (true);
  return results;
}

export function transformProviderToTree(
  groups: IRawGXGitTree[]
): IStructuredGroups {
  const parsedGroups: { [groupId: string]: IGroup } = {};

  groups.forEach((group) => {
    parsedGroups[group.group.id] = {
      projects: group.projects,
      group: group.group,
      subgroups: {},
    };
  });

  const keys = Object.keys(parsedGroups).sort((a, b) => (a < b ? 1 : -1));

  for (const groupId of keys) {
    const group = parsedGroups[groupId];
    const parentId = group.group.parent_id;
    if (parentId && parsedGroups[parentId]) {
      parsedGroups[parentId].subgroups[groupId] = JSON.parse(
        JSON.stringify(group)
      );
      delete parsedGroups[groupId];
    }
  }
  return parsedGroups;
}
