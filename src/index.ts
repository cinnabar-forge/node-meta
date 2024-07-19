import { updateChangelog } from "./changelog.js";
import { askGithubRepo, askUpdateType, setupCli } from "./cli.js";
import {
  detectVersionsFromFiles,
  getMetaDataFromFiles,
  updateMetaDataFiles,
} from "./files.js";
import { checkGithubRepo } from "./git.js";
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

  const isInteractive =
    options.interactive != null && options.interactive[0] ? true : false;

  let oldVersion;

  const metaData = getMetaDataFromFiles();

  if (metaData != null) {
    oldVersion = metaData.version.latest;
  } else {
    const versions = detectVersionsFromFiles();
    if (versions.length === 0) {
      console.log("No versions found in files");
      oldVersion = "0.0.0";
    } else {
      oldVersion = versions[0];
    }
  }

  const parsedVersion = parseVersion(oldVersion);

  let githubRepo =
    metaData?.repo?.type === "github" && checkGithubRepo(metaData?.repo?.value)
      ? metaData.repo
      : null;

  if (githubRepo == null) {
    if (isInteractive) {
      githubRepo = {
        type: "github",
        value: await askGithubRepo(),
      };
    } else {
      throw new Error(
        "No GitHub repository found in metadata. Use --interactive option to set it.",
      );
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

  await updateMetaDataFiles(oldVersion, newVersion, build != null, githubRepo);

  if (githubRepo != null && build == null) {
    await updateChangelog(isInteractive, oldVersion, newVersion, githubRepo);
  }
}

main();
