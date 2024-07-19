/* eslint-disable sonarjs/no-duplicate-string */
import fs from "fs";

import { CinnabarMeta } from "./types.js";

const ANCA_JSON_PATH = "anca.json";
const CINNABAR_JSON_PATH = "cinnabar.json";

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
 *
 * @param version
 */
export function updateMetaDataFiles(version: string): boolean {
  const updateMeta = (data: CinnabarMeta) => {
    data.dataVersion = 0;
    data.version = {
      latest: version,
      timestamp: Math.floor(Date.now() / 1000),
    };
    if (data.files == null) {
      data.files = [];
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
      updateMeta(ancaJson.cinnabarMeta);
      fs.writeFileSync(ANCA_JSON_PATH, JSON.stringify(ancaJson, null, 2));
      success = true;
    } catch (error) {
      console.error("Error parsing anca.json:", error);
    }
  } else if (fs.existsSync(CINNABAR_JSON_PATH)) {
    const cinnabarContent = fs.readFileSync(ANCA_JSON_PATH, "utf8");
    try {
      const cinnabarJson = JSON.parse(cinnabarContent);
      updateMeta(cinnabarJson);
      fs.writeFileSync(ANCA_JSON_PATH, JSON.stringify(cinnabarJson, null, 2));
      success = true;
    } catch (error) {
      console.error("Error parsing cinnabar.json:", error);
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
