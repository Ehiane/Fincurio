/**
 * Format a number as currency with commas and decimals
 */
export const formatCurrency = (value: string): string => {
  // Remove all non-digit and non-decimal characters
  const cleanedValue = value.replace(/[^\d.]/g, '');

  // Split into integer and decimal parts
  const parts = cleanedValue.split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  // Add commas to integer part
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Combine with decimal (limit to 2 decimal places)
  if (decimalPart !== undefined) {
    return `${integerPart}.${decimalPart.slice(0, 2)}`;
  }

  return integerPart;
};

/**
 * Parse formatted currency string to number
 */
export const parseCurrency = (value: string): number => {
  const cleaned = value.replace(/[^\d.]/g, '');
  return parseFloat(cleaned) || 0;
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
