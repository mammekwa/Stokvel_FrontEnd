export const mockStore = {
  contributions: [
    {
      id: 'c-100',
      amount: 150,
      date: '2026-09-20T10:00:00Z',
      status: 'confirmed',
      txHash: '0x1a2b3c4d5e',
    },
    {
      id: 'c-101',
      amount: 100,
      date: '2026-09-24T10:00:00Z',
      status: 'pending',
      txHash: null,
    },
  ],
  loans: [
    {
      id: 'l-200',
      memberId: 'member-1',
      amount: 1200,
      repaymentMonths: 6,
      status: 'pending',
      eligibilityScore: 0.72,
      factors: [
        { factor: 'On-time contributions in the last 3 months', direction: 'positive' },
        { factor: 'Current repayment capacity is moderate', direction: 'negative' },
        { factor: 'No missed contribution this month', direction: 'positive' },
      ],
    },
  ],
  payouts: [],
  members: [
    { memberId: 'member-1', name: 'Nomsa Dlamini', lastContributionDate: '2026-09-24', arrearsStatus: 'clear' },
    { memberId: 'member-2', name: 'Sipho Mokoena', lastContributionDate: '2026-08-10', arrearsStatus: 'arrears' },
    { memberId: 'member-3', name: 'Ayanda Nkosi', lastContributionDate: '2026-09-02', arrearsStatus: 'arrears' },
  ],
}
