/* eslint-disable security/detect-object-injection */
/* eslint-disable security/detect-non-literal-fs-filename */
import fs from "fs";
import inquirer from "inquirer";
import path from "path";

import { getFullVersionText, updateVersion } from "./version.js";

const CINNABAR_FILE = "cinnabar.json";
const CINNABAR_JAVASCRIPT_FILE = "cinnabar.js";
const PACKAGE_JSON_FILE = "package.json";

/**
 *
 * @param folderPath
 */
export async function getCinnabarData(folderPath) {
  const cinnabarPath = path.join(folderPath, CINNABAR_FILE);
  let cinnabarData;

  try {
    if (fs.existsSync(cinnabarPath)) {
      cinnabarData = JSON.parse(fs.readFileSync(cinnabarPath, "utf8"));
    } else if (fs.existsSync(path.join(folderPath, "version.json"))) {
      cinnabarData = getVersionJson(folderPath);
      // eslint-disable-next-line sonarjs/no-duplicate-string
    } else if (fs.existsSync(path.join(folderPath, PACKAGE_JSON_FILE))) {
      cinnabarData = getPackageJson(folderPath);
    } else {
      cinnabarData = {};
    }
  } catch (error) {
    console.error(error.message);
    cinnabarData = {};
  } finally {
    if (cinnabarData.version == null) {
      cinnabarData.version = {
        major: 0,
        minor: 0,
        patch: 0,
        revision: 0,
        text: "0.0.0",
        timestamp: 0,
      };
    }
    if (cinnabarData.stack == null) {
      cinnabarData.stack = {};
    }
  }

  return cinnabarData;
}

/**
 * Load data from package.json file
 * @param folderPath
 */
async function getPackageJson(folderPath) {
  const packageJsonPath = path.join(folderPath, PACKAGE_JSON_FILE);

  try {
    const data = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    const versionSplitted = (data.version ?? "0.0.0")
      .split(".")
      .map((value) => parseInt(value));

    return {
      cinnabarMetaVersion: 1,
      description: data.description ?? "app",
      name: data.name ?? "app",
      stack: {
        nodejs: {
          outputFile: fs.existsSync(path.join(folderPath, "src"))
            ? ["src", CINNABAR_JAVASCRIPT_FILE]
            : [CINNABAR_JAVASCRIPT_FILE],
          package: data.name ?? "app",
        },
      },
      version: {
        major: versionSplitted[0],
        minor: versionSplitted[1],
        patch: versionSplitted[2],
        text: `${versionSplitted[0]}.${versionSplitted[1]}.${versionSplitted[2]}`,
      },
    };
  } catch (error) {
    return {};
  }
}

/**
 * Load legacy cf-version's version.json file
 * @param folderPath
 */
async function getVersionJson(folderPath) {
  const versionJsonPath = path.join(folderPath, "version.json");

  try {
    const data = JSON.parse(fs.readFileSync(versionJsonPath, "utf8"));

    const versionJsonData = await getPackageJson(folderPath);

    const cinnabarData = {
      cinnabarMetaVersion: 1,
      description: data.description ?? versionJsonData.description ?? "app",
      name: data.name ?? "app",
      version: {
        major: data.major ?? 0,
        minor: data.minor ?? 0,
        patch: data.patch ?? 0,
        revision: data.revision,
        text: `${data.major ?? 0}.${data.minor ?? 0}.${data.patch ?? 0}`,
        timestamp: data.timestamp ?? 0,
      },
    };

    if (fs.existsSync(path.join(folderPath, PACKAGE_JSON_FILE))) {
      cinnabarData.stack = {
        nodejs: {
          outputFile: fs.existsSync(path.join(folderPath, "src"))
            ? ["src", CINNABAR_JAVASCRIPT_FILE]
            : [CINNABAR_JAVASCRIPT_FILE],
          package: data.package,
        },
      };
    }

    return cinnabarData;
  } catch (error) {
    return {};
  }
}

/**
 * Handle the main menu and actions for the cinnabar.json file.
 * @param {string} folderPath - The path to the folder containing the cinnabar.json file.
 */
export async function handleCinnabarFile(folderPath) {
  const cinnabarData = await getCinnabarData(folderPath);

  const mainChoices = [
    { name: "Exit", value: "exit" },
    { name: "Change node.js package name", value: "changeNodejsPackageName" },
    { name: "Change name", value: "changeName" },
    { name: "Change description", value: "changeDescription" },
    { name: "Update version", value: "updateVersion" },
  ];

  const { action } = await inquirer.prompt({
    choices: mainChoices,
    message: getFullVersionText(cinnabarData),
    name: "action",
    type: "list",
  });

  switch (action) {
    case "exit":
      return;
    case "changeName":
      await handleChange("name", cinnabarData);
      writeToFiles(folderPath, cinnabarData);
      break;
    case "changeDescription":
      await handleChange("description", cinnabarData);
      writeToFiles(folderPath, cinnabarData);
      break;
    case "changeNodejsPackageName":
      if (cinnabarData.stack == null) {
        cinnabarData.stack = {};
      }
      if (cinnabarData.stack.nodejs == null) {
        cinnabarData.stack.nodejs = {};
      }
      writeToFiles(folderPath, cinnabarData);
      await handleChange("package", cinnabarData.stack.nodejs);
      break;
    case "updateVersion":
      await updateVersion(cinnabarData, folderPath);
      break;
  }

  handleCinnabarFile(folderPath);
}

/**
 * @param {string} key
 * @param {object} data
 */
async function handleChange(key, data) {
  const current = data[key];
  const { newValue } = await inquirer.prompt({
    default: current,
    message: `Enter new ${key}:`,
    name: "newValue",
    type: "input",
  });

  data[key] = newValue;
}

/**
 *
 * @param folderPath
 * @param cinnabarData
 * @param newVersion
 */
export function writeToFiles(folderPath, cinnabarData, newVersion = null) {
  if (newVersion != null) {
    cinnabarData.version = newVersion;
  }

  fs.writeFileSync(
    path.join(folderPath, CINNABAR_FILE),
    JSON.stringify(cinnabarData, null, 2) + "\n",
    "utf8",
  );

  if (cinnabarData.stack?.nodejs) {
    updateJavascriptFile(folderPath, cinnabarData, newVersion);
    updatePackageJson(folderPath, cinnabarData, newVersion, false);
    updatePackageJson(folderPath, cinnabarData, newVersion, true);
  }
}

/**
 *
 * @param folderPath
 * @param cinnabarData
 * @param newVersion
 */
function updateJavascriptFile(folderPath, cinnabarData, newVersion) {
  const fileName = cinnabarData.stack?.nodejs?.outputFile ?? [
    CINNABAR_JAVASCRIPT_FILE,
  ];
  const filePath = path.join(folderPath, ...fileName);

  if (newVersion != null) {
    cinnabarData.version = newVersion;
  }

  try {
    fs.writeFileSync(
      filePath,
      `// This file was generated by Cinnabar Forge Meta. Do not edit.\n\nexport default ${JSON.stringify(cinnabarData, null, 2)};\n`,
      "utf8",
    );
  } catch (error) {
    console.error(`Failed to update ${fileName}:`, error.message);
  }
}

/**
 *
 * @param folderPath
 * @param cinnabarData
 * @param newVersion
 * @param lock
 */
function updatePackageJson(folderPath, cinnabarData, newVersion, lock) {
  const fileName = lock ? "package-lock.json" : PACKAGE_JSON_FILE;
  const filePath = path.join(folderPath, fileName);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (cinnabarData.stack?.nodejs?.package != null) {
      data.name = cinnabarData.stack.nodejs.package;
    }
    if (cinnabarData.description != null && !lock) {
      data.description = cinnabarData.description;
    }
    if (newVersion != null) {
      data.version = newVersion.text;
    }
    if (data.packages?.[""] != null) {
      if (cinnabarData.stack?.nodejs?.package != null) {
        data.packages[""].name = cinnabarData.stack.nodejs.package;
      }
      if (newVersion != null) {
        data.packages[""].version = newVersion.text;
      }
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
  } catch (error) {
    console.error(`Failed to update ${fileName}:`, error.message);
  }
}
