# Questions for the owner — Arvan production (UNVERIFIED ON ARVAN)

Please answer as one batch; development does not depend on an immediate answer.

1. Which Arvan Edge runtime and deployment flow is enabled on your account? Can you deploy a Workers-style `addEventListener('fetch', ...)` bundle, and what are the exact CLI/version and deployment configuration requirements?
2. Is there a persistent, shared database/KV accessible from Edge isolates? What binding, authentication, atomic operations, consistency, TTL, latency and pricing apply? Is it shared across PoPs? An in-memory store is not a production leaderboard.
3. What are the request body, response, bundle size, CPU time and memory limits, especially for replay validation? Are V8/JavaScriptCore versions specified?
4. Is AlaaS enabled for your account? What are its endpoint, authentication/secret mechanism, model, quotas, content policies and timeout limits? Can the worker reach it privately?
5. Which request headers are actually available, and which are trustworthy? No geolocation is required for teams; do not enable IP collection.
6. What is the production HTTPS origin/custom domain and the expected lifetime through results day? Who will configure DNS, submit the contest entry and monitor availability?
7. Does the contest permit random, locally generated pseudonymous identifiers and storing replay logs for 14 days under its no-personal-data rule? Please obtain organizer/legal confirmation before enabling public rankings.
8. What operational budget and owner-managed secret/storage provisioning are available? Who will test on real Android and iOS devices and on Arvan staging?

Do not paste credentials into chat, files or the repository. No Arvan deployment or storage binding has been tested here.
