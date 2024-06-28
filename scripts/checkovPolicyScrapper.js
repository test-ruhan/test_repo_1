/* eslint-disable */
const fs = require('fs');
const path = require('path');


/**
 * This script is used to parse the Checkov policy documentation to extract the Checkov ID and Severity.
 * How to run the script:
 * 1. Clone the open source repo https://github.com/hlxsites/prisma-cloud-docs
 * 2. Run the script from the root of the repo with the directoryPath set to the path of the policy-reference directory.
 *    which is "docs/en/enterprise-edition/policy-reference"
 * 3. The script will parse all the .adoc files in the directory and its subdirectories and extract the Checkov ID and Severity.
 * 4. The script will generate a TypeScript file 'checkov_policy_severity.ts' with the extracted data.
 **/
function parseAdoc(filePath) {
	const content = fs.readFileSync(filePath, "utf-8")

	// Regex pattern to extract Checkov ID
	const checkovIdRegex =
		/\|\s*Checkov ID\s*\|\s*(?:https:\/\/[^\[]+\[([^\]]+)\]|([^\n\r]+))/
	const checkovIdMatch = content.match(checkovIdRegex)
	const checkovId = checkovIdMatch
		? checkovIdMatch[1] || checkovIdMatch[2]
		: null

	// Regex pattern to extract Severity
	const severityRegex = /\|Severity\s*\|\s*(\w+)\s*/
	const severityMatch = content.match(severityRegex)
	const severity = severityMatch ? severityMatch[1] : null

	return {
		checkovId,
		severity,
	}
}

function main() {
	// const directoryPath = "docs/en/enterprise-edition/policy-reference"
	const directoryPath = process.argv[2]
	if (!directoryPath) {
		console.error("Please provide the directory path as an argument")
		process.exit(1)
	}
	const output = {}

	function processDirectory(dirPath) {
		const files = fs.readdirSync(dirPath)

		files.forEach(file => {
			const filePath = path.join(dirPath, file)

			if (fs.statSync(filePath).isDirectory()) {
				processDirectory(filePath)
			} else if (filePath.endsWith(".adoc")) {
				// Check if the file should be processed based on filename filtering
				const fileName = path.basename(filePath).toLowerCase()
				if (fileName.includes("policies") || fileName.includes("index")) {
					return // Skip processing this file
				}
				const { checkovId, severity } = parseAdoc(filePath)
				if (checkovId && severity) {
					output[checkovId] = severity
				}
			}
		})
	}

	processDirectory(directoryPath)

	// Generate TypeScript file content
	let tsContent = "export const checkovPolicySeverity: Record<string, string> = {\n"
	Object.keys(output).forEach(checkovId => {
		tsContent += `  "${checkovId}": "${output[checkovId]}",\n`
	})
	tsContent += "};\n"

	// Write to TypeScript file
	fs.writeFileSync("checkov_policy_severity.ts", tsContent)

	console.log(
		"TypeScript file 'checkov_policy_severity.ts' generated successfully.",
	)
}

main()
