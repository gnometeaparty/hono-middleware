import type { KnipConfig } from "knip";

export default {
	workspaces: {
		"packages/*": {
			entry: ["src/index.ts!"],
			project: ["src/**/*.{js,ts,tsx}!", "src/**/*.test.{js,ts,tsx}"],
			ignoreDependencies: ["@tsconfig/node20", "@size-limit/preset-small-lib"],
		},
	},
} satisfies KnipConfig;
