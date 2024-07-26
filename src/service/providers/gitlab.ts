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

const baseUrl = GLOBAL_STATE.PROVIDERS.GITLAB.API_URL;
const webUrl = GLOBAL_STATE.PROVIDERS.GITLAB.WEB_URL;
let authToken = '';

export class GitlabService {
  async getMyUser(): Promise<any> {
    const url = `${baseUrl}/user`;
    return execGet<any>(url, authToken);
  }

  async getAllProjects(): Promise<any[]> {
    return execGetParallel(
      `${baseUrl}/projects?membership=true&simple=true`,
      authToken
    );
  }

  async getGroups(): Promise<any[]> {
    return execGetParallel(`${baseUrl}/groups?`, authToken);
  }

  async getNested(token: string): Promise<IStructuredGroups> {
    authToken = token;
    const srcGroups = await this.getGroups();

    const user = await this.getMyUser();
    const groups: IRawGXGitTree['group'][] = [
      ...srcGroups,
      {
        parent_id: null,
        web_url: user.web_url,
        name: user.username,
        description: '',
        id: -99,
      },
    ].map((group) => ({
      ...group,
      ...{
        create_subgroup_url: `${webUrl}/groups/new?parent_id=${group.id}`,
        create_repo_url: `${webUrl}/projects/new?namespace_id=${group.id}`,
      },
    }));

    const projects = (await this.getAllProjects()).map((project) => ({
      parent_web_url: project.namespace.web_url,
      parent_id: project.namespace.id,
      clone_http: project.http_url_to_repo,
      clone_ssh: project.ssh_url_to_repo,
      description: project.description,
      web_url: project.web_url,
      name: project.name,
      id: project.id,
    }));

    const data: IRawGXGitTree[] = [];
    for (const group of groups) {
      let projectsOfGroup = projects.filter(
        (project) =>
          project.parent_id === group.id ||
          project.parent_web_url === group.web_url
      );
      data.push({
        projects: projectsOfGroup,
        group,
        subgroups: {},
      });
    }

    return transformProviderToTree(data);
  }
}
