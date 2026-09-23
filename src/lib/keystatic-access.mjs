const writePermissions = new Set(["WRITE", "MAINTAIN", "ADMIN"]);

/** Read a named cookie without trusting the rest of the cookie header. */
export function cookieValue(header, name) {
  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator > -1 && part.slice(0, separator).trim() === name) {
      return part.slice(separator + 1).trim();
    }
  }
  return "";
}

/** Keystatic sets an access-token cookie after the GitHub OAuth callback or refresh. */
export function issuedAccessToken(response) {
  for (const header of response.headers.getSetCookie()) {
    const token = cookieValue(header, "keystatic-gh-access-token");
    if (token) return token;
  }
  return "";
}

/** Ask GitHub for the signed-in user's effective permission on this repository. */
export async function hasKeystaticWriteAccess(token, repo, fetcher = fetch) {
  const [owner, name, ...extra] = repo.split("/");
  if (!token || !owner || !name || extra.length) return false;
  try {
    const response = await fetcher("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "kateri-keystatic-access",
      },
      body: JSON.stringify({
        query:
          "query($owner:String!,$name:String!){repository(owner:$owner,name:$name){viewerPermission}}",
        variables: { owner, name },
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return false;
    const result = await response.json();
    return writePermissions.has(result?.data?.repository?.viewerPermission);
  } catch {
    return false;
  }
}

export function keystaticAccessDenied() {
  const headers = new Headers({
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex, nofollow",
  });
  for (const name of ["keystatic-gh-access-token", "keystatic-gh-refresh-token"]) {
    headers.append("Set-Cookie", `${name}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`);
  }
  return new Response("Access denied. Ask the website administrator for Write access to the GitHub repository.", {
    status: 403,
    headers,
  });
}
