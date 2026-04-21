#!/usr/bin/env bash
# Amplify 빌드 환경 시뮬레이터 (2026-04-21, deploy 35/37/39 실패 재발 방지)
#
# Amplify가 실제로 돌리는 것과 동일한 순서·환경에서 로컬 빌드를 검증한다.
# push 전에 이 스크립트를 반드시 통과시킬 것.
#
# 검증 항목:
#   1. stale `.prisma/client/` 제거 (deploy 35 재발 방지)
#   2. Suspense 미래핑 page.tsx 그렙 검사 (deploy 39 재발 방지)
#   3. prisma generate (deploy 35/37 재발 방지)
#   4. tsc --noEmit (기본 타입 체크)
#   5. next build (Amplify static generation 재현)
#
# 사용법:
#   bash scripts/amplify-dryrun.sh
#   또는 npm run amplify:dryrun

set -euo pipefail

cd "$(dirname "$0")/.."

RED='\033[0;31m'
GRN='\033[0;32m'
YLW='\033[1;33m'
CYN='\033[0;36m'
NC='\033[0m'

ok()   { echo -e "${GRN}✅${NC} $*"; }
info() { echo -e "${CYN}➜${NC}  $*"; }
warn() { echo -e "${YLW}⚠${NC}  $*"; }
fail() { echo -e "${RED}❌${NC} $*" >&2; }

START_TS=$(date +%s)

echo ""
echo "🧪 Amplify 빌드 드라이런 시작"
echo "   ($(pwd))"
echo ""

# ────────────────────────────────────────────────────────────
# Step 1. Stale artifacts 제거 (Amplify는 npm ci 이후 깨끗한 상태)
# ────────────────────────────────────────────────────────────
info "[1/5] stale artifacts 제거 (.prisma/client, .next)"
rm -rf node_modules/.prisma .next 2>/dev/null || true
ok "stale artifacts 제거 완료"
echo ""

# ────────────────────────────────────────────────────────────
# Step 2. Suspense 미래핑 page.tsx 검사 (deploy 39 재발 방지)
# ────────────────────────────────────────────────────────────
info "[2/5] useSearchParams + Suspense 정합성 검사"
UNWRAPPED=""
if command -v rg >/dev/null 2>&1; then
  GREP_CMD="rg -l"
else
  GREP_CMD="grep -rl"
fi

while IFS= read -r f; do
  [ -z "$f" ] && continue
  # 기본 export가 Suspense를 감싸는 패턴인지 확인
  # 패턴 1: export default function X() { return <Suspense ... }
  # 패턴 2: 파일에 Suspense import + 기본 export에서 사용
  if ! grep -qE "export default function .*\(\).*\{[[:space:]]*return[[:space:]]*<Suspense" "$f" 2>/dev/null; then
    # 더 느슨한 검증: 파일 안에 Suspense가 있고 export default 바로 다음에 Suspense 블록이 나오는지
    if ! awk '/export default/{flag=1} flag && /<Suspense/{found=1; exit} END{exit !found}' "$f" 2>/dev/null; then
      UNWRAPPED="$UNWRAPPED$f\n"
    fi
  fi
done < <($GREP_CMD "useSearchParams" src/app --include='*.tsx' 2>/dev/null | grep -E '(page|layout)\.tsx$' || true)

if [ -n "$UNWRAPPED" ]; then
  fail "useSearchParams()를 쓰는데 기본 export에서 <Suspense>로 감싸지 않은 파일:"
  echo -e "$UNWRAPPED" | sed 's/^/    /'
  echo ""
  echo "  해결: 해당 파일의 기본 export를 내부 컴포넌트로 분리하고 <Suspense fallback={null}>로 래핑"
  echo "  참고: src/app/chat/page.tsx 구조"
  exit 1
fi
ok "Suspense 정합성 통과"
echo ""

# ────────────────────────────────────────────────────────────
# Step 3. prisma generate (deploy 35/37 재발 방지)
# ────────────────────────────────────────────────────────────
if [ -f "prisma/schema.prisma" ]; then
  info "[3/5] prisma generate"
  if ! npx prisma generate 2>&1 | tail -5; then
    fail "prisma generate 실패"
    exit 1
  fi
  ok "prisma generate 통과"
else
  warn "[3/5] prisma/schema.prisma 없음 — 스킵"
fi
echo ""

# ────────────────────────────────────────────────────────────
# Step 4. tsc --noEmit (타입 체크)
# ────────────────────────────────────────────────────────────
info "[4/5] tsc --noEmit"
if ! npx tsc --noEmit; then
  fail "tsc 실패 — 타입 에러 수정 후 재시도"
  exit 1
fi
ok "tsc 통과"
echo ""

# ────────────────────────────────────────────────────────────
# Step 5. next build (Amplify static generation 재현)
# ────────────────────────────────────────────────────────────
info "[5/5] next build (Amplify와 동일한 static generation)"
echo "    ⏱  로컬 머신에서 보통 2~5분 걸림. 타임아웃 걸리면 환경변수 확인"
echo ""
if ! NODE_OPTIONS="--max-old-space-size=4096" npx next build --no-lint; then
  fail "next build 실패 — 위 로그에서 에러 위치 확인"
  echo ""
  echo "  자주 나오는 원인:"
  echo "    - useSearchParams/useRouter/usePathname Suspense 미래핑"
  echo "    - 환경변수 (DATABASE_URL, KAKAO_*, NEXTAUTH_*) 누락"
  echo "    - Prisma 7.x adapter 미주입 (src/lib/prisma.ts)"
  exit 1
fi
echo ""

END_TS=$(date +%s)
ELAPSED=$((END_TS - START_TS))
MIN=$((ELAPSED / 60))
SEC=$((ELAPSED % 60))

echo ""
ok "Amplify 빌드 드라이런 전체 통과 (${MIN}분 ${SEC}초)"
echo ""
echo "  안전하게 push해도 됩니다: git push origin main"
echo ""
