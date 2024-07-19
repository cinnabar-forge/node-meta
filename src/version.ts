import { checkVersionExistsInGitTags } from "./git.js";
import { CinnabarMetaParsedVersion } from "./types.js";

/**
 * Parse the version
 * @param version
 */
export function parseVersion(version: string): CinnabarMetaParsedVersion {
  const [versionPart, prereleasePart] = version.split("-");
  const [major, minor, patch] = versionPart.split(".");
  const [prerelease, prereleaseNumber] = prereleasePart
    ? prereleasePart.split(".")
    : [];

  return {
    major: parseInt(major) ?? 0,
    minor: parseInt(minor) ?? 0,
    patch: parseInt(patch) ?? 0,
    prerelease: prerelease !== "next" ? prerelease : undefined,
    prereleaseNumber:
      prerelease !== "next" && prereleaseNumber != null
        ? parseInt(prereleaseNumber)
        : undefined,
  };
}

/**
 * Check if the version exists
 * @param version
 */
export function checkVersion(version: string) {
  if (checkVersionExistsInGitTags(version)) {
    throw new Error(`Version ${version} already exists`);
  }
}

/**
 * Update the version
 * @param parsedVersion
 * @param updateType
 * @param prerelease
 */
export function updateVersion(
  parsedVersion: CinnabarMetaParsedVersion,
  updateType: string,
  prerelease?: string,
): string {
  let { major, minor, patch } = parsedVersion;

  if (updateType === "major") {
    major++;
    minor = 0;
    patch = 0;
  } else if (updateType === "minor") {
    minor++;
    patch = 0;
  } else if (updateType === "patch") {
    patch++;
  }

  return (
    major + "." + minor + "." + patch + (prerelease ? "-" + prerelease : "")
  );
}

/**
 * Update the prerelease version
 * @param parsedVersion
 * @param newPrerelease
 */
export function updatePrerelease(
  parsedVersion: CinnabarMetaParsedVersion,
  newPrerelease?: string,
): string {
  const { major, minor, patch } = parsedVersion;
  let { prerelease, prereleaseNumber } = parsedVersion;

  if (prerelease != null) {
    if (newPrerelease !== prerelease) {
      prerelease = newPrerelease;
      prereleaseNumber = undefined;
    } else if (prereleaseNumber == null) {
      prereleaseNumber = 1;
    } else {
      prereleaseNumber++;
    }
  }

  return (
    major +
    "." +
    minor +
    "." +
    patch +
    (prerelease ? "-" + prerelease : "") +
    (prereleaseNumber ? "." + prereleaseNumber : "")
  );
}

/**
 * Update the build version
 * @param parsedVersion
 */
export function markBuild(parsedVersion: CinnabarMetaParsedVersion): string {
  const { major, minor, patch, prerelease, prereleaseNumber } = parsedVersion;

  const build = new Date(Date.now())
    .toISOString()
    .replaceAll("-", "")
    .replaceAll(":", "")
    .replace("T", "")
    .replace("Z", "")
    .split(".")[0];

  return (
    major +
    "." +
    minor +
    "." +
    patch +
    (prerelease ? "-" + prerelease : "") +
    (prereleaseNumber ? "." + prereleaseNumber : "") +
    ("-next." + build)
  );
}
