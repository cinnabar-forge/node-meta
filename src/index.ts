import { askUpdateType, setupCli } from "./cli.js";
import {
  detectVersionsFromFiles,
  getMetaDataFromFiles,
  updateMetaDataFiles,
} from "./files.js";
import {
  checkVersion,
  markBuild,
  parseVersion,
  updatePrerelease,
  updateVersion,
} from "./version.js";

/**
 * Main function
 */
async function main() {
  const options = setupCli();

  const metaData = getMetaDataFromFiles();
  let parsedVersion;
  if (metaData != null) {
    parsedVersion = parseVersion(metaData.version.latest);
  } else {
    const versions = detectVersionsFromFiles();
    if (versions.length === 0) {
      console.log("No versions found in files");
      parsedVersion = { major: 0, minor: 0, patch: 0 };
    } else {
      parsedVersion = parseVersion(versions[0]);
    }
  }

  let update;
  let prerelease;
  let build;

  let newVersion;

  if (options.interactive) {
    const updateType = await askUpdateType();

    if (updateType === "build") {
      build = "yes";
    }
  } else if (
    options.prerelease != null ||
    options.update != null ||
    options.build != null
  ) {
    if (options.update != null && options.update[0]) {
      update = options.update[0];
    }
    if (options.prerelease != null && options.prerelease[0]) {
      prerelease = options.prerelease[0];
    }
    if (options.build != null && options.build[0]) {
      build = options.build[0];
    }
  } else {
    console.log(
      "No update type specified. Pass --interactive option to choose one, or use specific update type with --update option.",
    );
    return;
  }

  console.log("update", update, "prerelease", prerelease, "build", build);

  if (update != null) {
    newVersion = updateVersion(parsedVersion, update, prerelease);
  } else if (prerelease != null) {
    newVersion = updatePrerelease(parsedVersion, prerelease);
  } else if (build != null) {
    newVersion = markBuild(parsedVersion);
  } else {
    return;
  }

  checkVersion(newVersion);

  console.log("newVersion", newVersion);

  updateMetaDataFiles(newVersion);
}

main();
