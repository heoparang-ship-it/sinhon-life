import {
  DEFAULT_LEDGER_CATEGORIES,
  DEFAULT_LEDGER_ENTRIES,
  formatKRW,
  groupEntriesByDate,
  summarizeLedger,
} from '../../src/ledger.js';

describe('summarizeLedger', () => {
  test('calculates wedding budget totals', () => {
    const summary = summarizeLedger(DEFAULT_LEDGER_ENTRIES, DEFAULT_LEDGER_CATEGORIES);

    expect(summary.totalBudget).toBe(40000000);
    expect(summary.expenseTotal).toBe(6300000);
    expect(summary.incomeTotal).toBe(8200000);
    expect(summary.remaining).toBe(33700000);
    expect(summary.spentRate).toBe(16);
  });

  test('calculates category progress', () => {
    const summary = summarizeLedger(DEFAULT_LEDGER_ENTRIES, DEFAULT_LEDGER_CATEGORIES);
    const studio = summary.byCategory.find((category) => category.id === 'studio');

    expect(studio.spent).toBe(1850000);
    expect(studio.remaining).toBe(1150000);
    expect(studio.rate).toBe(62);
  });

  test('handles an empty budget defensively', () => {
    const summary = summarizeLedger(
      [{ id: '1', type: 'expense', categoryId: 'x', amount: 1000, date: '2026-05-20' }],
      [{ id: 'x', name: '기타', budget: 0 }]
    );

    expect(summary.spentRate).toBe(0);
    expect(summary.byCategory[0].rate).toBe(0);
  });
});

describe('groupEntriesByDate', () => {
  test('groups newest dates first', () => {
    const groups = groupEntriesByDate([
      { id: '1', date: '2026-05-18' },
      { id: '2', date: '2026-05-20' },
      { id: '3', date: '2026-05-18' },
    ]);

    expect(groups.map((group) => group.date)).toEqual(['2026-05-20', '2026-05-18']);
    expect(groups[1].entries).toHaveLength(2);
  });
});

describe('formatKRW', () => {
  test('formats Korean won amounts', () => {
    expect(formatKRW(33700000)).toBe('33,700,000원');
  });
});
