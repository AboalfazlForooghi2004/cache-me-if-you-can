# Manual deployment — UNVERIFIED ON ARVAN

The current bundle is a development bootstrap, not the requested complete V2; do not submit it as a verified-scoring contest entry.

1. Locally run `node build.js` and `node tests/run_all.js`. The upload artifact is `worker/dist/worker.js`.
2. Sign into your own [Arvan panel](https://accounts.arvancloud.ir/login) yourself. Before creating anything, inspect your existing Edge projects. Do not modify or delete existing projects. Check pricing/plan and approve any charges first.
3. In Edge Computing, create a new project whose name starts `cmiyc-`; use «بارگذاری فایل» to upload the bundle, following the current panel instructions. The official [dashboard guide](https://docs.arvancloud.ir/fa/edge-computing/dashboard/) describes build-file upload and the default test address. No DNS/domain changes are required for the default subdomain.
4. Privately verify the page, `/api/ping`, and `/api/daily`. The latter reports `verificationAvailable:false`; `/api/score` is unavailable. Do not send real leaderboard traffic. Record the deployment version, URL and test results only after confirmation; no secrets in logs or repo.
5. Keep the URL available through results day if you later submit it. Arrange monitoring and owner-managed renewal.

If using CLI instead, install it per the [official guide](https://docs.arvancloud.ir/en/developer-tools/cli/install/), then authenticate on your own machine via `arvan auth login` with a scoped machine-user key (not your account password). Verify current `arvan ec --help` and run `arvan ec list` before any write. Project names must start `cmiyc-`. Never put keys in command-line arguments, chat, source, logs, or Git. This sandbox could not verify the CLI deploy sequence.

Because the account password appeared in chat, change it now and revoke any key that was created or exposed.
