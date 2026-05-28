## gstack (recommended)

This project uses [gstack](https://github.com/garrytan/gstack) for AI-assisted workflows.
Install it for the best experience:

```bash
git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
cd ~/.claude/skills/gstack && ./setup --team
```

Skills like /qa, /ship, /review, /investigate, and /browse become available after install.
Use /browse for all web browsing. Use ~/.claude/skills/gstack/... for gstack file paths.

## BMAD-METHOD (installed)

This repo has [BMAD-METHOD](https://github.com/bmad-code-org/bmad-method) installed
(`_bmad/` + 44 skills in `.claude/skills/bmad-*`). It provides PRD/architecture/
story/dev/QA workflow skills (e.g. `bmad-help`, `bmad-prd`, `bmad-create-story`,
`bmad-dev-story`, `bmad-code-review`, etc.).

Generated artifacts (planning/implementation) go to `_bmad-output/` which is
gitignored. To re-install or upgrade: `npx bmad-method install`.
