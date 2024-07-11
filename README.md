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
- Github
- BitBucket:
    * [App Passwords](https://bitbucket.org/account/settings/app-passwords/)
    * Required permissions: Account(Read), Workspace membership(Read) and Projects(Read)

## Changelog

### 1.0.0

- Validate token previous save
- Refresh connections

### 0.3.0

- English and spanish support
- Search folder/group
- Github provider
- Gitlab provider

### 0.2.0

- Go to repository/group page
- Clone repository

### 0.1.0

- List projects on structure
