const { access, constants, readFile, writeFile } = require("node:fs/promises")
const { join } = require("node:path")

async function findConfigFile(repoPath, configFiles) {
  for (const configFile of configFiles) {
    const configFilePath = join(repoPath, configFile)
    if (await fileExists(configFilePath)) {
      return true
    }
  }
  return false
}

async function writeDetektConfig( repoPath) {
  const configFiles = [
    "detekt.yml",
    "detekt.yaml",
    "detekt-config.yml",
    "detekt-config.yaml",
    "default-detekt-config.yml",
    "default-detekt-config.yaml",
  ]

  const configFileExists = await findConfigFile(repoPath, configFiles)
  console.log("Config file exists: ", configFileExists)
  if (configFileExists) {
    return
  }

  const isAssertive = "assertive"

  // Paths to the config files in the current repository
  const assertiveConfigPath = join(process.cwd(), "assertive-detekt-config.yaml")
  const nonAssertiveConfigPath = join(process.cwd(), "non-assertive-detekt-config.yaml")
  console.log({
    assertiveConfigPath,
    nonAssertiveConfigPath,
  
  })

  // Determine the source config file based on the isAssertive condition
  const sourceConfigPath = isAssertive ? assertiveConfigPath : nonAssertiveConfigPath
  console.log("Source config path: ", sourceConfigPath)

  try {
    // Read the content of the chosen YAML config file
    const configContent = await readFile(sourceConfigPath, "utf8")
    console.log("Config content: ", configContent,typeof configContent)

    // Path to the target config file in the cloned repository
    const targetConfigPath = join(process.cwd(), "detekt-config.yaml")
    console.log("Target config path: ", targetConfigPath)

    // Write the content to the target config file
    await writeFile(targetConfigPath, configContent, { mode: 0o644 })

    console.log(`Detekt config file written to ${targetConfigPath} based on isAssertive = ${isAssertive}`)
  } catch (error) {
    console.error(`Failed to write Detekt config file: ${error}`)
  }
}

async function fileExists(file) {
  try {
    await access(file, constants.F_OK)
    return true
  } catch {
    return false
  }
}

// Example usage
async function exampleUsage() {
  const repoPath = '/path/to/cloned/repo' // Update this to the actual path of the cloned repo


  await writeDetektConfig(repoPath)
}

exampleUsage().catch(console.error)
