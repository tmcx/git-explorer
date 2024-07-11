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

const baseUrl = `${GLOBAL_STATE.PROVIDERS.GITLAB.URL}/api/v4`;
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
    let groups = await this.getGroups();

    const user = await this.getMyUser();
    groups = [
      ...groups,
      {
        parent_id: null,
        web_url: user.web_url,
        name: user.username,
        id: -99,
      },
    ];

    const projects = (await this.getAllProjects()).map((project) => ({
      parent_web_url: project.namespace.web_url,
      parent_id: project.namespace.id,
      clone_http: project.http_url_to_repo,
      clone_ssh: project.ssh_url_to_repo,
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
