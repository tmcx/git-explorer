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

const baseUrl = `${GLOBAL_STATE.PROVIDERS.BITBUCKET.API_URL}/2.0`;
let authToken = '';

export class BitbucketService {
  async getMyUser(): Promise<any> {
    const url = `${baseUrl}/user`;
    return execGet<any>(url, authToken, true);
  }

  async getAllRepositories(): Promise<any[]> {
    return execGetParallel(
      `${baseUrl}/repositories?role=member`,
      authToken,
      true
    );
  }

  async getGroups(): Promise<any[]> {
    return execGetParallel(`${baseUrl}/workspaces?`, authToken, true);
  }

  async getNested(token: string): Promise<IStructuredGroups> {
    authToken = token;
    let groups = (await this.getGroups()).map((group) => ({
      web_url: group.links.html.href,
      name: group.name,
      parent_id: -99,
      id: group.uuid,
    }));

    const repositories = (await this.getAllRepositories())
      .map((repository) => ({
        parent_web_url: repository.workspace.links.html.href,
        parent_id: repository.workspace.uuid,
        clone_http: repository.links.clone.find(
          (link: any) => link.name === 'https'
        ).href,
        clone_ssh: repository.links.clone.find(
          (link: any) => link.name === 'ssh'
        ).href,
        web_url: repository.links.html.href,
        name: repository.name,
        id: repository.uuid,
      }))
      .filter((obj, index, arr) => {
        return (
          arr.findIndex((o) => {
            return JSON.stringify(o) === JSON.stringify(obj);
          }) === index
        );
      });

    const data: IRawGXGitTree[] = [];
    for (const group of groups) {
      let projects = repositories.filter(
        (repository) =>
          repository.parent_id === group.id ||
          repository.parent_web_url === group.web_url
      );
      data.push({
        projects,
        group,
        subgroups: {},
      });
    }
    return transformProviderToTree(data);
  }
}
