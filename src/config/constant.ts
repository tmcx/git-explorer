export const GLOBAL_STATE = {
  KEY: {
    TOKENS: 'git-exp-tokens',
  },
  PROVIDERS: {
    GITHUB: {
      NAME: 'GitHub',
      WEB_URL: 'https://github.com',
      API_URL: 'https://api.github.com',
      VALIDATE_TOKEN_URL: 'https://api.github.com/user',
      AUTH_PROVIDER: 'github',
    },
    GITLAB: {
      NAME: 'GitLab',
      WEB_URL: 'https://gitlab.com',
      API_URL: 'https://gitlab.com/api/v4',
      VALIDATE_TOKEN_URL: 'https://gitlab.com/api/v4/user',
      AUTH_PROVIDER: 'gitlab',
    },
    BITBUCKET: {
      NAME: 'BitBucket',
      WEB_URL: 'https://bitbucket.org',
      API_URL: 'https://api.bitbucket.org/2.0',
      VALIDATE_TOKEN_URL: 'https://api.bitbucket.org/2.0/user',
      AUTH_PROVIDER: 'bitbucket',
    },
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
        INVALID_TOKEN: any;
        REFRESH: any;
        REFRESH_ALL: any;
        EMPTY_GROUP: any;
        SEARCH: any;
        CLEAR_ALL: any;
        GIT_CLONE: any;
        GO_TO: any;
        TITLE: string;
      };
      SET_CONFIGURATION: {
        USERNAME: any;
        INVALID_TOKEN: any;
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
        EMPTY_GROUP: 'No repositories found',
        CLEAR_ALL: 'Clear',
        GIT_CLONE: 'Clone',
        GO_TO: 'Go to',
        SEARCH: 'Search',
        REFRESH_ALL: 'Refresh All',
        INVALID_TOKEN: 'Invalid token',
        REFRESH: 'Refresh',
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
        INVALID_TOKEN: 'Invalid token',
        USERNAME: 'Username',
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
        EMPTY_GROUP: 'No se encontraron repositorios',
        CLEAR_ALL: 'Limpiar',
        GIT_CLONE: 'Clonar',
        GO_TO: 'Ir a',
        SEARCH: 'Buscar',
        REFRESH_ALL: 'Refrescar Todos',
        INVALID_TOKEN: 'Token inválido',
        REFRESH: 'Refrescar',
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
        INVALID_TOKEN: 'Token inválido',
        USERNAME: 'Usuario',
      },
    },
  },
};
