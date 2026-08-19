---
status: accepted
---

# Use PostgreSQL for shared rate limits

Production application rate limits use atomic expiring PostgreSQL token buckets or sliding windows keyed by dedicated-secret HMAC pseudonyms. This adds small database write load but keeps limits consistent across API instances without Redis, prevents process-local bypass, supports independent IP and identity policies, and fails closed for authentication while bounded expiry cleanup avoids turning the table into a general event log.
