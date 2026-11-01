const MINUTES_PER_DAY = 24 * 60;

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/** `HH:MM` to `HH:MM` as `2h 12m`; a `to` earlier than `from` is the next day. */
export function formatDuration(from: string, to: string): string {
  const total =
    (toMinutes(to) - toMinutes(from) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (hours === 0) return `${minutes}m`;
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}
