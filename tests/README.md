# MoneyLens tests

All tests live here (the old `src/calculations/__tests__/engine.test.ts` was merged in and removed).

    npm test -- --watchAll=false

(`npm test` is configured with `--roots tests` and `jest.testMatch` in `package.json`.)

- `unit/` – one file per calculator (+ helpers/validation/formatting): reference values, closed-form checks, edge cases, invariants.
- `integration/` – cross-calculator agreement (Step-Up@0% = SIP, NPS = SIP, Goal-SIP round trip, FD = Lumpsum, CAGR inverts Lumpsum…), yearly/monthly/summary consistency for every calculator, comparison series and CSV export.
- `support/references.ts` – the hard-coded expected numbers.

## Where the reference numbers come from (please read)

I could **not** open the Groww app/website, so none of the numbers were read off Groww. Instead each was computed by an
independent 40-digit Python re-implementation of the textbook formula, and the following are also corroborated by figures
that are widely published:

| Check | Value | Corroboration |
|---|---|---|
| RD ₹5,000/mo, 8%, quarterly, 12m | ₹62,647 | standard bank RD example |
| PPF ₹1.5L/yr, 7.1%, 15y, start of year | ₹40,68,209 | commonly published PPF maturity |
| Inflation ₹1L @6%, 10y | ₹1,79,085 | closed form |

**Known divergence from Groww-style SIP numbers:** this app converts annual→monthly with `(1+r)^(1/12)-1`; calculators that
use `r/12` give ₹23,23,391 for ₹10k/mo @12% for 10y, this app gives ₹22,40,359 (~3.6% lower). `unit/sip.test.ts` pins this
explicitly. To verify against Groww, enter the inputs in `support/references.ts` into the Groww calculators and compare;
the existing comment in `src/calculations/__tests__/engine.test.ts` claiming a Groww cross-check for ₹22,40,359 looks wrong.
