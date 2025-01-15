import { parseCli, promptOptions, promptText } from "clivo";

import { checkGithubRepo } from "./git.js";
import type { CinnabarMetaParsedVersion } from "./types.js";
import { updatePrerelease, updateVersion } from "./version.js";

export type Option =
  | "build"
  | "file"
  | "interactive"
  | "prerelease"
  | "push"
  | "pwd"
  | "update";

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
      { letter: "f", name: "file" },
      { name: "push" },
    ],
  }) as Record<Option, string[]>;
}

/**
 * Ask the user to choose the update type
 * @param parsedVersion
 * @param oldVersion
 */
export async function askUpdateType(
  parsedVersion: CinnabarMetaParsedVersion,
  oldVersion: string,
): Promise<string> {
  const answers =
    parsedVersion.prerelease != null
      ? [
          {
            label: `Update (${updatePrerelease(parsedVersion, parsedVersion.prerelease)})`,
            name: "prerelease-update",
          },
          {
            label: `Change tag (${updatePrerelease(parsedVersion, "newtag")})`,
            name: "prerelease-change",
          },
          {
            label: `Release (${updatePrerelease(parsedVersion, "yes")})`,
            name: "prerelease-release",
          },
          { label: "Mark build info", name: "build" },
        ]
      : [
          {
            label: `Major (${updateVersion(parsedVersion, "major")})`,
            name: "major",
          },
          {
            label: `Minor (${updateVersion(parsedVersion, "minor")})`,
            name: "minor",
          },
          {
            label: `Patch (${updateVersion(parsedVersion, "patch")})`,
            name: "patch",
          },
          {
            label: `Major prerelease (${updateVersion(parsedVersion, "major", "tag")})`,
            name: "major-prerelease",
          },
          {
            label: `Minor prerelease (${updateVersion(parsedVersion, "minor", "tag")})`,
            name: "minor-prerelease",
          },
          {
            label: `Patch prerelease (${updateVersion(parsedVersion, "patch", "tag")})`,
            name: "patch-prerelease",
          },
          { label: "Mark build info", name: "build" },
        ];

  const answer = await promptOptions(
    parsedVersion.prerelease != null
      ? `What to do with prerelease version ${oldVersion}?`
      : `Update version ${oldVersion} to...`,
    answers,
  );
  return answer.name;
}

/**
 * Ask the user to enter the Git provider
 */
export async function askGitProvider(): Promise<"github" | "gitea"> {
  return (
    await promptOptions("What is your git provider?", [
      { label: "GitHub", name: "github" },
      { label: "Gitea", name: "gitea" },
    ])
  ).name as "github" | "gitea";
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
 * Ask the user to enter the GitHub repository
 */
export async function askGiteaRepo(): Promise<string> {
  const text = await promptText(
    "Enter GitHub repository (format: protocol://gitea.example.com/user/repo)",
  );
  return text;
}

/**
 * Ask the user to enter the new prerelease tag
 */
export async function askPrereleaseTag(): Promise<string> {
  return await promptText("Enter new prerelease tag");
}

/**
 * Ask the user to choose the commit type
 */
export async function askCommitType(): Promise<string> {
  return (
    await promptOptions("What to do next?", [
      { label: "Nothing", name: "nothing" },
      { label: "Commit and tag", name: "commit" },
      { label: "Commit and tag and push", name: "commit-push" },
    ])
  ).name;
}

/**
 * Ask the user to enter yes or no
 * @param text
 */
export async function askYesOrNo(text: string): Promise<string> {
  return await promptText(`${text} (yes/no)`);
}
