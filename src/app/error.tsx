"use client";

import { useEffect } from "react";
import { EmptyState, Button } from "@/components/ui";

/**
 * Next.js error boundary (per-route). Must be a client component.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[route error]", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-paper flex items-center justify-center">
      <EmptyState
        flavor="error"
        title="일시적인 오류가 발생했어요"
        body="잠시 후 다시 시도해주세요. 계속된다면 문의해주시면 빠르게 살펴볼게요."
        action={
          <div className="flex gap-xs">
            <Button variant="secondary" onClick={() => window.location.reload()}>
              새로고침
            </Button>
            <Button onClick={reset}>다시 시도</Button>
          </div>
        }
      />
    </main>
  );
}
