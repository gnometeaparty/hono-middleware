import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";

type HeaderVersionOptions = {
	/**
	 * The name of the header to evaluate.
	 *
	 * @default "X-Api-Version"
	 */
	headerName?: string;
	/**
	 * The versions to validate against.
	 */
	versions: Set<string>;
	/**
	 * The version to use if the header is not present.
	 */
	fallbackVersion: string;
	/**
	 * A function to call if the version is invalid.
	 *
	 * @default (c) => c.json({ error: "Invalid API version" }, 400)
	 * @returns A response to send to the client.
	 */
	onInvalidVersion?: (c: Context, next: Next) => Response | Promise<Response>;
};

/**
 * Middleware to add a version header to the response.
 * @param options - The options for the middleware.
 * @returns The middleware.
 */
export const headerVersion = (options: HeaderVersionOptions) => {
	if (options.versions.size === 0) {
		throw new Error("versions must be a non-empty set");
	}

	return createMiddleware(async (c, next) => {
		const headerName = options.headerName ?? "X-Api-Version";
		const version = c.req.header(headerName) ?? options.fallbackVersion;

		if (!options.versions.has(version)) {
			return options.onInvalidVersion?.(c, next) ?? c.json({ error: "Invalid API version" }, 400);
		}

		c.header(headerName, version);
		c.set("apiVersion", version);

		await next();
	});
};

export type HeaderVersionVariables = {
	/**
	 * The version requested by the client.
	 */
	apiVersion: string;
};
