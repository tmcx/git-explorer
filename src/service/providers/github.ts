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
    let groups: IRawGXGitTree['group'][] = (await this.getGroups()).map(
      (group) => ({
        create_repo_url: `${webUrl}/organizations/${group.login}/repositories/new`,
        description: group.description,
        create_subgroup_url: '',
        web_url: `${webUrl}/${group.login}`,
        name: group.login,
        parent_id: -99,
        id: group.id,
      })
    );

    const myUser = await this.getMyUser();
    groups.push({
      id: myUser.id,
      name: myUser.login,
      parent_id: -99,
      web_url: `${webUrl}/${myUser.login}?tab=repositories`,
      create_subgroup_url: '',
      create_repo_url: `${webUrl}/organizations/${myUser.login}/repositories/new`,
      description: '',
    });
    let srcProjects = await this.getProjects();
    
    const projects = srcProjects.map((project) => ({
      parent_web_url: `${webUrl}/${project.owner.login}`,
      description: project.description,
      clone_http: project.clone_url,
      clone_ssh: project.ssh_url,
      parent_id: project.owner.id,
      ssh_url: project.ssh_url,
      web_url: project.html_url,
      name: project.name,
      id: project.id,
    }));

    const outProjects: IRawGXGitTree[] = [];
    for (const group of groups) {
      outProjects.push({
        projects: projects.filter(({ parent_id }) => parent_id === group.id),
        group,
        subgroups: {},
      });
    }

    return transformProviderToTree(outProjects);
  }
}
