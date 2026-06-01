export type EntryType = "expense" | "income";

export type Payer = "공동" | "신랑" | "신부" | "양가";

export type Method = "카드" | "이체" | "현금" | "입금";

export type IncomeSource = "축의금" | "양가 지원금" | "본인 저축" | "기타";

export type LedgerEntry = {
  id: string;
  type: EntryType;
  categoryId: string;
  memo: string;
  payer: Payer;
  method: Method;
  amount: number;
  date: string; // YYYY-MM-DD
  incomeSource?: IncomeSource;
};

export type BudgetMap = Record<string, number>;
