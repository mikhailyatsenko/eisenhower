import { format, addMinutes } from 'date-fns';

/**
 * Generates a Google Calendar link for a task
 * @param text Task description
 * @param dueDate Due date of the task
 * @returns Google Calendar URL
 */
export const getGoogleCalendarLink = (text: string, dueDate: Date): string => {
  const title = encodeURIComponent(text);
  const startDate = format(dueDate, "yyyyMMdd'T'HHmmss");
  const endDate = format(addMinutes(dueDate, 30), "yyyyMMdd'T'HHmmss");

  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=Created+via+Eisenhower+Matrix+App`;
};
