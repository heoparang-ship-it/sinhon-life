"use client";

import { useEffect, useState } from "react";
import { Search, Plus, RefreshCw, X } from "lucide-react";

interface KnowledgeRecord {
  id: string;
  score: number;
  title: string;
  category: string;
  text: string;
  source: string;
}

export default function KnowledgePage() {
  const [records, setRecords] = useState<KnowledgeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("신혼부부 정책 혜택");
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", category: "housing", content: "", tags: "" });

  const fetchRecords = async (q?: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/knowledge?q=${encodeURIComponent(q || searchQuery)}&topK=20`);
      const data = await res.json();
      setRecords(data.records || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleAdd = async () => {
    if (!form.title || !form.content) return;
    setAdding(true);
    try {
      const res = await fetch("/api/admin/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ title: "", category: "housing", content: "", tags: "" });
        setShowAddForm(false);
        fetchRecords();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const CATEGORY_LABELS: Record<string, string> = {
    housing: "주거", finance: "금융", baby: "출산", tax: "세금",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">지식 관리</h2>
          <p className="text-sm text-gray-500 mt-1">AI 비서가 참고하는 Pinecone 벡터 데이터</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 bg-coral text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-coral-600 transition-colors"
        >
          <Plus size={14} />
          지식 추가
        </button>
      </div>

      {/* 검색 */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchRecords()}
            placeholder="검색어를 입력하세요 (유사도 기반 검색)"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral"
          />
        </div>
        <button
          onClick={() => fetchRecords()}
          className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* 수동 추가 폼 */}
      {showAddForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">새 지식 추가</h3>
            <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="제목"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coral/20"
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coral/20"
            >
              <option value="housing">주거</option>
              <option value="finance">금융</option>
              <option value="baby">출산</option>
              <option value="tax">세금</option>
            </select>
            <input
              placeholder="태그 (콤마 구분)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coral/20"
            />
            <textarea
              placeholder="내용 (AI가 참고할 텍스트)"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={5}
              className="col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coral/20 resize-none"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={adding || !form.title || !form.content}
            className="w-full bg-coral text-white py-2.5 rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-coral-600 transition-colors"
          >
            {adding ? "추가 중..." : "Pinecone에 저장"}
          </button>
        </div>
      )}

      {/* 지식 목록 */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin w-6 h-6 border-2 border-coral border-t-transparent rounded-full" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">데이터가 없습니다</div>
        ) : (
          records.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-coral bg-coral-50 px-2 py-0.5 rounded">
                      {CATEGORY_LABELS[r.category] || r.category}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      유사도 {(r.score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <h4 className="font-bold text-sm">{r.title || r.id}</h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.text}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-gray-400 font-mono">{r.id}</span>
                {r.source && <span className="text-[10px] text-gray-400">· {r.source}</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
