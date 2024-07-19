import { execSync } from "child_process";

import { CinnabarMetaGitLogItem } from "./types.js";

/**
 *
 * @param tagOrCommit
 */
export function getGitLog(tagOrCommit: string): CinnabarMetaGitLogItem[] {
  try {
    const log = execSync(
      `git log ${tagOrCommit}..HEAD --pretty=format:'%H|%ad|%s|%an' --date=short`,
    ).toString();
    return log.split("\n").map((line) => {
      const [hash, date, message, author] = line.split("|");
      return { author, date, hash, message };
    });
  } catch (error) {
    console.error("Error fetching git log:", error);
    return [];
  }
}

/**
 * Checks if a given version exists in the git tags.
 * @param version The version string to check.
 * @returns true if the version exists in git tags, false otherwise.
 */
export function checkVersionExistsInGitTags(version: string): boolean {
  try {
    const tags = execSync(`git tag`).toString();
    const tagList = tags.split("\n");
    return tagList.includes("v" + version);
  } catch (error) {
    console.error("Error checking version in git tags:", error);
    return false;
  }
}

/**
 * Gets the most recent git tag.
 * @returns The most recent git tag as a string.
 */
export function getMostRecentGitTag(): string {
  try {
    return execSync("git tag --sort=-creatordate | head -n 1")
      .toString()
      .trim();
  } catch (error) {
    console.error("Error fetching the most recent git tag:", error);
    return "";
  }
}

/**
 *
 * @param push
 */
export function commitChanges(push: boolean): boolean {
  try {
    execSync("git add .");
    execSync(`git commit -m "Automated commit"`);
    if (push) {
      execSync("git push");
    }
    return true;
  } catch (error) {
    console.error("Error committing changes:", error);
    return false;
  }
}

/**
 * Check if the input is a valid GitHub repository
 * @param text
 */
export function checkGithubRepo(text?: string) {
  console.log(text);
  return text != null
    ? text.includes("/") &&
        text.split("/").length === 2 &&
        text.split("/")[0].length > 0 &&
        text.split("/")[1].length > 0
    : false;
}
