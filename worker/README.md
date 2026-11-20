# Worker bootstrap — LOCAL ONLY; UNVERIFIED ON ARVAN

`node build.js` from the repository root embeds the exact `index.html` into `dist/worker.js`.
`node worker/dev.js` serves `/`, `/api/ping`, and a preliminary `/api/daily` locally on port 8787. The daily response sets `simVersion:null` and `verificationAvailable:false`; all other `/api/` routes return 503; no leaderboard or score validation is implemented. No credentials are needed locally.

The [official Edge getting-started guide](https://docs.arvancloud.ir/fa/edge-computing) says that an account is required and that built files can be uploaded through the Edge panel. It links the [CLI guide](https://docs.arvancloud.ir/fa/developer-tools/cli/), which describes the newer `arvan` CLI rather than documenting a concrete `r1ec` deployment recipe. The available docs did not provide a verified sequence for `r1ec` for this bundle. On this machine `npx --yes r1ec --help` returned npm `ENOVERSIONS`. Therefore we cannot honestly supply exact `r1ec` deployment steps; the owner should consult the current account-specific official guide or Arvan support. Never commit credentials.

This bundle's Workers-style listener is **UNVERIFIED ON ARVAN**; no claim is made about runtime compatibility, resource limits, persistence, cost, availability or production deployment. See `../QUESTIONS_FOR_OWNER.md`.

The current CLI authentication documentation specifies `arvan auth login` with a machine-user key, not an account password. See `../PLATFORM_FINDINGS.md` and `../DEPLOY_MANUAL.md`.
