import { Play } from "lucide-react";

export default function ShortsCard({
  title,
  duration,
  tags = [],
}: {
  title: string;
  duration?: string;
  tags?: string[];
}) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--sky-card, #EAF6FF)" }}>
      <div className="relative h-40 flex items-center justify-center">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
          style={{ background: "var(--primary, #2196F3)" }}
        >
          <Play size={20} fill="white" className="text-white ml-1" />
        </div>
        {duration && (
          <span className="absolute bottom-2 right-2 text-[10px] px-2 py-0.5 rounded" style={{ background: "rgba(0,0,0,0.55)", color: "white" }}>
            {duration}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold" style={{ color: "#172033" }}>{title}</p>
        {tags.length > 0 && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {tags.map((t) => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white" style={{ color: "var(--primary, #2196F3)" }}>
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
