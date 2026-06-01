## gstack (recommended)

This project uses [gstack](https://github.com/garrytan/gstack) for AI-assisted workflows.
Install it for the best experience:

```bash
git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
cd ~/.claude/skills/gstack && ./setup --team
```

Skills like /qa, /ship, /review, /investigate, and /browse become available after install.
Use /browse for all web browsing. Use ~/.claude/skills/gstack/... for gstack file paths.

## Business Documents (사업계획서 운영 규칙)

이 레포는 `docs/business/**` 에 사업계획서·정부지원 신청서·IP 초안 등 비즈니스 문서를 함께 보관한다.
사용자가 정부지원 1순위로 운영 중이며, 수시 업데이트가 필요해 깃 트래킹을 명시 채택했다.

- 위치
  - `docs/business/master_businessplan.md` — 마스터 사업계획서(어느 공고에든 발췌)
  - `docs/business/grants/<공고명>_v<n>.md` — 공고별 신청서 초안
  - `docs/business/ip/<제목>_v<n>.md` — 특허/상표/저작권 초안
- 작업 규칙
  - 변경 시 **매번** ① 지정 브랜치에 커밋·푸시 ② `SendUserFile` 로도 동시 전달 (사용자가 손에 즉시 쥘 수 있게)
  - 버저닝은 수동 (`_v0.1` → `_v0.2`). 큰 개편은 새 파일로 보존, 작은 갱신은 같은 파일.
  - 사업 문서와 코드 변경이 같이 일어나도 **PR은 분리**(리뷰 용이) — 단 사용자가 통합을 명시하면 한 PR에 묶음.

## BMAD-METHOD (installed)

This repo has [BMAD-METHOD](https://github.com/bmad-code-org/bmad-method) installed
(`_bmad/` + 44 skills in `.claude/skills/bmad-*`). It provides PRD/architecture/
story/dev/QA workflow skills (e.g. `bmad-help`, `bmad-prd`, `bmad-create-story`,
`bmad-dev-story`, `bmad-code-review`, etc.).

Generated artifacts (planning/implementation) go to `_bmad-output/` which is
gitignored. To re-install or upgrade: `npx bmad-method install`.
