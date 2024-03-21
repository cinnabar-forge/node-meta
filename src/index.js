import { Command } from "commander";

import cinnabarData from "./cinnabar.js";
import { handleCinnabarFile } from "./file.js";
import { getFullVersionText } from "./version.js";

console.log(
  `\n\n==============================================\n${getFullVersionText(cinnabarData)}\n${cinnabarData.description}\n==============================================\n\n`,
);

const program = new Command();

program
  .name("cinnabar-cli")
  .description("CLI to manage cinnabar.json configurations")
  .version("v" + cinnabarData.version?.text)
  .option(
    "-f, --folder <path>",
    "Specify the folder path containing cinnabar.json",
    process.cwd(),
  );

program.action(async (options) => {
  await handleCinnabarFile(options.folder);
});

program.parse();
