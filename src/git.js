/* eslint-disable security/detect-non-literal-fs-filename */
import inquirer from "inquirer";
import simpleGit from "simple-git";

import { handleCinnabarFile, writeToFiles } from "./file.js";

const git = simpleGit();

/**
 * Handles committing changes to Git, tagging, and optionally pushing.
 * @param {string} folderPath - The path to the project folder.
 * @param {string} cinnabarData - The loaded cinnabar.json data.
 * @param {string} versionType - The type of version update.
 * @param {string} newVersion - Object with new version data.
 */
export async function commitChanges(
  folderPath,
  cinnabarData,
  versionType,
  newVersion,
) {
  await git.cwd(folderPath);

  const gitChoices = [
    { name: "Back", value: "back" },
    { name: "Update version", value: "update" },
    { name: "Update version, commit & tag", value: "commit" },
    { name: "Update version, commit & tag, push", value: "push" },
  ];

  const { gitAction } = await inquirer.prompt({
    choices: gitChoices,
    message: "Select Git actions to perform:",
    name: "gitAction",
    type: "list",
  });

  if (versionType === "back") {
    await handleCinnabarFile(folderPath);
    return;
  }

  writeToFiles(folderPath, cinnabarData, newVersion);

  if (gitAction === "commit" || gitAction === "push") {
    await git
      .add("./*")
      .commit(`release version ${newVersion.text}`)
      .tag([`v${newVersion.text}`]);
  }
  if (gitAction === "push") {
    await git.push("origin", "--tags");
  }

  await handleCinnabarFile(folderPath);
}
