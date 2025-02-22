import fs from "node:fs";
import path from "node:path";
import { promptText } from "clivo";

import {
  checkVersionExistsInGitTags,
  getGitLog,
  getMostRecentGitTag,
} from "./git.js";
import type { CinnabarMetaGitLogItem, CinnabarMetaRepo } from "./types.js";

const COMMENT_LINE = "[comment]: # (Insert new version after this line)";

function getReleaseUrl(gitRepo: CinnabarMetaRepo | null, newVersion: string) {
  if (gitRepo == null) {
    return null;
  }
  return gitRepo.type === "github"
    ? `https://github.com/${gitRepo.value}/releases/tag/v${newVersion}`
    : gitRepo.type === "gitea"
      ? `${gitRepo.value}/releases/tag/v${newVersion}`
      : null;
}

function getCommitUrl(gitRepo: CinnabarMetaRepo | null, commitHash: string) {
  if (gitRepo == null) {
    return null;
  }
  return gitRepo.type === "github"
    ? `https://github.com/${gitRepo.value}/commit/${commitHash}`
    : gitRepo.type === "gitea"
      ? `${gitRepo.value}/commit/${commitHash}`
      : null;
}

function getCompareUrl(gitRepo: CinnabarMetaRepo | null) {
  if (gitRepo == null) {
    return null;
  }
  return gitRepo.type === "github"
    ? `https://github.com/${gitRepo.value}/compare/HEAD...HEAD`
    : gitRepo.type === "gitea"
      ? `${gitRepo.value}/compare/HEAD...HEAD`
      : null;
}

/**
 *
 * @param gitRepo
 * @param oldVersion
 * @param newVersion
 * @param disableLinks
 * @param versionComment
 */
function prepareCommitVersionChangelog(
  gitRepo: CinnabarMetaRepo | null,
  oldVersion: string,
  newVersion: string,
  disableLinks: boolean,
  versionComment: null | string,
) {
  const lastTag = getMostRecentGitTag();
  const gitLogs: CinnabarMetaGitLogItem[] = checkVersionExistsInGitTags(
    oldVersion,
  )
    ? getGitLog(`v${oldVersion}`)
    : lastTag != null
      ? getGitLog(lastTag)
      : getGitLog();
  const changesMap = new Map<string, string[]>();

  for (const log of gitLogs) {
    for (const message of log.message.split("\n")) {
      if (!changesMap.has(message)) {
        changesMap.set(message, []);
      }
      changesMap.get(message)?.push(log.hash.slice(0, 7));
    }
  }

  const sortedChanges = Array.from(changesMap).sort();

  let fullListMarkdown = "";
  for (const [message, hashes] of sortedChanges) {
    fullListMarkdown += disableLinks
      ? `- ${message} (${hashes.join(", ")})\n`
      : `- ${message} ([${hashes.join("], [")}])\n`;
  }

  const releaseDate = new Date().toISOString().split("T")[0];

  const releaseUrl = getReleaseUrl(gitRepo, newVersion);
  const releaseLink =
    releaseUrl != null ? `[${newVersion}](${releaseUrl})` : newVersion;

  const releaseDateHeader = `## ${releaseLink} — ${releaseDate}\n\n`;

  let newVersionMarkdown = `${versionComment && versionComment.length > 0 ? versionComment : ""}${fullListMarkdown && fullListMarkdown.length > 0 ? `${versionComment && versionComment.length > 0 ? "Full list:\n\n" : ""}${fullListMarkdown}` : ""}
`;

  if (!disableLinks) {
    for (const log of gitLogs) {
      const commitHash = log.hash.slice(0, 7);
      const commitUrl = getCommitUrl(gitRepo, commitHash);
      if (commitUrl != null) {
        const commitLink = `[${commitHash}]: ${commitUrl}`;
        newVersionMarkdown += `${commitLink}\n`;
      }
    }
  }

  return { version: newVersionMarkdown, header: releaseDateHeader };
}

function preparePullRequestChangelog(
  gitRepo: CinnabarMetaRepo | null,
  newVersion: string,
) {
  const releaseDate = new Date().toISOString().split("T")[0];

  const releaseUrl = getReleaseUrl(gitRepo, newVersion);
  const releaseLink =
    releaseUrl != null ? `[${newVersion}](${releaseUrl})` : newVersion;

  const header = `## ${releaseLink} — ${releaseDate}\n\n`;

  return { header };
}

/**
 * Updates the changelog with the latest changes
 * @param isInteractive
 * @param oldVersion
 * @param newVersion
 * @param gitRepo
 * @param disableLinks
 */
export async function updateChangelog(
  isInteractive: boolean,
  oldVersion: string,
  newVersion: string,
  gitRepo: CinnabarMetaRepo | null,
  disableChangelogCheck: boolean,
  disableLinks: boolean,
  versionComment?: string,
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

[unreleased]: ${getCompareUrl(gitRepo)}
`;
    fs.writeFileSync(changelogPath, changelogContent);
  } else {
    changelogContent = fs.readFileSync(changelogPath, "utf8");
  }

  const newVersionComment =
    versionComment != null
      ? versionComment
      : isInteractive
        ? await promptText("Enter version summary")
        : null;

  const pullRequestsPath = path.join(
    process.cwd(),
    ".cinnabar-meta-pull-requests.md",
  );
  const pullRequestsExists = fs.existsSync(pullRequestsPath);

  const pullRequests = fs.readFileSync(pullRequestsPath, "utf8");

  let versionResult: string;

  if (
    !disableChangelogCheck &&
    pullRequestsExists &&
    pullRequests?.length > 0
  ) {
    const markdowns = preparePullRequestChangelog(gitRepo, newVersion);

    changelogContent = changelogContent.replace(
      COMMENT_LINE,
      `${COMMENT_LINE}\n\n${markdowns.header}${pullRequests}`,
    );

    versionResult = pullRequests;

    fs.rmSync(pullRequestsPath);
  } else {
    const markdowns = prepareCommitVersionChangelog(
      gitRepo,
      oldVersion,
      newVersion,
      disableLinks,
      newVersionComment,
    );

    changelogContent = changelogContent.replace(
      COMMENT_LINE,
      `${COMMENT_LINE}\n\n${markdowns.header}${markdowns.version}`,
    );

    versionResult = markdowns.version;
  }

  const unreleasedLinkRegex = /compare\/(.+?)\.\.\.HEAD/;
  const unreleasedLinkMatch = changelogContent.match(unreleasedLinkRegex);
  if (unreleasedLinkMatch) {
    changelogContent = changelogContent.replace(
      unreleasedLinkRegex,
      `compare/v${newVersion}...HEAD`,
    );
  }

  fs.writeFileSync(changelogPath, changelogContent);

  return versionResult;
}

/**
 * Writes the changelog to a file
 * @param version
 * @param changelog
 */
export function writeChangelog(version: string, changelog: string) {
  fs.mkdirSync("tmp", { recursive: true });
  fs.writeFileSync(`tmp/CHANGELOG-${version}.md`, changelog);
  fs.writeFileSync("tmp/CHANGELOG-latest.md", changelog);
  fs.writeFileSync("tmp/version", version);
}
