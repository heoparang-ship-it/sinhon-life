export interface Suggestion {
  icon: string;
  text: string;
}

export const CHAT_SUGGESTIONS: Suggestion[] = [
  { icon: "💰", text: "우리 부부 정부지원 혜택 알려줘" },
  { icon: "🏠", text: "서울 신혼 월세지원 어떻게 신청해?" },
  { icon: "💍", text: "혼수 예산은 어떻게 나누지?" },
  { icon: "📋", text: "D-60 결혼 체크리스트 만들어줘" },
];

export default function SuggestionChips({
  onPick,
  disabled,
}: {
  onPick: (text: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      {CHAT_SUGGESTIONS.map((s) => (
        <button
          key={s.text}
          onClick={() => onPick(s.text)}
          disabled={disabled}
          className="flex items-center gap-2.5 w-full text-left bg-paper-surface border border-paper-line rounded-xl px-4 py-3 text-[13px] text-ink font-medium active:scale-[0.98] transition-transform hover:bg-paper disabled:opacity-50"
        >
          <span className="text-[18px]" aria-hidden>
            {s.icon}
          </span>
          <span className="flex-1">{s.text}</span>
        </button>
      ))}
    </div>
  );
}
