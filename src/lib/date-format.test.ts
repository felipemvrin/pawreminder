import { isoDateToDisplay, isoDateToLocalDate, localDateToISO } from './date-format';

describe('date format helpers', () => {
  it('formats an ISO date for display', () => {
    expect(isoDateToDisplay('2026-08-26')).toBe('26-08-2026');
  });

  it('parses an ISO date in local time', () => {
    const date = isoDateToLocalDate('2026-08-26');

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(7);
    expect(date.getDate()).toBe(26);
  });

  it('converts a local date back to the storage format', () => {
    expect(localDateToISO(new Date(2026, 7, 26))).toBe('2026-08-26');
  });
});
