// ─── Pay Frequency Multipliers ───────────────────────────────────────────────
export const PAY_FREQUENCY_MULTIPLIERS: Record<string, number> = {
  weekly: 52,
  'bi-weekly': 26,
  'semi-monthly': 24,
  monthly: 12,
};

// ─── US States ───────────────────────────────────────────────────────────────
export const US_STATES = [
  { code: 'AL', name: 'Alabama', rate: 0.05 },
  { code: 'AK', name: 'Alaska', rate: 0 },
  { code: 'AZ', name: 'Arizona', rate: 0.025 },
  { code: 'AR', name: 'Arkansas', rate: 0.044 },
  { code: 'CA', name: 'California', rate: 0.093 },
  { code: 'CO', name: 'Colorado', rate: 0.044 },
  { code: 'CT', name: 'Connecticut', rate: 0.05 },
  { code: 'DE', name: 'Delaware', rate: 0.066 },
  { code: 'FL', name: 'Florida', rate: 0 },
  { code: 'GA', name: 'Georgia', rate: 0.055 },
  { code: 'HI', name: 'Hawaii', rate: 0.075 },
  { code: 'ID', name: 'Idaho', rate: 0.058 },
  { code: 'IL', name: 'Illinois', rate: 0.0495 },
  { code: 'IN', name: 'Indiana', rate: 0.0305 },
  { code: 'IA', name: 'Iowa', rate: 0.044 },
  { code: 'KS', name: 'Kansas', rate: 0.057 },
  { code: 'KY', name: 'Kentucky', rate: 0.04 },
  { code: 'LA', name: 'Louisiana', rate: 0.0425 },
  { code: 'ME', name: 'Maine', rate: 0.0715 },
  { code: 'MD', name: 'Maryland', rate: 0.0575 },
  { code: 'MA', name: 'Massachusetts', rate: 0.05 },
  { code: 'MI', name: 'Michigan', rate: 0.0425 },
  { code: 'MN', name: 'Minnesota', rate: 0.0985 },
  { code: 'MS', name: 'Mississippi', rate: 0.05 },
  { code: 'MO', name: 'Missouri', rate: 0.048 },
  { code: 'MT', name: 'Montana', rate: 0.059 },
  { code: 'NE', name: 'Nebraska', rate: 0.0564 },
  { code: 'NV', name: 'Nevada', rate: 0 },
  { code: 'NH', name: 'New Hampshire', rate: 0 },
  { code: 'NJ', name: 'New Jersey', rate: 0.1075 },
  { code: 'NM', name: 'New Mexico', rate: 0.059 },
  { code: 'NY', name: 'New York', rate: 0.109 },
  { code: 'NC', name: 'North Carolina', rate: 0.045 },
  { code: 'ND', name: 'North Dakota', rate: 0.0195 },
  { code: 'OH', name: 'Ohio', rate: 0.035 },
  { code: 'OK', name: 'Oklahoma', rate: 0.0475 },
  { code: 'OR', name: 'Oregon', rate: 0.099 },
  { code: 'PA', name: 'Pennsylvania', rate: 0.0307 },
  { code: 'RI', name: 'Rhode Island', rate: 0.0599 },
  { code: 'SC', name: 'South Carolina', rate: 0.064 },
  { code: 'SD', name: 'South Dakota', rate: 0 },
  { code: 'TN', name: 'Tennessee', rate: 0 },
  { code: 'TX', name: 'Texas', rate: 0 },
  { code: 'UT', name: 'Utah', rate: 0.0465 },
  { code: 'VT', name: 'Vermont', rate: 0.0875 },
  { code: 'VA', name: 'Virginia', rate: 0.0575 },
  { code: 'WA', name: 'Washington', rate: 0 },
  { code: 'WV', name: 'West Virginia', rate: 0.052 },
  { code: 'WI', name: 'Wisconsin', rate: 0.0765 },
  { code: 'WY', name: 'Wyoming', rate: 0 },
  { code: 'DC', name: 'Washington D.C.', rate: 0.1075 },
];

// ─── 2025 Federal Tax Brackets (Single Filer) ───────────────────────────────
const FEDERAL_BRACKETS: [number, number][] = [
  [11925, 0.1],
  [48475, 0.12],
  [103350, 0.22],
  [197300, 0.24],
  [250525, 0.32],
  [626350, 0.35],
  [Infinity, 0.37],
];

const STANDARD_DEDUCTION = 15700;

export function calculateFederalTax(grossAnnual: number): number {
  if (grossAnnual <= 0) return 0;
  const taxableIncome = Math.max(0, grossAnnual - STANDARD_DEDUCTION);
  let tax = 0;
  let prev = 0;
  for (const [threshold, rate] of FEDERAL_BRACKETS) {
    if (taxableIncome <= prev) break;
    const taxable = Math.min(taxableIncome, threshold) - prev;
    tax += taxable * rate;
    prev = threshold;
  }
  return Math.round(tax * 100) / 100;
}

export function calculateStateTax(grossAnnual: number, stateCode?: string): number {
  if (!stateCode || grossAnnual <= 0) return 0;
  const state = US_STATES.find((s) => s.code === stateCode);
  if (!state) return 0;
  return Math.round(grossAnnual * state.rate * 100) / 100;
}

export function calculateGrossAnnual(
  earningMethod: string,
  annualSalary: number,
  hourlyRate: number,
  hoursPerWeek: number,
): number {
  if (earningMethod === 'hourly') {
    return hourlyRate * hoursPerWeek * 52;
  }
  return annualSalary;
}

// ─── v2 helpers ──────────────────────────────────────────────────────────────

export function annualizePerPaycheck(perPaycheck: number, payFrequency: string): number {
  const multiplier = PAY_FREQUENCY_MULTIPLIERS[payFrequency] ?? 12;
  return perPaycheck * multiplier;
}

export function retirementAnnualFromPercent(grossAnnual: number, percent: number): number {
  return grossAnnual * (percent / 100);
}

/**
 * Calculate net annual income using the new v2 deduction format.
 * Accepts both the old-style (raw annual amounts) and new-style (percentage/per-paycheck) inputs.
 */
export function calculateNetAnnual(
  grossAnnual: number,
  federalTax: number,
  stateTax: number,
  healthInsuranceAnnual: number,
  retirementAnnual: number,
  otherDeductionsAnnual: number,
): number {
  return grossAnnual - federalTax - stateTax - healthInsuranceAnnual - retirementAnnual - otherDeductionsAnnual;
}

// ─── Formatting ──────────────────────────────────────────────────────────────

export function formatMoney(amount: number): string {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
