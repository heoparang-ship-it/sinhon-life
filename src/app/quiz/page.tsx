"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";

const QUESTIONS = [
  { id: "status", title: "결혼 상태를 알려주세요", opts: ["결혼 예정", "혼인신고 완료", "신혼 1~7년차"] },
  { id: "interest", title: "어떤 게 가장 궁금하세요?", sub: "중복 선택 가능", multi: true, opts: ["신혼집", "전세대출", "청약", "출산", "세금"] },
  { id: "region", title: "지금 사는 지역은 어디세요?", opts: ["서울", "인천", "경기", "기타"] },
];

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  const q = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;
  const selected = answers[q.id];
  const valid = q.multi ? (Array.isArray(selected) && selected.length > 0) : !!selected;

  const choose = (opt: string) => {
    if (q.multi) {
      const arr = (answers[q.id] as string[]) || [];
      setAnswers({
        ...answers,
        [q.id]: arr.includes(opt) ? arr.filter((x) => x !== opt) : [...arr, opt],
      });
    } else {
      setAnswers({ ...answers, [q.id]: opt });
    }
  };

  const next = () => {
    if (!valid) return;
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      // Save answers to localStorage for result page
      localStorage.setItem("sinhon-quiz", JSON.stringify(answers));
      router.push("/explore");
    }
  };

  const isSel = (opt: string) =>
    q.multi ? (Array.isArray(selected) && selected.includes(opt)) : selected === opt;

  return (
    <div className="min-h-dvh flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 pt-3 pb-3.5">
        <button
          onClick={() => (step === 0 ? router.back() : setStep(step - 1))}
          className="p-1.5 text-[#172033]"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 h-1 bg-[#E6ECF2] rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[12px] text-[#667085] font-semibold">
          {step + 1} / {QUESTIONS.length}
        </span>
      </div>

      {/* Question */}
      <div className="flex-1 px-5 pt-4">
        <div className="text-[12px] text-[#1478D4] font-bold tracking-wider">STEP {step + 1}</div>
        <h1 className="text-[22px] font-extrabold text-[#172033] mt-1.5 leading-[1.35] tracking-tight">
          {q.title}
        </h1>
        {q.sub && <p className="text-[12px] text-[#667085] mt-1.5">{q.sub}</p>}

        <div className="flex flex-col gap-2.5 mt-5">
          {q.opts.map((opt) => {
            const active = isSel(opt);
            return (
              <button
                key={opt}
                onClick={() => choose(opt)}
                className={`flex items-center gap-2.5 p-4 rounded-[14px] text-left text-[15px] font-semibold transition-all ${
                  active
                    ? "bg-sky-card border-[1.5px] border-blue-500 text-[#172033]"
                    : "bg-white border-[1.5px] border-[#E6ECF2] text-[#172033]"
                }`}
              >
                <div
                  className={`w-5 h-5 flex items-center justify-center flex-shrink-0 ${
                    q.multi ? "rounded-md" : "rounded-full"
                  } border-[1.5px] transition-colors ${
                    active ? "bg-blue-500 border-blue-500" : "bg-transparent border-[#E6ECF2]"
                  }`}
                >
                  {active && <Check size={12} className="text-white" />}
                </div>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pt-3.5 pb-7 border-t border-[#E6ECF2] bg-white">
        <button
          onClick={next}
          disabled={!valid}
          className={`w-full h-[52px] rounded-[14px] text-[15.5px] font-bold transition-all ${
            valid
              ? "bg-blue-500 text-white active:bg-blue-600"
              : "bg-blue-500/35 text-white/70 cursor-not-allowed"
          }`}
        >
          {step === QUESTIONS.length - 1 ? "맞춤 혜택 보기" : "다음"}
        </button>
      </div>
    </div>
  );
}
