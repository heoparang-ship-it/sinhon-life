export default function TranslationCard({
  original,
  easy,
  caution,
}: {
  original: string;
  easy: string;
  caution?: string;
}) {
  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ background: "var(--sky-card, #EAF6FF)" }}>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#667085" }}>공문 용어</p>
        <p className="text-sm" style={{ color: "#2E3A52" }}>{original}</p>
      </div>
      <div className="border-t pt-3" style={{ borderColor: "#E6ECF2" }}>
        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--primary, #2196F3)" }}>쉬운 말</p>
        <p className="text-sm font-semibold" style={{ color: "#172033" }}>{easy}</p>
      </div>
      {caution && (
        <div className="border-t pt-3" style={{ borderColor: "#E6ECF2" }}>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#C2440D" }}>주의</p>
          <p className="text-sm" style={{ color: "#2E3A52" }}>{caution}</p>
        </div>
      )}
    </div>
  );
}
