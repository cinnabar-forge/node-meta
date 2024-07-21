import { parseCli, promptOptions, promptText } from "clivo";

import { checkGithubRepo } from "./git.js";
import { CinnabarMetaParsedVersion } from "./types.js";
import { updatePrerelease, updateVersion } from "./version.js";

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
          { label: `Mark build info`, name: "build" },
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
          { label: `Mark build info`, name: "build" },
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
