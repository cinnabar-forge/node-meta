import inquirer from "inquirer";

import { commitChanges } from "./git.js";

/**
 *
 * @param cinnabarData
 */
export function getFullVersionText(cinnabarData) {
  const date = new Date(
    cinnabarData.version?.timestamp
      ? cinnabarData.version?.timestamp * 1000
      : 0,
  ).toISOString();
  if (cinnabarData.stack?.nodejs != null) {
    return `${cinnabarData.stack.nodejs.package ?? "'new-app'"}@${cinnabarData.version?.text ?? "0.0.0"} from ${date}`;
  }
  return `${cinnabarData.name ?? "New app"} v${cinnabarData.version?.text ?? "0.0.0"} from ${date}`;
}

/**
 * Increments the specified version part and updates the version object.
 * @param {object} version - The version object from cinnabar.json.
 * @param {string} type - The type of version to increment ('major', 'minor', 'patch', 'dev').
 * @returns {string} The new version string.
 */
function incrementVersion(version, type) {
  let { dev, major, minor, patch, revision } = version;
  revision++;

  switch (type) {
    case "dev-major":
    case "major":
      major++;
      minor = 0;
      patch = 0;
      dev = type == "dev-major" ? 1 : 0;
      break;
    case "dev-minor":
    case "minor":
      minor++;
      patch = 0;
      dev = type == "dev-minor" ? 1 : 0;
      break;
    case "dev-patch":
    case "patch":
      patch++;
      dev = type == "dev-patch" ? 1 : 0;
      break;
    case "dev":
      if (!dev) {
        dev = 0;
      }
      dev++;
      break;
    case "release-dev":
      dev = 0;
      break;
  }

  return {
    dev,
    major,
    minor,
    patch,
    revision,
    text: `${major}.${minor}.${patch}${dev ? "-dev." + dev : ""}`,
    timestamp: Math.round(Date.now() / 1000),
  };
}

/**
 * Updates the version in cinnabar.json, package.json, and package-lock.json files.
 * @param {object} cinnabarData - The loaded cinnabar.json data.
 * @param {string} folderPath - The path to the folder containing the files.
 */
export async function updateVersion(cinnabarData, folderPath) {
  const { dev, major, minor, patch } = cinnabarData.version;
  const currentVersionText = `${major}.${minor}.${patch}${dev ? "-dev." + dev : ""}`;

  const versionChoices = [{ name: "Back", value: "back" }];

  if (dev && dev > 0) {
    versionChoices.push(
      ...[
        {
          name: `Update dev (${currentVersionText} -> ${major}.${minor}.${patch}-dev.${(dev ?? 0) + 1})`,
          value: "dev",
        },
        {
          name: `Release dev (${currentVersionText} -> ${major}.${minor}.${patch})`,
          value: "release-dev",
        },
      ],
    );
  } else {
    versionChoices.push(
      ...[
        {
          name: `Start dev patch (${currentVersionText} -> ${major}.${minor}.${patch + 1}-dev.1)`,
          value: "dev-patch",
        },
        {
          name: `Start dev minor (${currentVersionText} -> ${major}.${minor + 1}.0-dev.1)`,
          value: "dev-minor",
        },
        {
          name: `Start dev major (${currentVersionText} -> ${major + 1}.0.0-dev.1)`,
          value: "dev-major",
        },
      ],
    );
  }

  versionChoices.push(
    ...[
      {
        name: `Update patch (${currentVersionText} -> ${major}.${minor}.${patch + 1})`,
        value: "patch",
      },
      {
        name: `Update minor (${currentVersionText} -> ${major}.${minor + 1}.0)`,
        value: "minor",
      },
      {
        name: `Update major (${currentVersionText} -> ${major + 1}.0.0)`,
        value: "major",
      },
    ],
  );

  const { versionType } = await inquirer.prompt({
    choices: versionChoices,
    message: "Select version update type:",
    name: "versionType",
    type: "list",
  });

  if (versionType === "back") {
    return;
  }

  const newVersion = incrementVersion(cinnabarData.version, versionType);

  await commitChanges(folderPath, cinnabarData, versionType, newVersion);
}
