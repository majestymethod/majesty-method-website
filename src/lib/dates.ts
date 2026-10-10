// Webinar times are entered in South African time (SAST, UTC+2, no daylight saving).
export function parseSast(local: string): Date | null {
  if (!local) return null;
  let iso = local.trim();
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(iso)) iso += ':00+02:00';
  else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(iso)) iso += '+02:00';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}
export function formatSast(d: Date): { date: string; time: string } {
  const date = new Intl.DateTimeFormat('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Johannesburg' }).format(d);
  const time = new Intl.DateTimeFormat('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Africa/Johannesburg' }).format(d);
  return { date, time: `${time} SAST` };
}
