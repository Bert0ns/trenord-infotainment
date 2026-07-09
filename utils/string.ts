export function capitalizeWords(text: string): string {
  return text.replace(
    /\b\w+/g,
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
  );
}

// A simple ID generator for use in React keys, etc.
// Not guaranteed to be unique, but very unlikely to collide in practice.
export function simpleID(): string {
  return Math.random().toString(36).substring(2, 12);
}
