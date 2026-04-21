#!/usr/bin/env node
/**
 * Suspense 래핑 정합성 검증 (deploy 39 재발 방지)
 *
 * src/app 안의 모든 page.tsx·layout.tsx 를 스캔해서
 * useSearchParams()를 호출하는 파일의 default export가
 * <Suspense>로 감싸져 있는지 확인한다.
 *
 * 2026-04-21 deploy 39 에서 /search/page.tsx 가 이 규칙을 안 지켜서 실패.
 * 같은 실수 반복을 막기 위해 push 전 자동 검증.
 *
 * 사용법:
 *   node scripts/verify-suspense.js
 *   또는 npm run verify:suspense
 *
 * 실패 시 exit code 1 — pre-push hook에서 사용 가능.
 */

const fs = require("node:fs");
const path = require("node:path");

const APP_DIR = path.join(process.cwd(), "src", "app");
const RED = "\x1b[31m";
const GRN = "\x1b[32m";
const YLW = "\x1b[33m";
const CYN = "\x1b[36m";
const NC = "\x1b[0m";

/** 재귀적으로 .tsx 파일 수집 */
function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, acc);
    } else if (
      entry.isFile() &&
      (entry.name === "page.tsx" || entry.name === "layout.tsx")
    ) {
      acc.push(full);
    }
  }
  return acc;
}

/**
 * 파일이 useSearchParams()를 호출하는 컴포넌트의 default export를
 * <Suspense>로 감쌌는지 확인.
 *
 * 통과 패턴(예):
 *   export default function XxxPage() {
 *     return <Suspense fallback={null}><XxxContent /></Suspense>;
 *   }
 *
 * 실패 패턴:
 *   export default function XxxPage() {
 *     const params = useSearchParams(); // 여기서 훅 호출
 *     return <main>...</main>;
 *   }
 */
function hasUseSearchParams(src) {
  return /\buseSearchParams\s*\(/.test(src);
}

function defaultExportWrapsSuspense(src) {
  // default export 이후 나오는 첫 return 문의 최상위 태그가 Suspense인지
  const m = src.match(
    /export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{([\s\S]*?)\n\}/
  );
  if (!m) return false;
  const body = m[1];
  // return ( <Suspense ... 또는 return <Suspense ...
  return /return\s*\(?\s*<Suspense\b/.test(body);
}

function main() {
  const files = walk(APP_DIR);
  const offenders = [];
  let checked = 0;

  for (const f of files) {
    const src = fs.readFileSync(f, "utf8");
    if (!hasUseSearchParams(src)) continue;
    checked++;
    if (!defaultExportWrapsSuspense(src)) {
      offenders.push(path.relative(process.cwd(), f));
    }
  }

  if (offenders.length > 0) {
    console.error(`${RED}❌ Suspense 미래핑 감지${NC}`);
    console.error("");
    console.error(
      `다음 ${offenders.length}개 파일이 useSearchParams()를 쓰지만`
    );
    console.error("기본 export에서 <Suspense>로 감싸지 않았습니다.");
    console.error("Amplify static generation에서 빌드 실패를 유발합니다:");
    console.error("");
    for (const f of offenders) {
      console.error(`  ${RED}• ${f}${NC}`);
    }
    console.error("");
    console.error(`${YLW}해결:${NC}`);
    console.error("  1. 기존 기본 export 함수를 내부 컴포넌트로 리네임 (예: FooContent)");
    console.error("  2. 새 기본 export는 아래처럼 작성:");
    console.error("");
    console.error("     export default function FooPage() {");
    console.error("       return (");
    console.error("         <Suspense fallback={null}>");
    console.error("           <FooContent />");
    console.error("         </Suspense>");
    console.error("       );");
    console.error("     }");
    console.error("");
    console.error(
      `${CYN}참고:${NC} src/app/chat/page.tsx, src/app/search/page.tsx 에 올바른 패턴 있음.`
    );
    process.exit(1);
  }

  console.log(
    `${GRN}✅${NC} Suspense 정합성 통과 (${checked}개 파일 검사, ${files.length}개 page/layout 스캔)`
  );
}

main();
