export default function ProgressCard({
  done,
  total,
  nextLabel,
}: {
  done: number;
  total: number;
  nextLabel?: string;
}) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct / 100);

  return (
    <div className="relative overflow-hidden rounded-3xl p-5 flex items-center gap-4 bg-gradient-to-br from-mint-200 to-mint-500/40 border border-mint-500/40">
      <span
        aria-hidden
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full"
        style={{ background: "radial-gradient(circle, #FBD38D77, transparent 70%)" }}
      />
      <div className="relative" style={{ width: 72, height: 72 }}>
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={radius} stroke="rgba(255,255,255,0.6)" strokeWidth="6" fill="none" />
          <circle
            cx="36"
            cy="36"
            r={radius}
            stroke="#2F8770"
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(-90 36 36)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-serif text-[20px] font-bold text-mint-700">
          {pct}%
        </div>
      </div>
      <div className="flex-1 relative">
        <div className="text-[13px] text-mint-700 font-semibold">
          {done} / {total} 완료
        </div>
        <div className="text-[14px] font-bold text-ink mt-0.5 tracking-tight">
          {pct >= 70
            ? "거의 다 왔어요 🤍"
            : pct >= 30
            ? "순조롭게 가고 있어요 🤍"
            : "천천히 시작해봐요 🌱"}
        </div>
        {nextLabel && (
          <div className="text-[11px] text-mint-700/85 mt-1">다음: {nextLabel}</div>
        )}
      </div>
    </div>
  );
}
