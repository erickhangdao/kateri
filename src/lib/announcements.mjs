/** Calendar dates always use Ontario time, including during daylight saving. */
export function ontarioToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
/** @param {{published:string, active:boolean, eventStart?:string, eventEnd?:string, expires?:string}} item */
export function isCurrent(item, today = ontarioToday()) {
  const end = item.expires || item.eventEnd || item.eventStart;
  return item.active && item.published <= today && (!end || end >= today);
}
/** @param {{published:string}} item */
export function isPublished(item, today = ontarioToday()) {
  return item.published <= today;
}
/** @param {{registrationUrl?:string, registrationDeadline?:string, published:string, active:boolean, eventStart?:string, eventEnd?:string, expires?:string}} item */
export function registrationOpen(item, today = ontarioToday()) {
  return (
    Boolean(item.registrationUrl) &&
    isCurrent(item, today) &&
    (!item.registrationDeadline || item.registrationDeadline >= today)
  );
}
/** @param {{data:{featured:boolean,published:string}}} a @param {{data:{featured:boolean,published:string}}} b */
export function announcementOrder(a, b) {
  return (
    Number(b.data.featured) - Number(a.data.featured) ||
    b.data.published.localeCompare(a.data.published)
  );
}
