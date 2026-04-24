import { ExternalLink } from "lucide-react";

export default function SourceCard({
  name,
  url,
  lastUpdated,
}: {
  name: string;
  url?: string;
  lastUpdated?: string;
}) {
  return (
    <div className="rounded-xl p-3 border flex items-center justify-between" style={{ borderColor: "#E6ECF2" }}>
      <div>
        <p className="text-[10px] mb-0.5" style={{ color: "#98A2B3" }}>공식 출처</p>
        <p className="text-sm font-semibold" style={{ color: "#2E3A52" }}>{name}</p>
        {lastUpdated && <p className="text-[10px] mt-0.5" style={{ color: "#98A2B3" }}>{lastUpdated} 기준</p>}
      </div>
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer" className="p-2">
          <ExternalLink size={16} style={{ color: "#98A2B3" }} />
        </a>
      )}
    </div>
  );
}
