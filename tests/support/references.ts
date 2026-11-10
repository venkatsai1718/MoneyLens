/**
 * Reference values used by the unit + integration tests.
 *
 * HOW THESE WERE PRODUCED
 * Every number below was computed OUTSIDE the app's code, with a separate
 * 40-digit-precision Python (decimal) script that re-implements each textbook
 * formula from scratch. They were NOT read off the Groww app/website (no
 * access to it from the dev environment) — see tests/README.md for which
 * values are additionally corroborated by widely published figures.
 *
 * Tolerance: the tests allow ±₹0.5 unless noted.
 */
export const REF = {
  sip: {
    // ₹10,000/mo, 12% p.a., 10y — effective monthly rate (app convention)
    effective_10k_12_10: 2240358.8956,
    // Same inputs with the nominal r/12 convention many calculators use
    // (published widely as ₹23.23 lakh total / ₹11.23 lakh gain).
    nominal_10k_12_10: 2323390.7635,
    withLumpsum_5k_10_15_lump1L: 2425830.9075,
    big_25k_15_20: 33176836.0122,
  },
  lumpsum: { oneYear_1L_12: 112000, fiveYear_5L_10: 805255, tenYear_1L_12: 310584.8208 },
  fd: {
    q_1L_7_5: 141477.8196,
    m_1L_7_5: 141762.526,
    y_1L_6_5_3: 120794.9625,
    h_5L_7_1_2: 574871.0218,
  },
  rd: {
    q_5k_8_12: 62646.6279, // widely published bank example (₹62,647)
    q_10k_7_24: 258197.8096,
    m_1k_6_12: 12397.2402,
  },
  stepUp: {
    pct_10k_10_12_10: { final: 3268898.4819, invested: 1912490.95212 },
    amt_5k_500_10_5: { final: 455703.9854, invested: 360000 },
  },
  swp: {
    sustaining_50L_10_30k_10: { remaining: 6972796.5991, withdrawn: 3600000 },
    stepped_1Cr_8_50k_20_5pct: { remaining: 5004555.5178, withdrawn: 19839572.4617 },
    exhausted_10L_6_20k_5: { withdrawn: 1148717.3113, month: 58 },
  },
  ppf: {
    // ₹1.5L/yr, 7.1%, 15y, start of year. Matches the commonly published
    // PPF maturity of ₹40,68,209 (annual compounding).
    start_150k_7_1_15: 4068209.2203,
    end_150k_7_1_15: 3798514.6781,
  },
  nps: {
    flat_5k_10_30: { final: 10396463.5815, invested: 1800000, annuity40: 4158585.4326, pension: 20792.9272 },
    stepUp_10k_10pct_12_25: { final: 39355017.9627, invested: 11801647.13205 },
  },
  goal: {
    cr_12_10: 44635.7056,
    withSavingsInflation: { goalFuture: 11982790.9655, sip: 19427.1866 },
  },
  cagr: { double5y: 14.8698355, quadruple10y: 14.8698355, loss: -10.5572809 },
  inflation: { fv_1L_6_10: 179084.7697, pv_1L_6_10: 55839.4777, fv_50k_7_20: 193484.2231 },
}
