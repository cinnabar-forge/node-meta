import { execSync } from "node:child_process";

import type { CinnabarMetaGitLogItem } from "./types.js";

/**
 * Gets an array of objects contains log since specified tag or commit
 * @param tagOrCommit
 */
export function getGitLog(tagOrCommit?: string): CinnabarMetaGitLogItem[] {
  try {
    const log = execSync(
      `git log ${tagOrCommit ? `${tagOrCommit}..HEAD ` : ""}--pretty=format:'%H%n%B' --no-merges`,
    ).toString();
    return log.split("\n\n").map((line) => {
      const [hash, ...message] = line.split("\n");
      const messages: string[] = [];
      for (const msg of message) {
        if (msg.length > 0) {
          messages.push(msg);
        }
      }
      return { hash, message: messages.join("\n") };
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
    const tags = execSync("git tag").toString();
    const tagList = tags.split("\n");
    return tagList.includes(`v${version}`);
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
 * Commits changes to the git repository
 * @param version
 * @param push
 */
export function commitChanges(version: string, push: boolean): boolean {
  try {
    console.log("Adding changes to git...");
    execSync("git add -A");

    console.log(
      `Committing changes with message: "release version ${version}"`,
    );
    execSync(`git commit -m "release version ${version}"`);

    console.log(`Creating tag: "v${version}"`);
    execSync(`git tag "v${version}"`);

    if (push) {
      console.log("Pushing changes to origin...");
      execSync("git push origin");
      execSync("git push origin --tags");
    }

    console.log("Git operations completed successfully.");
    return true;
  } catch (error) {
    console.error(`Error committing changes to git repository: ${error}`);
    throw new Error(`Error committing changes to git repository: ${error}`);
  }
}

/**
 * Check if the input is a valid GitHub repository
 * @param text
 */
export function checkGithubRepo(text?: string) {
  return text != null
    ? text.includes("/") &&
        text.split("/").length === 2 &&
        text.split("/")[0].length > 0 &&
        text.split("/")[1].length > 0
    : false;
}

/**
 * Get the last commit hash
 */
export function getTheLastCommitHash() {
  try {
    return execSync("git rev-parse HEAD").toString().trim();
  } catch (error) {
    console.error("Error fetching the last commit hash:", error);
    return false;
  }
}

/**
 * Reset to a specific commit
 * @param commit
 */
export function resetToCommit(commit: string) {
  try {
    execSync(`git reset --hard ${commit}`);
    return true;
  } catch (error) {
    console.error("Error resetting to commit:", error);
    return false;
  }
}
