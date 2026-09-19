// Centralized types shared by every calculation module, UI component,
// chart, CSV export, PDF export and the comparison engine.

/** One row of month-granular data produced by the calculation engine. */
export interface MonthlyDataPoint {
  month: number // 1-based, absolute month index across the whole tenure
  year: number // 1-based calendar year of the investment (ceil(month / 12))
  invested: number // cumulative amount invested/deposited up to this month
  withdrawn?: number // cumulative amount withdrawn up to this month (SWP)
  interest: number // cumulative interest/returns accrued up to this month
  balance: number // portfolio / corpus value at the end of this month
  contribution?: number // the contribution made *in* this month (not cumulative)
}

/** One row of the year-wise breakdown table. */
export interface YearlyDataPoint {
  year: number
  monthlyAmount?: number // SIP/SSIP: the monthly instalment during this year
  invested: number // amount invested/contributed *during* this year
  withdrawals?: number // amount withdrawn *during* this year (SWP)
  returns: number // growth attributable to this year (not cumulative)
  openingBalance?: number // balance at the start of this year (SWP/FD)
  closingBalance: number // cumulative portfolio value at the end of this year
  totalInvestedTillDate: number // cumulative invested amount till end of this year
  isExhausted?: boolean // SWP: true once the corpus has hit zero
}

export interface CalculationSummary {
  totalInvested: number
  totalReturns: number
  finalValue: number
  inflationAdjustedValue?: number
  // SWP specific
  totalWithdrawn?: number
  remainingCorpus?: number
  exhaustionYear?: number | null
  exhaustionMonth?: number | null
  // Step-up SIP specific
  totalSipContribution?: number
  totalStepUpContribution?: number
  // NPS specific
  estimatedAnnuityAllocation?: number
  estimatedLumpSum?: number
  estimatedMonthlyPension?: number
  estimatedAnnualPension?: number
  // Goal SIP specific
  todaysGoal?: number
  inflationAdjustedGoal?: number
  requiredMonthlySip?: number
}

export interface InputAssumption {
  label: string
  value: string
}

/** The single, normalized shape every calculator returns. */
export interface CalculationResult {
  calculatorName: string
  summary: CalculationSummary
  monthlyData: MonthlyDataPoint[]
  yearlyData: YearlyDataPoint[]
  assumptions: InputAssumption[]
  inflationApplied: boolean
  inflationRate?: number
}

export interface ComparisonScenario {
  id: string
  name: string
  type: string
  result: CalculationResult
  color: string
}
