import * as vscode from 'vscode';

const MESSAGE = {
  NO_FOLDER_SELECTED: 'No se seleccionó ninguna carpeta de destino',
  SELECT_PROTOCOL: 'Selecciona el protocolo de clonación',
  TARGET_FOLDER: 'Seleccionar Carpeta de Destino',
  CLONED: 'Repositorio clonado en: ',
  ERROR: 'Error: ',
};

enum PROTOCOL {
  SSH = 'SSH',
  HTTP = 'HTTP',
}

export async function gitClone(urls: { http: string; ssh: string }) {
  const protocol = await vscode.window.showQuickPick(Object.values(PROTOCOL), {
    placeHolder: MESSAGE.SELECT_PROTOCOL,
    canPickMany: false,
  });

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
