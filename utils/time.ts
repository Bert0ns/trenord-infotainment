export function parseAndAddDelay(
  timeStr: string | undefined,
  delayMinutes: number,
): Date | null {
  if (!timeStr) return null;
  const now = new Date();
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date(now);
  d.setHours(h, m, 0, 0);

  // Handle overnight train edge cases (e.g., if scheduled time is 01:00 but it's currently 23:00)
  if (h < 4 && now.getHours() > 20) {
    d.setDate(d.getDate() + 1);
  } else if (h > 20 && now.getHours() < 4) {
    d.setDate(d.getDate() - 1);
  }

  // Add the live delay minutes
  d.setMinutes(d.getMinutes() + delayMinutes);
  return d;
}
