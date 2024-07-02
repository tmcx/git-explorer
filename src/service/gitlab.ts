import { authToken } from '../config/constant';
import {
  IGroup,
  IRawGXGitTree,
  IStructuredGroups,
} from '../interfaces/extension-configurator';

const baseUrl = `https://gitlab.com/api/v4`;

export class GitlabService {
  async execGet<T>(url: string) {
    const data = await fetch(url, {
      headers: {
        'PRIVATE-TOKEN': authToken,
      },
    });
    return data.json() as T;
  }

  async getProjects(groupId: number): Promise<any[]> {
    const projects: any[] = [];
    let res: any[] = [];
    let i = 1;
    do {
      const url = `${baseUrl}/groups/${groupId}/projects?per_page=100&page=${i}`;
      res = await this.execGet<any[]>(url);
      projects.push(...res);
      i++;
    } while (res.length > 0);
    return projects;
  }

  async getGroups(): Promise<any[]> {
    const groups: any[] = [];
    let res: any[] = [];
    let i = 1;
    do {
      const url = `${baseUrl}/groups?per_page=100&page=${i}`;
      res = await this.execGet<any[]>(url);
      groups.push(...res);
      i++;
    } while (res.length > 0);
    return groups;
  }

  async getNested(): Promise<IStructuredGroups> {
    const groups = await this.getGroups();
    const promises: Promise<IRawGXGitTree>[] = [];
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      promises.push(
        (async () => {
          const projects = await this.getProjects(group.id);
          return {
            projects: projects.map((project) => ({
              http_url_to_repo: project.http_url_to_repo,
              ssh_url_to_repo: project.ssh_url_to_repo,
              name: project.name,
              id: project.id,
            })),
            group: {
              parent_id: group.parent_id,
              web_url: group.web_url,
              name: group.name,
              id: group.id,
            },
            subgroups: {},
          };
        })()
      );
    }
    return this.format(await Promise.all(promises));
  }

  format(groups: IRawGXGitTree[]): IStructuredGroups {
    const parsedGroups: { [groupId: string]: IGroup } = {};

    groups.forEach((group) => {
      parsedGroups[group.group.id] = {
        projects: group.projects,
        group: group.group,
        subgroups: {},
      };
    });

    const keys = Object.keys(parsedGroups)
      .map(Number)
      .sort((a, b) => (a < b ? 1 : -1));

    for (const groupId of keys) {
      const group = parsedGroups[groupId];
      const parentId = group.group.parent_id;
      if (parentId) {
        parsedGroups[parentId].subgroups[groupId] = JSON.parse(
          JSON.stringify(group)
        );
        delete parsedGroups[groupId];
      }
    }

    return parsedGroups;
  }
}
