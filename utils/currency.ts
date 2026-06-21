/**
 * Utilitaires de formatage monétaire pour le Franc CFA (XOF/XAF)
 * Conformément aux spécifications Pursio :
 * - Pas de décimales (monnaie entière)
 * - Séparateurs de milliers (espace fine insécable \u202F)
 * - Stockage en Long (entiers)
 */

export const formatFCFA = (amount: number, showCurrency: boolean = true): string => {
  const roundedAmount = Math.round(amount);
  const formatted = roundedAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u202F");
  return showCurrency ? `${formatted} FCFA` : formatted;
};

export const parseFCFA = (formattedAmount: string): number => {
  const cleaned = formattedAmount.replace(/\s/g, '').replace(/FCFA/gi, '').trim();
  return Math.round(parseFloat(cleaned) || 0);
};

export const isValidFCFAAmount = (amount: number): boolean => {
  return Number.isInteger(amount) && amount >= 0;
};

export const formatFCFACompact = (amount: number): string => {
  const roundedAmount = Math.round(amount);
  if (roundedAmount >= 1_000_000_000) return `${(roundedAmount / 1_000_000_000).toFixed(1)}B FCFA`;
  if (roundedAmount >= 1_000_000) return `${(roundedAmount / 1_000_000).toFixed(1)}M FCFA`;
  if (roundedAmount >= 1_000) return `${(roundedAmount / 1_000).toFixed(1)}K FCFA`;
  return `${roundedAmount} FCFA`;
};