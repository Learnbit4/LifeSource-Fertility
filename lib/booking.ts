// Shared by the booking UI and the API. PLACEHOLDER hours: weekdays, East Africa Time.
export const TIMES = ["09:00", "10:00", "11:00", "12:00", "13:00", "15:00", "16:00"];
export const BOOKING_WINDOW_DAYS = 30;
const EAT_MS = 3 * 3600 * 1000;
export const todayEAT = () => new Date(Date.now() + EAT_MS).toISOString().slice(0, 10);
const addDays = (iso: string, n: number) => new Date(new Date(iso + "T00:00:00Z").getTime() + n * 86400000).toISOString().slice(0, 10);
export const isWeekday = (iso: string) => { const d = new Date(iso + "T00:00:00Z").getUTCDay(); return d !== 0 && d !== 6; };
export const bookableDays = (n: number) => { const out: string[] = []; for (let i = 1; out.length < n && i <= BOOKING_WINDOW_DAYS; i++) { const d = addDays(todayEAT(), i); if (isWeekday(d)) out.push(d); } return out; };
export const isBookable = (date: string, time: string) => /^\d{4}-\d{2}-\d{2}$/.test(date) && TIMES.includes(time) && isWeekday(date) && date > todayEAT() && date <= addDays(todayEAT(), BOOKING_WINDOW_DAYS);
