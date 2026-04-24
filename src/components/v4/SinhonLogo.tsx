// V4 — sinhon.life logo (blue circle mark + wordmark)
export default function SinhonLogo({ size = 22 }: { size?: number }) {
  return (
    <div className="inline-flex items-center gap-2">
      <svg
        width={size + 4}
        height={size + 4}
        viewBox="0 0 28 28"
        aria-hidden="true"
      >
        <circle cx="14" cy="14" r="13" fill="#2196F3" />
        <path
          d="M8 18 Q14 9 20 18"
          stroke="#fff"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="14" cy="11" r="1.8" fill="#fff" />
      </svg>
      <span
        className="font-bold tracking-tight text-[#172033]"
        style={{ fontSize: size * 0.82 }}
      >
        sinhon<span className="text-blue-500">.life</span>
      </span>
    </div>
  );
}
