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

const baseUrl = GLOBAL_STATE.PROVIDERS.BITBUCKET.API_URL;
const webUrl = GLOBAL_STATE.PROVIDERS.BITBUCKET.WEB_URL;
let authToken = '';

export class BitbucketService {
  async getMyUser(): Promise<any> {
    const url = `${baseUrl}/user`;
    return execGet<any>(url, authToken, true);
  }

  async getWorkspaceProjects(workspaceName: string): Promise<any[]> {
    return execGetParallel(
      `${baseUrl}/workspaces/${workspaceName}/projects?`,
      authToken,
      true
    );
  }

  async getAllRepositories() {
    return execGetParallel<any[]>(
      `${baseUrl}/repositories?role=member`,
      authToken,
      true
    );
  }

  async getWorkspaces(): Promise<any[]> {
    return execGetParallel(`${baseUrl}/workspaces?`, authToken, true);
  }

  async getNested(token: string): Promise<IStructuredGroups> {
    authToken = token;

    const repositories = (await this.getAllRepositories())
      .map((repository) => ({
        parent_web_url: repository.project.links.html.href,
        parent_id: repository.project.uuid,
        clone_http: repository.links.clone[0].href,
        clone_ssh: repository.links.clone[1].href,
        description: repository.description,
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

    const workspaces = await this.getWorkspaces();

    const groups: IRawGXGitTree['group'][] = workspaces.map((group) => ({
      create_repo_url: `${webUrl}/${group.slug}/workspace/create/repository`,
      create_subgroup_url: `${webUrl}/${group.slug}/workspace/create/project`,
      web_url: group.links.html.href,
      name: group.name,
      parent_id: '-99',
      id: group.uuid,
      workspaceName: group.slug,
      description: group.description,
    }));

    for (const workspace of workspaces) {
      const projects = await this.getWorkspaceProjects(workspace.slug);
      groups.push(
        ...projects.map((project) => ({
          create_repo_url: `${webUrl}/${workspace.slug}/workspace/create/repository?project=${project.key}`,
          create_subgroup_url: `${webUrl}/${workspace.slug}/workspace/create/project`,
          description: project.description,
          web_url: project.links.html.href,
          name: project.name,
          parent_id: workspace.uuid,
          id: project.uuid,
          workspaceName: project.slug,
        }))
      );
    }

    const data: IRawGXGitTree[] = [];
    for (const group of groups) {
      data.push({
        projects: repositories
          .filter(
            (repository) =>
              String(repository.parent_id) === String(group.id) ||
              repository.parent_web_url === group.web_url
          )
          .map<IRawGXGitTree['projects'][0]>((repository) => ({
            description: repository.description,
            clone_http: repository.clone_http,
            clone_ssh: repository.clone_ssh,
            id: repository.id,
            name: repository.name,
            web_url: repository.web_url,
          })),
        group,
        subgroups: {},
      });
    }
    return transformProviderToTree(data);
  }
}
