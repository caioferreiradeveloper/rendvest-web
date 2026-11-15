// Utility function to get the local date-time value in the format "YYYY-MM-DDTHH:mm"
export function getLocalDateTimeValue(value?: string): string {
  const date = value ? new Date(value) : new Date();
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}
