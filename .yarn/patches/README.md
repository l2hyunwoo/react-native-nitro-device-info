# Security patches

These patches are applied by the root `package.json` resolutions and verified by
`yarn test:security` in CI. Keep them until an upstream fix passes the same tests.
Do not suppress the advisories: version-based scanners still report the original
package versions even when Yarn installs patched code.

- **braces 3.0.3 — GHSA-vfj7-8cjw-p6xm:** bound parsed brace and parenthesis nesting
  to 128 levels before recursive AST processing. Deeper input raises `SyntaxError`;
  callers accepting untrusted patterns must handle invalid input. Ordinary expansion,
  escaping, and nesting remain supported. This guards string parsing, not arbitrary
  caller-constructed AST objects.
- **http-cache-semantics 4.2.0 — GHSA-ch52-4w7c-c8xp:** require revalidation when
  `maxAge()` is zero, before considering a request's `max-stale`. This prevents
  private, no-store, no-cache, authenticated, and cookie-bearing responses from
  bypassing security-imposed freshness limits. Public responses with positive
  freshness lifetimes retain normal cache behavior. Version 4.3.0 was also tested
  and still reused a private response with `max-stale`, so it is not a replacement
  for this patch.

The documentation site uses Rspress 2 and no longer depends on either package.
