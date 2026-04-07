const formatter = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
});

export function formatCurrency(cents: number): string {
  return formatter.format(cents / 100);
}
