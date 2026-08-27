const isoDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isoDateToDisplay(isoDate: string): string {
  const match = isoDatePattern.exec(isoDate);
  if (!match) return isoDate;

  const [, year, month, day] = match;
  return `${day}-${month}-${year}`;
}

export function isoDateToLocalDate(isoDate: string): Date {
  const match = isoDatePattern.exec(isoDate);
  if (!match) return new Date(isoDate);

  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

export function localDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
