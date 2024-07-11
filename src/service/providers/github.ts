import { GLOBAL_STATE } from '../../config/constant';
import {
  IRawGXGitTree,
  IStructuredGroups,
} from '../../interfaces/extension-configurator';
import {
  execGet,
  execGetParallel,
  transformProviderToTree,
} from '../../utils/functions';

const apiUrl = GLOBAL_STATE.PROVIDERS.GITHUB.API_URL;
const webUrl = GLOBAL_STATE.PROVIDERS.GITHUB.WEB_URL;
let authToken = '';

export class GithubService {
  async getMyUser(): Promise<any> {
    const url = `${apiUrl}/user`;
    return execGet<any>(url, authToken);
  }

  async getProjects(org?: string): Promise<any[]> {
    org = org ? `orgs/${org}` : 'user';
    return execGetParallel(`${apiUrl}/${org}/repos?`, authToken);
  }

  async getGroups(): Promise<any[]> {
    return execGetParallel(`${apiUrl}/user/orgs?`, authToken);
  }

  async getNested(token: string): Promise<IStructuredGroups> {
    authToken = token;
    let groups = (await this.getGroups()).map((group) => ({
      web_url: `${webUrl}/${group.login}`,
      name: group.login,
      parent_id: -99,
      id: group.id,
    }));

    const myUser = await this.getMyUser();
    groups.push({
      id: myUser.id,
      name: myUser.login,
      parent_id: -99,
      web_url: `${webUrl}/${myUser.login}?tab=repositories`,
    });
    let projects = await this.getProjects();

    projects = projects.map((project) => ({
      parent_id: project.owner.id,
      http_url: project.clone_url,
      ssh_url: project.ssh_url,
      web_url: project.html_url,
      name: project.name,
      id: project.id,
    }));

    const outProjects: IRawGXGitTree[] = [];
    for (const group of groups) {
      outProjects.push({
        projects: projects
          .filter(({ parent_id }) => parent_id === group.id)
          .map((project) => ({
            clone_http: project.http_url,
            clone_ssh: project.ssh_url,
            web_url: project.web_url,
            name: project.name,
            id: project.id,
          })),
        group,
        subgroups: {},
      });
    }

    return transformProviderToTree(outProjects);
  }
}
