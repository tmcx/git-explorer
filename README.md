<h1 align="center">Git Explorer</h1>

Git Explorer, a Visual Studio Code extension designed to navigate and manage your Git repositories efficiently, providing an intuitive user interface and advanced functionalities.

<p align="center">
    <img src="https://github.com/tmcx/git-explorer/blob/701fef8dd3c0fe54f141e4d3840ead15a5c8b093/media/demo.gif?raw=true" width="400" height="400"/>
</p>

## Features

- **Repository Navigation**: Explore your repositories directly from VS Code.
- **Custom Tree Structure**: Visualize the structure of your projects in a custom tree view, making it easy to navigate through files and directories.
- **Repository Search**: Search a specific repository or group.
- **Repository Cloning**: Easily clone repositories using both HTTP and SSH.
- **Authentication Management**: Manage your authentication tokens for git providers securely.

## Extension Configuration

Git Explorer does not require any additional configuration to start using it. Just add your git cloud provider connection.

To get tokens:

- Gitlab
    * [Access Token](https://gitlab.com/-/user_settings/personal_access_tokens)
    * Required permissions: read_api
- Github
    * [Git Token(Classic)](https://github.com/settings/tokens/new)
    * Required permissions: repo(Full), user(read:user), admin:org(read:org) and project(read:project)
- BitBucket:
    * [App Passwords](https://bitbucket.org/account/settings/app-passwords/)
    * Required permissions: Account(Read), Workspace membership(Read) and Projects(Read)
