import { promptText } from "clivo";
import fs from "fs";
import path from "path";

import { getGitLog } from "./git.js";
import { CinnabarMetaGitLogItem } from "./types.js";

/**
 *
 */
async function updateChangelog() {
  const changelogPath = path.join(process.cwd(), "CHANGELOG.md");
  const changelogExists = fs.existsSync(changelogPath);
  let changelogContent = "";

  if (!changelogExists) {
    changelogContent = `# Changelog

This changelog is updated by [Cinnabar Meta](https://github.com/cinnabar-forge/node-meta).

## [Unreleased]

Visit the link above to see all unreleased changes.

[comment]: # (Insert new version after this line).

[unreleased]: https://github.com/TimurRin/pdf-rush/compare/HEAD...HEAD
`;
    fs.writeFileSync(changelogPath, changelogContent);
  } else {
    changelogContent = fs.readFileSync(changelogPath, "utf8");
  }

  const gitLogs: CinnabarMetaGitLogItem[] = getGitLog("master");
  const changesMap = new Map<string, string[]>();

  gitLogs.forEach((log) => {
    log.message.split("\n").forEach((message) => {
      if (!changesMap.has(message)) {
        changesMap.set(message, []);
      }
      changesMap.get(message)?.push(log.hash);
    });
  });

  let fullListMarkdown = "Full list:\n";
  changesMap.forEach((hashes, message) => {
    fullListMarkdown += `- [[${hashes.join("], [")}]] ${message}\n`;
  });

  const versionComment = await promptText("Enter version comment:");
  const mainPoints = await promptText(
    "Enter main points (use '-' for bullet points):",
  );

  const versionTag = "1.14.0"; // This should be dynamically determined or input by the user
  const releaseDate = "2024-07-18"; // This should be dynamically determined or input by the user

  let newVersionMarkdown = `
## [${versionTag}](https://github.com/example/example/releases/tag/v${versionTag}) - ${releaseDate}

${versionComment}

${mainPoints}

${fullListMarkdown}
`;

  gitLogs.forEach((log) => {
    newVersionMarkdown += `[${log.hash}]: https://github.com/example/example/commit/${log.hash}\n`;
  });

  changelogContent = changelogContent.replace(
    "[comment]: # (Insert new version after this line).",
    `[comment]: # (Insert new version after this line).\n${newVersionMarkdown}`,
  );

  const unreleasedLinkRegex =
    /\[unreleased\]: https:\/\/github.com\/TimurRin\/pdf-rush\/compare\/(.+?)\.\.\.HEAD/;
  const unreleasedLinkMatch = changelogContent.match(unreleasedLinkRegex);
  if (unreleasedLinkMatch) {
    changelogContent = changelogContent.replace(
      unreleasedLinkRegex,
      `[unreleased]: https://github.com/TimurRin/pdf-rush/compare/${versionTag}...HEAD`,
    );
  }

  fs.writeFileSync(changelogPath, changelogContent);
}

updateChangelog().then(() => console.log("Changelog updated."));
