import * as vscode from 'vscode';

export const GLOBAL_STATE = {
  KEY: {
    TOKENS: 'git-exp-tokens',
  },
};

export const LANG: {
  [key: string]: {
    CMD: {
      GIT_CLONE: {
        NO_PROTOCOL_SELECTED: string;
        NO_FOLDER_SELECTED: string;
        SELECT_PROTOCOL: string;
        TARGET_FOLDER: string;
        CLONED: string;
        ERROR: string;
      };
    };
    WVP: {
      CONTENT: {
        SEARCH: any;
        CLEAR_ALL: any;
        GIT_CLONE: any;
        GO_TO: any;
        TITLE: string;
      };
      SET_CONFIGURATION: {
        CONNECTIONS: any;
        ADD_SERVER: any;
        SELECT_SERVER: any;
        ALIAS: any;
        TOKEN: any;
        ADD: any;
        DELETE: any;
        NO_SERVERS_LOADED: any;
        TITLE: string;
      };
    };
  };
} = {
  en: {
    CMD: {
      GIT_CLONE: {
        NO_PROTOCOL_SELECTED: 'No protocol selected for cloning',
        NO_FOLDER_SELECTED: 'No destination folder selected',
        SELECT_PROTOCOL: 'Select cloning protocol',
        TARGET_FOLDER: 'Select Destination Folder',
        CLONED: 'Repository cloned at: ',
        ERROR: 'Error: ',
      },
    },
    WVP: {
      CONTENT: {
        TITLE: 'Connections content',
        CLEAR_ALL: 'Clear',
        GIT_CLONE: 'Clone',
        GO_TO: 'Go to',
        SEARCH: 'Search',
      },
      SET_CONFIGURATION: {
        TITLE: 'Connections',
        CONNECTIONS: 'Added',
        ADD_SERVER: 'New',
        ADD: 'Add',
        ALIAS: 'Alias',
        DELETE: 'Delete',
        NO_SERVERS_LOADED: 'No connections loaded',
        SELECT_SERVER: 'Select provider',
        TOKEN: 'Token',
      },
    },
  },
  es: {
    CMD: {
      GIT_CLONE: {
        NO_PROTOCOL_SELECTED: 'No se seleccionó ningun protocolo de clonación',
        NO_FOLDER_SELECTED: 'No se seleccionó ninguna carpeta de destino',
        SELECT_PROTOCOL: 'Selecciona el protocolo de clonación',
        TARGET_FOLDER: 'Seleccionar Carpeta de Destino',
        CLONED: 'Repositorio clonado en: ',
        ERROR: 'Error: ',
      },
    },
    WVP: {
      CONTENT: {
        TITLE: 'Contenido de conexiones',
        CLEAR_ALL: 'Limpiar',
        GIT_CLONE: 'Clonar',
        GO_TO: 'Ir a',
        SEARCH: 'Buscar',
      },
      SET_CONFIGURATION: {
        TITLE: 'Conexiones',
        CONNECTIONS: 'Agregadas',
        ADD_SERVER: 'Nueva',
        ADD: 'Agregar',
        ALIAS: 'Alias',
        DELETE: 'Borrar',
        NO_SERVERS_LOADED: 'No hay conexiones agregadas',
        SELECT_SERVER: 'Seleccionar proveedor',
        TOKEN: 'Token',
      },
    },
  },
};
