# Owner actions — interim build, not contest-ready

1. **Keep the existing live V1 unchanged.** The current V2 prototype has no score validation, rankings, signed challenges, campaign or private S3 build. Do not replace the live version with it or create a paid bucket yet.
2. Once a complete, tested release is available, run `node build.js` and `node tests/run_all.js`, then in the existing Edge project choose «بارگذاری فایل» and select the final `dist/worker.js`. This operation is unverified on Arvan; retain a rollback to the currently live V1.
3. On a *private staging copy* of a future tested release, open `/__diag`. It currently reports unavailable features honestly; never publish secrets or raw private configuration. Check the result before relying on platform capabilities.
4. After the missing features are built, check the game, offline fallback, and—if implemented—rankings/challenge links on an actual phone. Obtain organizer guidance on pseudonymous names and moderation before enabling rankings.
5. When the complete release and showcase assets are ready, submit the live URL and keep it available through results day. Review costs and revoke any storage keys only when they are no longer needed by the running service (revoking a live key disables its board).

No account password or other credentials are requested. Because a password was previously shared in chat, change it if not already rotated.
