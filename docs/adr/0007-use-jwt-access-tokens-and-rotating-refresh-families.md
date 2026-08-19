---
status: accepted
---

# Use JWT access tokens and rotating Refresh Token families

Authentication uses strictly verified HS256, unpersisted 15-minute JWT access tokens alongside independently revocable seven-day Refresh Sessions whose opaque tokens rotate and retain hashed family history for reuse detection. HS256 keeps key management inside the modular-monolith trust boundary; this accepts a short access-token revocation delay—including after logout or account disabling—to keep normal API authorization stateless, while database-backed refresh families provide device isolation, immediate prevention of new tokens, atomic rotation, and theft detection without exposing Refresh Tokens to frontend JavaScript. Multiple signing keys and asymmetric verification are deferred until independent services need verification without signing authority.
