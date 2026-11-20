# Owner-only unresolved decisions

No secret is needed in chat. Please **change the password shared in chat** and revoke any exposed keys.

1. Can you confirm a cost ceiling for Edge and, separately, any AI/storage consumption before a paid resource is created? Will you supply an appropriately scoped machine-user credential through a secure channel only if this environment can use it without exposing it?
2. Which new `cmiyc-` project name and production URL should be used, who will submit/monitor it, and who guarantees availability through results day?
3. Please obtain contest-organizer/legal confirmation that random local pseudonymous IDs, scores and 14-day replay retention are allowed under the no-personal-data rule before enabling public rankings.
4. If persistent rankings are approved, do you explicitly authorize provisioning an Object Storage bucket and scoped S3 credentials after cost/consistency review, or is another supported persistent store available to your account?
5. Is an AI gateway already enabled, and do you authorize a model/budget for flavor text? Gateway usage is billed by tokens; no AI call has been made.
6. Who can conduct staging tests on Arvan and real low-end Android and iOS devices, including availability and accessibility checks?

Platform implementation questions unresolved pending an authenticated private probe (not questions requiring secrets in chat): runtime capabilities/limits, timezone, env/secrets access, store consistency and network access. See PLATFORM_FINDINGS.md.
