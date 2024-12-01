import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { headerVersion } from "./index";

describe("headerVersion", () => {
	let app: Hono;

	beforeEach(() => {
		app = new Hono();
	});

	const addTestRoute = (app: Hono) => app.get("/", (c) => c.text("Hello, world!"));

	it("throws an error if the versions set is empty", () => {
		expect(() => headerVersion({ versions: new Set(), fallbackVersion: "v0" })).toThrow(
			"versions must be a non-empty set",
		);
	});

	it("continues to the next middleware if the specified version is valid", async () => {
		app.use(
			"*",
			headerVersion({
				versions: new Set(["v0"]),
				fallbackVersion: "v0",
			}),
		);
		addTestRoute(app);

		const res = await app.request("/", {
			headers: {
				"X-Api-Version": "v0",
			},
		});

		expect(res.status).toBe(200);
		expect(res.headers.get("X-Api-Version")).toBe("v0");
	});

	it("uses the custom header name if specified", async () => {
		app.use(
			"*",
			headerVersion({
				versions: new Set(["v0", "v1"]),
				fallbackVersion: "v0",
				headerName: "X-Api-Version-Custom",
			}),
		);
		addTestRoute(app);

		const res = await app.request("/", {
			headers: {
				"X-Api-Version-Custom": "v1",
			},
		});

		expect(res.status).toBe(200);
		expect(res.headers.get("X-Api-Version-Custom")).toBe("v1");
	});

	it("uses the fallback version if the header is not present", async () => {
		app.use(
			"*",
			headerVersion({
				versions: new Set(["v0"]),
				fallbackVersion: "v0",
			}),
		);
		addTestRoute(app);

		const res = await app.request("/");

		expect(res.status).toBe(200);
		expect(res.headers.get("X-Api-Version")).toBe("v0");
	});

	it("returns a 400 if the version is invalid", async () => {
		app.use("*", headerVersion({ versions: new Set(["v0"]), fallbackVersion: "v0" }));
		addTestRoute(app);

		const res = await app.request("/", {
			headers: {
				"X-Api-Version": "v1",
			},
		});

		expect(res.status).toBe(400);
	});

	it("calls the onInvalidVersion function if the version is invalid", async () => {
		const onInvalidVersion = vi.fn();

		app.use("*", headerVersion({ versions: new Set(["v0"]), fallbackVersion: "v0", onInvalidVersion }));
		addTestRoute(app);

		const res = await app.request("/", {
			headers: {
				"X-Api-Version": "v1",
			},
		});

		expect(onInvalidVersion).toHaveBeenCalled();
	});
});
