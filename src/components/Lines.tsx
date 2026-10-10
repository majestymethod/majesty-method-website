/** Splits a one-item-per-line field into an array. */
export const lines = (s: unknown): string[] => (typeof s === 'string' ? s.split('\n').map((l) => l.trim()).filter(Boolean) : []);
