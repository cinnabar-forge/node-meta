import fs from "node:fs";
import path from "node:path";
import { listenClivoEvent } from "clivo";

import { getTheLastCommitHash } from "./git.js";
import type {
  CinnabarMeta,
  CinnabarMetaFile,
  CinnabarMetaRepo,
} from "./types.js";

const ANCA_JSON_PATH = "anca.json";
const CINNABAR_JSON_PATH = "cinnabar.json";
const UPDATE_CINNABARMETA_PATH = "update.cinnabarmeta";

export function getUpdateTypeFromFile(): {
  description?: string;
  update: string;
} {
  const updateContent = fs.readFileSync(UPDATE_CINNABARMETA_PATH, "utf8");

  const lines = updateContent.split("\n");
  const update = lines[0];
  const description = lines.slice(1).join("\n").trim();

  fs.rmSync(UPDATE_CINNABARMETA_PATH);

  return {
    update,
    description,
  };
}

/**
 *
 */
export function getMetaDataFromFiles(): CinnabarMeta | undefined {
  if (fs.existsSync(ANCA_JSON_PATH)) {
    const ancaContent = fs.readFileSync(ANCA_JSON_PATH, "utf8");
    try {
      const ancaJson = JSON.parse(ancaContent);
      if (ancaJson.cinnabarMeta) {
        return ancaJson.cinnabarMeta;
      }
    } catch (error) {
      console.error("Error parsing anca.json:", error);
    }
  }

  if (fs.existsSync(CINNABAR_JSON_PATH)) {
    const cinnabarContent = fs.readFileSync(CINNABAR_JSON_PATH, "utf8");
    try {
      return JSON.parse(cinnabarContent);
    } catch (error) {
      console.error("Error parsing cinnabar.json:", error);
    }
  }
}

/**
 * Updates the metadata files like anca.json or cinnabar.json and other files
 * @param oldVersion
 * @param newVersion
 * @param isBuild
 * @param files
 * @param repo
 */
export async function updateMetaDataFiles(
  oldVersion: string,
  newVersion: string,
  isBuild: boolean,
  files: CinnabarMetaFile[],
  repo?: CinnabarMetaRepo | null,
): Promise<boolean> {
  const updateMeta = async (data: CinnabarMeta) => {
    data.dataVersion = 0;
    data.version = {
      latest: isBuild ? oldVersion : newVersion,
      latestNext: isBuild ? newVersion : undefined,
      timestamp: Math.floor(Date.now() / 1000),
    };
    if (data.files == null) {
      data.files = [];
    }
    if (repo != null) {
      data.repo = repo;
    }
  };

  let success = false;
  if (fs.existsSync(ANCA_JSON_PATH)) {
    const ancaContent = fs.readFileSync(ANCA_JSON_PATH, "utf8");
    try {
      const ancaJson = JSON.parse(ancaContent);
      if (ancaJson.cinnabarMeta == null) {
        ancaJson.cinnabarMeta = {};
      }
      await updateMeta(ancaJson.cinnabarMeta);
      fs.writeFileSync(
        ANCA_JSON_PATH,
        `${JSON.stringify(ancaJson, null, 2)}\n`,
      );
      success = true;
    } catch (error) {
      console.error("Error parsing anca.json:", error);
    }
  } else if (fs.existsSync(CINNABAR_JSON_PATH)) {
    const cinnabarContent = fs.readFileSync(CINNABAR_JSON_PATH, "utf8");
    try {
      const cinnabarJson = JSON.parse(cinnabarContent);
      await updateMeta(cinnabarJson);
      fs.writeFileSync(
        CINNABAR_JSON_PATH,
        `${JSON.stringify(cinnabarJson, null, 2)}\n`,
      );
      success = true;
    } catch (error) {
      console.error("Error parsing cinnabar.json:", error);
    }
  }

  for (const file of files) {
    if (isBuild && !file.updateBuild) {
      continue;
    }
    if (file.type === "nodejs-package-json") {
      let packageJson: { version?: string } = {};
      if (fs.existsSync(file.path)) {
        packageJson = JSON.parse(fs.readFileSync(file.path, "utf8"));
      }
      packageJson.version = newVersion;
      fs.writeFileSync(file.path, `${JSON.stringify(packageJson, null, 2)}\n`);
    } else if (file.type === "nodejs-package-lock-json") {
      if (fs.existsSync(file.path)) {
        const packageLockJson = JSON.parse(fs.readFileSync(file.path, "utf8"));
        packageLockJson.version = newVersion;
        if (packageLockJson.packages?.[""]) {
          packageLockJson.packages[""].version = newVersion;
        }
        fs.writeFileSync(
          file.path,
          `${JSON.stringify(packageLockJson, null, 2)}\n`,
        );
      }
    } else if (file.type === "javascript" || file.type === "typescript") {
      const content = `// This file was generated by Cinnabar Meta. Do not edit.\n\nexport const CINNABAR_PROJECT_TIMESTAMP = ${Math.floor(Date.now() / 1000)};\nexport const CINNABAR_PROJECT_VERSION = "${newVersion}";\n`;
      fs.writeFileSync(path.resolve(file.path), content);
    }
  }

  return success;
}

/**
 * Detects the versions from the files like package.json
 */
export function detectVersionsFromFiles(): string[] {
  const versions: string[] = [];
  const packageJsonPath = "package.json";

  if (fs.existsSync(packageJsonPath)) {
    const packageJsonContent = fs.readFileSync(packageJsonPath, "utf8");
    try {
      const packageJson = JSON.parse(packageJsonContent);
      if (packageJson.version) {
        versions.push(packageJson.version);
      }
    } catch (error) {
      console.error("Error parsing package.json:", error);
    }
  }

  return versions;
}

/**
 * Locks the file to prevent multiple instances of Cinnabar running or errors
 */
export function lockCinnabar() {
  const lockFilePath = "cinnabar.lock";
  if (fs.existsSync(lockFilePath)) {
    return fs.readFileSync(lockFilePath, "utf8");
  }
  fs.writeFileSync(lockFilePath, getTheLastCommitHash() || "");
  return true;
}

/**
 * Unlocks the file
 */
export function unlockCinnabar() {
  const lockFilePath = "cinnabar.lock";
  if (fs.existsSync(lockFilePath)) {
    fs.unlinkSync(lockFilePath);
  }
}

/**
 * Locks the PID file to prevent multiple instances of Cinnabar running or errors
 */
export function lockCinnabarPid() {
  const pidLockFilePath = "cinnabar.pid.lock";
  if (fs.existsSync(pidLockFilePath)) {
    throw new Error("Cinnabar is already running");
  }
  fs.writeFileSync(pidLockFilePath, process.pid.toString());
  return true;
}

/**
 * Unlocks the PID file
 */
export function unlockCinnabarPid() {
  const pidLockFilePath = "cinnabar.pid.lock";
  if (fs.existsSync(pidLockFilePath)) {
    fs.unlinkSync(pidLockFilePath);
  }
}

listenClivoEvent("clivoCancel", () => {
  unlockCinnabar();
  unlockCinnabarPid();
});
