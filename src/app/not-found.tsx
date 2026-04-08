import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <p className="text-6xl mb-4">😢</p>
      <h1 className="text-xl font-bold mb-2">페이지를 찾을 수 없어요</h1>
      <p className="text-sm text-warm-text-muted mb-6">
        주소가 바뀌었거나 삭제된 페이지예요
      </p>
      <Link
        href="/"
        className="bg-coral text-white px-6 py-3 rounded-xl font-semibold text-sm active:scale-[0.97] transition-transform"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
