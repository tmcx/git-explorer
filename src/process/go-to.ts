import { env, Uri } from 'vscode';

export async function goTo(url: string) {
  env.openExternal(Uri.parse(url));
}
