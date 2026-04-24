"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";

const POPULAR = [
  { rank: 1, title: "신혼부부 전세자금대출 (버팀목)", saves: 3421, slug: "newlywed-jeonse" },
  { rank: 2, title: "디딤돌 주택구입자금대출", saves: 2109, slug: "didimdon-housing-loan" },
  { rank: 3, title: "첫만남이용권 200만원", saves: "first-meet-voucher", slug: "first-meet-voucher" },
];

// V4 — 신혼부부가 많이 저장한 랭킹
export default function PopularList() {
  return (
    <section className="px-4 pt-3 pb-2">
      <h3 className="text-[15px] font-extrabold text-[#172033] mb-2.5">신혼부부가 많이 저장한</h3>
      {POPULAR.map((item) => (
        <Link
          key={item.rank}
          href={`/policy/${item.slug}`}
          className="flex items-center gap-3 py-2.5 border-t border-[#F0F4F8] first:border-t-0"
        >
          <span className="text-[16px] font-extrabold text-blue-500 w-[18px]">{item.rank}</span>
          <span className="flex-1 text-[13.5px] font-semibold text-[#172033]">{item.title}</span>
          <span className="flex items-center gap-1 text-[11px] text-[#98A2B3]">
            <Bookmark size={10} />
            {typeof item.saves === "number" ? item.saves.toLocaleString() : "1,876"}
          </span>
        </Link>
      ))}
    </section>
  );
}
