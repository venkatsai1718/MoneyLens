import { TrendingUp, Scale, Percent, ShieldCheck, Layers, PieChart, AlertTriangle, type LucideIcon } from 'lucide-react'

export interface EduTopic {
  key: string
  title: string
  /** One-line teaser shown on the landing page's small cards. */
  summary: string
  /** Full explanation shown on the Resources learning page. Paragraphs are separated by a blank line. */
  body: string
  /** Short note on the actual formula/method behind the concept, shown in muted text under the main explanation. */
  howCalculated: string
  icon: LucideIcon
}

// A single source of truth for MoneyLens' educational content: the landing
// page teases the first few as small cards, and the Resources page renders
// all of them in full — so the two never drift out of sync.
export const EDU_TOPICS: EduTopic[] = [
  {
    key: 'how-sip-works',
    title: 'How SIP works',
    icon: TrendingUp,
    summary: 'Rupee-cost averaging and why consistency beats timing the market.',
    body: `A Systematic Investment Plan (SIP) is simply a standing instruction to invest a fixed amount into a mutual fund at a regular interval — usually monthly — instead of investing one large sum at once. Each instalment buys units at that day's price (the "NAV"), so when the market is down you automatically buy more units, and when it's up you buy fewer. Averaged over many months, this is called rupee-cost averaging, and it removes the need to guess whether today is a "good" day to invest.

The real engine behind a SIP is compounding combined with time. Your first instalment has the longest time to grow, but every instalment after it keeps stacking on top — both the money you put in and the returns it has already earned keep earning further returns. This is why SIP returns tend to look unimpressive in the first few years and accelerate sharply later: most of the growth in a 15–20 year SIP is generated in the second half of the tenure, not the first.

Because a SIP is automated, it also removes a behavioural problem, not just a mathematical one: it's very easy to keep investing when markets are calm and very tempting to stop when they fall — which is usually the worst time to stop. A SIP that continues through both good and bad months is what actually captures the benefit of rupee-cost averaging; pausing it during a downturn defeats the purpose.`,
    howCalculated:
      'The maturity value is calculated with the future-value-of-annuity formula: FV = P × [((1+r)ⁿ − 1) / r] × (1+r), where P is your monthly instalment, r is the effective monthly rate implied by your expected annual return, and n is the number of months. See the SIP calculator for the full worked example.',
  },
  {
    key: 'sip-vs-fd',
    title: 'SIP vs FD',
    icon: Scale,
    summary: 'Contractually fixed returns vs. market-linked growth potential.',
    body: `A Fixed Deposit (FD) and a SIP into a mutual fund solve different problems, even though both are common starting points for new investors. An FD is a contract: you deposit a lump sum with a bank or NBFC, and it pays you a pre-agreed interest rate for a pre-agreed tenure, regardless of what happens in the market. The amount you'll receive at maturity is known on day one. A SIP, on the other hand, is a recurring investment into a market-linked instrument (typically a mutual fund), where the return depends entirely on how that fund's underlying investments perform — it is not fixed, not guaranteed, and can occasionally be negative over shorter periods.

That trade-off is the whole story: an FD offers certainty and capital protection in exchange for a return that's usually modest and, after adjusting for inflation and tax, can sometimes barely preserve your purchasing power. A SIP offers the potential for meaningfully higher long-term growth — because equity markets have historically outpaced fixed-income instruments over long horizons — but that potential comes with volatility you have to be able to sit through, and no guarantee that any specific time period will work out favourably.

In practice, the two aren't really competitors — they're tools for different jobs. Money you'll need with certainty on a specific date (an emergency fund, next year's tuition fee) is generally better suited to an FD or similarly safe instrument. Money you won't need for 5+ years, where you can tolerate short-term ups and downs in exchange for higher long-term growth potential, is the kind of money a SIP is designed for.`,
    howCalculated:
      "An FD's maturity value compounds at its stated rate over the chosen frequency: A = P × (1 + r/n)ⁿᵗ. A SIP instead compounds a stream of monthly instalments using the future-value-of-annuity formula — two genuinely different calculations, which is why the FD and SIP calculators show different formula blocks even when the headline rate looks similar.",
  },
  {
    key: 'why-inflation-matters',
    title: 'Why inflation matters',
    icon: Percent,
    summary: 'What ₹1 lakh today will really be worth years from now.',
    body: `Inflation is the gradual rise in the price of goods and services over time, which means a fixed amount of money buys less in the future than it does today. ₹1 lakh today will not buy the same basket of goods and services in 15 or 20 years — even a modest, steady inflation rate compounds over long periods the same way investment returns do, just working against your money instead of for it.

This is why the "nominal" value of an investment — the raw rupee figure a calculator shows you — can be misleading on its own. A corpus that grows to ₹50 lakh over 20 years sounds substantial, but what actually matters is what that ₹50 lakh can buy at that point, compared to what a similar amount buys today. The inflation-adjusted (or "real") value tries to answer that more honest question by discounting the future amount back to today's purchasing power, using the inflation rate you expect.

This matters most for long-horizon goals — retirement, a child's higher education, a home years away — where the gap between the nominal and inflation-adjusted numbers can be large simply because inflation has more years to compound. Every relevant calculator on MoneyLens lets you optionally enter an inflation rate specifically so you can compare a goal in today's terms rather than being reassured by a large-looking future number that may not stretch as far as it appears to.`,
    howCalculated:
      'The inflation-adjusted (real) value is calculated by discounting a future amount back to today\'s purchasing power: Real Value = Future Value ÷ (1 + inflation rate)^years. The Inflation calculator on MoneyLens runs this formula directly.',
  },
  {
    key: 'risk-vs-return',
    title: 'Risk vs Return',
    icon: ShieldCheck,
    summary: 'Matching an investment to your risk appetite and time horizon.',
    body: `Every investment option sits somewhere on a spectrum between "safe and low-return" and "volatile and higher-potential-return," and no option escapes this trade-off entirely — an investment promising both high returns and no risk is a warning sign, not an opportunity. Fixed deposits, PPF and similar instruments sit toward the safe end: predictable, contractually protected, but with returns that are usually modest. Equity mutual funds sit toward the other end: no guaranteed return, and the value can genuinely fall over short-to-medium periods, but with materially higher growth potential over long horizons, historically.

"Risk" in this context usually means volatility — how much an investment's value can swing up or down before it eventually reflects its long-term trend. A well-diversified equity portfolio can be down 15-20% in a bad year and still deliver strong compounded returns over a full decade; the volatility doesn't disappear, but a longer holding period gives it more room to average out. This is why time horizon and risk tolerance need to be considered together, not separately.

A practical way to think about it: money needed within 1-3 years generally shouldn't carry much volatility risk, because there may not be enough time to recover from a bad stretch before you need the money. Money that won't be needed for 7-10+ years can usually afford to take on more volatility in exchange for higher expected growth, because there's enough time for short-term swings to smooth out. Matching each goal to an investment with an appropriate risk level — rather than choosing purely by expected return — is the core idea behind sound asset allocation.`,
    howCalculated:
      "There isn't a single formula here the way there is for a maturity value — risk is typically measured statistically, as the volatility (standard deviation) of an investment's historical returns. MoneyLens doesn't compute a volatility score; use the Compare tool to place different investment types side by side and judge risk qualitatively instead.",
  },
  {
    key: 'what-is-compounding',
    title: 'What is compounding?',
    icon: Layers,
    summary: 'Why returns that earn their own returns change everything.',
    body: `Compounding is what happens when the returns your money earns are left invested and start generating their own returns, instead of being withdrawn. In year one, you earn a return only on your original principal. In year two, you earn a return on your principal plus whatever you earned in year one. In year ten, you're earning a return on nine years of accumulated growth, not just your original contribution — this is why compound growth curves start slowly and then bend sharply upward.

The practical consequence is that time matters more than almost any other factor in long-term investing. Two people investing the same total amount, but starting ten years apart, can end up with very different final corpora — the earlier investor's money simply has more compounding cycles to work through, even if the later investor eventually contributes more in total. This is often summarised as "time in the market matters more than the amount," and it's the single biggest reason financial advice tends to emphasise starting early over waiting for a "better" time to start.

Compounding applies to any investment that reinvests its returns rather than paying them out — SIPs, cumulative FDs, PPF, and NPS all rely on it — which is also why withdrawing gains early (even partially) can meaningfully reduce a corpus's eventual size: every rupee taken out stops compounding from that point onward.`,
    howCalculated:
      'Compound growth follows A = P × (1 + r)ⁿ — each period\'s return is calculated on the previous period\'s total (principal plus every prior period\'s growth), not just the original principal. That last part is what separates it from simple interest, where every period is calculated on the original principal alone.',
  },
  {
    key: 'diversification-basics',
    title: 'Diversification basics',
    icon: PieChart,
    summary: 'Spreading risk across equity, debt and fixed income.',
    body: `Diversification means spreading money across different types of investments — equity, debt, fixed income, gold and so on — rather than concentrating it in one place. The underlying idea is straightforward: different asset classes tend to react differently to the same economic event. When equities fall sharply, debt instruments or gold have historically often held up better (and vice versa), so a mix of the two tends to fall less, in aggregate, than an all-equity portfolio would during a downturn.

This doesn't mean diversification eliminates risk or guarantees smoother returns in every scenario — assets can and occasionally do fall together, particularly during severe, broad market stress. What diversification more reliably does is reduce unsystematic risk: the risk specific to a single company, sector or asset class doing badly for reasons that don't affect the rest of your portfolio. A single stock can lose most of its value for company-specific reasons; a well-diversified portfolio is structurally protected from any one holding causing that kind of damage.

In practice, diversification shows up at multiple levels: across asset classes (equity vs debt vs gold), within an asset class (many stocks or funds instead of one), and across time (a SIP inherently diversifies your entry points across many months). None of this is about maximising returns — it's about not being overly dependent on any single bet playing out favourably.`,
    howCalculated:
      "Like risk, diversification isn't summarised by one calculator formula — it's usually assessed through the correlation between holdings' returns (how closely they move together). Lower correlation between asset classes generally means smoother combined returns, but MoneyLens doesn't compute a correlation or diversification score.",
  },
  {
    key: 'past-performance',
    title: "Why past performance isn't a guarantee",
    icon: AlertTriangle,
    summary: 'Historical growth is an illustration, never a prediction.',
    body: `A mutual fund, index or asset class that has performed well historically is not guaranteed to keep performing that way — this is one of the most consistently repeated (and consistently ignored) pieces of investing guidance, which is exactly why every SEBI-regulated fund communication is legally required to carry some version of the disclaimer "mutual fund investments are subject to market risks." Markets move in cycles; a sector or strategy that led returns for one stretch of years frequently lags in the next, and chasing whichever fund posted the best recent returns is a well-documented way to consistently buy in after the best part of a rally has already happened.

Every expected-return assumption used in a calculator — including MoneyLens — is exactly that: an assumption you've chosen for illustration, not a forecast of what will actually happen. Entering "12% p.a." doesn't mean a fund will return 12% every year, or even on average; real returns for market-linked investments arrive unevenly, some years strongly positive and some negative, and the long-run average is only meaningful when measured over many years, not extrapolated from a single good (or bad) recent stretch.

The practical takeaway isn't to avoid market-linked investments — historically, they've been one of the more effective tools for long-term wealth growth — but to treat any specific return figure as a planning assumption to stress-test, not a promise to bank on. Running a calculation at a more conservative rate alongside your expected one is a simple way to see how sensitive a goal is to that assumption turning out to be optimistic.`,
    howCalculated:
      'A fund\'s historical performance is usually quoted as CAGR: (End Value ÷ Start Value)^(1/years) − 1 — the same formula behind the CAGR calculator on MoneyLens. It precisely describes what already happened over that period; it is not a formula for what will happen next.',
  },
]
