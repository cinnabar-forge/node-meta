# Changelog

This changelog is updated by [Cinnabar Meta](https://github.com/cinnabar-forge/node-meta).

## [Unreleased]

Visit the link above to see all unreleased changes.

[comment]: # (Insert new version after this line)

## [0.4.1](https://github.com/cinnabar-forge/node-meta/releases/tag/v0.4.1) — 2025-01-16

- add cinnabar-meta actions ([deaebeb])
- add disableChangelogCheck and disableLinks settings ([a3a9b40])
- add pull request list parsing from .cinnabar-meta-pull-requests.md ([a3a9b40])
- fix format ([cf96aca])
- update ([ea8ebe8])

[deaebeb]: https://github.com/cinnabar-forge/node-meta/commit/deaebeb
[ea8ebe8]: https://github.com/cinnabar-forge/node-meta/commit/ea8ebe8
[cf96aca]: https://github.com/cinnabar-forge/node-meta/commit/cf96aca
[a3a9b40]: https://github.com/cinnabar-forge/node-meta/commit/a3a9b40


## [0.4.0](https://github.com/cinnabar-forge/node-meta/releases/tag/v0.4.0) — 2025-01-15

This update brings improvements for a non-interactive mode. Now we can update from 'update.cinnabarmeta' file in repo's root: first line is type of update (patch, minor, ...) and the other lines for the update description.

Full list:

- apply biomejs recommendations ([a7faf6e])
- comply anca ([2e620c2], [a67eb02])
- fix changelog for gitea ([2091982])
- fix getGitLog to hide merge messages ([1988b3c])
- fix interactive actions in non-interactive mode ([8c23220])
- fix version comment with file option ([cf26eee])
- remove pre-commit ([3743d25])
- switch to biomejs ([cfe9ba0])
- update npm packages ([3743d25], [2e620c2], [888ede5])

[cf26eee]: https://github.com/cinnabar-forge/node-meta/commit/cf26eee
[1988b3c]: https://github.com/cinnabar-forge/node-meta/commit/1988b3c
[2091982]: https://github.com/cinnabar-forge/node-meta/commit/2091982
[8c23220]: https://github.com/cinnabar-forge/node-meta/commit/8c23220
[a7faf6e]: https://github.com/cinnabar-forge/node-meta/commit/a7faf6e
[3743d25]: https://github.com/cinnabar-forge/node-meta/commit/3743d25
[cfe9ba0]: https://github.com/cinnabar-forge/node-meta/commit/cfe9ba0
[2e620c2]: https://github.com/cinnabar-forge/node-meta/commit/2e620c2
[888ede5]: https://github.com/cinnabar-forge/node-meta/commit/888ede5
[a67eb02]: https://github.com/cinnabar-forge/node-meta/commit/a67eb02


## [0.3.1](https://github.com/cinnabar-forge/node-meta/releases/tag/v0.3.1) — 2024-07-23

- fix prepareVersionChangelog for non-tagged repos ([1022a9e])

[1022a9e]: https://github.com/cinnabar-forge/node-meta/commit/1022a9e


## [0.3.0](https://github.com/cinnabar-forge/node-meta/releases/tag/v0.3.0) — 2024-07-23

- change log display in markdown ([4d9dfea])

[4d9dfea]: https://github.com/cinnabar-forge/node-meta/commit/4d9dfea


## [0.2.0](https://github.com/cinnabar-forge/node-meta/releases/tag/v0.2.0) — 2024-07-22

This is an overhaul of the previous iteration. Clivo instead of inquirer. Support for any prerelease tag. Changelog generation.

Full list:

- [[333d1c7]] add anca
- [[056f308]] add changelog support
- [[40d46d4]] add comment to generated typescript file
- [[935ae0d]] add dev version mark
- [[333d1c7]] add devcontainer
- [[e2d32a4]] add eslint and prettier as direct dependencies
- [[7a751c7]] add exact versions of node.js to github actions
- [[8d6ab40]] add git commit and push after version update
- [[76e18b6]] add interactive version update
- [[fe957c7]] add lock system
- [[5131986]] add package.json version update support
- [[333d1c7]] add typescript
- [[2fd4938]] add updateChangelog config option
- [[924edc4]] add version update preview to cli
- [[5921af0], [fe957c7]] comply anca
- [[311efab]] fix bin
- [[c1a8db2]] fix build generation
- [[61bb338]] fix getGitLog
- [[311efab]] fix package.json
- [[333d1c7]] rewrite from scratch
- [[de3f12b]] sort changelog messages
- [[fe957c7]] update npm packages

[de3f12b]: https://github.com/cinnabar-forge/node-meta/commit/de3f12b
[311efab]: https://github.com/cinnabar-forge/node-meta/commit/311efab
[fe957c7]: https://github.com/cinnabar-forge/node-meta/commit/fe957c7
[5921af0]: https://github.com/cinnabar-forge/node-meta/commit/5921af0
[61bb338]: https://github.com/cinnabar-forge/node-meta/commit/61bb338
[8d6ab40]: https://github.com/cinnabar-forge/node-meta/commit/8d6ab40
[2fd4938]: https://github.com/cinnabar-forge/node-meta/commit/2fd4938
[924edc4]: https://github.com/cinnabar-forge/node-meta/commit/924edc4
[c1a8db2]: https://github.com/cinnabar-forge/node-meta/commit/c1a8db2
[40d46d4]: https://github.com/cinnabar-forge/node-meta/commit/40d46d4
[5131986]: https://github.com/cinnabar-forge/node-meta/commit/5131986
[76e18b6]: https://github.com/cinnabar-forge/node-meta/commit/76e18b6
[056f308]: https://github.com/cinnabar-forge/node-meta/commit/056f308
[7a751c7]: https://github.com/cinnabar-forge/node-meta/commit/7a751c7
[e2d32a4]: https://github.com/cinnabar-forge/node-meta/commit/e2d32a4
[333d1c7]: https://github.com/cinnabar-forge/node-meta/commit/333d1c7
[935ae0d]: https://github.com/cinnabar-forge/node-meta/commit/935ae0d


[unreleased]: https://github.com/cinnabar-forge/node-meta/compare/v0.4.1...HEAD
