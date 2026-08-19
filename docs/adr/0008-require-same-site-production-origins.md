---
status: accepted
---

# Require same-site production origins

Production places the HTTPS frontend and API on exact origins under one registrable domain, allowing the opaque Refresh Token to use a host-only `Secure`, `HttpOnly`, `SameSite=Lax` cookie with strict Origin validation and no separate CSRF token. This constrains hosting to custom sibling subdomains or a same-origin proxy, but avoids silently weakening cookies; unrelated public domains require an explicit redesign with `SameSite=None; Secure` and dedicated CSRF protection.
