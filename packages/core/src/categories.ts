export function matchCategory(
  aiCategory: string | null | undefined,
  knownCategories: string[]
): string {
  if (!aiCategory || !aiCategory.trim()) {
    return 'Uncategorized';
  }

  const clean = aiCategory.trim().toLowerCase();
  
  // Exact or case-insensitive match
  const match = knownCategories.find((cat) => cat.toLowerCase() === clean);
  if (match) {
    return match;
  }

  // Partial match fallback if AI returned e.g. "groceries" for "Groceries"
  const partial = knownCategories.find(
    (cat) =>
      cat.toLowerCase().includes(clean) ||
      clean.includes(cat.toLowerCase())
  );
  if (partial && clean.length >= 3) {
    return partial;
  }

  return 'Uncategorized';
}
