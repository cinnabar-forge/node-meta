# Cinnabar Forge Meta

**DISCLAIMER**: Until version 1.0.0, all versions below should be considered unstable and are subject to change.

A Node.js CLI tool designed to manage project configurations and versions efficiently. This tool provides an interactive CLI for updating project metadata and managing versions with semantic versioning.

## Features

- Interactive CLI for easy management of project settings.
- Supports updating project metadata such as name, description, and version.
- Automated version management including patch, minor, and major updates.
- Git integration for committing changes, tagging versions, and pushing updates.

## Getting Started

### Installation

Install globally using npm:

```bash
npm install -g @cinnabar-forge/meta
```

This will make the `cinnabar-meta` command available in your terminal.

### Usage

```bash
cinnabar-meta
```

#### Updating the project version

- Select `Update version`.
- Choose the version update type (patch, minor, major).
- Confirm update (and, if necessary, commit and push).

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, feel free to open an issue or create a pull request.

Clone the repository and install dependencies:

```bash
git clone git@github.com:cinnabar-forge/node-meta.git
cd node-meta
npm ci
```

## License

Cinnabar Forge Meta is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Authors

- Timur Moziev ([@TimurRin](https://github.com/TimurRin))
