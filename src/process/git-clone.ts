import * as vscode from 'vscode';
import { PROTOCOL } from '../interfaces/extension-configurator';
import { LANG } from '../config/constant';

const MESSAGE = LANG[vscode.env.language].CMD.GIT_CLONE;

export async function gitClone(urls: { http: string; ssh: string }) {
  const protocol = await vscode.window.showQuickPick(Object.values(PROTOCOL), {
    placeHolder: MESSAGE.SELECT_PROTOCOL,
    canPickMany: false,
  });
  if (!protocol || protocol.length === 0) {
    vscode.window.showErrorMessage(MESSAGE.NO_PROTOCOL_SELECTED);
    return;
  }

  const targetFolder = await vscode.window.showOpenDialog({
    openLabel: MESSAGE.TARGET_FOLDER,
    canSelectFolders: true,
  });
  if (!targetFolder || targetFolder.length === 0) {
    vscode.window.showErrorMessage(MESSAGE.NO_FOLDER_SELECTED);
    return;
  }

  const repoUrl = `${protocol === PROTOCOL.SSH ? urls?.ssh : urls?.http}`;
  const targetPath = targetFolder[0].fsPath;

  vscode.commands.executeCommand('git.clone', repoUrl, targetPath).then(
    () => {
      vscode.window.showInformationMessage(`${MESSAGE.CLONED} ${targetPath}`);
    },
    (err) => {
      vscode.window.showErrorMessage(`${MESSAGE.ERROR} ${err.message}`);
    }
  );
}
