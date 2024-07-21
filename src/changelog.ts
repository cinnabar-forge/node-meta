import { promptText } from "clivo";
import fs from "fs";
import path from "path";

import { checkVersionExistsInGitTags, getGitLog } from "./git.js";
import { CinnabarMetaGitLogItem, CinnabarMetaRepo } from "./types.js";

const COMMENT_LINE = "[comment]: # (Insert new version after this line)";

/**
 *
 * @param githubRepo
 * @param oldVersion
 * @param newVersion
 * @param versionComment
 */
function prepareVersionChangelog(
  githubRepo: CinnabarMetaRepo,
  oldVersion: string,
  newVersion: string,
  versionComment: null | string,
) {
  const gitLogs: CinnabarMetaGitLogItem[] = checkVersionExistsInGitTags(
    oldVersion,
  )
    ? getGitLog("v" + oldVersion)
    : [];
  const changesMap = new Map<string, string[]>();

  gitLogs.forEach((log) => {
    log.message.split("\n").forEach((message) => {
      if (!changesMap.has(message)) {
        changesMap.set(message, []);
      }
      changesMap.get(message)?.push(log.hash.slice(0, 7));
    });
  });

  let fullListMarkdown = "";
  changesMap.forEach((hashes, message) => {
    fullListMarkdown += `- [[${hashes.join("], [")}]] ${message}\n`;
  });

  const releaseDate = new Date().toISOString().split("T")[0];

  let newVersionMarkdown = `## [${newVersion}](https://github.com/${githubRepo.value}/releases/tag/v${newVersion}) — ${releaseDate}${versionComment && versionComment.length > 0 ? "\n\n" + versionComment : ""}${fullListMarkdown && fullListMarkdown.length > 0 ? "\n\n" + (versionComment && versionComment.length > 0 ? "Full list:\n\n" : "") + fullListMarkdown : ""}
`;

  gitLogs.forEach((log) => {
    newVersionMarkdown += `[${log.hash.slice(0, 7)}]: https://github.com/${githubRepo.value}/commit/${log.hash.slice(0, 7)}\n`;
  });

  return newVersionMarkdown;
}

/**
 * Updates the changelog with the latest changes
 * @param isInteractive
 * @param oldVersion
 * @param newVersion
 * @param githubRepo
 */
export async function updateChangelog(
  isInteractive: boolean,
  oldVersion: string,
  newVersion: string,
  githubRepo: CinnabarMetaRepo,
) {
  const changelogPath = path.join(process.cwd(), "CHANGELOG.md");
  const changelogExists = fs.existsSync(changelogPath);

  let changelogContent = "";

  if (!changelogExists) {
    changelogContent = `# Changelog

This changelog is updated by [Cinnabar Meta](https://github.com/cinnabar-forge/node-meta).

## [Unreleased]

Visit the link above to see all unreleased changes.

${COMMENT_LINE}

[unreleased]: https://github.com/${githubRepo.value}/compare/HEAD...HEAD
`;
    fs.writeFileSync(changelogPath, changelogContent);
  } else {
    changelogContent = fs.readFileSync(changelogPath, "utf8");
  }

  const versionComment = isInteractive
    ? await promptText("Enter version summary")
    : null;

  const newVersionMarkdown = prepareVersionChangelog(
    githubRepo,
    oldVersion,
    newVersion,
    versionComment,
  );

  changelogContent = changelogContent.replace(
    COMMENT_LINE,
    `${COMMENT_LINE}\n\n${newVersionMarkdown}`,
  );

  const unreleasedLinkRegex = /compare\/(.+?)\.\.\.HEAD/;
  const unreleasedLinkMatch = changelogContent.match(unreleasedLinkRegex);
  if (unreleasedLinkMatch) {
    changelogContent = changelogContent.replace(
      unreleasedLinkRegex,
      `compare/v${newVersion}...HEAD`,
    );
  }

  fs.writeFileSync(changelogPath, changelogContent);

  return newVersionMarkdown;
}

/**
 * Writes the changelog to a file
 * @param version
 * @param changelog
 */
export function writeChangelog(version: string, changelog: string) {
  fs.mkdirSync("tmp", { recursive: true });
  fs.writeFileSync(`tmp/CHANGELOG-${version}.md`, changelog);
}
