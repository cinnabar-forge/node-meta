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
 */
export async function askUpdateType(): Promise<string> {
  const answer = await promptOptions("Choose the update type:", [
    { label: "Major", name: "major" },
    { label: "Minor", name: "minor" },
    { label: "Patch", name: "patch" },
    { label: "Major pre-release", name: "major-prerelease" },
    { label: "Minor pre-release", name: "minor-prerelease" },
    { label: "Patch pre-release", name: "patch-prerelease" },
    { label: "Build", name: "build" },
  ]);
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
