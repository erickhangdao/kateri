import test from "node:test";
import assert from "node:assert/strict";
import {
  cookieValue,
  hasKeystaticWriteAccess,
  issuedAccessToken,
  keystaticAccessDenied,
} from "../src/lib/keystatic-access.mjs";

test("reads only the named Keystatic cookie", () => {
  assert.equal(cookieValue("other=abc; keystatic-gh-access-token=xyz", "keystatic-gh-access-token"), "xyz");
  assert.equal(cookieValue("other=abc", "keystatic-gh-access-token"), "");
});

test("recognizes the OAuth callback's access-token cookie", () => {
  const headers = new Headers();
  headers.append("Set-Cookie", "keystatic-gh-refresh-token=refresh; Path=/; HttpOnly");
  headers.append("Set-Cookie", "keystatic-gh-access-token=access; Path=/");
  assert.equal(issuedAccessToken(new Response(null, { headers })), "access");
});

test("allows only effective GitHub Write-level permissions", async () => {
  for (const permission of ["WRITE", "MAINTAIN", "ADMIN"]) {
    const allowed = await hasKeystaticWriteAccess("token", "owner/repo", async (_url, options) => {
      assert.equal(options.headers.Authorization, "Bearer token");
      assert.deepEqual(JSON.parse(options.body).variables, { owner: "owner", name: "repo" });
      return Response.json({ data: { repository: { viewerPermission: permission } } });
    });
    assert.equal(allowed, true);
  }
  for (const permission of ["READ", "TRIAGE", null]) {
    assert.equal(
      await hasKeystaticWriteAccess("token", "owner/repo", async () =>
        Response.json({ data: { repository: { viewerPermission: permission } } }),
      ),
      false,
    );
  }
});

test("fails closed on invalid configuration or unavailable GitHub", async () => {
  assert.equal(await hasKeystaticWriteAccess("", "owner/repo"), false);
  assert.equal(await hasKeystaticWriteAccess("token", "bad-repo"), false);
  assert.equal(await hasKeystaticWriteAccess("token", "owner/repo", async () => new Response(null, { status: 500 })), false);
  assert.equal(await hasKeystaticWriteAccess("token", "owner/repo", async () => { throw new Error("offline"); }), false);
});

test("access-denied response clears Keystatic session cookies", () => {
  const response = keystaticAccessDenied();
  assert.equal(response.status, 403);
  assert.equal(response.headers.getSetCookie().length, 2);
  assert.match(response.headers.get("Cache-Control"), /no-store/);
});
