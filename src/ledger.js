export const DEFAULT_LEDGER_CATEGORIES = [
  { id: 'venue', name: '예식장', budget: 5000000, color: '#F07C9B' },
  { id: 'studio', name: '스드메', budget: 3000000, color: '#F07C6C' },
  { id: 'hanbok', name: '예복', budget: 1000000, color: '#8C8FF2' },
  { id: 'gift', name: '예물예단', budget: 3000000, color: '#6BA7F2' },
  { id: 'appliance', name: '혼수가전', budget: 6000000, color: '#F2B66B' },
  { id: 'newhome', name: '신혼집', budget: 10000000, color: '#9D7CB8' },
  { id: 'travel', name: '신혼여행', budget: 5000000, color: '#77C7C0' },
  { id: 'cash', name: '본식현금', budget: 1500000, color: '#C97A86' },
  { id: 'etc', name: '기타', budget: 5500000, color: '#A8B0BB' },
];

export const DEFAULT_LEDGER_ENTRIES = [
  { id: 'seed-1', type: 'expense', categoryId: 'venue', memo: '웨딩홀 계약금', payer: '공동', method: '카드', amount: 4000000, date: '2026-05-19' },
  { id: 'seed-2', type: 'expense', categoryId: 'studio', memo: '스튜디오 촬영 예약금', payer: '신랑', method: '이체', amount: 1200000, date: '2026-05-19' },
  { id: 'seed-3', type: 'expense', categoryId: 'studio', memo: '드레스 피팅비', payer: '신부', method: '카드', amount: 650000, date: '2026-05-18' },
  { id: 'seed-4', type: 'expense', categoryId: 'hanbok', memo: '예복 샘플 상담', payer: '공동', method: '카드', amount: 450000, date: '2026-05-17' },
  { id: 'seed-5', type: 'income', categoryId: 'etc', memo: '결혼 준비 저축', payer: '공동', method: '입금', amount: 8200000, date: '2026-05-16' },
];

export function formatKRW(amount) {
  return `${Math.round(amount).toLocaleString('ko-KR')}원`;
}

export function summarizeLedger(entries, categories = DEFAULT_LEDGER_CATEGORIES) {
  const totalBudget = categories.reduce((sum, category) => sum + Number(category.budget || 0), 0);
  const expenseTotal = entries
    .filter((entry) => entry.type === 'expense')
    .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const incomeTotal = entries
    .filter((entry) => entry.type === 'income')
    .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const remaining = totalBudget - expenseTotal;
  const spentRate = totalBudget > 0 ? Math.min(100, Math.round((expenseTotal / totalBudget) * 100)) : 0;

  const byCategory = categories.map((category) => {
    const spent = entries
      .filter((entry) => entry.type === 'expense' && entry.categoryId === category.id)
      .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
    const budget = Number(category.budget || 0);
    const rate = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
    return { ...category, spent, remaining: budget - spent, rate };
  });

  return {
    totalBudget,
    expenseTotal,
    incomeTotal,
    remaining,
    spentRate,
    byCategory,
  };
}

export function groupEntriesByDate(entries) {
  const groups = [];
  for (const entry of entries) {
    let group = groups.find((candidate) => candidate.date === entry.date);
    if (!group) {
      group = { date: entry.date, entries: [] };
      groups.push(group);
    }
    group.entries.push(entry);
  }
  return groups.sort((a, b) => b.date.localeCompare(a.date));
}
