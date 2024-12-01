import { RuleConfigSeverity } from "@commitlint/types";

export default {
	extends: ["@commitlint/config-conventional"],
	rules: {
		"subject-case": [
			RuleConfigSeverity.Error,
			"never",
			[
				// Disabled for tickets like "JIRA-1234".
				// "sentence-case",
				"start-case",
				"pascal-case",
				"upper-case",
			],
		],
	},
};
