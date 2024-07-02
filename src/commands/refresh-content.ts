import { ICommand } from "../interfaces/extension-configurator";
import { TDP_CONTENT } from '../tree-data-providers/content';

export const CMD_REFRESH_CONTENT: ICommand = {
  id: "cmd-refresh-content",
  callback: () => TDP_CONTENT.tdp.refresh(),
};