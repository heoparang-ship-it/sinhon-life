"use client";

import { VENDORS, VENDOR_CATEGORIES, BRAND } from "@/lib/constants";
import { Star, MapPin, ExternalLink } from "lucide-react";

export default function VendorsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">업체 관리</h2>
          <p className="text-sm text-gray-500 mt-1">입점 업체 목록 및 상세 정보</p>
        </div>
        <a
          href={BRAND.kakaoLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 bg-coral text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-coral-600 transition-colors"
        >
          <ExternalLink size={14} />
          입점 문의 링크
        </a>
      </div>

      {/* 카테고리별 현황 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {VENDOR_CATEGORIES.map((cat) => {
          const count = VENDORS.filter((v) => v.category === cat.id).length;
          return (
            <div key={cat.id} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <span className="text-2xl">{cat.emoji}</span>
              <p className="font-bold text-sm mt-1">{cat.label}</p>
              <p className="text-xl font-extrabold text-coral mt-1">{count}</p>
            </div>
          );
        })}
      </div>

      {/* 업체 리스트 */}
      <div className="space-y-3">
        {VENDORS.map((vendor) => (
          <div key={vendor.slug} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-coral bg-coral-50 px-2 py-0.5 rounded">
                    {vendor.categoryLabel}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <Star size={10} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold">{vendor.rating}</span>
                    <span className="text-[10px] text-gray-400">({vendor.reviewCount})</span>
                  </div>
                </div>
                <h3 className="font-bold text-base">{vendor.name}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-500">{vendor.location}</span>
                  <span className="text-xs text-gray-400 mx-1">·</span>
                  <span className="text-xs font-bold text-mint">{vendor.priceRange}</span>
                </div>
              </div>
              <a
                href={`/vendor/${vendor.slug}`}
                target="_blank"
                className="text-xs text-coral hover:underline"
              >
                상세보기 →
              </a>
            </div>

            <p className="text-xs text-gray-500 mt-3 line-clamp-2">{vendor.description}</p>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {vendor.tags.map((tag) => (
                <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {vendor.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-1">
                    <span className="text-mint mt-0.5">✓</span>
                    <span className="text-gray-600">{h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 안내 */}
      <div className="bg-gray-100 rounded-xl p-4 text-center">
        <p className="text-sm text-gray-500">업체 추가/수정은 현재 코드에서 직접 관리합니다</p>
        <p className="text-xs text-gray-400 mt-1">파일: src/lib/constants.ts → VENDORS 배열</p>
        <p className="text-xs text-gray-400">DB 연동 후 이 페이지에서 직접 관리 가능</p>
      </div>
    </div>
  );
}
