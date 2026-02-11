/**
 * Cash-register style currency formatting.
 * All input is treated as cents — typing "1789" displays "17.89".
 * The decimal point is always fixed at 2 places.
 */

/**
 * Format raw digit string into cash-register display (e.g., "1789" → "17.89")
 */
export const formatCurrency = (value: string): string => {
  // Strip everything except digits
  const digits = value.replace(/\D/g, '');

  if (digits === '' || digits === '0') return '';

  // Remove leading zeros but keep at least 1 digit
  const trimmed = digits.replace(/^0+/, '') || '0';

  // Pad to at least 3 digits so we always have dollars + cents
  const padded = trimmed.padStart(3, '0');

  const integerPart = padded.slice(0, -2);
  const decimalPart = padded.slice(-2);

  // Add commas to integer part
  const withCommas = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return `${withCommas}.${decimalPart}`;
};

/**
 * Parse cash-register formatted string to a decimal number (e.g., "17.89" → 17.89)
 */
export const parseCurrency = (value: string): number => {
  const cleaned = value.replace(/[^\d.]/g, '');
  return parseFloat(cleaned) || 0;
};

/**
 * Convert a decimal number to cash-register display string (for editing existing amounts)
 * e.g., 17.89 → "17.89", 10 → "10.00"
 */
export const toCurrencyDisplay = (amount: number): string => {
  // Convert to cents, round to avoid floating point issues, then format
  const cents = Math.round(amount * 100).toString();
  return formatCurrency(cents);
};

/**
 * Handle currency input change
 */
export const handleCurrencyInput = (
  e: React.ChangeEvent<HTMLInputElement>,
  setValue: (value: string) => void
): void => {
  const inputValue = e.target.value;
  const formatted = formatCurrency(inputValue);
  setValue(formatted);
};
