import { updateChangelog, writeChangelog } from "./changelog.js";
import { CINNABAR_PROJECT_VERSION } from "./cinnabar.js";
import {
  askCommitType,
  askGitProvider,
  askGiteaRepo,
  askGithubRepo,
  askPrereleaseTag,
  askUpdateType,
  askYesOrNo,
  setupCli,
} from "./cli.js";
import {
  detectVersionsFromFiles,
  getMetaDataFromFiles,
  getUpdateTypeFromFile,
  lockCinnabar,
  lockCinnabarPid,
  unlockCinnabar,
  unlockCinnabarPid,
  updateMetaDataFiles,
} from "./files.js";
import { checkGithubRepo, commitChanges, resetToCommit } from "./git.js";
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
  lockCinnabarPid();
  const printIntro = () => {
    const design1 = "=".repeat(4);
    const text = `${design1} Cinnabar Meta v${CINNABAR_PROJECT_VERSION} ${design1}`;
    const design2 = "=".repeat(text.length);
    console.log(`\n${design2}\n${text}\n${design2}\n`);
  };
  printIntro();
  const bye = () => {
    unlockCinnabar();
    console.log("\nBye!\n");
    unlockCinnabarPid();
  };

  const success = lockCinnabar();
  if (success !== true) {
    console.log("[WARNING] Reverting to the last stable commit", success);
    const askToRevert = await askYesOrNo(
      "Do you want to revert to the last stable commit?",
    );
    if (askToRevert === "yes") {
      resetToCommit(success);
    } else {
      bye();
      return;
    }
  }

  const options = setupCli();

  const isInteractive = !!options.interactive?.[0];

  let oldVersion: string;

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

  let gitRepo =
    metaData?.repo?.type === "github" && checkGithubRepo(metaData?.repo?.value)
      ? metaData.repo
      : metaData?.repo?.type === "gitea"
        ? metaData?.repo
        : null;

  if (gitRepo == null && metaData?.updateChangelog) {
    if (isInteractive) {
      const provider = await askGitProvider();

      if (provider === "github") {
        gitRepo = {
          type: provider,
          value: await askGithubRepo(),
        };
      } else {
        gitRepo = {
          type: provider,
          value: await askGiteaRepo(),
        };
      }
    }
  }

  let update: string | undefined;
  let prerelease: string | undefined;
  let build: string | undefined;

  let newVersion: string;

  const processUpdateType = async (updateType: string) => {
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
  };

  let versionComment: string | undefined;

  if (options.file) {
    const result = getUpdateTypeFromFile();

    versionComment = result.description;

    processUpdateType(result.update);
  } else if (options.interactive) {
    const updateType = await askUpdateType(parsedVersion, oldVersion);

    processUpdateType(updateType);
  } else if (
    options.prerelease != null ||
    options.update != null ||
    options.build != null
  ) {
    if (options.update?.[0]) {
      update = options.update[0];
    }
    if (options.prerelease?.[0]) {
      prerelease = options.prerelease[0];
    }
    if (options.build?.[0]) {
      build = options.build[0];
    }
  } else {
    console.log(
      "No update type specified. Pass --interactive option to choose one, or use specific update type with --update option.",
    );
    bye();
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
    console.log("No update.");
    bye();
    return;
  }

  checkVersion(newVersion);

  console.log("New app version:", newVersion);

  await updateMetaDataFiles(
    oldVersion,
    newVersion,
    build != null,
    metaData?.files || [],
    gitRepo,
  );

  if (metaData?.updateChangelog && build == null) {
    const versionChangelog = await updateChangelog(
      isInteractive,
      oldVersion,
      newVersion,
      gitRepo,
      !!metaData?.disableChangelogCheck,
      !!metaData?.disableLinks,
      versionComment,
    );

    writeChangelog(newVersion, versionChangelog);
  }

  if (build == null) {
    if (options.interactive) {
      const commitType = await askCommitType();
      if (commitType === "commit" || commitType === "commit-push") {
        commitChanges(newVersion, commitType === "commit-push");
      }
    } else {
      commitChanges(newVersion, options.push != null);
    }
  }
  bye();
}

main();
