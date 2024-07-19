import { parseCli, promptOptions, promptText } from "clivo";

import { checkGithubRepo } from "./git.js";

export type Option = "build" | "interactive" | "prerelease" | "pwd" | "update";

/**
 * Parse the CLI arguments and return the options
 */
export function setupCli(): Record<Option, string[]> {
  return parseCli({
    args: process.argv,
    options: [
      { letter: "p", name: "pwd" },
      { letter: "u", name: "update" },
      { letter: "r", name: "prerelease" },
      { letter: "b", name: "build" },
      { letter: "i", name: "interactive" },
    ],
  }) as Record<Option, string[]>;
}

/**
 * Ask the user to choose the update type
 * @param isPrerelease
 */
export async function askUpdateType(isPrerelease: boolean): Promise<string> {
  const answers = isPrerelease
    ? [
        { label: "Update prerelease", name: "prerelease-update" },
        { label: "Change prerelease", name: "prerelease-change" },
        { label: "Release prerelease", name: "prerelease-release" },
        { label: "Build", name: "build" },
      ]
    : [
        { label: "Major", name: "major" },
        { label: "Minor", name: "minor" },
        { label: "Patch", name: "patch" },
        { label: "Major prerelease", name: "major-prerelease" },
        { label: "Minor prerelease", name: "minor-prerelease" },
        { label: "Patch prerelease", name: "patch-prerelease" },
        { label: "Build", name: "build" },
      ];

  const answer = await promptOptions("Choose the update type", answers);
  return answer.name;
}

/**
 * Ask the user to enter the GitHub repository
 */
export async function askGithubRepo(): Promise<string> {
  const text = await promptText("Enter GitHub repository (format: user/repo)");
  if (!checkGithubRepo(text)) {
    console.log("Invalid GitHub repository format");
    return await askGithubRepo();
  }
  return text;
}

/**
 * Ask the user to enter the new prerelease tag
 */
export async function askPrereleaseTag(): Promise<string> {
  return await promptText("Enter new prerelease tag");
}
