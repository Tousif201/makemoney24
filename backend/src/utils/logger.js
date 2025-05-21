import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Helper to get __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the config file relative to this util file
const configPath = path.join(__dirname, "../../public/config.json");

let devInfo = null; // Cache the config

async function loadDevInfo() {
  if (devInfo) {
    return devInfo;
  }
  try {
    const configData = await readFile(configPath, "utf8");
    devInfo = JSON.parse(configData);
    return devInfo;
  } catch (error) {
    console.warn(`⚠️ Could not load developer info from ${configPath}: ${error.message}`);
    // Provide default values if config loading fails
    return {
      name: "The Developer",
      github: "your-github",
      linkedIn: "your-linkedin",
      ascii: "🚀",
    };
  }
}

export async function beyonderLogger() {
  const info = await loadDevInfo();
  const border = "=".repeat(60);

  console.log(border);
  console.log(`👋 Howdy! I'm ${info.name}.`);
  console.log("   Your Friendly Neighbourhood Dev Environment! 🚀");
  console.log("\n   Check out my work:");
  console.log(`   GitHub    : https://github.com/${info.github}`);
  console.log(`   LinkedIn  : https://linkedin.com/in/${info.linkedIn}`);
  console.log("\n" + (info.ascii || "")); // Display ASCII art if available
  console.log(border);
}
