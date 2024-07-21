import { updateChangelog } from "./changelog.js";
import { CINNABAR_PROJECT_VERSION } from "./cinnabar.js";
import {
  askGithubRepo,
  askPrereleaseTag,
  askUpdateType,
  setupCli,
} from "./cli.js";
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
  const printIntro = () => {
    const design1 = "=".repeat(4);
    const text = `${design1} Cinnabar Meta v${CINNABAR_PROJECT_VERSION} ${design1}`;
    const design2 = "=".repeat(text.length);
    console.log(`\n${design2}\n${text}\n${design2}\n`);
  };
  printIntro();

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

  if (githubRepo == null && metaData?.updateChangelog) {
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
    const updateType = await askUpdateType(parsedVersion, oldVersion);

    switch (updateType) {
      case "prerelease-update":
        prerelease = parsedVersion.prerelease;
        break;
      case "prerelease-change":
        prerelease = await askPrereleaseTag();
        break;
      case "prerelease-release":
        prerelease = "yes";
        break;
      case "build":
        build = "yes";
        break;
      case "major":
      case "minor":
      case "patch":
        update = updateType;
        break;
      case "major-prerelease":
      case "minor-prerelease":
      case "patch-prerelease":
        update = updateType.split("-")[0];
        prerelease = await askPrereleaseTag();
        break;
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

  // console.log(
  //   parsedVersion,
  //   "update",
  //   update,
  //   "prerelease",
  //   prerelease,
  //   "build",
  //   build,
  // );

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

  console.log("New app version:", newVersion);

  await updateMetaDataFiles(
    oldVersion,
    newVersion,
    build != null,
    metaData?.files || [],
    githubRepo,
  );

  if (metaData?.updateChangelog && githubRepo != null && build == null) {
    await updateChangelog(isInteractive, oldVersion, newVersion, githubRepo);
  }
}

main();
