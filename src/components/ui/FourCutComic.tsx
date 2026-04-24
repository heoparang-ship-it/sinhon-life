type Panel = { caption: string; emoji: string };

export default function FourCutComic({ panels }: { panels: Panel[] }) {
  const four = panels.slice(0, 4);
  return (
    <div className="grid grid-cols-2 gap-2">
      {four.map((p, i) => (
        <div
          key={i}
          className="rounded-xl p-3 flex flex-col items-center gap-2 text-center"
          style={{ background: "var(--peach-card, #FFF0E8)" }}
        >
          <span className="text-3xl">{p.emoji}</span>
          <p className="text-[11px] leading-snug" style={{ color: "#2E3A52" }}>{p.caption}</p>
        </div>
      ))}
    </div>
  );
}
