export type LedgerCategory = {
  id: string;
  name: string;
  defaultBudget: number;
  color: string;
};

export const LEDGER_CATEGORIES: LedgerCategory[] = [
  { id: "venue",     name: "예식장",   defaultBudget: 5_000_000,  color: "#F07C9B" },
  { id: "studio",    name: "스드메",   defaultBudget: 3_000_000,  color: "#F07C6C" },
  { id: "hanbok",    name: "예복",     defaultBudget: 1_000_000,  color: "#8C8FF2" },
  { id: "gift",      name: "예물예단", defaultBudget: 3_000_000,  color: "#6BA7F2" },
  { id: "appliance", name: "혼수가전", defaultBudget: 6_000_000,  color: "#F2B66B" },
  { id: "newhome",   name: "신혼집",   defaultBudget: 10_000_000, color: "#9D7CB8" },
  { id: "travel",    name: "신혼여행", defaultBudget: 5_000_000,  color: "#77C7C0" },
  { id: "cash",      name: "본식현금", defaultBudget: 1_500_000,  color: "#C97A86" },
  { id: "etc",       name: "기타",     defaultBudget: 5_500_000,  color: "#A8B0BB" },
];

export function getCategory(id: string): LedgerCategory {
  return LEDGER_CATEGORIES.find((c) => c.id === id) ?? LEDGER_CATEGORIES[LEDGER_CATEGORIES.length - 1];
}
