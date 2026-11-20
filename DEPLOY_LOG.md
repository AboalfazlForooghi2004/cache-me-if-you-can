# Deployment log

No Arvan project was created, modified, listed or deleted, and no public URL was obtained. No credential or key was used.

Local sandbox discovery: `command -v arvan` returned no executable. `curl -fsSI --max-time 20 https://repo.arvancloud.ir/apt/gpg.key` timed out. The official CLI authentication guide requires a machine-user access key. Earlier `npx --yes r1ec --help` returned npm ENOVERSIONS. No account-dependent operation was attempted, including `arvan ec list`, hello or probe.

Local only: `node build.js` and `node tests/run_all.js` exercise the generated worker via Node Request/Response. They are not an Arvan deployment test. See PLATFORM_FINDINGS.md.
