import {
  TrendingUp,
  StepForward,
  Wallet,
  Landmark,
  PiggyBank,
  Repeat,
  ShieldCheck,
  BarChart3,
  Target,
  Percent,
  LineChart,
  type LucideIcon,
} from 'lucide-react'

export interface CalculatorMeta {
  key: string
  name: string
  shortName: string
  route: string
  description: string
  icon: LucideIcon
  category: 'growth' | 'income' | 'fixed' | 'planning'
}

export const CALCULATORS: CalculatorMeta[] = [
  {
    key: 'sip',
    name: 'SIP Calculator',
    shortName: 'SIP',
    route: '/sip-calculator',
    description: 'Estimate the future value of your monthly mutual fund investments.',
    icon: TrendingUp,
    category: 'growth',
  },
  {
    key: 'step-up-sip',
    name: 'Step-Up SIP Calculator',
    shortName: 'Step-Up SIP',
    route: '/step-up-sip-calculator',
    description: 'Model a SIP that increases every year as your income grows.',
    icon: StepForward,
    category: 'growth',
  },
  {
    key: 'swp',
    name: 'SWP Calculator',
    shortName: 'SWP',
    route: '/swp-calculator',
    description: 'Plan regular withdrawals from a corpus while it keeps growing.',
    icon: Wallet,
    category: 'income',
  },
  {
    key: 'fd',
    name: 'FD Calculator',
    shortName: 'FD',
    route: '/fd-calculator',
    description: 'Calculate maturity value of a fixed deposit at any compounding frequency.',
    icon: Landmark,
    category: 'fixed',
  },
  {
    key: 'lumpsum',
    name: 'Lumpsum Calculator',
    shortName: 'Lumpsum',
    route: '/lumpsum-calculator',
    description: 'See how a one-time investment can grow over the years.',
    icon: BarChart3,
    category: 'growth',
  },
  {
    key: 'rd',
    name: 'RD Calculator',
    shortName: 'RD',
    route: '/rd-calculator',
    description: 'Calculate the maturity value of your monthly recurring deposits.',
    icon: Repeat,
    category: 'fixed',
  },
  {
    key: 'ppf',
    name: 'PPF Calculator',
    shortName: 'PPF',
    route: '/ppf-calculator',
    description: 'Project your Public Provident Fund balance at maturity.',
    icon: ShieldCheck,
    category: 'fixed',
  },
  {
    key: 'nps',
    name: 'NPS Calculator',
    shortName: 'NPS',
    route: '/nps-calculator',
    description: 'Estimate your retirement corpus and annuity from NPS contributions.',
    icon: PiggyBank,
    category: 'planning',
  },
  {
    key: 'goal-sip',
    name: 'Goal-Based SIP Calculator',
    shortName: 'Goal Planner',
    route: '/goal-sip-calculator',
    description: 'Work backward from a financial goal to the monthly SIP you need.',
    icon: Target,
    category: 'planning',
  },
  {
    key: 'cagr',
    name: 'CAGR Calculator',
    shortName: 'CAGR',
    route: '/cagr-calculator',
    description: 'Find the compound annual growth rate between two values.',
    icon: LineChart,
    category: 'planning',
  },
  {
    key: 'inflation',
    name: 'Inflation Calculator',
    shortName: 'Inflation',
    route: '/inflation-calculator',
    description: "See how inflation erodes today's money over time.",
    icon: Percent,
    category: 'planning',
  },
]

export function getCalculatorByRoute(route: string): CalculatorMeta | undefined {
  return CALCULATORS.find((c) => c.route === route)
}
